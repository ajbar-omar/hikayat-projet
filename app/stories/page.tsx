'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function StoriesLibrary() {
  const [profile, setProfile] = useState<any>(null)
  const [stories, setStories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const pathname = usePathname()

  useEffect(() => {
    async function loadData() {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        // جلب بيانات البروفايل والـ XP
        const { data: profData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        setProfile(profData)

        // جلب القصص المتاحة
        const { data: storyList } = await supabase
          .from('stories')
          .select('*')
          .order('created_at', { ascending: false })
        
        setStories(storyList || [])
      } else {
        window.location.href = '/auth'
      }
      setLoading(false)
    }
    loadData()
  }, [])

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-[#faf7f4] font-bold text-[#7c5c3e] italic text-xl">
      جاري فتح عالم الحكايات... ✨
    </div>
  )

  return (
    <div className="flex min-h-screen bg-[#faf7f4]" style={{ direction: 'rtl' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;700&display=swap');
        body { font-family: 'IBM Plex Sans Arabic', sans-serif; }
      `}</style>

      {/* --- Sidebar (النافيغاسيون المطور) --- */}
      <nav className="w-64 bg-white border-l border-orange-100 flex flex-col p-8 shadow-2xl z-20 sticky top-0 h-screen">
        <div className="mb-12 text-center">
          <div className="w-24 h-24 rounded-full border-4 border-[#7c5c3e] mx-auto overflow-hidden bg-orange-50 mb-4 shadow-lg flex items-center justify-center">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} className="w-full h-full object-cover" alt="avatar" />
            ) : (
              <span className="text-3xl">👦</span>
            )}
          </div>
          <h2 className="font-black text-[#3a2a1a] text-xl mb-1">{profile?.kid_name || 'بطلنا'}</h2>
          
          {/* عرض الـ XP الحقيقي تحت السمية */}
          <div className="inline-block bg-[#7c5c3e]/10 px-4 py-1.5 rounded-full mt-2 border border-[#7c5c3e]/10">
            <span className="text-[#7c5c3e] font-bold text-xs tracking-wider">✨ {profile?.total_xp || 0} XP</span>
          </div>
        </div>

        <div className="space-y-4 flex-1">
          {/* رابط المكتبة */}
          <Link href="/stories">
            <button className={`w-full py-4 rounded-2xl font-bold flex items-center px-6 gap-4 transition-all duration-300 ${pathname === '/stories' ? 'bg-[#7c5c3e] text-white shadow-lg' : 'text-gray-400 hover:bg-orange-50 hover:text-[#7c5c3e]'}`}>
              <span className="text-xl">📚</span> المكتبة
            </button>
          </Link>
          
          {/* رابط الإنجازات (البروفايل) - دابا خدام! */}
          <Link href="/profile">
            <button className={`w-full py-4 rounded-2xl font-bold flex items-center px-6 gap-4 transition-all duration-300 ${pathname === '/profile' ? 'bg-[#7c5c3e] text-white shadow-lg' : 'text-gray-400 hover:bg-orange-50 hover:text-[#7c5c3e]'}`}>
              <span className="text-xl">🏆</span> الإنجازات
            </button>
          </Link>

          <button className="w-full py-4 rounded-2xl font-bold text-gray-400 hover:bg-orange-50 flex items-center px-6 gap-4 transition">
            <span className="text-xl">⚙️</span> الإعدادات
          </button>
        </div>

        <button 
          onClick={() => supabase.auth.signOut().then(() => window.location.href='/auth')}
          className="mt-auto w-full py-4 rounded-2xl font-bold text-red-400 hover:bg-red-50 transition flex items-center px-6 gap-4"
        >
          <span>🚪</span> خروج
        </button>
      </nav>

      {/* --- المحتوى الرئيسي --- */}
      <main className="flex-1 p-10 md:p-16 overflow-y-auto">
        <header className="mb-16 text-right">
          <h1 className="text-5xl font-black text-[#3a2a1a] mb-4 leading-tight">
            مرحباً بطلنا {profile?.kid_name}! 👋
          </h1>
          <p className="text-[#a07850] text-xl font-medium">اختر حكاية وانطلق في مغامرة عبر الزمن...</p>
        </header>

        {/* شبكة الحكايات */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
          {stories.map((story) => (
            <motion.div 
              whileHover={{ y: -12, scale: 1.03 }} 
              key={story.id} 
              className="bg-white rounded-[45px] shadow-sm border border-orange-50 overflow-hidden cursor-pointer group hover:shadow-2xl transition-all duration-500"
              onClick={() => window.location.href = `/stories/${story.id}`}
            >
               <div className="h-64 bg-orange-100 overflow-hidden relative">
                  <img 
                    src={story.cover_url} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" 
                    alt={story.title} 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
               </div>
               
               <div className="p-8 text-center bg-white">
                  <h3 className="text-2xl font-black text-[#3a2a1a] mb-6">{story.title}</h3>
                  <button className="bg-[#7c5c3e] text-white px-8 py-4 rounded-[22px] font-black w-full shadow-lg hover:bg-[#5a3e28] transition-all transform active:scale-95">
                    ابدأ المغامرة الآن ←
                  </button>
               </div>
            </motion.div>
          ))}
        </div>

        {stories.length === 0 && (
          <div className="text-center py-20 bg-white/50 rounded-[50px] border-2 border-dashed border-orange-100">
             <p className="text-gray-400 text-xl font-bold italic tracking-widest">قريباً.. حكايات جديدة في انتظارك!</p>
          </div>
        )}
      </main>
    </div>
  )
}