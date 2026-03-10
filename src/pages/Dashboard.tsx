import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { Play, BookOpen, Trophy, Clock } from 'lucide-react';

interface Quiz {
  id: number;
  title: string;
  description: string;
  image_url: string;
}

export default function Dashboard() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/quizzes')
      .then(res => res.json())
      .then(data => {
        setQuizzes(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch quizzes', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12 text-center"
      >
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
          Bilimingizni sinab ko'ring
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Turli xil mavzulardagi viktorinalarni yeching, yangi bilimlarga ega bo'ling va boshqa ishtirokchilar bilan bellashing.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {quizzes.map((quiz, index) => (
          <motion.div
            key={quiz.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 border border-slate-100 flex flex-col"
          >
            <div className="relative h-48 overflow-hidden">
              <img 
                src={quiz.image_url || `https://picsum.photos/seed/${quiz.id}/800/600`} 
                alt={quiz.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end text-white">
                <h3 className="text-2xl font-bold leading-tight">{quiz.title}</h3>
              </div>
            </div>
            
            <div className="p-6 flex-grow flex flex-col">
              <p className="text-slate-600 mb-6 flex-grow line-clamp-2">
                {quiz.description}
              </p>
              
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <div className="flex gap-4 text-sm text-slate-500 font-medium">
                  <span className="flex items-center gap-1.5"><BookOpen size={16} className="text-indigo-500" /> Savollar</span>
                  <span className="flex items-center gap-1.5"><Clock size={16} className="text-emerald-500" /> 5 daqiqa</span>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <Link 
                  to={`/quiz/${quiz.id}`}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm shadow-indigo-200"
                >
                  <Play size={18} fill="currentColor" /> Boshlash
                </Link>
                <Link 
                  to={`/result/${quiz.id}`}
                  className="px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl font-semibold flex items-center justify-center transition-colors"
                  title="Natijalar"
                >
                  <Trophy size={20} className="text-amber-500" />
                </Link>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
