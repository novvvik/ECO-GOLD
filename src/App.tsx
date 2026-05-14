import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "./lib/firebase";
import Shell from "./components/layout/Shell";
import Home from "./pages/Home";
import Deposit from "./pages/Deposit";
import Convert from "./pages/Convert";
import History from "./pages/History";
import Locations from "./pages/Locations";
import Rewards from "./pages/Rewards";
import Knowledge from "./pages/Knowledge";
import Auth from "./pages/Auth";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full"
          />
          <h1 className="text-2xl font-bold text-primary font-sans italic tracking-tighter">EcoGold</h1>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <AnimatePresence mode="wait">
        <Routes>
          {!user ? (
            <Route path="*" element={<Auth />} />
          ) : (
            <Route element={<Shell user={user} />}>
              <Route path="/" element={<Home />} />
              <Route path="/deposit" element={<Deposit />} />
              <Route path="/convert" element={<Convert />} />
              <Route path="/history" element={<History />} />
              <Route path="/locations" element={<Locations />} />
              <Route path="/rewards" element={<Rewards />} />
              <Route path="/knowledge" element={<Knowledge />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          )}
        </Routes>
      </AnimatePresence>
    </BrowserRouter>
  );
}
