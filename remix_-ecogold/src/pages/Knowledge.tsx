import React from "react";
import { BookOpen, Info, CheckCircle2, AlertTriangle, Lightbulb, Recycle, TrendingUp, HandCoins } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "../lib/utils";

const guides = [
  {
    title: "Cara Memilah Sampah",
    desc: "Pisahkan sampah Anda menjadi 4 kategori utama untuk nilai tukar maksimal.",
    icon: Recycle,
    items: [
      { type: "Plastik", color: "bg-blue-500", detail: "Botol PET, Gelas minuman, Plastik kemasan bersih." },
      { type: "Kertas", color: "bg-amber-500", detail: "Kardus, Kertas HVS, Koran, Majalah bekas." },
      { type: "Logam", color: "bg-slate-500", detail: "Kaleng minuman, Seng, Besi tua, Alumunium." },
      { type: "Kaca", color: "bg-teal-500", detail: "Botol sirup, Toples kaca, Botol parfum." }
    ]
  },
  {
    title: "Investasi Emas Pegadaian",
    desc: "Saldo EcoGold Anda dikonversi ke gramasi emas murni (99.9%).",
    icon: TrendingUp,
    tips: [
      "Harga emas cenderung naik dalam jangka panjang.",
      "Saldo emas dapat dicairkan menjadi uang tunai kapan saja.",
      "Emas fisik dapat diambil jika saldo mencapai 1 gram.",
      "Investasi aman dan diawasi oleh OJK."
    ]
  }
];

export default function Knowledge() {
  return (
    <div className="space-y-12">
      <header className="space-y-3">
        <div className="inline-flex p-3 bg-emerald-100 text-emerald-600 rounded-2xl mb-2">
          <BookOpen className="w-6 h-6" />
        </div>
        <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Pusat Pembelajaran</h1>
        <p className="text-lg text-slate-500 font-medium max-w-2xl">Pahami cara memaksimalkan kontribusi lingkungan Anda dan amankan masa depan finansial dengan emas.</p>
      </header>

      <section className="grid lg:grid-cols-2 gap-8">
        {guides.map((guide, i) => (
          <motion.div
            key={guide.title}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.2 }}
            className="bg-white rounded-[3rem] p-10 shadow-xl shadow-slate-100 border border-slate-50 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
               <guide.icon className="w-40 h-40" />
            </div>

            <h2 className="text-2xl font-black text-slate-900 mb-2">{guide.title}</h2>
            <p className="text-slate-500 font-medium mb-10 leading-relaxed">{guide.desc}</p>

            {guide.items ? (
              <div className="grid gap-4">
                {guide.items.map(item => (
                  <div key={item.type} className="flex gap-4 p-5 bg-slate-50 rounded-[2rem] border border-transparent hover:border-slate-200 transition-all">
                    <div className={cn("w-10 h-10 rounded-xl shrink-0 flex items-center justify-center text-white font-black text-[10px]", item.color)}>
                      {item.type[0]}
                    </div>
                    <div>
                      <p className="font-black text-slate-900 mb-0.5">{item.type}</p>
                      <p className="text-xs text-slate-500 font-medium">{item.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {guide.tips?.map((tip, idx) => (
                  <div key={idx} className="flex gap-4 items-start">
                    <div className="w-6 h-6 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shrink-0 mt-1">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <p className="text-sm text-slate-700 font-bold leading-relaxed">{tip}</p>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        ))}
      </section>

      {/* Pro Tips Section */}
      <section className="bg-amber-50 rounded-[3rem] p-10 border border-amber-100">
         <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-amber-400 text-amber-900 rounded-2xl">
               <Lightbulb className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-black text-slate-900">Tips Pahlawan Pro</h2>
         </div>
         <div className="grid md:grid-cols-3 gap-8">
            <div className="space-y-3">
               <h3 className="font-bold text-slate-900 flex items-center gap-2">
                 <AlertTriangle className="w-4 h-4 text-amber-500" /> Pastikan Bersih
               </h3>
               <p className="text-sm text-slate-600 font-medium leading-relaxed">Sampah yang kotor atau basah sulit didaur ulang dan memiliki nilai ekonomis yang rendah. Bersihkan sisa makanan sebelum menyetor.</p>
            </div>
            <div className="space-y-3">
               <h3 className="font-bold text-slate-900 flex items-center gap-2">
                 <HandCoins className="w-4 h-4 text-emerald-500" /> Pantau Harga Emas
               </h3>
               <p className="text-sm text-slate-600 font-medium leading-relaxed">Konversikan saldo sampah Anda saat harga emas sedang stabil atau dalam tren naik untuk mendapatkan gramasi terbaik.</p>
            </div>
            <div className="space-y-3">
               <h3 className="font-bold text-slate-900 flex items-center gap-2">
                 <Recycle className="w-4 h-4 text-blue-500" /> Urutkan Berdasarkan Jenis
               </h3>
               <p className="text-sm text-slate-600 font-medium leading-relaxed">Sampah plastik jenis PET (botol bening) biasanya dihargai lebih tinggi daripada plastik campuran. Pisahkan secara spesifik.</p>
            </div>
         </div>
      </section>
    </div>
  );
}
