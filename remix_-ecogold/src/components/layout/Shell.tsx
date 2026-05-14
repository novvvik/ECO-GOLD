import React, { useState, useEffect } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { User, signOut } from "firebase/auth";
import { auth, db } from "../../lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { 
  BarChart3, 
  Recycle, 
  Coins, 
  History, 
  MapPin,
  Trophy,
  BookOpen,
  User as UserIcon, 
  LogOut, 
  Menu, 
  X,
  Leaf,
  ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn, formatIDR } from "../../lib/utils";

interface ShellProps {
  user: User;
}

export default function Shell({ user }: ShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user?.uid) return;
    
    const unsub = onSnapshot(
      doc(db, "users", user.uid), 
      (doc) => {
        if (doc.exists()) {
          setProfile(doc.data());
        }
      },
      (error) => {
        console.error("Shell: Profile subscription error", error);
        // Silently fail or redirect if needed, but onSnapshot needs error callback
      }
    );
    return unsub;
  }, [user.uid]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  const navItems = [
    { name: "Dashboard", href: "/", icon: BarChart3 },
    { name: "Setor Sampah", href: "/deposit", icon: Recycle },
    { name: "Tukar Emas", href: "/convert", icon: Coins },
    { name: "Riwayat", href: "/history", icon: History },
    { name: "Kantor Pegadaian", href: "/locations", icon: MapPin },
    { name: "Hadiah & Ranks", href: "/rewards", icon: Trophy },
    { name: "Pusat Ilmu", href: "/knowledge", icon: BookOpen },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex flex-col w-72 bg-white border-r border-slate-200">
        <div className="p-8 flex items-center gap-3">
          <div className="bg-primary/20 p-2 rounded-xl">
            <Leaf className="text-primary w-6 h-6" />
          </div>
          <span className="text-2xl font-black text-slate-900 tracking-tighter">EcoGold</span>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group text-sm font-bold uppercase tracking-widest",
                  isActive
                    ? "bg-[#2ecc71] text-white shadow-lg shadow-emerald-200"
                    : "text-slate-400 hover:bg-slate-50"
                )
              }
            >
              <item.icon className="w-5 h-5 transition-transform group-hover:scale-110" />
              <span>{item.name}</span>
              <ChevronRight className="ml-auto w-4 h-4 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
            </NavLink>
          ))}
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl transition-all text-sm font-bold uppercase tracking-widest mt-4"
          >
            <LogOut className="w-5 h-5" />
            <span>Keluar</span>
          </button>
        </nav>

        <div className="p-6 border-t border-slate-50">
          <div className="bg-slate-50 p-4 rounded-2xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white font-black">
              {(profile?.displayName || user.displayName || user.email)?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-black text-slate-900 truncate uppercase">
                {profile?.displayName || user.displayName || "User"}
              </p>
              <p className="text-[10px] font-bold text-slate-400 truncate uppercase">Nasabah</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Top Nav */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <header className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Leaf className="text-primary w-6 h-6" />
            <span className="text-xl font-black tracking-tighter">EcoGold</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-primary font-bold text-sm border border-slate-200">
              {(profile?.displayName || user.displayName || user.email)?.[0]?.toUpperCase()}
            </div>
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 lg:p-10">
          <div className="max-w-6xl mx-auto">
            {/* Header with Profile Info */}
            <header className="hidden lg:flex items-center justify-between mb-10">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Halo, {profile?.displayName || user.displayName || "Pahlawan Lingkungan"}! 👋</h2>
                <p className="text-sm text-slate-500 font-medium">Selamat datang kembali di EcoGold.</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm font-black text-slate-900">{profile?.displayName || user.displayName || "User"}</p>
                  <p className="text-xs font-bold text-primary">{profile?.role === 'admin' ? 'Administrator' : 'Nasabah EcoGold'}</p>
                </div>
                <button 
                   onClick={handleLogout}
                   className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-red-500 transition-all shadow-sm group"
                >
                  <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </button>
              </div>
            </header>

            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] lg:hidden"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed inset-y-0 left-0 w-[300px] bg-white z-[110] flex flex-col lg:hidden shadow-[20px_0_60px_-15px_rgba(0,0,0,0.1)]"
            >
              <div className="p-10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Leaf className="text-[#16A34A] w-8 h-8" />
                  <span className="text-3xl font-black tracking-tighter text-slate-900">EcoGold</span>
                </div>
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-2 hover:bg-slate-50 rounded-full text-slate-400 transition-colors"
                >
                  <X className="w-8 h-8" />
                </button>
              </div>

              <nav className="flex-1 px-6 space-y-4 pt-4 overflow-y-auto">
                {navItems.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsSidebarOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-6 px-8 py-5 rounded-[1.5rem] transition-all duration-300 font-extrabold text-sm uppercase tracking-widest",
                        isActive
                          ? "bg-[#2ecc71] text-white shadow-2xl shadow-emerald-200"
                          : "text-slate-400 hover:bg-slate-50"
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <item.icon className={cn("w-6 h-6", isActive ? "text-white" : "text-slate-400")} />
                        <span>{item.name}</span>
                      </>
                    )}
                  </NavLink>
                ))}
                
                {/* Explicit Logout Button in nav list */}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-6 px-8 py-5 text-red-500 hover:bg-red-50 rounded-[1.5rem] transition-all font-extrabold text-sm uppercase tracking-widest mt-4"
                >
                  <LogOut className="w-6 h-6" />
                  <span>Keluar</span>
                </button>
              </nav>

              <div className="p-8 border-t border-slate-50 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-white font-black text-xl shadow-lg ring-4 ring-white">
                  {(profile?.displayName || user.displayName || user.email)?.[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black text-slate-900 truncate uppercase tracking-tight">
                    {profile?.displayName || user.displayName || "User"}
                  </p>
                  <p className="text-[10px] font-bold text-slate-400 truncate uppercase">ID Nasabah: {user.uid.slice(0, 8)}</p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
