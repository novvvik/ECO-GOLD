import React, { useState, useEffect } from "react";
import { 
  collection, 
  addDoc, 
  doc, 
  updateDoc, 
  increment,
  getDoc
} from "firebase/firestore";
import { db, auth, handleFirestoreError, OperationType } from "../lib/firebase";
import { 
  Coins, 
  ArrowRightLeft, 
  ChevronRight, 
  TrendingUp,
  Landmark,
  ShieldCheck,
  Info,
  CheckCircle2
} from "lucide-react";
import { motion } from "motion/react";
import { formatIDR, cn } from "../lib/utils";
import { useNavigate } from "react-router-dom";

export default function Convert() {
  const [balance, setBalance] = useState(0);
  const [amountToConvert, setAmountToConvert] = useState(0);
  const [goldPrice, setGoldPrice] = useState(1150000); // per gram
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBalance = async () => {
      const user = auth.currentUser;
      if (!user) return;
      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists()) {
          setBalance(snap.data().balance || 0);
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, `users/${user.uid}`);
      }
    };
    
    fetch("/api/gold-price")
      .then(res => res.json())
      .then(data => setGoldPrice(data.priceIdr))
      .catch(() => {});
      
    fetchBalance();
  }, []);

  const handleConvert = async () => {
    const user = auth.currentUser;
    if (!user || amountToConvert <= 0 || amountToConvert > balance) return;

    setLoading(true);
    const goldWeight = amountToConvert / goldPrice;

    try {
      // 1. Create Transaction
      await addDoc(collection(db, "transactions"), {
        userId: user.uid,
        type: "conversion",
        amount: amountToConvert,
        goldWeight: goldWeight,
        pricePerGram: goldPrice,
        status: "completed",
        createdAt: new Date().toISOString(),
      });

      // 2. Update User Profile
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        balance: increment(-amountToConvert),
        goldBalance: increment(goldWeight),
      });

      setSubmitted(true);
      setTimeout(() => navigate("/"), 3000);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, "transactions/conversion");
      alert("Gagal melakukan konversi. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const estimatedGold = amountToConvert / goldPrice;

  if (submitted) {
    return (
      <div className="h-[70vh] flex items-center justify-center">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center space-y-6"
        >
          <div className="w-24 h-24 bg-amber-100 text-amber-500 rounded-full flex items-center justify-center mx-auto shadow-xl">
             <TrendingUp className="w-12 h-12" />
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-black text-slate-900">Emas Berhasil Ditambah!</h2>
            <p className="text-slate-500 font-medium">
              Tabungan emas Anda telah bertambah <br /> sebesar {estimatedGold.toFixed(4)} gram.
            </p>
          </div>
          <motion.div 
            animate={{ width: ["0%", "100%"] }}
            transition={{ duration: 3 }}
            className="h-1 bg-amber-500 rounded-full mx-auto max-w-[200px]"
          />
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest text-center mt-4">Sinkronisasi dengan Pegadaian...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20">
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-amber-600 font-black uppercase tracking-widest text-xs">
            <TrendingUp className="w-4 h-4" />
            Investasi Masa Depan
        </div>
        <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Tukarkan Saldo ke Emas</h1>
        <p className="text-slate-500 font-medium">Investasikan hasil kelola sampahmu ke Tabungan Emas Pegadaian.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-10">
        <div className="space-y-8">
           {/* Current Gold Price */}
           <div className="glass p-8 rounded-[2.5rem] border-none bg-gradient-to-br from-amber-400 to-amber-600 text-white relative overflow-hidden shadow-2xl shadow-amber-200">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="relative flex items-center justify-between mb-10">
                    <div className="p-3 bg-white/20 rounded-2xl">
                         <Coins className="w-8 h-8" />
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Harga Hari Ini</p>
                        <p className="text-xl font-black">{formatIDR(goldPrice)}/gr</p>
                    </div>
                </div>
                <div className="relative">
                    <p className="text-sm font-medium opacity-80 mb-1">Update Terakhir</p>
                    <p className="text-lg font-black">{new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
                <div className="absolute bottom-0 right-0 p-4 opacity-10">
                    <Landmark className="w-24 h-24" />
                </div>
           </div>

           {/* Conversion Form */}
           <div className="space-y-6">
              <div className="space-y-4">
                  <div className="flex justify-between items-center px-2">
                       <label className="text-sm font-bold text-slate-600 uppercase tracking-wider">Jumlah Saldo</label>
                       <span className="text-xs font-black text-primary underline underline-offset-4 decoration-primary cursor-pointer" onClick={() => setAmountToConvert(balance)}>PAKAI SEMUA</span>
                  </div>
                  <div className="relative group">
                      <div className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-black text-slate-300">Rp</div>
                      <input 
                        type="number" 
                        value={amountToConvert || ''}
                        onChange={(e) => setAmountToConvert(Number(e.target.value))}
                        className="w-full pl-16 pr-6 py-8 bg-white border-2 border-slate-100 rounded-[2rem] text-3xl font-black outline-none focus:border-amber-400/30 transition-all group-hover:border-slate-200"
                        placeholder="0"
                      />
                  </div>
                  <p className="text-xs font-bold text-slate-400 px-4">Tersedia: <span className="text-slate-900">{formatIDR(balance)}</span></p>
              </div>

              <div className="flex justify-center py-2">
                   <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-sm">
                       <ArrowRightLeft className="w-6 h-6 rotate-90" />
                   </div>
              </div>

              <div className="space-y-4 opacity-70">
                  <label className="text-sm font-bold text-slate-600 uppercase tracking-wider px-2">Emas yang Diperoleh</label>
                  <div className="relative">
                      <div className="absolute right-6 top-1/2 -translate-y-1/2 text-2xl font-black text-slate-300">gr</div>
                      <input 
                        type="text" 
                        readOnly
                        value={estimatedGold.toFixed(6)}
                        className="w-full pl-6 pr-16 py-8 bg-slate-50 border-2 border-slate-100 rounded-[2rem] text-3xl font-black text-slate-900 outline-none"
                      />
                  </div>
              </div>
           </div>
        </div>

        {/* Sidebar Info/Status */}
        <div className="space-y-6">
            <div className="glass rounded-[2.5rem] p-8 border-none shadow-xl">
                <h3 className="text-xl font-bold text-slate-900 mb-8">Konfirmasi Transaksi</h3>
                
                <div className="space-y-6">
                   <div className="bg-slate-50 rounded-2xl p-4 flex items-center gap-4">
                       <div className="p-3 bg-white rounded-xl shadow-sm text-amber-500">
                           <Landmark className="w-6 h-6" />
                       </div>
                       <div className="flex-1">
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Partner Resmi</p>
                           <p className="text-sm font-bold text-slate-900 leading-tight">Pegadaian Indonesia</p>
                       </div>
                       <ShieldCheck className="text-emerald-500 w-5 h-5" />
                   </div>

                   <ul className="space-y-3">
                      <li className="flex justify-between text-sm font-medium">
                          <span className="text-slate-500">Biaya Admin</span>
                          <span className="text-slate-900 font-bold">Rp 0 (GRATIS)</span>
                      </li>
                      <li className="flex justify-between text-sm font-medium">
                          <span className="text-slate-500">Total Tagihan</span>
                          <span className="text-slate-900 font-bold">{formatIDR(amountToConvert)}</span>
                      </li>
                   </ul>

                   <div className="pt-4 border-t border-slate-100">
                        <button 
                          onClick={handleConvert}
                          disabled={loading || amountToConvert <= 0 || amountToConvert > balance}
                          className="w-full py-5 bg-slate-900 text-white font-black rounded-3xl shadow-xl hover:shadow-slate-200 hover:-translate-y-1 active:translate-y-0 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                          {loading ? "Memproses..." : "Tukarkan Sekarang"}
                          <ChevronRight className="w-5 h-5" />
                        </button>
                   </div>
                </div>
            </div>

            <div className="p-6 rounded-[2rem] bg-amber-50 border border-amber-100 flex gap-4">
                 <div className="bg-amber-400 p-2 rounded-xl h-fit text-white">
                     <Info className="w-4 h-4" />
                 </div>
                 <div className="space-y-1">
                     <p className="text-xs font-black text-amber-900 uppercase tracking-wide">Pemberitahuan</p>
                     <p className="text-xs text-amber-800 leading-relaxed font-medium">
                        Emas yang dibeli akan langsung masuk ke akun Tabungan Emas Pegadaian yang tertaut dengan nomor HP/Email Anda. Proses sinkronisasi memakan waktu maksimal 1x24 jam.
                     </p>
                 </div>
            </div>
        </div>
      </div>
    </div>
  );
}
