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

  // 1. جلب المشاهد + جلب آخر صفحة وقف فيها الطفل من قبل
  useEffect(() => {
    async function fetchStoryData() {
      if (!storyId) return
      
      // جلب المشاهد
      const { data: scenesData } = await supabase
        .from('scenes')
        .select('*')
        .eq('story_id', storyId)
        .order('order_index', { ascending: true })
      
      const fetchedScenes = scenesData || []
      setScenes(fetchedScenes)

      // جلب آخر تقدم محفوظ للطفل فـ هذه القصة
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        const { data: progressData } = await supabase
          .from('user_stories')
          .select('last_page, status')
          .eq('profile_id', session.user.id)
          .eq('story_id', storyId)
          .single()

        // إذا لقى صفحة محفوظة ومشي كمل الحكاية، يرجعو ليها نيشان
        if (progressData && progressData.status !== 'Completed' && progressData.last_page < fetchedScenes.length) {
          setCurrentIndex(progressData.last_page)
        }
      }
      setLoading(false)
    }
    fetchStoryData()
  }, [storyId])

  // --- إصلاح السكرول (Mouse + Touch Tactile) ---
  useEffect(() => {
    const handleWheel = (e) => {
      if (isTransitioning.current || scenes.length === 0 || showQuiz) return
      if (e.deltaY > 50) nextScene()
      else if (e.deltaY < -50) prevScene()
    }

    let touchStartY = 0
    const handleTouchStart = (e) => {
      touchStartY = e.touches[0].clientY
    }

    const handleTouchEnd = (e) => {
      if (isTransitioning.current || scenes.length === 0 || showQuiz) return
      const touchEndY = e.changedTouches[0].clientY
      const deltaY = touchStartY - touchEndY

      if (deltaY > 50) nextScene()      
      else if (deltaY < -50) prevScene() 
    }

    window.addEventListener('wheel', handleWheel)
    window.addEventListener('touchstart', handleTouchStart)
    window.addEventListener('touchend', handleTouchEnd)

    return () => {
      window.removeEventListener('wheel', handleWheel)
      window.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('touchend', handleTouchEnd)
    }
  }, [currentIndex, scenes.length, showQuiz])

  // 🛠️ فانكشن داخلية ذكية لحفظ حالة القراءة كـ In Progress لايف فـ الداتابيز
const saveLiveProgress = async (pageIndex) => {
      const { data: { session } } = await supabase.auth.getSession()
    if (session?.user && storyId) {
      await supabase
        .from('user_stories')
        .upsert({
          profile_id: session.user.id,
          story_id: Number(storyId),
          last_page: pageIndex,
          status: 'In Progress', // تقييد القصة كـ قيد القراءة
          updated_at: new Date().toISOString()
        }, { onConflict: 'profile_id,story_id' })
    }
  }

  const fetchQuizzes = async () => {
    const { data } = await supabase.from('quizzes').select('*').eq('story_id', storyId).limit(3)
    if (data && data.length > 0) {
      setQuizzes(data)
      setShowQuiz(true)
    } else {
      // إذا مكانش كاين كويز، كيتعتبر كمل الحكاية أوتوماتيكياً
      await handleStoryCompletion()
      window.location.href = '/stories'
    }
  }

  // 🛠️ فانكشن لتقييد القصة كـ المكتملة (Completed) فـ الداتابيز وإعادة تصفير الصفحة لـ 1
  const handleStoryCompletion = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user && storyId) {
      await supabase
        .from('user_stories')
        .upsert({
          profile_id: session.user.id,
          story_id: Number(storyId),
          last_page: 0, // تصفير العداد لـ 0 فـ حالة بغا يعاود يقراها
          status: 'Completed', // تحويل الحالة لـ مكتملة 🎉
          updated_at: new Date().toISOString()
        }, { onConflict: 'profile_id,story_id' })
    }
  }

  const updateUserXP = async (finalScore) => {
    const quizPoints = finalScore * 50
    const completionBonus = 100 
    const totalEarned = quizPoints + completionBonus
    setXpEarned(totalEarned)

    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      // 1. تحديث الـ XP فـ ملف الطفل
      const { data: profile } = await supabase.from('profiles').select('total_xp').eq('id', user.id).single()
      const newXP = (profile?.total_xp || 0) + totalEarned
      await supabase.from('profiles').update({ total_xp: newXP }).eq('id', user.id)
      
      // 2. تقييد الحكاية كـ Completed ديناميكياً
      await handleStoryCompletion()
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
      const nextIndex = currentIndex + 1
      setCurrentIndex(nextIndex)
      
      // حفظ التقدم لايف فـ الداتابيز مع كل حركية
      saveLiveProgress(nextIndex)
      
      setTimeout(() => { isTransitioning.current = false }, 1200)
    } else {
      fetchQuizzes()
    }
  }

  const prevScene = () => {
    if (currentIndex > 0) {
      isTransitioning.current = true
      const prevIndex = currentIndex - 1
      setCurrentIndex(prevIndex)
      
      // حفظ التقدم لايف
      saveLiveProgress(prevIndex)
      
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

      {/* --- التحكم العلوية --- */}
      <div className="absolute top-10 left-10 right-10 z-[1000] flex justify-between items-center">
        <button 
          onClick={() => window.location.href = '/stories'} 
          className="bg-white/90 text-[#7c5c3e] border border-[#e8ddd3] px-8 py-3 rounded-full font-bold backdrop-blur-md shadow-2xl hover:scale-105 transition-all flex items-center gap-2"
        >
          <span style={{ fontSize: '18px' }}>←</span>
          <span>المكتبة</span>
        </button>

        <button 
          onClick={() => setIsMuted(!isMuted)} 
          className="bg-white/90 text-[#7c5c3e] w-14 h-14 rounded-full flex items-center justify-center shadow-2xl backdrop-blur-md hover:scale-110 transition-all border border-[#e8ddd3]"
        >
          {isMuted ? "🔇" : "🔊"}
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
          
          {scene.video_url?.match(/\.(mp4|webm|ogg|mov)$/i) ? (
            <video key={`vid-${scene.id}`} autoPlay muted loop playsInline className="w-full h-full object-cover opacity-60">
              <source src={scene.video_url} type="video/mp4" />
            </video>
          ) : (
            <img src={scene.video_url} className="w-full h-full object-cover opacity-60" alt="Scene" />
          )}

          {index === currentIndex && !isMuted && !showQuiz && scene.audio_url && (
            <audio autoPlay key={`aud-${scene.id}`}>
              <source src={scene.audio_url} type="audio/mpeg" />
            </audio>
          )}

          <div className="absolute bottom-0 w-full pb-32 px-10 text-center z-20 bg-gradient-to-t from-black/90 to-transparent">
            <p className="text-2xl md:text-4xl text-white/90 max-w-4xl mx-auto leading-relaxed italic drop-shadow-2xl">{scene.content}</p>
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

      {/* --- واجهة الاختبار --- */}
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
                        {selectedOption !== null && isCorrect && <span>✅</span>}
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