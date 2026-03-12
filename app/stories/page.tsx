'use client'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'

export default function InteractiveStoryPage() {
  const [stories, setStories] = useState([])
  const [selectedStory, setSelectedStory] = useState(null)
  const [scenes, setScenes] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const isTransitioning = useRef(false) // باش ما يبقاش ينقز بزاف ديال المشاهد دقة وحدة

  useEffect(() => {
    fetchStories()
  }, [])

  // التحكم في السكرول (Wheel Interaction)
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (!selectedStory || isTransitioning.current) return

      if (e.deltaY > 50) { // سكرول لتحت
        nextScene()
      } else if (e.deltaY < -50) { // سكرول لفوق
        prevScene()
      }
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
      setTimeout(() => { isTransitioning.current = false }, 1000) // وقت الراحة بين المشاهد
    }
  }

  const prevScene = () => {
    if (currentIndex > 0) {
      isTransitioning.current = true
      setCurrentIndex(prev => prev - 1)
      setTimeout(() => { isTransitioning.current = false }, 1000)
    }
  }

  // --- واجهة المكتبة ---
  if (!selectedStory) {
    return (
      <div style={{ minHeight: '100vh', background: '#f8f5f2', padding: '60px 20px', direction: 'rtl' }}>
        <h1 style={{ textAlign: 'center', color: '#3a2a1a', fontSize: '42px', marginBottom: '50px' }}>مكتبة الحكايات</h1>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '35px', maxWidth: '1100px', margin: '0 auto' }}>
          {stories.map(s => (
            <div key={s.id} onClick={() => handleOpenStory(s)} style={{ background: '#fff', borderRadius: '24px', padding: '20px', cursor: 'pointer', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', textAlign: 'center', border: '1px solid #e2d7cc' }}>
              <div style={{ height: '180px', background: '#7c5c3e', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '60px', marginBottom: '20px' }}>📖</div>
              <h2 style={{ color: '#3a2a1a' }}>{s.title}</h2>
              <p style={{ color: '#7c5c3e', fontWeight: 'bold' }}>إبدأ القصة ←</p>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // --- واجهة المشغل (Interaction Based) ---
  return (
    <div style={{ height: '100vh', width: '100vw', background: '#000', overflow: 'hidden', position: 'fixed' }}>
      
      {/* زر الرجوع */}
      <button 
        onClick={() => setSelectedStory(null)} 
        style={{ position: 'absolute', top: '30px', left: '30px', zIndex: 100, background: '#fff', color: '#000', border: 'none', padding: '12px 25px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' }}
      >
        ← الرجوع للمكتبة
      </button>

      {scenes.map((scene, index) => (
        <div 
          key={scene.id} 
          style={{ 
            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
            opacity: index === currentIndex ? 1 : 0,
            transform: index === currentIndex ? 'scale(1)' : 'scale(1.1)',
            transition: 'opacity 1s ease-in-out, transform 1.5s ease-out',
            visibility: index === currentIndex ? 'visible' : 'hidden',
            zIndex: index === currentIndex ? 10 : 0
          }}
        >
          {/* الفيديو */}
          <video autoPlay muted loop playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }}>
            <source src={scene.video_url} type="video/mp4" />
          </video>

          {/* الصوت */}
          {index === currentIndex && (
            <audio autoPlay key={scene.audio_url}>
              <source src={scene.audio_url} type="audio/mpeg" />
            </audio>
          )}

          {/* النص */}
          <div style={{ position: 'absolute', bottom: 0, width: '100%', padding: '100px 20px', background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)', textAlign: 'center', color: '#fff', direction: 'rtl' }}>
            <p style={{ fontSize: '32px', maxWidth: '850px', margin: '0 auto', lineHeight: '1.6', textShadow: '0 4px 15px rgba(0,0,0,0.8)' }}>
              {scene.content}
            </p>
          </div>
        </div>
      ))}

      {/* نقط التنقل (Dots Indicator) */}
      <div style={{ position: 'absolute', right: '30px', top: '50%', transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', gap: '15px', zIndex: 100 }}>
        {scenes.map((_, i) => (
          <div key={i} style={{ width: '12px', height: '12px', borderRadius: '50%', background: i === currentIndex ? '#fff' : 'rgba(255,255,255,0.3)', transition: '0.3s' }} />
        ))}
      </div>
    </div>
  )
}