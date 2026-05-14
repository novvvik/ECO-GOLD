import React, { useState } from "react";
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  updateProfile
} from "firebase/auth";
import { auth, db } from "../lib/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { 
  Recycle, 
  Coins, 
  Mail, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Leaf,
  Smartphone
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../lib/utils";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const res = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(res.user, { displayName: name });
        // Create user document
        await setDoc(doc(db, "users", res.user.uid), {
          userId: res.user.uid,
          email: res.user.email,
          displayName: name,
          role: "nasabah",
          balance: 0,
          goldBalance: 0,
          totalWasteKg: 0,
          createdAt: new Date().toISOString(),
        });
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const res = await signInWithPopup(auth, provider);
      const userDoc = await getDoc(doc(db, "users", res.user.uid));
      if (!userDoc.exists()) {
        await setDoc(doc(db, "users", res.user.uid), {
          userId: res.user.uid,
          email: res.user.email,
          displayName: res.user.displayName,
          role: "nasabah",
          balance: 0,
          goldBalance: 0,
          totalWasteKg: 0,
          createdAt: new Date().toISOString(),
        });
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const demoLogin = async (role: string) => {
     // For demo purposes, we can't easily sign in as specific roles without real accounts
     // but we can suggest the email
     setEmail(`demo-${role}@ecogold.test`);
     setPassword("password123");
     setError("Klik 'Masuk' dengan detail demo ini (Password: password123)");
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-[#F8FAFC]">
      {/* Left Branding */}
      <div className="hidden lg:flex relative bg-[#16A34A] overflow-hidden flex-col justify-center p-24 text-white">
        <div className="absolute top-0 right-0 w-[120%] h-[120%] bg-emerald-500 rounded-full blur-[160px] -translate-y-1/2 translate-x-1/4 opacity-30 animate-pulse" />
        
        <div className="relative z-10">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-4 mb-24"
          >
            <div className="bg-white p-4 rounded-[2rem] shadow-2xl">
              <Leaf className="w-12 h-12 text-[#16A34A]" />
            </div>
            <span className="text-5xl font-black tracking-tighter">EcoGold</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-[6.5rem] font-black tracking-tighter leading-[0.85] mb-12"
          >
            Ubah Sampah <br /> Jadi Investasi.
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-emerald-50/90 text-[1.75rem] font-medium max-w-xl leading-relaxed"
          >
            Platform bank sampah digital yang terintegrasi langsung dengan <span className="text-white font-black underline decoration-amber-400 decoration-8 underline-offset-8">tabungan emas Pegadaian</span>.
          </motion.p>
        </div>
      </div>

      {/* Right Auth Card */}
      <div className="flex items-center justify-center p-6 lg:p-24">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-lg bg-white rounded-[4rem] p-12 lg:p-16 shadow-[0_60px_120px_-20px_rgba(0,0,0,0.08)] border border-slate-50"
        >
          {/* Tabs */}
          <div className="flex p-2 bg-[#F1F5F9] rounded-[2.5rem] mb-14">
            <button 
              onClick={() => setIsLogin(true)}
              className={cn(
                "flex-1 py-5 text-sm font-black uppercase tracking-[0.2em] rounded-[2rem] transition-all duration-400",
                isLogin ? "bg-white text-[#16A34A] shadow-sm scale-[1.02]" : "text-slate-400"
              )}
            >
              Masuk
            </button>
            <button 
              onClick={() => setIsLogin(false)}
              className={cn(
                "flex-1 py-5 text-sm font-black uppercase tracking-[0.2em] rounded-[2rem] transition-all duration-400",
                !isLogin ? "bg-white text-[#16A34A] shadow-sm scale-[1.02]" : "text-slate-400"
              )}
            >
              Daftar
            </button>
          </div>

          <form onSubmit={handleAuth} className="space-y-10">
            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-3"
                >
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.25em] ml-2">Nama Lengkap</label>
                  <div className="relative group">
                    <User className="absolute left-8 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-300 group-focus-within:text-[#16A34A] transition-colors" />
                    <input 
                      type="text" 
                      required={!isLogin}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-20 pr-8 py-6 bg-[#F8FAFC] border-none rounded-[2rem] outline-none focus:ring-4 focus:ring-[#16A34A]/10 transition-all font-bold text-slate-700"
                      placeholder="Masukkan nama Anda"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-3">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.25em] ml-2">Email</label>
              <div className="relative group">
                <Mail className="absolute left-8 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-300 group-focus-within:text-[#16A34A] transition-colors" />
                <input 
                  type="email" 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-20 pr-8 py-6 bg-[#F8FAFC] border-none rounded-[2rem] outline-none focus:ring-4 focus:ring-[#16A34A]/10 transition-all font-bold text-slate-700"
                  placeholder="email@anda.com"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.25em] ml-2">Kata Sandi</label>
              <div className="relative group">
                <Lock className="absolute left-8 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-300 group-focus-within:text-[#16A34A] transition-colors" />
                <input 
                  type={showPassword ? "text" : "password"} 
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-20 pr-16 py-6 bg-[#F8FAFC] border-none rounded-[2rem] outline-none focus:ring-4 focus:ring-[#16A34A]/10 transition-all font-bold text-slate-700"
                  placeholder="••••••••"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-8 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
                </button>
              </div>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-5 bg-red-50 rounded-[1.5rem] flex items-center gap-4 text-red-500 text-xs font-black uppercase tracking-wider border border-red-100"
              >
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span>{error}</span>
              </motion.div>
            )}

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-6 bg-[#2ecc71] text-white text-sm font-black uppercase tracking-[0.2em] rounded-[2rem] shadow-[0_20px_40px_-10px_rgba(46,204,113,0.3)] hover:shadow-[0_30px_60px_-15px_rgba(46,204,113,0.4)] hover:-translate-y-1.5 active:scale-95 transition-all flex items-center justify-center gap-4 disabled:opacity-50"
            >
              {loading ? "Memproses..." : (isLogin ? "Masuk" : "Daftar Sekarang")}
              {!loading && <ArrowRight className="w-6 h-6" />}
            </button>
          </form>

          <div className="relative my-12">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-100" /></div>
            <div className="relative flex justify-center text-[11px] font-black uppercase tracking-[0.3em] text-slate-300"><span className="bg-white px-10">Atau</span></div>
          </div>

          <button 
            onClick={signInWithGoogle}
            className="w-full py-5 bg-white border-2 border-slate-100 text-slate-500 text-xs font-black uppercase tracking-[0.15em] rounded-[2rem] hover:bg-slate-50 hover:border-slate-200 transition-all flex items-center justify-center gap-4 shadow-sm"
          >
            <img src="https://www.google.com/favicon.ico" className="w-5 h-5 grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all" alt="google" />
            Lanjutkan dengan Google
          </button>
        </motion.div>
      </div>
    </div>
  );
}
