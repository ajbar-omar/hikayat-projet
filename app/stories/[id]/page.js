'use client'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useParams } from 'next/navigation'

export default function StoryPlayer() {
  const params = useParams()
  const storyId = params?.id
  
  const [scenes, setScenes] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [isMuted, setIsMuted] = useState(false)
  const isTransitioning = useRef(false)

  // --- States الخاص بالاختبار والـ XP والـ Feedback ---
  const [showQuiz, setShowQuiz] = useState(false)
  const [quizzes, setQuizzes] = useState([])
  const [currentQuizStep, setCurrentQuizStep] = useState(0)
  const [score, setScore] = useState(0)
  const [isQuizFinished, setIsQuizFinished] = useState(false)
  const [xpEarned, setXpEarned] = useState(0)
  const [selectedOption, setSelectedOption] = useState(null)

  useEffect(() => {
    async function fetchScenes() {
      if (!storyId) return
      const { data, error } = await supabase
        .from('scenes')
        .select('*')
        .eq('story_id', storyId)
        .order('order_index', { ascending: true })
      
      if (!error) setScenes(data || [])
      setLoading(false)
    }
    fetchScenes()
  }, [storyId])

  useEffect(() => {
    const handleWheel = (e) => {
      if (isTransitioning.current || scenes.length === 0 || showQuiz) return
      if (e.deltaY > 50) nextScene()
      else if (e.deltaY < -50) prevScene()
    }
    window.addEventListener('wheel', handleWheel)
    return () => window.removeEventListener('wheel', handleWheel)
  }, [currentIndex, scenes.length, showQuiz])

  const fetchQuizzes = async () => {
    const { data } = await supabase.from('quizzes').select('*').eq('story_id', storyId).limit(3)
    if (data && data.length > 0) {
      setQuizzes(data)
      setShowQuiz(true)
    } else {
      window.location.href = '/stories'
    }
  }

  const updateUserXP = async (finalScore) => {
    const quizPoints = finalScore * 50
    const completionBonus = 100 
    const totalEarned = quizPoints + completionBonus
    setXpEarned(totalEarned)

    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: profile } = await supabase.from('profiles').select('total_xp').eq('id', user.id).single()
      const newXP = (profile?.total_xp || 0) + totalEarned
      await supabase.from('profiles').update({ total_xp: newXP }).eq('id', user.id)
    }
  }

  const handleAnswerClick = (index) => {
    if (selectedOption !== null) return
    const isCorrect = index === quizzes[currentQuizStep].correct_answer_index
    setSelectedOption(index)
    if (isCorrect) setScore(s => s + 1)

    setTimeout(() => {
      if (currentQuizStep < quizzes.length - 1) {
        setCurrentQuizStep(prev => prev + 1)
        setSelectedOption(null)
      } else {
        const finalScore = isCorrect ? score + 1 : score
        setIsQuizFinished(true)
        updateUserXP(finalScore)
      }
    }, 1500)
  }

  const nextScene = () => {
    if (currentIndex < scenes.length - 1) {
      isTransitioning.current = true
      setCurrentIndex(prev => prev + 1)
      setTimeout(() => { isTransitioning.current = false }, 1200)
    } else {
      fetchQuizzes()
    }
  }

  const prevScene = () => {
    if (currentIndex > 0) {
      isTransitioning.current = true
      setCurrentIndex(prev => prev - 1)
      setTimeout(() => { isTransitioning.current = false }, 1200)
    }
  }

  if (loading) return (
    <div className="h-screen bg-black text-[#7c5c3e] flex items-center justify-center font-bold italic text-2xl">
      جاري فتح بوابة الحكاية... ✨
    </div>
  )

  return (
    <div className="h-screen w-screen bg-black overflow-hidden fixed inset-0">
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@900&family=IBM+Plex+Sans+Arabic:wght@400;700&display=swap');
        body { margin: 0; background: black; font-family: 'IBM Plex Sans Arabic', sans-serif; }
      ` }} />

      {/* --- أزرار التحكم العلوية (Premium Classic Style) --- */}
      <div className="absolute top-10 left-10 right-10 z-[1000] flex justify-between items-center">
        
        {/* زر المكتبة (على اليسار) */}
        <button 
          onClick={() => window.location.href = '/stories'} 
          className="bg-white/90 text-[#7c5c3e] border border-[#e8ddd3] px-8 py-3 rounded-full font-bold backdrop-blur-md shadow-2xl hover:scale-105 transition-all active:scale-95 flex items-center gap-2"
        >
          <span style={{ fontSize: '18px' }}>←</span>
          <span>المكتبة</span>
        </button>

        {/* زر كتم الصوت (على اليمين) */}
        <button 
          onClick={() => setIsMuted(!isMuted)} 
          className="bg-white/90 text-[#7c5c3e] w-14 h-14 rounded-full flex items-center justify-center shadow-2xl backdrop-blur-md hover:scale-110 transition-all active:scale-90 border border-[#e8ddd3]"
        >
          {isMuted ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5z"></path><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5z"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path><path d="M15.53 8.47a5 5 0 0 1 0 7.07"></path></svg>
          )}
        </button>
      </div>

      {/* المشاهد */}
      {!showQuiz && scenes.map((scene, index) => (
        <div key={scene.id} style={{ 
            position: 'absolute', inset: 0, 
            opacity: index === currentIndex ? 1 : 0,
            transform: index === currentIndex ? 'scale(1)' : 'scale(1.05)',
            transition: 'opacity 1.2s ease-in-out, transform 2s ease-out',
            visibility: index === currentIndex ? 'visible' : 'hidden',
            zIndex: index === currentIndex ? 10 : 0
          }}>
          <video autoPlay muted loop playsInline className="w-full h-full object-cover opacity-60">
            <source src={scene.video_url} type="video/mp4" />
          </video>
          {/* إيقاف الصوت أوتوماتيكياً عند الكويز */}
          {index === currentIndex && !isMuted && !showQuiz && (
            <audio autoPlay key={scene.audio_url}><source src={scene.audio_url} type="audio/mpeg" /></audio>
          )}
          <div className="absolute bottom-0 w-full pb-32 px-10 text-center z-20 bg-gradient-to-t from-black/90 to-transparent">
            <p className="text-2xl md:text-4xl text-white/90 max-w-4xl mx-auto leading-relaxed italic">{scene.content}</p>
          </div>
        </div>
      ))}

      {/* مؤشر السكرول */}
      {!showQuiz && (
        <div className="absolute right-10 top-1/2 -translate-y-1/2 z-[100] flex flex-col gap-3">
          {scenes.map((_, i) => (
            <div key={i} className={`w-1 rounded-full transition-all duration-700 ${i === currentIndex ? 'h-10 bg-white shadow-[0_0_10px_white]' : 'h-3 bg-white/20'}`} />
          ))}
        </div>
      )}

      {/* --- واجهة الاختبار المطور --- */}
      {showQuiz && (
        <div className="fixed inset-0 z-[2000] bg-black/95 backdrop-blur-xl flex items-center justify-center p-6 text-right" dir="rtl">
          <div className="max-w-xl w-full bg-[#1a1510] border border-[#7c5c3e]/30 p-10 rounded-[40px] shadow-2xl relative">
            {!isQuizFinished ? (
              <div className="w-full text-center">
                <div className="flex gap-2 mb-8">
                  {quizzes.map((_, i) => (
                    <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-500 ${i <= currentQuizStep ? 'bg-[#7c5c3e]' : 'bg-white/10'}`} />
                  ))}
                </div>
                <p className="text-[#7c5c3e] font-bold text-sm mb-2 italic uppercase">تحدي الذاكرة 🧠</p>
                <h2 className="text-[#e8ddd3] text-2xl md:text-3xl font-bold mb-8 leading-tight">{quizzes[currentQuizStep]?.question}</h2>
                <div className="flex flex-col gap-4">
                  {quizzes[currentQuizStep]?.options.map((option, index) => {
                    const isCorrect = index === quizzes[currentQuizStep].correct_answer_index;
                    const isSelected = selectedOption === index;
                    let btnStyle = "border-[#7c5c3e]/20 text-[#e8ddd3]";
                    if (selectedOption !== null) {
                        if (isCorrect) btnStyle = "border-green-500 bg-green-500/20 text-white shadow-[0_0_20px_rgba(34,197,94,0.3)]";
                        else if (isSelected) btnStyle = "border-red-500 bg-red-500/20 text-white shadow-[0_0_20px_rgba(239,68,68,0.3)]";
                    }
                    return (
                      <button key={index} disabled={selectedOption !== null} onClick={() => handleAnswerClick(index)} className={`p-5 border rounded-2xl text-right transition-all duration-300 flex justify-between items-center ${btnStyle}`}>
                        <span className="text-lg">{option}</span>
                        {selectedOption !== null && isCorrect && <span className="animate-bounce">✅</span>}
                        {selectedOption === index && !isCorrect && <span>❌</span>}
                      </button>
                    )
                  })}
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <div className="text-6xl mb-6 font-bold">🏆</div>
                <h2 className="text-[#e8ddd3] text-3xl font-black mb-2 tracking-wide">مذهل يا بطل!</h2>
                <div className="bg-[#7c5c3e]/10 p-8 rounded-[35px] mb-10 border border-[#7c5c3e]/20 inline-block px-14 shadow-inner">
                   <p className="text-white font-black text-5xl">+{xpEarned} XP</p>
                   <p className="text-[#7c5c3e] text-[10px] mt-4 font-bold uppercase tracking-tighter">(100 قصة + {score * 50} اختبار)</p>
                </div>
                <button onClick={() => window.location.href = '/stories'} className="w-full bg-[#7c5c3e] text-white py-5 rounded-3xl font-black text-xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-[#7c5c3e]/20">
                  العودة للمكتبة
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}