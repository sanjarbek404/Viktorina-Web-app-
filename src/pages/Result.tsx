import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Trophy, Home, RotateCcw, Medal, Star } from 'lucide-react';

interface LeaderboardEntry {
  username: string;
  score: number;
  total: number;
  created_at: string;
}

export default function Result() {
  const { id } = useParams();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/quizzes/${id}/leaderboard`)
      .then(res => res.json())
      .then(data => {
        setLeaderboard(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch leaderboard', err);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-10">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-amber-100 text-amber-500 mb-6 shadow-xl shadow-amber-100/50">
          <Trophy size={48} />
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
          Natijalar va Reyting
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Sizning va boshqa ishtirokchilarning natijalari bilan tanishing.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden"
          >
            <div className="bg-indigo-600 px-8 py-6 flex items-center justify-between text-white">
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <Medal size={28} className="text-amber-300" /> Top 10 Ishtirokchilar
              </h2>
            </div>
            
            <div className="p-0">
              {leaderboard.length === 0 ? (
                <div className="p-10 text-center text-slate-500">
                  Hali hech kim bu viktorinani yechmadi. Birinchi bo'ling!
                </div>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {leaderboard.map((entry, index) => (
                    <motion.li 
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + index * 0.05 }}
                      className="flex items-center justify-between px-8 py-5 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                          index === 0 ? 'bg-amber-100 text-amber-600' :
                          index === 1 ? 'bg-slate-200 text-slate-600' :
                          index === 2 ? 'bg-orange-100 text-orange-600' :
                          'bg-slate-100 text-slate-500'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 text-lg">{entry.username}</p>
                          <p className="text-sm text-slate-500">
                            {new Date(entry.created_at).toLocaleDateString('uz-UZ', {
                              day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="bg-indigo-50 px-4 py-2 rounded-xl text-indigo-700 font-bold text-xl flex items-center gap-2">
                          {entry.score} <span className="text-sm text-indigo-400 font-medium">/ {entry.total}</span>
                        </div>
                      </div>
                    </motion.li>
                  ))}
                </ul>
              )}
            </div>
          </motion.div>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8 text-center"
          >
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Yana urinib ko'rasizmi?</h3>
            <p className="text-slate-600 mb-6 text-sm">
              Natijangizni yaxshilash uchun viktorinani qaytadan yechishingiz mumkin.
            </p>
            <Link 
              to={`/quiz/${id}`}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-indigo-200"
            >
              <RotateCcw size={20} /> Qaytadan boshlash
            </Link>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Link 
              to="/"
              className="w-full bg-white hover:bg-slate-50 border-2 border-slate-200 text-slate-700 py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <Home size={20} /> Bosh sahifaga qaytish
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
