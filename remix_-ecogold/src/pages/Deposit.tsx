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
  Recycle, 
  Trash2, 
  ChevronRight, 
  AlertCircle,
  Plus,
  Minus,
  CheckCircle2,
  Leaf,
  Camera
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { formatIDR, cn } from "../lib/utils";
import { useNavigate } from "react-router-dom";

const WASTE_CATEGORIES = [
  { id: 'plastik', name: 'Plastik', icon: '🥤', price: 3500, color: 'text-blue-600 bg-blue-50' },
  { id: 'kertas', name: 'Kertas', icon: '📄', price: 2500, color: 'text-amber-600 bg-amber-50' },
  { id: 'logam', name: 'Logam', icon: '🥫', price: 8000, color: 'text-slate-600 bg-slate-50' },
  { id: 'kaca', name: 'Kaca', icon: '🫙', price: 1500, color: 'text-emerald-600 bg-emerald-50' },
];

export default function Deposit() {
  const [selectedCategory, setSelectedCategory] = useState(WASTE_CATEGORIES[0]);
  const [weight, setWeight] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBalance = async () => {
      const user = auth.currentUser;
      if (!user) return;
      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists()) {
          setBalance(snap.data().balance);
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, `users/${user.uid}`);
      }
    };
    fetchBalance();
  }, []);

  const handleDeposit = async () => {
    const user = auth.currentUser;
    if (!user) return;

    setLoading(true);
    const amount = selectedCategory.price * weight;

    try {
      // 1. Create Transaction
      await addDoc(collection(db, "transactions"), {
        userId: user.uid,
        type: "deposit",
        wasteType: selectedCategory.name,
        weight: weight,
        amount: amount,
        status: "completed",
        createdAt: new Date().toISOString(),
      });

      // 2. Update User Profile
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        balance: increment(amount),
        totalWasteKg: increment(weight),
      });

      setSubmitted(true);
      setTimeout(() => navigate("/"), 3000);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, "transactions/deposit");
      alert("Gagal melakukan setoran. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="h-[70vh] flex items-center justify-center">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center space-y-6"
        >
          <div className="w-24 h-24 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-xl">
             <CheckCircle2 className="w-12 h-12" />
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-black text-slate-900">Setoran Berhasil!</h2>
            <p className="text-slate-500 font-medium whitespace-pre-line">
              Anda baru saja menyelamatkan bumi <br /> dan mendapatkan {formatIDR(selectedCategory.price * weight)}
            </p>
          </div>
          <motion.div 
            animate={{ width: ["0%", "100%"] }}
            transition={{ duration: 3 }}
            className="h-1 bg-emerald-500 rounded-full mx-auto max-w-[200px]"
          />
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Kembali ke dashboard dalam 3 detik...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-primary font-black uppercase tracking-widest text-xs">
                <Recycle className="w-4 h-4" />
                Setoran Baru
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Setor Sampah Anda</h1>
            <p className="text-slate-500 font-medium">Pilih jenis sampah dan tentukan beratnya.</p>
          </div>
          <div className="glass px-6 py-4 rounded-3xl border-primary/20 flex items-center gap-4">
              <div className="bg-primary/10 p-2 rounded-xl">
                <AlertCircle className="text-primary w-5 h-5" />
              </div>
              <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Saldo Saat Ini</p>
                  <p className="text-lg font-black text-slate-900">{balance !== null ? formatIDR(balance) : "Rp --"}</p>
              </div>
          </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-10">
        <div className="space-y-8">
           {/* Step 1: Category */}
           <div className="space-y-4">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600 text-sm">1</span>
                Pilih Kategori Sampah
              </h3>
              <div className="grid grid-cols-2 gap-4">
                 {WASTE_CATEGORIES.map(cat => (
                   <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat)}
                    className={cn(
                        "p-6 rounded-[2rem] border-2 transition-all flex flex-col items-center gap-4 text-center group relative overflow-hidden",
                        selectedCategory.id === cat.id 
                            ? "border-primary bg-primary shadow-xl shadow-primary/20" 
                            : "border-slate-100 bg-white hover:border-slate-200"
                    )}
                   >
                     <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center text-2xl transition-transform group-hover:scale-110",
                        selectedCategory.id === cat.id ? "bg-white/20" : cat.color
                     )}>
                        {cat.icon}
                     </div>
                     <div>
                        <p className={cn("text-lg font-black", selectedCategory.id === cat.id ? "text-white" : "text-slate-900")}>{cat.name}</p>
                        <p className={cn("text-[10px] font-bold uppercase tracking-wider", selectedCategory.id === cat.id ? "text-white/70" : "text-slate-400")}>
                            {formatIDR(cat.price)}/kg
                        </p>
                     </div>
                     {selectedCategory.id === cat.id && (
                         <div className="absolute top-2 right-2 text-white">
                             <CheckCircle2 className="w-5 h-5" />
                         </div>
                     )}
                   </button>
                 ))}
              </div>
           </div>

           {/* Step 2: Weight */}
           <div className="space-y-4">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600 text-sm">2</span>
                Tentukan Berat
              </h3>
              <div className="glass p-8 rounded-[2rem] flex items-center justify-between gap-8 border-none shadow-xl shadow-slate-100">
                  <button 
                    onClick={() => setWeight(Math.max(0.5, weight - 0.5))}
                    className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors"
                  >
                    <Minus className="w-6 h-6" />
                  </button>
                  <div className="text-center flex-1">
                      <span className="text-5xl font-black text-slate-900">{weight}</span>
                      <span className="text-xl font-black text-slate-400 ml-2">kg</span>
                  </div>
                  <button 
                    onClick={() => setWeight(weight + 0.5)}
                    className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors"
                  >
                    <Plus className="w-6 h-6" />
                  </button>
              </div>
           </div>
        </div>

        {/* Right Session Summary */}
        <div className="lg:sticky lg:top-10 h-fit space-y-6">
            <div className="glass rounded-[2.5rem] p-8 border-none shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                
                <div className="relative space-y-6">
                    <h3 className="text-xl font-bold text-slate-900 mb-8">Ringkasan Setoran</h3>
                    
                    <div className="space-y-4">
                        <div className="flex justify-between items-center px-4 py-3 bg-slate-50 rounded-2xl">
                            <span className="text-sm font-bold text-slate-500 uppercase">Barang</span>
                            <span className="font-black text-slate-900 underline underline-offset-4 decoration-primary">{selectedCategory.name}</span>
                        </div>
                        <div className="flex justify-between items-center px-4 py-3 bg-slate-50 rounded-2xl">
                            <span className="text-sm font-bold text-slate-500 uppercase">Berat Total</span>
                            <span className="font-black text-slate-900">{weight} kg</span>
                        </div>
                        <div className="flex justify-between items-center px-4 py-3 bg-emerald-50 rounded-2xl">
                            <span className="text-sm font-bold text-emerald-600 uppercase">Estimasi Hasil</span>
                            <span className="font-black text-emerald-600 text-lg">{formatIDR(selectedCategory.price * weight)}</span>
                        </div>
                    </div>

                    <div className="pt-6 text-center space-y-4">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                           <Leaf className="w-3 h-3" />
                           Selamatkan {((weight * 2.5)).toFixed(1)} kg CO₂
                        </div>
                        <p className="text-[10px] font-medium text-slate-400">
                             Dengan menekan tombol di bawah, Anda setuju dengan Syarat & Ketentuan Bank Sampah Induk.
                        </p>
                    </div>

                    <button 
                      onClick={handleDeposit}
                      disabled={loading}
                      className="w-full py-5 bg-primary text-white font-black rounded-3xl shadow-xl shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-1 active:translate-y-0 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                      {loading ? "Memproses..." : "Konfirmasi Setoran"}
                      <ChevronRight className="w-5 h-5" />
                    </button>
                    
                    <button className="w-full py-4 border-2 border-slate-100 text-slate-400 font-bold rounded-2xl hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
                        <Camera className="w-4 h-4" />
                        Tambah Foto
                    </button>
                </div>
            </div>

            <div className="p-8 rounded-[2.5rem] bg-slate-900 text-white space-y-4">
                <h4 className="font-bold flex items-center gap-2">
                    <AlertCircle className="text-amber-400 w-5 h-5" />
                    Info Penting
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                    Pastikan sampah sudah dibersihkan dan dipilah sesuai kategori. Sampah yang bercampur akan menurunkan nilai setor atau ditolak petugas.
                </p>
            </div>
        </div>
      </div>
    </div>
  );
}
