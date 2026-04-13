'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { motion } from 'framer-motion'
import Link from 'next/link'

interface UserProfile {
  kid_name?: string;
  child_username?: string;
  avatar_url?: string;
  total_xp: number;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function getProfile() {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
        setProfile(data)
      }
      setLoading(false)
    }
    getProfile()
  }, [])

  const totalXp = profile?.total_xp || 0
  const level = Math.floor(totalXp / 500) + 1
  const progress = (totalXp % 500) / 500 * 100

  if (loading) return (
    <div className="h-screen bg-[#faf7f4] flex items-center justify-center font-bold text-[#7c5c3e] italic text-xl">
      جاري استحضار سجلات البطل... ✨
    </div>
  )

  return (
    <div dir="rtl" className="min-h-screen bg-[#faf7f4] font-['IBM_Plex_Sans_Arabic'] text-[#3a2a1a]">
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#7c5c3e]/5 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#a07850]/5 rounded-full blur-[120px]"></div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12 relative z-10">
        
        {/* Header Navigation */}
        <div className="flex justify-between items-center mb-12">
          <Link href="/stories" className="bg-white/80 backdrop-blur-md border border-[#e8ddd3] px-6 py-3 rounded-2xl font-bold text-[#7c5c3e] hover:scale-105 transition-all shadow-sm">
            ← العودة للمكتبة
          </Link>
          <div className="text-[#a07850] font-black tracking-widest text-sm italic">HIKAYAT PREMIUM ID</div>
        </div>

        {/* Main Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative bg-white border border-[#e8ddd3] rounded-[50px] p-10 md:p-16 shadow-[0_20px_80px_rgba(124,92,62,0.08)] overflow-hidden"
        >
          {/* الـ Level Badge الكبير */}
          <div className="absolute top-10 left-10 bg-[#7c5c3e] text-white w-20 h-20 rounded-3xl rotate-12 flex flex-col items-center justify-center shadow-2xl border-4 border-white/20">
            <span className="text-[10px] font-bold uppercase tracking-tight opacity-70">LEVEL</span>
            <span className="text-3xl font-black leading-none">{level}</span>
          </div>

          <div className="flex flex-col items-center text-center">
            {/* صورة الطفل (Avatar) */}
            <div className="relative mb-8">
              <div className="w-40 h-40 md:w-56 md:h-56 rounded-[60px] border-[6px] border-[#7c5c3e]/10 p-3 bg-[#faf7f4]">
                <div className="w-full h-full rounded-[45px] overflow-hidden bg-white shadow-inner flex items-center justify-center">
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} className="w-full h-full object-cover" alt="avatar" />
                  ) : (
                    <span className="text-7xl">👦</span>
                  )}
                </div>
              </div>
              <motion.div 
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 3 }}
                className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-[#7c5c3e] text-white px-6 py-2 rounded-full font-bold text-sm shadow-xl whitespace-nowrap"
              >
                ✨ بطل معتمد
              </motion.div>
            </div>

            {/* معلومات الطفل */}
            <h1 className="text-5xl font-black text-[#3a2a1a] mb-2">{profile?.kid_name}</h1>
            <p className="text-[#a07850] font-bold italic mb-10 tracking-wide text-lg">@{profile?.child_username}</p>

            {/* الـ Stats بستايل Luxury */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-3xl">
              <div className="bg-[#faf7f4] border border-[#e8ddd3] p-8 rounded-[35px] relative group overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-[#7c5c3e]/5 rounded-bl-full transition-all group-hover:scale-150"></div>
                <p className="text-[#a07850] text-xs font-black uppercase mb-3 tracking-tighter">إجمالي الطاقة (XP)</p>
                <p className="text-4xl font-black text-[#7c5c3e]">{totalXp}</p>
              </div>

              <div className="bg-[#faf7f4] border border-[#e8ddd3] p-8 rounded-[35px] relative group overflow-hidden">
                <p className="text-[#a07850] text-xs font-black uppercase mb-3 tracking-tighter">المستوى الحالي</p>
                <p className="text-4xl font-black text-[#7c5c3e]">{level}</p>
              </div>

              <div className="bg-[#faf7f4] border border-[#e8ddd3] p-8 rounded-[35px] relative group overflow-hidden">
                <p className="text-[#a07850] text-xs font-black uppercase mb-3 tracking-tighter">الأوسمة</p>
                <p className="text-4xl font-black text-[#7c5c3e]">0</p>
              </div>
            </div>

            {/* شريط التقدم الفخم */}
            <div className="w-full max-w-3xl mt-12 space-y-4">
              <div className="flex justify-between items-end">
                <div className="text-right">
                  <p className="text-[#a07850] text-xs font-bold uppercase">التقدم نحو المستوى التالي</p>
                  <p className="text-[#3a2a1a] font-black text-lg">{Math.round(progress)}%</p>
                </div>
                <div className="text-left text-[#7c5c3e] font-black italic">{totalXp} / {level * 500} XP</div>
              </div>
              <div className="h-6 w-full bg-[#f0e8e0] rounded-2xl p-1 border border-[#e8ddd3]">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="h-full bg-gradient-to-l from-[#7c5c3e] to-[#a07850] rounded-xl shadow-[0_0_20px_rgba(124,92,62,0.3)] relative"
                >
                  <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* قسم الأوسمة (Coming Soon Style) */}
        <div className="mt-20">
          <h3 className="text-2xl font-black text-[#3a2a1a] mb-10 text-center">خزانة الأوسمة الملكية 🏆</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="aspect-square bg-white border border-[#e8ddd3] rounded-[40px] flex flex-col items-center justify-center gap-4 opacity-30 grayscale hover:grayscale-0 hover:opacity-100 transition-all cursor-not-allowed group">
                <span className="text-5xl">🔒</span>
                <span className="text-[10px] font-bold text-[#7c5c3e] uppercase">مغلق</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}