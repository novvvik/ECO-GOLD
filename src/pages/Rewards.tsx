import React from "react";
import { Trophy, Star, Shield, Zap, Medal, Gift, ArrowRight, Target } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "../lib/utils";

const badges = [
  { id: 1, name: "Eco Starter", desc: "Setoran pertama berhasil dilakukan", icon: Zap, color: "bg-blue-100 text-blue-600", unlocked: true },
  { id: 2, name: "Waste Warrior", desc: "Telah menyetor total 50kg sampah", icon: Shield, color: "bg-emerald-100 text-emerald-600", unlocked: true },
  { id: 3, name: "Gold Seeker", desc: "Konversi pertama ke saldo emas", icon: Star, color: "bg-amber-100 text-amber-600", unlocked: true },
  { id: 4, name: "Planet Protector", desc: "Menghindari 100kg emisi CO2", icon: Medal, color: "bg-indigo-100 text-indigo-600", unlocked: false },
  { id: 5, name: "Elite Member", desc: "Transaksi rutin selama 3 bulan", icon: Trophy, color: "bg-rose-100 text-rose-600", unlocked: false },
  { id: 6, name: "Gift Master", desc: "Undang 5 teman bergabung", icon: Gift, color: "bg-purple-100 text-purple-600", unlocked: false },
];

export default function Rewards() {
  return (
    <div className="space-y-10">
      <header className="space-y-2">
        <h1 className="text-3xl font-black text-slate-900 tracking-tighter">Pencapaian & Hadiah</h1>
        <p className="text-slate-500 font-medium">Kumpulkan lencana dan dapatkan keuntungan eksklusif sebagai Pahlawan EcoGold.</p>
      </header>

      {/* Progress Card */}
      <section className="bg-gradient-to-br from-[#16A34A] to-emerald-700 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        
        <div className="relative z-10 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 rounded-full text-xs font-black uppercase tracking-widest mb-6 backdrop-blur-md">
              <Target className="w-4 h-4" /> Milestone Berikutnya
            </div>
            <h2 className="text-4xl font-extrabold tracking-tight mb-4">Level 3: Green Knight</h2>
            <div className="space-y-4">
              <div className="w-full bg-black/10 rounded-full h-4 overflow-hidden border border-white/10">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: "65%" }}
                  className="h-full bg-amber-400"
                />
              </div>
              <div className="flex justify-between text-sm font-bold text-emerald-50">
                <span>650 / 1000 Poin</span>
                <span>350 Poin lagi</span>
              </div>
            </div>
          </div>
          
          <div className="glass-dark p-8 rounded-[2rem] border-white/20">
             <h3 className="text-xl font-bold mb-4">Keuntungan Level Terkini:</h3>
             <ul className="space-y-3">
               {[
                 "Bonus konversi emas +1%",
                 "Prioritas penjemputan sampah",
                 "Stiker profil eksklusif",
                 "Akses ke event komunitas"
               ].map((benefit, i) => (
                 <li key={i} className="flex items-center gap-3 text-sm font-medium">
                   <div className="w-5 h-5 bg-amber-400 text-emerald-900 rounded-full flex items-center justify-center text-[10px] font-black">✓</div>
                   {benefit}
                 </li>
               ))}
             </ul>
          </div>
        </div>
      </section>

      {/* Badges Grid */}
      <section className="space-y-6">
        <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3 uppercase tracking-tight">
          <Trophy className="w-6 h-6 text-amber-500" /> Koleksi Lencana
        </h2>
        
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
          {badges.map((badge, i) => (
            <motion.div
              key={badge.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className={cn(
                "p-8 rounded-[2.5rem] border-2 transition-all relative group",
                badge.unlocked 
                  ? "bg-white border-slate-100 shadow-sm" 
                  : "bg-slate-50 border-transparent grayscale opacity-60"
              )}
            >
              <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform", badge.color)}>
                 <badge.icon className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-black text-slate-900 mb-1">{badge.name}</h3>
              <p className="text-sm text-slate-500 font-medium leading-relaxed">{badge.desc}</p>
              
              {!badge.unlocked && (
                <div className="absolute top-6 right-6">
                   <Shield className="w-5 h-5 text-slate-300" />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </section>

      {/* Referral Section */}
      <section className="bg-slate-900 rounded-[2.5rem] p-10 text-white flex flex-col md:flex-row items-center justify-between gap-10">
         <div className="space-y-4 max-w-md">
            <h2 className="text-3xl font-black tracking-tight">Undang Teman, <br />Dapatkan Bonus! 🎁</h2>
            <p className="text-slate-400 font-medium">Setiap teman yang menggunakan kode referralmu akan memberikan 100 poin emas untuk kalian berdua.</p>
         </div>
         <div className="flex items-center gap-2 p-2 bg-white/5 rounded-2xl border border-white/10 w-full md:w-auto">
            <div className="px-6 font-mono font-black text-xl tracking-widest text-[#2ecc71]">ECOHERO24</div>
            <button className="bg-[#2ecc71] px-8 py-4 rounded-xl text-sm font-black uppercase tracking-widest hover:bg-[#27ae60] transition-all">Salin</button>
         </div>
      </section>
    </div>
  );
}
