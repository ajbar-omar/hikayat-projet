'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { motion } from 'framer-motion'

export default function StoriesLibrary() {
  const [profile, setProfile] = useState<any>(null)
  const [stories, setStories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      // 1. كنجيبو السيسيون ديال المستخدم
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        // 2. كنجيبو البروفايل اللي عمرنا فـ SQL
        const { data: profData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        setProfile(profData)

        // 3. كنجيبو كاع القصص
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
    <div className="h-screen flex items-center justify-center bg-[#faf7f4] font-bold text-[#7c5c3e]">
      جاري فتح عالم الحكايات... ✨
    </div>
  )

  return (
    <div className="flex min-h-screen bg-[#faf7f4]" style={{ direction: 'rtl' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;700&display=swap');
        body { font-family: 'IBM Plex Sans Arabic', sans-serif; }
      `}</style>

      {/* --- Sidebar اليميني (النافيغاسيون) --- */}
      <nav className="w-64 bg-white border-l border-orange-100 flex flex-col p-8 shadow-2xl z-20">
        <div className="mb-12 text-center">
          <div className="w-24 h-24 rounded-full border-4 border-[#7c5c3e] mx-auto overflow-hidden bg-orange-50 mb-4 shadow-lg">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} className="w-full h-full object-cover" alt="avatar" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-[#7c5c3e]">
                {profile?.kid_name?.charAt(0) || '؟'}
              </div>
            )}
          </div>
          <h2 className="font-black text-[#3a2a1a] text-xl mb-1">{profile?.kid_name || 'بطلنا الصغير'}</h2>
          <p className="text-sm text-[#a07850] font-bold italic">@{profile?.child_username}</p>
        </div>

        <div className="space-y-4 flex-1">
          <button className="w-full py-4 rounded-2xl font-bold bg-[#7c5c3e] text-white shadow-lg flex items-center px-6 gap-4">
            <span>📚</span> المكتبة
          </button>
          
          <button className="w-full py-4 rounded-2xl font-bold text-gray-400 hover:bg-orange-50 flex items-center px-6 gap-4 transition">
            <span>🏆</span> الإنجازات
          </button>

          <button className="w-full py-4 rounded-2xl font-bold text-gray-400 hover:bg-orange-50 flex items-center px-6 gap-4 transition">
            <span>⚙️</span> الإعدادات
          </button>
        </div>

        <button 
          onClick={() => supabase.auth.signOut().then(() => window.location.href='/auth')}
          className="mt-auto w-full py-4 rounded-2xl font-bold text-red-400 hover:bg-red-50 transition flex items-center px-6 gap-4"
        >
          <span>🚪</span> خروج
        </button>
      </nav>

      {/* --- المحتوى الرئيسي (المكتبة) --- */}
      <main className="flex-1 p-16 overflow-y-auto">
        <header className="mb-16 text-right">
          <h1 className="text-5xl font-black text-[#3a2a1a] mb-4 leading-tight">
            مرحباً بطلنا {profile?.kid_name}! 👋
          </h1>
          <p className="text-[#a07850] text-xl font-medium">اختر حكاية وانطلق في مغامرة عبر الزمن...</p>
        </header>

        {/* شبكة الحكايات */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-12">
          {stories.map((story: any) => (
            <motion.div 
              whileHover={{ y: -15, scale: 1.02 }} 
              key={story.id} 
              className="bg-white rounded-[45px] shadow-sm border border-orange-50 overflow-hidden cursor-pointer group hover:shadow-2xl transition-all duration-300"
              onClick={() => window.location.href = `/stories/${story.id}`}
            >
               <div className="h-60 bg-orange-100 overflow-hidden relative">
                  <img 
                    src={story.cover_url} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                    alt={story.title} 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
               </div>
               
               <div className="p-8 text-center bg-white">
                  <h3 className="text-2xl font-black text-[#3a2a1a] mb-6">{story.title}</h3>
                  <button className="bg-[#7c5c3e] text-white px-8 py-4 rounded-[20px] font-black w-full shadow-lg shadow-orange-900/10 hover:bg-[#5a3e28] transition-all transform active:scale-95">
                    ابدأ المغامرة الآن ←
                  </button>
               </div>
            </motion.div>
          ))}
        </div>

        {/* إيلا ما كاينينش قصص */}
        {stories.length === 0 && (
          <div className="text-center py-20 bg-white/50 rounded-[50px] border-2 border-dashed border-orange-100">
             <p className="text-gray-400 text-xl font-bold italic">قريباً.. حكايات جديدة في انتظارك!</p>
          </div>
        )}
      </main>
    </div>
  )
}