import React, { useState, useEffect } from "react";
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  getDocs 
} from "firebase/firestore";
import { db, auth, handleFirestoreError, OperationType } from "../lib/firebase";
import { 
  History as HistoryIcon,
  Recycle,
  Coins,
  ChevronRight,
  TrendingUp,
  Download,
  Filter,
  FileText
} from "lucide-react";
import { formatIDR, cn } from "../lib/utils";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function History() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      const user = auth.currentUser;
      if (!user) return;
      
      try {
        const q = query(
          collection(db, "transactions"),
          where("userId", "==", user.uid),
          orderBy("createdAt", "desc")
        );
        const querySnapshot = await getDocs(q);
        setTransactions(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        handleFirestoreError(err, OperationType.LIST, "transactions");
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const downloadPDF = () => {
    const doc = new jsPDF();
    
    // Add Brand Header
    doc.setFontSize(22);
    doc.setTextColor(22, 163, 74); // primary color #16A34A
    doc.text("EcoGold", 14, 20);
    
    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text("Laporan Riwayat Aktivitas Nasabah", 14, 30);
    doc.text(`Dicetak pada: ${new Date().toLocaleString('id-ID')}`, 14, 38);
    
    // Add User Info
    const user = auth.currentUser;
    doc.setFontSize(10);
    doc.text(`Nama Nasabah: ${user?.displayName || 'Pahlawan Lingkungan'}`, 14, 48);
    doc.text(`Email: ${user?.email || '-'}`, 14, 54);

    const tableData = transactions.map((tx) => [
      new Date(tx.createdAt).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' }),
      tx.type === 'deposit' ? `Setoran: ${tx.wasteType}` : 'Konversi Emas',
      tx.type === 'deposit' ? `+${formatIDR(tx.amount)}` : `-${formatIDR(tx.amount)}`,
      tx.type === 'conversion' ? `${tx.goldWeight?.toFixed(4)} gr` : '-',
      tx.status.toUpperCase()
    ]);

    autoTable(doc, {
      startY: 65,
      head: [['Tanggal', 'Jenis Aktivitas', 'Nominal (IDR)', 'Emas (gr)', 'Status']],
      body: tableData,
      headStyles: { fillColor: [22, 163, 74] },
      styles: { fontSize: 9 },
      alternateRowStyles: { fillColor: [248, 250, 252] }
    });

    doc.save(`EcoGold_History_${new Date().getTime()}.pdf`);
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter">Riwayat Aktivitas</h1>
          <p className="text-slate-500 font-medium">Pantau semua setoran dan tabungan emas Anda.</p>
        </div>
        <div className="flex gap-2">
            <button className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-black text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
                <Filter className="w-4 h-4" /> Filter
            </button>
            <button 
              onClick={downloadPDF}
              disabled={transactions.length === 0}
              className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 disabled:opacity-50 disabled:cursor-not-allowed group"
            >
                <Download className="w-5 h-5 group-hover:-translate-y-1 transition-transform" /> Unduh PDF
            </button>
        </div>
      </div>

      <div className="glass rounded-[3rem] overflow-hidden border-none shadow-2xl shadow-slate-200/50">
        {loading ? (
          <div className="p-32 text-center space-y-6">
             <div className="w-14 h-14 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto shadow-2xl" />
             <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Singkronisasi data...</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="p-32 text-center space-y-8">
            <div className="w-28 h-28 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mx-auto text-slate-200 shadow-inner">
                <HistoryIcon className="w-12 h-12" />
            </div>
            <div className="space-y-2">
                <p className="text-2xl font-black text-slate-900">Belum Ada Transaksi</p>
                <p className="text-slate-500 font-medium max-w-sm mx-auto">Mulai berkontribusi lingkungan untuk melihat jejak digital Anda di sini.</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-50 bg-slate-50/50">
                  <th className="px-10 py-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Aktivitas</th>
                  <th className="px-10 py-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Keterangan</th>
                  <th className="px-10 py-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Nominal</th>
                  <th className="px-10 py-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                  <th className="px-10 py-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="group hover:bg-white transition-all duration-300">
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-6">
                         <div className={cn(
                             "w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform",
                             tx.type === 'deposit' ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                         )}>
                             {tx.type === 'deposit' ? <Recycle className="w-6 h-6" /> : <Coins className="w-6 h-6" />}
                         </div>
                         <div>
                             <p className="font-black text-slate-900 text-lg leading-tight uppercase tracking-tight">{tx.type}</p>
                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                                {new Date(tx.createdAt).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                             </p>
                         </div>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                       {tx.type === 'deposit' ? (
                           <div className="space-y-1">
                               <p className="text-sm font-bold text-slate-900">{tx.wasteType}</p>
                               <p className="text-xs text-slate-400 font-medium">Berat: <span className="text-slate-900 font-black">{tx.weight} kg</span></p>
                           </div>
                       ) : (
                           <div className="space-y-1">
                               <p className="text-sm font-bold text-slate-900">Konversi ke Emas</p>
                               <p className="text-xs text-slate-400 font-medium">Gramasi: <span className="text-amber-600 font-black">{tx.goldWeight?.toFixed(4)} gr</span></p>
                           </div>
                       )}
                    </td>
                    <td className="px-10 py-8 text-right">
                       <p className={cn("text-xl font-black", tx.type === 'deposit' ? "text-emerald-600" : "text-amber-600")}>
                           {tx.type === 'deposit' ? '+' : '-'}{formatIDR(tx.amount)}
                       </p>
                    </td>
                    <td className="px-10 py-8">
                       <div className={cn(
                           "inline-flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest",
                           tx.status === 'completed' ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-400"
                       )}>
                           <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", tx.status === 'completed' ? "bg-emerald-500" : "bg-slate-400")} />
                           {tx.status}
                       </div>
                    </td>
                    <td className="px-10 py-8 text-center">
                       <button className="w-10 h-10 rounded-xl bg-slate-50 text-slate-300 hover:bg-primary/10 hover:text-primary transition-all flex items-center justify-center mx-auto">
                           <FileText className="w-5 h-5" />
                       </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
