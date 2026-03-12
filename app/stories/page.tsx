'use client'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'

export default function InteractiveStoryPage() {
  const [stories, setStories] = useState([])
  const [selectedStory, setSelectedStory] = useState(null)
  const [scenes, setScenes] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const isTransitioning = useRef(false)

  useEffect(() => {
    fetchStories()
    // إضافة خطوط أنيقة للمكتبة
    const link = document.createElement('link')
    link.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=IBM+Plex+Sans+Arabic:wght@400;700&display=swap'
    link.rel = 'stylesheet'
    document.head.appendChild(link)
  }, [])

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (!selectedStory || isTransitioning.current) return
      if (e.deltaY > 50) nextScene()
      else if (e.deltaY < -50) prevScene()
    }
    window.addEventListener('wheel', handleWheel)
    return () => window.removeEventListener('wheel', handleWheel)
  }, [selectedStory, currentIndex, scenes.length])

  async function fetchStories() {
    const { data } = await supabase.from('stories').select('*').order('created_at', { ascending: false })
    setStories(data || [])
  }

  async function handleOpenStory(story) {
    const { data } = await supabase.from('scenes').select('*').eq('story_id', story.id).order('order_index', { ascending: true })
    setScenes(data || [])
    setSelectedStory(story)
    setCurrentIndex(0)
  }

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

  // --- واجهة المكتبة (Premium Design) ---
  if (!selectedStory) {
    return (
      <div style={{ minHeight: '100vh', background: '#faf7f4', padding: '80px 20px', direction: 'rtl', fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}>
        <header style={{ textAlign: 'center', marginBottom: '80px' }}>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '56px', fontWeight: 900, color: '#3a2a1a', margin: '0' }}>مكتبة الحكايات</h1>
          <p style={{ color: '#a07850', fontSize: '18px', marginTop: '10px', letterSpacing: '1px' }}>غص في أعماق الخيال</p>
          <div style={{ width: '60px', height: '4px', background: '#7c5c3e', margin: '25px auto', borderRadius: '2px' }}></div>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '40px', maxWidth: '1200px', margin: '0 auto' }}>
          {stories.map(s => (
            <div 
              key={s.id} 
              onClick={() => handleOpenStory(s)} 
              style={{ 
                background: '#fff', borderRadius: '30px', overflow: 'hidden', cursor: 'pointer', 
                boxShadow: '0 15px 35px rgba(58,42,26,0.08)', border: '1px solid #e8ddd3',
                transition: 'all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-12px)'
                e.currentTarget.style.boxShadow = '0 25px 50px rgba(58,42,26,0.15)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 15px 35px rgba(58,42,26,0.08)'
              }}
            >
              {/* هنا التغيير: عرض الغلاف المرفوع */}
              <div style={{ 
                height: '240px', 
                background: s.cover_url ? `url(${s.cover_url}) center/cover` : '#7c5c3e',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                position: 'relative'
              }}>
                {!s.cover_url && <span style={{ fontSize: '70px' }}>📖</span>}
                <div style={{ position: 'absolute', bottom: '0', left: '0', width: '100%', height: '50%', background: 'linear-gradient(to top, rgba(0,0,0,0.3), transparent)' }}></div>
              </div>

              <div style={{ padding: '30px', textAlign: 'center' }}>
                <h2 style={{ color: '#1a1a1a', fontSize: '24px', margin: '0 0 15px 0', fontWeight: '700' }}>{s.title}</h2>
                <div style={{ display: 'inline-block', padding: '10px 30px', background: '#7c5c3e', color: '#fff', borderRadius: '100px', fontSize: '14px', fontWeight: 'bold', transition: '0.3s' }}>إبدأ القصة الآن</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // --- واجهة المشغل (Interaction Based) ---
  return (
    <div style={{ height: '100vh', width: '100vw', background: '#000', overflow: 'hidden', position: 'fixed' }}>
      
      <button 
        onClick={() => setSelectedStory(null)} 
        style={{ 
          position: 'absolute', top: '40px', left: '40px', zIndex: 1000, 
          background: 'rgba(255,255,255,0.9)', color: '#000', border: 'none', 
          padding: '12px 28px', borderRadius: '100px', cursor: 'pointer', 
          fontWeight: 'bold', backdropFilter: 'blur(10px)', boxShadow: '0 10px 20px rgba(0,0,0,0.2)',
          transition: '0.3s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = '#fff'}
      >
        ← المكتبة
      </button>

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
          <video autoPlay muted loop playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }}>
            <source src={scene.video_url} type="video/mp4" />
          </video>

          {index === currentIndex && (
            <audio autoPlay key={scene.audio_url}>
              <source src={scene.audio_url} type="audio/mpeg" />
            </audio>
          )}

          <div style={{ 
            position: 'absolute', bottom: 0, width: '100%', 
            padding: '150px 20px 100px', 
            background: 'linear-gradient(to top, rgba(0,0,0,0.9) 20%, rgba(0,0,0,0.4) 60%, transparent)', 
            textAlign: 'center', color: '#fff', direction: 'rtl' 
          }}>
            <p style={{ 
              fontSize: '34px', maxWidth: '900px', margin: '0 auto', 
              lineHeight: '1.7', textShadow: '0 4px 25px rgba(0,0,0,0.9)',
              fontFamily: "'IBM Plex Sans Arabic', sans-serif",
              fontWeight: '500'
            }}>
              {scene.content}
            </p>
          </div>
        </div>
      ))}

      {/* مؤشر النقط */}
      <div style={{ position: 'absolute', right: '40px', top: '50%', transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', gap: '12px', zIndex: 100 }}>
        {scenes.map((_, i) => (
          <div 
            key={i} 
            style={{ 
              width: i === currentIndex ? '4px' : '4px', 
              height: i === currentIndex ? '40px' : '12px', 
              borderRadius: '10px', 
              background: i === currentIndex ? '#7c5c3e' : 'rgba(255,255,255,0.3)', 
              transition: 'all 0.5s ease' 
            }} 
          />
        ))}
      </div>
    </div>
  )
}