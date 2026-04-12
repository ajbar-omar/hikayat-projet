'use client'
import { useState, useEffect, useRef, use } from 'react'
import { supabase } from '@/lib/supabase'
import { useParams } from 'next/navigation'

export default function StoryPlayer() {
  const params = useParams()
  const storyId = params?.id
  
  const [scenes, setScenes] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const isTransitioning = useRef(false)

  // 1. جلب البيانات من سوبابيس
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

  // 2. منطق التحكم بالسكرول (Wheel)
  useEffect(() => {
    const handleWheel = (e) => {
      if (isTransitioning.current || scenes.length === 0) return
      
      if (e.deltaY > 50) nextScene()
      else if (e.deltaY < -50) prevScene()
    }

    window.addEventListener('wheel', handleWheel)
    return () => window.removeEventListener('wheel', handleWheel)
  }, [currentIndex, scenes.length])

  const nextScene = () => {
    if (currentIndex < scenes.length - 1) {
      isTransitioning.current = true
      setCurrentIndex(prev => prev + 1)
      setTimeout(() => { isTransitioning.current = false }, 1200)
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
    <div className="h-screen bg-black text-white flex items-center justify-center font-bold italic tracking-widest">
      جاري فتح بوابة الحكاية... ✨
    </div>
  )

  return (
    <div className="h-screen w-screen bg-black overflow-hidden fixed inset-0">
      {/* ستايل الخطوط */}
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@900&family=IBM+Plex+Sans+Arabic:wght@400;700&display=swap');
        body { margin: 0; background: black; font-family: 'IBM Plex Sans Arabic', sans-serif; }
      ` }} />

      {/* زر العودة للمكتبة */}
      <button 
        onClick={() => window.location.href = '/stories'} 
        className="absolute top-10 left-10 z-[1000] bg-white/90 text-black border-none px-8 py-3 rounded-full font-bold backdrop-blur-md shadow-2xl hover:bg-white transition-all active:scale-95"
      >
        ← المكتبة
      </button>

      {/* عرض المشاهد (المنطق القديم اللي كيبدل الـ Opacity) */}
      {scenes.map((scene, index) => (
        <div 
          key={scene.id} 
          style={{ 
            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
            opacity: index === currentIndex ? 1 : 0,
            transform: index === currentIndex ? 'scale(1)' : 'scale(1.05)',
            transition: 'opacity 1.2s ease-in-out, transform 2s ease-out',
            visibility: index === currentIndex ? 'visible' : 'hidden',
            zIndex: index === currentIndex ? 10 : 0
          }}
        >
          {/* الفيديو */}
          <video 
            autoPlay muted loop playsInline 
            className="w-full h-full object-cover opacity-60"
            key={scene.video_url}
          >
            <source src={scene.video_url} type="video/mp4" />
          </video>

          {/* الصوت (يشتغل فقط في المشهد النشط) */}
          {index === currentIndex && (
            <audio autoPlay key={scene.audio_url}>
              <source src={scene.audio_url} type="audio/mpeg" />
            </audio>
          )}

          {/* النص السينمائي (Minimalist Style) */}
          <div className="absolute bottom-0 width-full w-full pb-32 px-10 text-center z-20 bg-gradient-to-t from-black/90 via-black/40 to-transparent">
            <p className="text-2xl md:text-4xl text-white/90 max-w-4xl mx-auto leading-relaxed italic font-medium drop-shadow-2xl">
              {scene.content}
            </p>
          </div>
        </div>
      ))}

      {/* مؤشر النقط على اليمين */}
      <div className="absolute right-10 top-1/2 -translate-y-1/2 z-[100] flex flex-col gap-3">
        {scenes.map((_, i) => (
          <div 
            key={i} 
            className={`w-1 rounded-full transition-all duration-700 ${i === currentIndex ? 'h-10 bg-white shadow-[0_0_10px_white]' : 'h-3 bg-white/20'}`}
          />
        ))}
      </div>
    </div>
  )
}