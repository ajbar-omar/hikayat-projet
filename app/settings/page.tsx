'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BookOpen, Trophy, Settings, LogOut, Languages, Volume2, Users, Lock, Music, Sparkles, Clock } from 'lucide-react'

interface UserProfile {
  id: string;
  kid_name?: string;
  avatar_url?: string;
  total_xp: number;
  bg_music?: boolean;
  sound_effects?: boolean;
}

export default function SettingsPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const pathname = usePathname()

  // 🌟 ردينا FR هي اللي مختارة بار ديفو 🌟
  const [selectedLang, setSelectedLang] = useState('FR')
  const [soundEffects, setSoundEffects] = useState(true)
  const [bgMusic, setBgMusic] = useState(true)
  const [timeLimit, setTimeLimit] = useState(60)

  useEffect(() => {
    async function getProfileData() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()
          
          if (data) {
            setProfile(data)
            setBgMusic(data.bg_music !== false)
            setSoundEffects(data.sound_effects !== false)
          }
        } else {
          setProfile({ id: 'mock', kid_name: 'Yasmin El amrani', total_xp: 750 })
        }
      } catch (error) {
        console.error(error)
      } finally {
        setTimeout(() => {
          setLoading(false)
        }, 1200)
      }
    }
    getProfileData()
  }, [])

  const handleToggleSetting = async (type: 'bg_music' | 'sound_effects', currentValue: boolean) => {
    const newValue = !currentValue
    
    if (type === 'bg_music') setBgMusic(newValue)
    if (type === 'sound_effects') setSoundEffects(newValue)

    if (type === 'bg_music') {
      localStorage.setItem('bg_music_enabled', String(newValue))
      window.dispatchEvent(new Event('storage'))
    }

    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      await supabase
        .from('profiles')
        .update({ [type]: newValue })
        .eq('id', session.user.id)
    }
  }

  const totalXp = profile?.total_xp || 0
  const level = Math.floor(totalXp / 500) + 1

  if (loading) return (
    <div className="h-screen bg-[#fffcf1] flex flex-col items-center justify-center font-sans text-[#c47529]">
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes instant-pulse { 0%, 100% { transform: scale(1) rotate(0deg); opacity: 1; } 50% { transform: scale(1.1) rotate(3deg); opacity: 0.8; } }
        .instant-logo { width: 80px; height: auto; animation: instant-pulse 1.8s ease-in-out infinite; }
        @media (min-width: 768px) { .instant-logo { width: 120px; } }
        .progress-bar-container { width: 180px; height: 4px; background: rgba(196, 117, 41, 0.1); border-radius: 10px; margin-top: 30px; overflow: hidden; }
        .progress-bar-fill { width: 100%; height: 100%; background: #c47529; transform: translateX(-100%); animation: slide-progress 2s infinite linear; }
        @keyframes slide-progress { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
      `}} />
      <img src="/assets/logo.svg" className="instant-logo" alt="Loading..." />
      <div className="progress-bar-container"><div className="progress-bar-fill" /></div>
      <p style={{ marginTop: '20px', fontWeight: '900', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase' }}>
        Chargement des paramètres...
      </p>
    </div>
  )

  return (
    <div className="w-full min-h-screen bg-[#fffcf1] p-4 md:p-8 font-sans antialiased text-[#3b1b0d]" dir="ltr">
      <div className="max-w-[1400px] mx-auto flex flex-col gap-6">
        
        {/* 1. TOP BAR */}
        <header className="w-full bg-white rounded-3xl p-4 flex items-center justify-between border border-[#f3eee0] shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-[#e6e2d1] flex items-center justify-center border-2 border-[#c47529]">
              <img src={profile?.avatar_url || "/assets/avatar-default.png"} alt="avatar" className="w-full h-full object-cover" />
            </div>
            <div className="text-left">
              <h1 className="text-base font-black tracking-tight">Hi {profile?.kid_name || 'Explorer'}!</h1>
              <p className="text-xs text-[#7a6657] font-medium">Ready for a new adventure?</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="bg-[#fff9e5] border border-[#f59e0b]/30 px-3 py-1 rounded-full flex items-center gap-1.5 text-xs font-bold text-[#f59e0b]">
              <span className="w-4 h-4 bg-[#f59e0b] text-white text-[10px] font-black rounded-full flex items-center justify-center">L</span>
              Livele <span className="font-black">{level}</span>
            </div>
            <div className="bg-[#fff3e5] border border-[#c47529]/20 px-3 py-1 rounded-full flex items-center gap-1 text-xs font-bold text-[#c47529]">
              Badges <span className="font-black">🎖️</span>
            </div>
          </div>
        </header>

        {/* MAIN LAYOUT */}
        <div className="w-full flex flex-col lg:flex-row gap-6 items-start">
          
          {/* 2. SIDEBAR */}
          <aside className="w-full lg:w-[260px] bg-white rounded-3xl p-4 flex flex-col gap-3 border border-[#f3eee0] shadow-sm lg:sticky lg:top-8 text-left">
            <Link href="/stories" className="w-full">
              <button className={`w-full text-left rounded-2xl p-3 text-sm font-bold flex items-center justify-between text-[#7a6657] hover:bg-[#fffcf1] transition-all tracking-tight`}>
                <span>Bibliothèque</span>
                <BookOpen className="w-5 h-5 text-[#7a6657] opacity-80" />
              </button>
            </Link>
            
            <Link href="/profile" className="w-full">
              <button className={`w-full text-left rounded-2xl p-3 text-sm font-bold flex items-center justify-between text-[#7a6657] hover:bg-[#fffcf1] transition-all tracking-tight`}>
                <span>Profil</span>
                <Trophy className="w-5 h-5 text-[#7a6657] opacity-60" />
              </button>
            </Link>
            
            <Link href="/settings" className="w-full">
              <button className={`w-full text-left rounded-2xl p-3 text-sm font-black flex items-center justify-between bg-[#c47529] text-white shadow-md   tracking-tight`}>
                <span>Paramètres</span>
                <Settings className="w-5 h-5 text-white" />
              </button>
            </Link>
            
            <div className="h-px bg-[#f3eee0] my-2 lg:mt-48" />
            
            <button 
              onClick={() => supabase.auth.signOut().then(() => window.location.href='/auth')}
              className="w-full text-left bg-white text-[#7a6657] hover:bg-red-50 hover:text-red-600 transition-all rounded-2xl p-3 text-sm font-bold flex items-center justify-between group"
            >
              <span>Se déconnecter</span>
              <LogOut className="w-5 h-5 text-[#7a6657] opacity-60 group-hover:text-red-600 group-hover:opacity-100 transition-all" />
            </button>
          </aside>

          {/* 3. MAIN CONTENT (SETTINGS CARDS) */}
          <main className="flex-1 w-full flex flex-col gap-6 text-left">
            
            {/* CARD 1: LANGUAGE SECTION */}
            <section className="w-full bg-white rounded-[36px] p-6 md:p-8 border border-[#f3eee0] shadow-sm flex flex-col gap-4">
              <div className="flex items-center gap-2 text-sm font-black uppercase tracking-tight text-[#3b1b0d]">
                <Languages className="w-5 h-5 text-[#c47529]" />
                <h3>Language</h3>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">
                {[
                  { code: 'EN', label: 'Anglais' },
                  { code: 'FR', label: 'Français' },
                  { code: 'AR', label: 'Arab' }
                ].map((lang) => {
                  const isSelected = selectedLang === lang.code
                  return (
                    <div
                      key={lang.code}
                      onClick={() => setSelectedLang(lang.code)}
                      className={`relative border-2 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all aspect-[2/1] bg-white ${
                        isSelected ? 'border-[#c47529] shadow-sm' : 'border-[#f3eee0] hover:border-gray-300'
                      }`}
                    >
                      <span className="text-2xl font-black text-[#3b1b0d]">{lang.code}</span>
                      <span className="text-xs text-[#7a6657] font-bold mt-1">{lang.label}</span>
                      {isSelected && (
                        <span className="absolute top-2 right-3 text-xs bg-green-100 text-green-600 w-4 h-4 rounded-full flex items-center justify-center font-bold">✓</span>
                      )}
                    </div>
                  )
                })}
              </div>
            </section>

            {/* CARD 2: SOUND SECTION */}
            <section className="w-full bg-white rounded-[36px] p-6 md:p-8 border border-[#f3eee0] shadow-sm flex flex-col gap-5">
              <div className="flex items-center gap-2 text-sm font-black uppercase tracking-tight text-[#3b1b0d]">
                <Volume2 className="w-5 h-5 text-[#c47529]" />
                <h3>Son </h3>
              </div>
              
              <div className="flex flex-col gap-4 mt-2">
                {/* Switch 1: Sound Effects */}
                <div className="w-full border border-[#f3eee0] rounded-2xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-5 h-5 text-[#7a6657] opacity-80" />
                    <div>
                      <h4 className="text-xs font-black text-[#3b1b0d]">Effets sonores</h4>
                      <p className="text-[10px] text-[#7a6657] font-medium">clics, et la voix du narrateur !</p>
                    </div>
                  </div>
                  <div 
                    onClick={() => handleToggleSetting('sound_effects', soundEffects)}
                    className={`w-14 h-7 rounded-full p-1 cursor-pointer flex items-center transition-colors ${soundEffects ? 'bg-[#c47529]' : 'bg-gray-200'}`}
                  >
                    <motion.div 
                      layout 
                      className="bg-white w-5 h-5 rounded-full shadow-md"
                      animate={{ x: soundEffects ? 28 : 0 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  </div>
                </div>

                {/* Switch 2: Background Music */}
                <div className="w-full border border-[#f3eee0] rounded-2xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Music className="w-5 h-5 text-[#7a6657] opacity-80" />
                    <div>
                      <h4 className="text-xs font-black text-[#3b1b0d]">Musique de fond</h4>
                      <p className="text-[10px] text-[#7a6657] font-medium">une expérience musicale dans la navigation</p>
                    </div>
                  </div>
                  <div 
                    onClick={() => handleToggleSetting('bg_music', bgMusic)}
                    className={`w-14 h-7 rounded-full p-1 cursor-pointer flex items-center transition-colors ${bgMusic ? 'bg-[#c47529]' : 'bg-gray-200'}`}
                  >
                    <motion.div 
                      layout 
                      className="bg-white w-5 h-5 rounded-full shadow-md"
                      animate={{ x: bgMusic ? 28 : 0 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* CARD 3: PARENTS ONLY (SCREEN TIME) */}
            <section className="w-full bg-white rounded-[36px] p-6 md:p-8 border border-[#f3eee0] shadow-sm flex flex-col gap-5">
              <div className="flex items-center justify-between text-sm font-black uppercase tracking-tight text-[#3b1b0d]">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#c47529]" />
                  <div>
                    <h3>Espace parents</h3>
                    <p className="text-[10px] text-[#7a6657] font-bold lowercase tracking-normal normal-case mt-0.5">Limite de temps d'écran</p>
                  </div>
                </div>
                <Lock className="w-4 h-4 text-[#7a6657] opacity-60" />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                {/* 🌟 زر الـ 30 دقيقة: مرسوم بـ الأيقونة د الـ Clock المتناسقة */}
                <div 
                  onClick={() => setTimeLimit(30)}
                  className={`border-2 rounded-2xl p-5 flex items-center justify-center gap-3 cursor-pointer transition-all ${
                    timeLimit === 30 ? 'border-[#c47529] bg-white shadow-sm' : 'border-[#f3eee0] bg-white hover:border-gray-300'
                  }`}
                >
                  <Clock className={`w-5 h-5 ${timeLimit === 30 ? 'text-[#c47529]' : 'text-[#7a6657]'}`} />
                  <span className="text-sm font-black text-[#3b1b0d]">30 Min</span>
                </div>

                {/* 🌟 زر الـ ساعة: مرسوم بنفس الأيقونة د الـ Clock والوزن */}
                <div 
                  onClick={() => setTimeLimit(60)}
                  className={`border-2 rounded-2xl p-5 flex items-center justify-center gap-3 cursor-pointer transition-all ${
                    timeLimit === 60 ? 'border-[#c47529] bg-white shadow-sm' : 'border-[#f3eee0] bg-white hover:border-gray-300'
                  }`}
                >
                  <Clock className={`w-5 h-5 ${timeLimit === 60 ? 'text-[#c47529]' : 'text-[#7a6657]'}`} />
                  <span className="text-sm font-black text-[#3b1b0d]">1 h </span>
                </div>
              </div>

              <button className="w-full bg-[#c47529] hover:bg-[#b06520] text-white font-black text-sm p-4 rounded-2xl shadow-sm transition-all mt-2 tracking-tight">
                Modifier le code PIN     ••••
              </button>
            </section>

          </main>
        </div>

      </div>
    </div>
  )
}

// 'use client'
// import { useState, useEffect } from 'react'
// import { supabase } from '@/lib/supabase'
// import { motion } from 'framer-motion'
// import Link from 'next/link'
// import { usePathname } from 'next/navigation'

// interface UserProfile {
//   id: string;
//   kid_name?: string;
//   avatar_url?: string;
//   total_xp: number;
//   bg_music?: boolean;
//   sound_effects?: boolean;
// }

// export default function SettingsPage() {
//   const [profile, setProfile] = useState<UserProfile | null>(null)
//   const [loading, setLoading] = useState(true)
//   const pathname = usePathname()

//   // 🎛️ الـ States ديال الـ UI مربوطين ديناميكياً مع الباكيند
//   const [selectedLang, setSelectedLang] = useState('EN')
//   const [soundEffects, setSoundEffects] = useState(true)
//   const [bgMusic, setBgMusic] = useState(true)
//   const [timeLimit, setTimeLimit] = useState(60)

//   useEffect(() => {
//     async function getProfileData() {
//       try {
//         const { data: { session } } = await supabase.auth.getSession()
//         if (session?.user) {
//           const { data } = await supabase
//             .from('profiles')
//             .select('*')
//             .eq('id', session.user.id)
//             .single()
          
//           if (data) {
//             setProfile(data)
//             // 🌟 قراءة الحقول الحقيقية من السوبابيس فوراً عند فتح الصفحة
//             setBgMusic(data.bg_music !== false)
//             setSoundEffects(data.sound_effects !== false)
//           }
//         } else {
//           // Fallback للمعاينة ف اللوكالهوست
//           setProfile({ id: 'mock', kid_name: 'Yasmin El amrani', total_xp: 750 })
//         }
//       } catch (error) {
//         console.error(error)
//       } finally {
//         setLoading(false)
//       }
//     }
//     getProfileData()
//   }, [])

//   // 🌟 الفانكشن السحرية لتحديث الصوت ف الباكيند والـ LocalStorage لايف
//   const handleToggleSetting = async (type: 'bg_music' | 'sound_effects', currentValue: boolean) => {
//     const newValue = !currentValue
    
//     // 1. تحديث الـ State ف البلاصة باش الـ UI يتحرك سريعاً
//     if (type === 'bg_music') setBgMusic(newValue)
//     if (type === 'sound_effects') setSoundEffects(newValue)

//     // 2. إعلام الـ RootLayout لايف عبر الـ LocalStorage إذا كانت bg_music
//     if (type === 'bg_music') {
//       localStorage.setItem('bg_music_enabled', String(newValue))
//       window.dispatchEvent(new Event('storage'))
//     }

//     // 3. حفظ القيمة الحقيقية ف داتابيز السوبابيس
//     const { data: { session } } = await supabase.auth.getSession()
//     if (session?.user) {
//       await supabase
//         .from('profiles')
//         .update({ [type]: newValue })
//         .eq('id', session.user.id)
//     }
//   }

//   const totalXp = profile?.total_xp || 0
//   const level = Math.floor(totalXp / 500) + 1

//   if (loading) return (
//     <div className="h-screen bg-[#fffcf1] flex items-center justify-center font-black text-[#c47529] italic text-xl">
//       Loading Settings... ✨
//     </div>
//   )

//   return (
//     <div className="w-full min-h-screen bg-[#fffcf1] p-4 md:p-8 font-sans antialiased text-[#3b1b0d]" dir="ltr">
//       <div className="max-w-[1400px] mx-auto flex flex-col gap-6">
        
//         {/* 1. TOP BAR */}
//         <header className="w-full bg-white rounded-3xl p-4 flex items-center justify-between border border-[#f3eee0] shadow-sm">
//           <div className="flex items-center gap-3">
//             <div className="w-10 h-10 rounded-full overflow-hidden bg-[#e6e2d1] flex items-center justify-center border-2 border-[#c47529]">
//               <img src={profile?.avatar_url || "/assets/avatar-default.png"} alt="avatar" className="w-full h-full object-cover" />
//             </div>
//             <div className="text-left">
//               <h1 className="text-base font-black tracking-tight">Hi {profile?.kid_name || 'Explorer'}!</h1>
//               <p className="text-xs text-[#7a6657] font-medium">Ready for a new adventure?</p>
//             </div>
//           </div>
          
//           <div className="flex items-center gap-3">
//             <div className="bg-[#fff9e5] border border-[#f59e0b]/30 px-3 py-1 rounded-full flex items-center gap-1.5 text-xs font-bold text-[#f59e0b]">
//               <span className="w-4 h-4 bg-[#f59e0b] text-white text-[10px] font-black rounded-full flex items-center justify-center">L</span>
//               Livele <span className="font-black">{level}</span>
//             </div>
//             <div className="bg-[#fff3e5] border border-[#c47529]/20 px-3 py-1 rounded-full flex items-center gap-1 text-xs font-bold text-[#c47529]">
//               Badges <span className="font-black">🎖️</span>
//             </div>
//           </div>
//         </header>

//         {/* MAIN LAYOUT */}
//         <div className="w-full flex flex-col lg:flex-row gap-6 items-start">
          
//           {/* 2. SIDEBAR */}
//           <aside className="w-full lg:w-[260px] bg-white rounded-3xl p-4 flex flex-col gap-3 border border-[#f3eee0] shadow-sm lg:sticky lg:top-8 text-left">
//             <Link href="/stories" className="w-full">
//               <button className="w-full text-left rounded-2xl p-3 text-sm font-bold flex items-center justify-between text-[#7a6657] hover:bg-[#fffcf1] transition-all">
//                 <span>Library</span>
//                 <span className="opacity-60">📚</span>
//               </button>
//             </Link>
            
//             <Link href="/profile" className="w-full">
//               <button className="w-full text-left rounded-2xl p-3 text-sm font-bold flex items-center justify-between text-[#7a6657] hover:bg-[#fffcf1] transition-all">
//                 <span>Profile</span>
//                 <span className="opacity-60">👤</span>
//               </button>
//             </Link>
            
//             <Link href="/settings" className="w-full">
//               <button className="w-full text-left rounded-2xl p-3 text-sm font-black flex items-center justify-between bg-[#c47529] text-white shadow-md italic uppercase tracking-tight">
//                 <span>Settings</span>
//                 <span className="opacity-80">⚙️</span>
//               </button>
//             </Link>
            
//             <div className="h-px bg-[#f3eee0] my-2 lg:mt-48" />
            
//             <button 
//               onClick={() => supabase.auth.signOut().then(() => window.location.href='/auth')}
//               className="w-full text-left bg-white text-[#7a6657] hover:bg-red-50 hover:text-red-600 transition-all rounded-2xl p-3 text-sm font-bold flex items-center justify-between"
//             >
//               <span>Log out</span>
//               <span>🚪</span>
//             </button>
//           </aside>

//           {/* 3. MAIN CONTENT (SETTINGS CARDS) */}
//           <main className="flex-1 w-full flex flex-col gap-6 text-left">
            
//             {/* CARD 1: LANGUAGE SECTION */}
//             <section className="w-full bg-white rounded-[36px] p-6 md:p-8 border border-[#f3eee0] shadow-sm flex flex-col gap-4">
//               <div className="flex items-center gap-2 text-sm font-black uppercase tracking-tight text-[#3b1b0d]">
//                 <span>🗣️</span>
//                 <h3>Language</h3>
//               </div>
              
//               <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">
//                 {[
//                   { code: 'EN', label: 'English' },
//                   { code: 'FR', label: 'French' },
//                   { code: 'AR', label: 'Arabic' }
//                 ].map((lang) => {
//                   const isSelected = selectedLang === lang.code
//                   return (
//                     <div
//                       key={lang.code}
//                       onClick={() => setSelectedLang(lang.code)}
//                       className={`relative border-2 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all aspect-[2/1] bg-white ${
//                         isSelected ? 'border-[#c47529] shadow-sm' : 'border-[#f3eee0] hover:border-gray-300'
//                       }`}
//                     >
//                       <span className="text-2xl font-black text-[#3b1b0d]">{lang.code}</span>
//                       <span className="text-xs text-[#7a6657] font-bold mt-1">{lang.label}</span>
//                       {isSelected && (
//                         <span className="absolute top-2 right-3 text-xs bg-green-100 text-green-600 w-4 h-4 rounded-full flex items-center justify-center font-bold">✓</span>
//                       )}
//                     </div>
//                   )
//                 })}
//               </div>
//             </section>

//             {/* CARD 2: SOUND SECTION */}
//             <section className="w-full bg-white rounded-[36px] p-6 md:p-8 border border-[#f3eee0] shadow-sm flex flex-col gap-5">
//               <div className="flex items-center gap-2 text-sm font-black uppercase tracking-tight text-[#3b1b0d]">
//                 <span>🔊</span>
//                 <h3>Sound</h3>
//               </div>
              
//               <div className="flex flex-col gap-4 mt-2">
//                 {/* Switch 1: Sound Effects */}
//                 <div className="w-full border border-[#f3eee0] rounded-2xl p-4 flex items-center justify-between">
//                   <div className="flex items-center gap-3">
//                     <span className="text-2xl">🎵</span>
//                     <div>
//                       <h4 className="text-xs font-black text-[#3b1b0d]">Sound Effects</h4>
//                       <p className="text-[10px] text-[#7a6657] font-medium">Pops, clicks & cheers!</p>
//                     </div>
//                   </div>
//                   {/* Toggle Button المربوط بالداتابيز لايف */}
//                   <div 
//                     onClick={() => handleToggleSetting('sound_effects', soundEffects)}
//                     className={`w-14 h-7 rounded-full p-1 cursor-pointer flex items-center transition-colors ${soundEffects ? 'bg-[#c47529]' : 'bg-gray-200'}`}
//                   >
//                     <motion.div 
//                       layout 
//                       className="bg-white w-5 h-5 rounded-full shadow-md"
//                       animate={{ x: soundEffects ? 28 : 0 }}
//                       transition={{ type: "spring", stiffness: 500, damping: 30 }}
//                     />
//                   </div>
//                 </div>

//                 {/* Switch 2: Background Music */}
//                 <div className="w-full border border-[#f3eee0] rounded-2xl p-4 flex items-center justify-between">
//                   <div className="flex items-center gap-3">
//                     <span className="text-2xl">🎚️</span>
//                     <div>
//                       <h4 className="text-xs font-black text-[#3b1b0d]">Background Music</h4>
//                       <p className="text-[10px] text-[#7a6657] font-medium">Fun tunes while playing</p>
//                     </div>
//                   </div>
//                   {/* Toggle Button المربوط بالداتابيز والـ LocalStorage */}
//                   <div 
//                     onClick={() => handleToggleSetting('bg_music', bgMusic)}
//                     className={`w-14 h-7 rounded-full p-1 cursor-pointer flex items-center transition-colors ${bgMusic ? 'bg-[#c47529]' : 'bg-gray-200'}`}
//                   >
//                     <motion.div 
//                       layout 
//                       className="bg-white w-5 h-5 rounded-full shadow-md"
//                       animate={{ x: bgMusic ? 28 : 0 }}
//                       transition={{ type: "spring", stiffness: 500, damping: 30 }}
//                     />
//                   </div>
//                 </div>
//               </div>
//             </section>

//             {/* CARD 3: PARENTS ONLY (SCREEN TIME) */}
//             <section className="w-full bg-white rounded-[36px] p-6 md:p-8 border border-[#f3eee0] shadow-sm flex flex-col gap-5">
//               <div className="flex items-center justify-between text-sm font-black uppercase tracking-tight text-[#3b1b0d]">
//                 <div className="flex items-center gap-2">
//                   <span>👥</span>
//                   <div>
//                     <h3>Parents Only</h3>
//                     <p className="text-[10px] text-[#7a6657] font-bold lowercase tracking-normal normal-case mt-0.5">Screen Time Limit</p>
//                   </div>
//                 </div>
//                 <span className="text-xl opacity-80">🔒</span>
//               </div>
              
//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
//                 <div 
//                   onClick={() => setTimeLimit(30)}
//                   className={`border-2 rounded-2xl p-5 flex items-center justify-center gap-3 cursor-pointer transition-all ${
//                     timeLimit === 30 ? 'border-[#c47529] bg-white' : 'border-[#f3eee0] bg-white hover:border-gray-300'
//                   }`}
//                 >
//                   <span className="text-xl">🕒</span>
//                   <span className="text-sm font-black text-[#3b1b0d]">30 Min</span>
//                 </div>

//                 <div 
//                   onClick={() => setTimeLimit(60)}
//                   className={`border-2 rounded-2xl p-5 flex items-center justify-center gap-3 cursor-pointer transition-all ${
//                     timeLimit === 60 ? 'border-[#c47529] bg-white' : 'border-[#f3eee0] bg-white hover:border-gray-300'
//                   }`}
//                 >
//                   <span className="text-xl text-[#c47529]">🕒</span>
//                   <span className="text-sm font-black text-[#3b1b0d]">1 Hour</span>
//                 </div>
//               </div>

//               <button className="w-full bg-[#c47529] hover:bg-[#b06520] text-white font-black text-sm p-4 rounded-2xl shadow-sm transition-all mt-2 tracking-tight">
//                 •••• Change PIN lock
//               </button>
//             </section>

//           </main>
//         </div>

//       </div>
//     </div>
//   )
// }