import React, { useState, useEffect } from "react";
import { 
  getDoc, 
  doc, 
  setDoc, 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs,
  writeBatch
} from "firebase/firestore";
import { db, auth, handleFirestoreError, OperationType } from "../lib/firebase";
import { 
  Recycle, 
  Coins, 
  TrendingUp, 
  Leaf, 
  TreePine, 
  Droplet, 
  Zap,
  Clock,
  History,
  Trophy,
  MapPin,
  BookOpen,
  AlertCircle,
  Database
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { formatIDR, cn } from "../lib/utils";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface UserProfile {
  userId: string;
  email: string;
  displayName: string;
  balance: number;
  goldBalance: number;
  totalWasteKg: number;
  role: string;
  createdAt: string;
}

const data = [
  { name: "Jan", kg: 12 },
  { name: "Feb", kg: 19 },
  { name: "Mar", kg: 15 },
  { name: "Apr", kg: 22 },
  { name: "May", kg: 30 },
  { name: "Jun", kg: 28 },
];

export default function Home() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [goldPrice, setGoldPrice] = useState({ priceIdr: 1150000, trend: "up" });
  const [errorInfo, setErrorInfo] = useState<any>(null);
  const [isSeeding, setIsSeeding] = useState(false);

  const fetchProfile = async () => {
    const user = auth.currentUser;
    if (!user) return;

    const path = `users/${user.uid}`;
    try {
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setProfile(docSnap.data() as UserProfile);
      } else {
        const newProfile: UserProfile = {
          userId: user.uid,
          email: user.email || "",
          displayName: user.displayName || "User EcoGold",
          role: "nasabah",
          balance: 0,
          goldBalance: 0,
          totalWasteKg: 0,
          createdAt: new Date().toISOString(),
        };
        await setDoc(docRef, newProfile);
        setProfile(newProfile);
      }
    } catch (err) {
      setErrorInfo(handleFirestoreError(err, OperationType.GET, path));
    }
  };

  const fetchTransactions = async () => {
    const user = auth.currentUser;
    if (!user) return;
    const path = "transactions";
    try {
      const q = query(
        collection(db, "transactions"),
        where("userId", "==", user.uid),
        orderBy("createdAt", "desc"),
        limit(5)
      );
      const querySnapshot = await getDocs(q);
      setRecentTransactions(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (err) {
      console.error("Error fetching transactions:", err);
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchTransactions();
    
    fetch("/api/gold-price")
      .then(res => res.json())
      .then(data => setGoldPrice(data))
      .catch(() => {});
  }, []);

  const seedData = async () => {
    setIsSeeding(true);
    try {
      const batch = writeBatch(db);
      
      const wasteTypes = [
        { id: 'plastik', name: 'Plastik', pricePerKg: 3500, category: 'Anorganik', icon: '🥤' },
        { id: 'kertas', name: 'Kertas', pricePerKg: 2500, category: 'Anorganik', icon: '📄' },
        { id: 'logam', name: 'Logam', pricePerKg: 8000, category: 'Anorganik', icon: '🥫' },
        { id: 'kaca', name: 'Kaca', pricePerKg: 1500, category: 'Anorganik', icon: '🫙' },
      ];

      wasteTypes.forEach(wt => {
        const ref = doc(db, "wasteTypes", wt.id);
        batch.set(ref, wt);
      });

      const statsRef = doc(db, "stats", "global");
      batch.set(statsRef, {
        totalCo2Saved: 1250,
        totalTreesSaved: 45,
        totalWasteProcessed: 500,
        updatedAt: new Date().toISOString()
      });

      await batch.commit();
      alert("Data berhasil diinisialisasi!");
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, "seed");
      alert("Gagal melakukan seeding. Pastikan Anda memiliki akses admin.");
    } finally {
      setIsSeeding(false);
    }
  };

  const isAdmin = profile?.role === 'admin' || auth.currentUser?.email === 'mesyalendra21@gmail.com';

  const stats = [
    { 
      label: "Total Sampah Disetor", 
      value: `${profile?.totalWasteKg || 0} kg`, 
      icon: Recycle, 
      color: "bg-emerald-500",
      description: "Dari awal bergabung" 
    },
    { 
      label: "Saldo Tabungan", 
      value: formatIDR(profile?.balance || 0), 
      icon: Coins, 
      color: "bg-blue-500",
      description: "Siap ditukar emas" 
    },
    { 
      label: "Tabungan Emas", 
      value: `${(profile?.goldBalance || 0).toFixed(4)} gr`, 
      icon: TrendingUp, 
      color: "bg-amber-500",
      description: "Estimasi nilai: " + formatIDR((profile?.goldBalance || 0) * goldPrice.priceIdr)
    },
  ];

  const environmentalImpact = [
    { label: "CO₂ Berkurang", value: `${((profile?.totalWasteKg || 0) * 2.5).toFixed(1)} kg`, icon: Leaf, desc: "Emisi yang dicegah" },
    { label: "Pohon Setara", value: Math.floor((profile?.totalWasteKg || 0) / 10), icon: TreePine, desc: "Kontribusi penghijauan" },
    { label: "Air Terhemat", value: `${(profile?.totalWasteKg || 0) * 15} L`, icon: Droplet, desc: "Konsumsi diredam" },
    { label: "Energi Hemat", value: `${((profile?.totalWasteKg || 0) * 0.8).toFixed(1)} kWh`, icon: Zap, desc: "Energi listrik dihemat" },
  ];

  if (errorInfo) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center p-10 text-center space-y-4">
        <div className="bg-red-50 text-red-500 p-6 rounded-[2rem] max-w-md shadow-sm border border-red-100">
           <AlertCircle className="w-12 h-12 mx-auto mb-4" />
           <h2 className="text-xl font-black mb-2">Terjadi Kesalahan Sinkronisasi</h2>
           <p className="text-sm font-medium mb-4 opacity-80">{errorInfo.error}</p>
           <div className="bg-white/50 p-4 rounded-xl text-[10px] font-mono text-left overflow-x-auto whitespace-pre">
             {JSON.stringify(errorInfo, null, 2)}
           </div>
           <button 
             onClick={() => window.location.reload()}
             className="mt-6 w-full py-3 bg-red-500 text-white font-black rounded-2xl shadow-lg shadow-red-200 hover:shadow-red-300 transition-all"
           >
             Coba Lagi
           </button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4 text-slate-400">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="font-bold uppercase tracking-widest text-xs">Memuat Profil...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-primary to-emerald-600 text-white p-8 lg:p-12 shadow-2xl">
        <div className="relative z-10 grid lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="text-4xl lg:text-6xl font-black tracking-tighter leading-[1.1] mb-2">
                Ubah Sampah <br /> Jadi Emas. 🪙
              </h1>
              <p className="text-emerald-50 text-lg lg:text-xl font-medium max-w-md">
                Kelola limbah rumah tangga Anda bersama EcoGold dan bangun aset investasi masa depan.
              </p>
            </motion.div>
            
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               transition={{ delay: 0.2 }}
               className="flex flex-wrap gap-4"
            >
              <div className="glass-dark px-4 py-2 rounded-full flex items-center gap-2 border border-white/20">
                <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                <span className="text-sm font-bold uppercase tracking-wider">Harga Emas: {formatIDR(goldPrice.priceIdr)}/gr</span>
              </div>

              {isAdmin && (
                <button 
                  onClick={seedData}
                  disabled={isSeeding}
                  className="glass-dark px-4 py-2 rounded-full flex items-center gap-2 border border-white/20 hover:bg-white/10 transition-colors"
                >
                  <Database className="w-4 h-4 text-amber-300" />
                  <span className="text-sm font-bold uppercase tracking-wider">
                    {isSeeding ? "Seeding..." : "Inisialisasi Data"}
                  </span>
                </button>
              )}
            </motion.div>
          </div>

          <div className="hidden lg:block relative h-full">
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
             <motion.div
               animate={{ y: [0, -20, 0] }}
               transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
               className="relative"
             >
                <div className="glass rounded-[3rem] p-6 shadow-2xl border border-white/30 max-w-xs mx-auto">
                    <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Total Impact</p>
                        <p className="text-slate-900 text-3xl font-black">{((profile.totalWasteKg) * 2.5).toFixed(0)} kg CO₂</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                         <div className="bg-emerald-50 rounded-xl p-3">
                             <TreePine className="text-emerald-600 w-5 h-5 mb-1" />
                             <p className="text-emerald-900 font-bold text-lg">{Math.floor((profile.totalWasteKg) / 10)}</p>
                             <p className="text-emerald-700 text-[10px] font-bold uppercase">Trees</p>
                         </div>
                         <div className="bg-blue-50 rounded-xl p-3">
                             <Droplet className="text-blue-600 w-5 h-5 mb-1" />
                             <p className="text-blue-900 font-bold text-lg">{(profile.totalWasteKg) * 15}</p>
                             <p className="text-blue-700 text-[10px] font-bold uppercase">Liters</p>
                         </div>
                    </div>
                </div>
             </motion.div>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button 
          onClick={() => navigate("/deposit")} 
          className="bg-white p-6 rounded-[2rem] border border-slate-100 hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 transition-all text-left flex flex-col gap-4 group"
        >
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-sm">
            <Recycle className="w-6 h-6" />
          </div>
          <div>
            <p className="font-black text-slate-900 text-sm uppercase tracking-tight">Setor Sampah</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Ubah jadi emas</p>
          </div>
        </button>

        <button 
          onClick={() => navigate("/locations")} 
          className="bg-white p-6 rounded-[2rem] border border-slate-100 hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 transition-all text-left flex flex-col gap-4 group"
        >
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <p className="font-black text-slate-900 text-sm uppercase tracking-tight">Cari Kantor</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Pegadaian Cabang</p>
          </div>
        </button>

        <button 
          onClick={() => navigate("/knowledge")} 
          className="bg-white p-6 rounded-[2rem] border border-slate-100 hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 transition-all text-left flex flex-col gap-4 group"
        >
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-all shadow-sm">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="font-black text-slate-900 text-sm uppercase tracking-tight">Pusat Ilmu</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Panduan sampah</p>
          </div>
        </button>

        <button 
          onClick={() => navigate("/history")} 
          className="bg-white p-6 rounded-[2rem] border border-slate-100 hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 transition-all text-left flex flex-col gap-4 group"
        >
          <div className="w-12 h-12 bg-slate-50 text-slate-600 rounded-2xl flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-all shadow-sm">
            <History className="w-6 h-6" />
          </div>
          <div>
            <p className="font-black text-slate-900 text-sm uppercase tracking-tight">Riwayat</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Aktivitas Anda</p>
          </div>
        </button>
      </section>

      {/* Main Stats */}
      <section className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="group glass p-6 rounded-[2rem] hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
          >
            <div className={cn("inline-flex p-3 rounded-2xl text-white shadow-lg mb-6", stat.color)}>
              <stat.icon className="w-6 h-6" />
            </div>
            <h3 className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-1">{stat.label}</h3>
            <p className="text-3xl font-black text-slate-900 mb-2">{stat.value}</p>
            <p className="text-slate-400 text-xs font-medium">{stat.description}</p>
          </motion.div>
        ))}
      </section>

      {/* Chart Section */}
      <section className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass rounded-[2.5rem] p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Statistik Setoran</h2>
              <p className="text-slate-500 text-sm">Target bulan ini: 50 kg</p>
            </div>
            <select className="bg-slate-100 border-none rounded-xl text-sm font-bold px-4 py-2 outline-none">
                <option>6 Bulan Terakhir</option>
                <option>Tahun Ini</option>
            </select>
          </div>
          <div className="h-72 w-full min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorKg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2ecc71" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#2ecc71" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                   contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Area type="monotone" dataKey="kg" stroke="#2ecc71" strokeWidth={4} fillOpacity={1} fill="url(#colorKg)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass rounded-[2.5rem] p-8">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Riwayat Terkini
          </h2>
          <div className="space-y-4">
            {recentTransactions.length === 0 ? (
                <div className="text-center py-10 opacity-50">
                    <History className="w-10 h-10 mx-auto mb-2" />
                    <p className="text-sm font-medium">Belum ada transaksi</p>
                </div>
            ) : (
                recentTransactions.map((tx) => (
                    <div key={tx.id} className="flex items-center gap-4 group cursor-pointer">
                        <div className={cn(
                            "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-all group-hover:scale-110",
                            tx.type === 'deposit' ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                        )}>
                            {tx.type === 'deposit' ? <Recycle className="w-5 h-5" /> : <Coins className="w-5 h-5" />}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-900 truncate">
                                {tx.type === 'deposit' ? `Setor ${tx.wasteType}` : 'Tukar Emas'}
                            </p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                                {new Date(tx.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className={cn("text-sm font-black", tx.type === 'deposit' ? "text-emerald-600" : "text-amber-600")}>
                                {tx.type === 'deposit' ? '+' : '-'}{formatIDR(tx.amount)}
                            </p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase">{tx.status}</p>
                        </div>
                    </div>
                ))
            )}
            <button className="w-full mt-4 py-3 rounded-xl border border-dashed border-slate-300 text-slate-400 text-sm font-bold hover:bg-slate-50 transition-all uppercase tracking-widest">
                Lihat Semua
            </button>
          </div>
        </div>
      </section>

      {/* Impact & Rewards Grid */}
      <section className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
              <Leaf className="w-5 h-5" />
            </span>
            Dampak Lingkunganmu
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {environmentalImpact.map((impact, i) => (
              <motion.div
                key={impact.label}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                className="glass p-6 rounded-[2rem] border-none flex flex-col items-center text-center group transition-all duration-300 hover:bg-white"
              >
                <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-emerald-500 mb-4 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300">
                   <impact.icon className="w-6 h-6" />
                </div>
                <p className="text-2xl font-black text-slate-900 mb-1">{impact.value}</p>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{impact.label}</p>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="glass bg-slate-900 text-white rounded-[2.5rem] p-8 relative overflow-hidden">
           <div className="absolute top-0 right-0 w-32 h-32 bg-[#2ecc71]/20 rounded-full blur-2xl" />
           <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                 <h2 className="text-xl font-bold">Reward Berikutnya</h2>
                 <Trophy className="w-6 h-6 text-amber-400" />
              </div>
              <p className="text-slate-400 text-sm font-medium mb-6">Setor 15kg lagi untuk membuka lencana <span className="text-white font-bold">Waste Warrior</span> dan dapatkan bonus 1,000 poin.</p>
              
              <div className="space-y-4">
                 <div className="w-full bg-white/10 rounded-full h-3">
                    <div className="bg-amber-400 h-full w-[65%] rounded-full" />
                 </div>
                 <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
                    <span>35 / 50 KG</span>
                    <span className="text-amber-400">65% Selesai</span>
                 </div>
                 <button 
                  onClick={() => navigate("/rewards")}
                  className="w-full py-4 mt-2 bg-white/10 hover:bg-white/20 rounded-2xl text-xs font-black uppercase tracking-[0.2em] transition-all border border-white/10"
                 >
                   Detail Hadiah
                 </button>
              </div>
           </div>
        </div>
      </section>
    </div>
  );
}
