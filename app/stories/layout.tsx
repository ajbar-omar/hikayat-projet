'use client'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'

export default function StoriesDashboardLayout({ children }: { children: React.ReactNode }) {
  const [bgMusicEnabled, setBgMusicEnabled] = useState(true)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    async function checkGlobalMusic() {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        // 🔍 قراءة الخانة الجديدة د الـ bg_music اللي عاد زدتيها ف السوبابيس
        const { data: profile } = await supabase
          .from('profiles')
          .select('bg_music')
          .eq('id', session.user.id)
          .single()

        if (profile && profile.bg_music !== undefined) {
          setBgMusicEnabled(profile.bg_music !== false)
        }
      }
    }

    checkGlobalMusic()

    // 🔄 [Realtime] الاستماع لايف: إيلا الأب طفا السويتش ف الـ Settings، كتسكت ف البلاصة!
    const channel = supabase
      .channel('realtime-bg-music-global')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'profiles' },
        (payload) => {
          if (payload.new && payload.new.bg_music !== undefined) {
            const isEnabled = payload.new.bg_music !== false
            setBgMusicEnabled(isEnabled)
            if (!isEnabled && audioRef.current) {
              audioRef.current.pause()
            } else if (isEnabled && audioRef.current) {
              audioRef.current.play().catch(() => {})
            }
          }
        }
      )
      .subscribe()

    // ⚡ هرس بلوكاج الـ Browser: غير الطفل يكليكي ف أي بلاصة ف الشاشة كيتطلق الصوت
    const handleFirstClick = () => {
      if (audioRef.current && audioRef.current.paused && bgMusicEnabled) {
        audioRef.current.play().catch(err => console.log("Audio play failed:", err))
      }
      window.removeEventListener('click', handleFirstClick)
    }

    window.addEventListener('click', handleFirstClick)

    return () => {
      supabase.removeChannel(channel)
      window.removeEventListener('click', handleFirstClick)
    }
  }, [bgMusicEnabled])

  return (
    <>
      {/* 🌟 تاغ الـ Audio مخفي وكيتسنى الكليكة الأولى د الدري لداخل */}
      {bgMusicEnabled && (
        <audio 
          ref={audioRef}
          loop 
          src="/assets/global-bg-music.mp3" 
          className="hidden" 
        />
      )}
      {children}
    </>
  )
}