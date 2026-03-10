import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, XCircle, ArrowRight, Timer, AlertTriangle } from 'lucide-react';

interface Question {
  id: number;
  question_text: string;
  options: string[];
  correct_option_index: number;
}

interface QuizData {
  id: number;
  title: string;
  questions: Question[];
}

export default function Quiz({ user }: { user: { id: number; username: string } }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/quizzes/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Viktorina topilmadi');
        return res.json();
      })
      .then(data => {
        setQuiz(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  useEffect(() => {
    if (loading || isFinished || error) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleFinish();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [loading, isFinished, error]);

  const handleOptionSelect = (index: number) => {
    if (selectedOption !== null) return; // Prevent multiple selections
    setSelectedOption(index);

    if (quiz && index === quiz.questions[currentQuestionIndex].correct_option_index) {
      setScore(prev => prev + 1);
    }
  };

  const handleNext = () => {
    if (!quiz) return;
    
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOption(null);
    } else {
      handleFinish();
    }
  };

  const handleFinish = async () => {
    setIsFinished(true);
    if (!quiz) return;

    try {
      await fetch('/api/results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          quizId: quiz.id,
          score: score + (selectedOption === quiz.questions[currentQuestionIndex].correct_option_index ? 1 : 0),
          total: quiz.questions.length
        })
      });
      
      setTimeout(() => {
        navigate(`/result/${quiz.id}`);
      }, 1500);
    } catch (err) {
      console.error('Failed to save result', err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="text-center py-20">
        <AlertTriangle size={48} className="mx-auto text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Xatolik</h2>
        <p className="text-slate-600">{error}</p>
        <button onClick={() => navigate('/')} className="mt-6 text-indigo-600 font-medium hover:underline">
          Bosh sahifaga qaytish
        </button>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex) / quiz.questions.length) * 100;
  
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (isFinished) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white p-10 rounded-3xl shadow-xl text-center max-w-md w-full border border-slate-100"
        >
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} />
          </div>
          <h2 className="text-3xl font-bold text-slate-800 mb-2">Ajoyib!</h2>
          <p className="text-slate-600 mb-8">Natijangiz saqlanmoqda...</p>
          <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto"></div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8 flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-4">
          <div className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-xl font-bold">
            {currentQuestionIndex + 1} / {quiz.questions.length}
          </div>
          <h2 className="text-lg font-semibold text-slate-800 hidden sm:block">{quiz.title}</h2>
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold ${timeLeft < 60 ? 'bg-red-50 text-red-600 animate-pulse' : 'bg-slate-50 text-slate-700'}`}>
          <Timer size={20} />
          {formatTime(timeLeft)}
        </div>
      </div>

      <div className="w-full bg-slate-200 h-2 rounded-full mb-8 overflow-hidden">
        <motion.div 
          className="bg-indigo-600 h-full rounded-full"
          initial={{ width: `${((currentQuestionIndex) / quiz.questions.length) * 100}%` }}
          animate={{ width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestionIndex}
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -50, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-3xl shadow-lg p-8 md:p-10 border border-slate-100"
        >
          <h3 className="text-2xl md:text-3xl font-bold text-slate-800 mb-8 leading-tight">
            {currentQuestion.question_text}
          </h3>

          <div className="space-y-4">
            {currentQuestion.options.map((option, index) => {
              const isSelected = selectedOption === index;
              const isCorrect = index === currentQuestion.correct_option_index;
              const showResult = selectedOption !== null;
              
              let buttonClass = "w-full text-left p-5 rounded-2xl border-2 transition-all duration-200 flex items-center justify-between text-lg font-medium ";
              
              if (!showResult) {
                buttonClass += "border-slate-200 hover:border-indigo-400 hover:bg-indigo-50 text-slate-700";
              } else if (isCorrect) {
                buttonClass += "border-emerald-500 bg-emerald-50 text-emerald-800";
              } else if (isSelected && !isCorrect) {
                buttonClass += "border-red-500 bg-red-50 text-red-800";
              } else {
                buttonClass += "border-slate-200 bg-slate-50 text-slate-400 opacity-60";
              }

              return (
                <button
                  key={index}
                  onClick={() => handleOptionSelect(index)}
                  disabled={showResult}
                  className={buttonClass}
                >
                  <span>{option}</span>
                  {showResult && isCorrect && <CheckCircle2 className="text-emerald-500" size={24} />}
                  {showResult && isSelected && !isCorrect && <XCircle className="text-red-500" size={24} />}
                </button>
              );
            })}
          </div>

          {selectedOption !== null && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-10 flex justify-end"
            >
              <button
                onClick={handleNext}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-xl font-bold flex items-center gap-2 transition-colors shadow-lg shadow-indigo-200"
              >
                {currentQuestionIndex < quiz.questions.length - 1 ? 'Keyingisi' : 'Yakunlash'}
                <ArrowRight size={20} />
              </button>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
