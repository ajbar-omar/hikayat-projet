'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { motion } from 'framer-motion'
import Link from 'next/navigation'
import { usePathname } from 'next/navigation'
import OnboardingTour from '@/components/OnboardingTour'
import { BookOpen, Trophy, Settings, LogOut } from 'lucide-react'

export default function StoriesLibrary() {
  const [profile, setProfile] = useState<any>(null)
  const [stories, setStories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  // 🌟 State جديد باش نشعلو الأنيمسايون ملي يكليكي على شي قصة 🌟
  const [isNavigating, setIsNavigating] = useState(false) 

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedLang, setSelectedLang] = useState("arabic") 
  const [selectedStatus, setSelectedStatus] = useState("all") 
  
  const [showTour, setShowTour] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    async function loadData() {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        const { data: profData } = await supabase
          .from('profiles')
          .select('id, kid_name, avatar_url, total_xp, has_seen_onboarding')
          .eq('id', session.user.id)
          .single()

        setProfile(profData)

        if (profData && profData.has_seen_onboarding === false) {
          setShowTour(true)
        }

        const { data: storyList } = await supabase
          .from('stories')
          .select('*')
          .order('created_at', { ascending: false })

        const { data: userStoriesProgress } = await supabase
          .from('user_stories')
          .select('story_id, status')
          .eq('profile_id', session.user.id)

        const progressMap = new Map(
          userStoriesProgress?.map(item => [item.story_id, item.status]) || []
        )

        const mappedStories = (storyList || []).map((story) => {
          const currentStatus = progressMap.get(story.id);
          return {
            ...story,
            status: currentStatus || "New"
          }
        })
        
        setStories(mappedStories)
      } else {
        window.location.href = '/auth'
      }
      
      setTimeout(() => {
        setLoading(false)
      }, 1200)
    }
    loadData()
  }, [])

  const filteredStories = stories.filter(story => {
    const matchesSearch = story.title?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = selectedStatus === "all" || story.status?.toLowerCase() === selectedStatus.toLowerCase()
    const matchesLang = selectedLang === "arabic" 

    return matchesSearch && matchesStatus && matchesLang
  })

  // 🌟 Function باش نشعلو الأنيمسايون عاد نمشيو للقصة 🌟
  const handleStoryClick = (storyId: string) => {
    setIsNavigating(true); // كنشعلو اللودينغ
    setTimeout(() => {
      window.location.href = `/stories/${storyId}`; // كنمشيو للقصة من بعد نص ثانية
    }, 600); 
  }

  return (
    <div className="w-full min-h-screen bg-[#fffcf1] p-4 md:p-8 font-sans antialiased text-[#3b1b0d] overflow-x-hidden" dir="ltr">
      
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes instant-pulse { 0%, 100% { transform: scale(1) rotate(0deg); opacity: 1; } 50% { transform: scale(1.1) rotate(3deg); opacity: 0.8; } }
        .loading-overlay { position: fixed; inset: 0; background: #fffcf1; display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 9999; transition: opacity 0.4s ease-out, visibility 0.4s; }
        .loading-overlay.hidden { opacity: 0; visibility: hidden; pointer-events: none; }
        .instant-logo { width: 80px; height: auto; animation: instant-pulse 1.8s ease-in-out infinite; }
        @media (min-width: 768px) { .instant-logo { width: 120px; } }
        .progress-bar-container { width: 180px; height: 4px; background: rgba(196, 117, 41, 0.1); border-radius: 10px; margin-top: 30px; overflow: hidden; }
        .progress-bar-fill { width: 100%; height: 100%; background: #c47529; transform: translateX(-100%); animation: slide-progress 2s infinite linear; }
        @keyframes slide-progress { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
      `}} />

      {/* 🌟 زدنا شرط باش يبان اللودينغ لا فالبداية لا ملي نكليكيو على شي قصة 🌟 */}
      <div className={`loading-overlay ${!loading && !isNavigating ? 'hidden' : ''}`}>
        {/* 🌟 حيدنا داك الفيلتر الكحل باش يبان اللوغو بالألوان الحقيقية ديالو 🌟 */}
        <img src="/assets/logo.svg" className="instant-logo" alt="Loading..." />
        <div className="progress-bar-container"><div className="progress-bar-fill" /></div>
        <p style={{ marginTop: '20px', color: '#c47529', fontWeight: '900', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase' }}>
          Préparation des histoires...
        </p>
      </div>

      {showTour && profile && !loading && <OnboardingTour profileId={profile.id} />}

      <div className="max-w-[1400px] mx-auto flex flex-col gap-6">
        
        <header className="w-full bg-white rounded-3xl p-4 flex items-center justify-between border border-[#f3eee0] shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-[#e6e2d1] flex items-center justify-center border-2 border-[#c47529]">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="User Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-xl">👦</span>
              )}
            </div>
            <div className="text-left">
              <h1 className="text-base font-black tracking-tight">Hi {profile?.kid_name || 'بطلنا'}!</h1>
              <p className="text-xs text-[#7a6657] font-medium">Ready for a new adventure?</p>
            </div>
          </div>
          
          <div id="topbar-xp" className="flex items-center gap-3">
            <div className="bg-[#fff9e5] border border-[#f59e0b]/30 px-3 py-1 rounded-full flex items-center gap-1.5 text-xs font-bold text-[#f59e0b]">
              <span className="w-4 h-4 bg-[#f59e0b] text-white text-[10px] font-black rounded-full flex items-center justify-center">L</span>
              Niveau <span className="font-black">{Math.floor((profile?.total_xp || 0) / 500) + 1}</span>
            </div>
            <div className="bg-[#fff3e5] border border-[#c47529]/20 px-3 py-1 rounded-full flex items-center gap-1 text-xs font-bold text-[#c47529]">
              ✨ <span className="font-black">{profile?.total_xp || 0}</span> XP
            </div>
          </div>
        </header>

        <div className="w-full flex flex-col lg:flex-row gap-6 items-start">
          
          <aside className="w-full lg:w-[260px] bg-white rounded-3xl p-4 flex flex-col gap-3 border border-[#f3eee0] shadow-sm lg:sticky lg:top-8">
            <button className={`w-full text-left rounded-2xl p-3 text-sm font-black flex items-center justify-between transition-all tracking-tight ${pathname === '/stories' ? 'bg-[#c47529] text-white shadow-md' : 'bg-white text-[#7a6657] hover:bg-[#fffcf1]'}`}>
              <span>Bibliothèque</span>
              <BookOpen className={`w-5 h-5 ${pathname === '/stories' ? 'text-white' : 'text-[#7a6657] opacity-80'}`} />
            </button>
            
            <button id="sidebar-profile" onClick={() => window.location.href = '/profile'} className={`w-full text-left rounded-2xl p-3 text-sm font-bold flex items-center justify-between transition-all border border-transparent ${pathname === '/profile' ? 'bg-[#c47529] text-white shadow-md' : 'bg-white text-[#7a6657] hover:bg-[#fffcf1]'}`}>
              <span>Profil</span>
              <Trophy className={`w-5 h-5 ${pathname === '/profile' ? 'text-white' : 'text-[#7a6657] opacity-60'}`} />
            </button>
            
            <button id="sidebar-settings" onClick={() => window.location.href = '/settings'} className={`w-full text-left rounded-2xl p-3 text-sm font-bold flex items-center justify-between transition-all border border-transparent ${pathname === '/settings' ? 'bg-[#c47529] text-white shadow-md' : 'bg-white text-[#7a6657] hover:bg-[#fffcf1]'}`}>
              <span>Paramètres</span>
              <Settings className={`w-5 h-5 ${pathname === '/settings' ? 'text-white' : 'text-[#7a6657] opacity-60'}`} />
            </button>
            
            <div className="h-px bg-[#f3eee0] my-2 lg:mt-48" />
            
            <button 
              onClick={() => supabase.auth.signOut().then(() => window.location.href='/auth')}
              className="w-full text-left bg-white text-[#7a6657] hover:bg-red-50 hover:text-red-600 transition-all rounded-2xl p-3 text-sm font-bold flex items-center justify-between border border-transparent group"
            >
              <span>Se déconnecter</span>
              <LogOut className="w-5 h-5 text-[#7a6657] opacity-60 group-hover:text-red-600 group-hover:opacity-100 transition-all" />
            </button>
          </aside>

          <main className="flex-1 w-full bg-white rounded-[36px] p-6 md:p-8 border border-[#f3eee0] shadow-sm flex flex-col items-center">
            
            <h2 className="text-xl md:text-2xl font-bold text-center max-w-md tracking-tight mb-6" style={{ fontFamily: "'Poppins', sans-serif" }}>
              Qu'est-ce que tu veux lire aujourd'hui ?
            </h2>

            <div className="w-full max-w-[540px] relative mb-6">
              <input 
                type="text" 
                placeholder="Quelle histoire tu veux aujourd'hui... ?" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#fffcf1] border border-[#e6e2d1] rounded-2xl py-3 px-4 pl-5 pr-12 text-sm font-medium focus:outline-none focus:border-[#c47529] transition-colors placeholder-[#a18f81] text-left"
                style={{ direction: 'ltr' }}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 opacity-40 text-lg">🔍</span>
            </div>

            <div className="w-full flex flex-col sm:flex-row items-center justify-center gap-4 mb-8 border-b border-[#f3eee0] pb-6">
              <div className="flex items-center gap-2 bg-[#fffcf1] p-1.5 rounded-full border border-[#f3eee0]">
                {[
                  { value: "english", label: "anglais" },
                  { value: "french", label: "français" },
                  { value: "arabic", label: "ARAB" }
                ].map((lang) => (
                  <button
                    key={lang.value}
                    onClick={() => setSelectedLang(lang.value)}
                    className={`px-5 py-1.5 rounded-full text-xs font-black uppercase tracking-tight transition-all ${
                      selectedLang === lang.value 
                        ? "bg-[#c47529] text-white shadow-md" 
                        : "text-[#7a6657] hover:opacity-80"
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>

              <div className="hidden sm:block w-px h-6 bg-[#e6e2d1]" />

              <div className="flex items-center gap-2 bg-[#fffcf1] p-1.5 rounded-full border border-[#f3eee0]">
                {[
                  { value: "all", label: "Tous les cas" },
                  { value: "new", label: "NOUVEAU" },
                  { value: "in progress", label: "EN COURS" },
                  { value: "completed", label: "TERMINÉ" }
                ].map((status) => (
                  <button
                    key={status.value}
                    onClick={() => setSelectedStatus(status.value)}
                    className={`px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-tight transition-all ${
                      selectedStatus === status.value 
                        ? status.value === "new" ? "bg-[#22c55e] text-white shadow-md" : status.value === "in progress" ? "bg-[#f59e0b] text-white shadow-md" : status.value === "completed" ? "bg-[#eab308] text-white shadow-md" : "bg-[#c47529] text-white shadow-md"
                        : "text-[#7a6657] hover:opacity-80"
                    }`}
                  >
                    {status.label}
                  </button>
                ))}
              </div>
            </div>

            {selectedLang !== "arabic" ? (
              <div className="w-full py-20 text-center flex flex-col items-center justify-center gap-2">
                <span className="text-4xl animate-bounce">✨</span>
                <p className="text-base font-black uppercase tracking-tight text-[#c47529]">Prochainement</p>
                <p className="text-xs text-[#7a6657] font-medium max-w-xs">Nous préparons des histoires magiques et captivantes dans d'autres langues pour notre héros !</p>
              </div>
            ) : filteredStories.length > 0 ? (
              <div id="library-stories" className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredStories.map((story) => {
                  const isNew = story.status?.toLowerCase() === "new";
                  const isInProgress = story.status?.toLowerCase() === "in progress";
                  
                  const borderClass = isNew ? "border-[#22c55e]" : isInProgress ? "border-[#f59e0b]" : "border-[#eab308]";
                  const btnLabel = isNew ? "Commencer à lire" : isInProgress ? "Continuer" : "Relire";

                  const displayStatus = isNew ? "NOUVEAU" : isInProgress ? "EN COURS" : "TERMINÉ";

                  return (
                    <motion.article 
                      key={story.id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ y: -6, scale: 1.02 }}
                      className={`w-full aspect-[4/3] rounded-[28px] border-[3px] ${borderClass} relative overflow-hidden group shadow-sm bg-black cursor-pointer`}
                      // 🌟 عيطنا على الفانكشن لي كتشعل اللودينغ عاد كتمشي للقصة 🌟
                      onClick={() => handleStoryClick(story.id)}
                    >
                      <img 
                        src={story.cover_url || "/assets/story1.png"} 
                        alt={story.title} 
                        className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent pointer-events-none" />

                      <div className="absolute inset-0 p-5 flex flex-col justify-end items-start text-white text-left">
                        <div className="flex items-center gap-1.5 mb-2">
                          <span className="bg-white/20 backdrop-blur-md text-[9px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">ARABE</span>
                          <span className="bg-white/20 backdrop-blur-md text-[9px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                            {displayStatus}
                          </span>
                        </div>
                        
                        <h3 className="text-base font-black tracking-tight mb-1" style={{ fontFamily: "'Poppins', sans-serif" }} >{story.title}</h3>
                        <p className="text-xs text-white/80 font-medium leading-relaxed mb-4 line-clamp-2 max-w-[220px]">
                          {story.description || "An epic adventure full of excitement and language learning secrets."}
                        </p>
                        
                        <button className="w-full bg-[#c47529] group-hover:bg-[#b0631e] transition-colors text-white text-xs font-black uppercase tracking-tight py-2.5 rounded-xl flex items-center justify-center gap-2 italic shadow-md">
                          {btnLabel} <span>→</span>
                        </button>
                      </div>
                    </motion.article>
                  );
                })}
              </div>
            ) : (
              <div className="w-full py-20 text-center flex flex-col items-center justify-center gap-2">
                <span className="text-4xl">📚</span>
                <p className="text-sm font-bold text-[#7a6657]">No stories found matching your filter.</p>
              </div>
            )}

            {selectedLang === "arabic" && filteredStories.length > 0 && (
              <button className="mt-8 border-2 border-[#f3eee0] text-[#7a6657] hover:bg-[#fffcf1] transition-colors font-black text-xs uppercase tracking-wider px-12 py-3 rounded-2xl shadow-sm">
                Voir plus
              </button>
            )}

          </main>
        </div>

      </div>
    </div>
  );
}


// 'use client'
// import { useState, useEffect } from 'react'
// import { supabase } from '@/lib/supabase'
// import { motion } from 'framer-motion'
// import Link from 'next/link'
// import { usePathname } from 'next/navigation'
// // 🌟 استدعاء الـ OnboardingTour من المجلد اللي برا
// import OnboardingTour from '@/components/OnboardingTour'

// export default function StoriesLibrary() {
//   const [profile, setProfile] = useState<any>(null)
//   const [stories, setStories] = useState<any[]>([])
//   const [loading, setLoading] = useState(true)
//   const [searchQuery, setSearchQuery] = useState("")
//   const [selectedLang, setSelectedLang] = useState("arabic") 
//   const [selectedStatus, setSelectedStatus] = useState("all") // 'all' | 'new' | 'in progress' | 'completed'
  
//   // 🌟 State للتحكم ف ظهور الـ Welcoming Tour للمشترك الجديد
//   const [showTour, setShowTour] = useState(false)

//   const pathname = usePathname()

//   useEffect(() => {
//     async function loadData() {
//       const { data: { session } } = await supabase.auth.getSession()
      
//       if (session?.user) {
//         // 1. جلب بيانات البروفايل والـ XP + الحقل الجديد د الـ Onboarding
//         const { data: profData } = await supabase
//           .from('profiles')
//           .select('id, kid_name, avatar_url, total_xp, has_seen_onboarding')
//           .eq('id', session.user.id)
//           .single()

//         setProfile(profData)

//         // 🔐 تشيك صارم: إيلا كان المشترك جديد وباقي ماشافش الـ Tour كنشعلوها
//         if (profData && profData.has_seen_onboarding === false) {
//           setShowTour(true)
//         }

//         // 2. جلب القصص المتاحة من الـ Backend
//         const { data: storyList } = await supabase
//           .from('stories')
//           .select('*')
//           .order('created_at', { ascending: false })

//         // 3. جلب حالات القراءة الخاصة بهذا الطفل من جدول user_stories
//         const { data: userStoriesProgress } = await supabase
//           .from('user_stories')
//           .select('story_id, status')
//           .eq('profile_id', session.user.id)

//         const progressMap = new Map(
//           userStoriesProgress?.map(item => [item.story_id, item.status]) || []
//         )

//         // 4. دمج الحالات الديناميكية (Default هي New)
//         const mappedStories = (storyList || []).map((story) => {
//           const currentStatus = progressMap.get(story.id);
//           return {
//             ...story,
//             status: currentStatus || "New"
//           }
//         })
        
//         setStories(mappedStories)
//       } else {
//         window.location.href = '/auth'
//       }
//       setLoading(false)
//     }
//     loadData()
//   }, [])

//   // 🛠️ الفلترة الذكية
//   const filteredStories = stories.filter(story => {
//     const matchesSearch = story.title?.toLowerCase().includes(searchQuery.toLowerCase())
//     const matchesStatus = selectedStatus === "all" || story.status?.toLowerCase() === selectedStatus.toLowerCase()
//     const matchesLang = selectedLang === "arabic" 

//     return matchesSearch && matchesStatus && matchesLang
//   })

//   if (loading) return (
//     <div className="h-screen flex items-center justify-center bg-[#fffcf1] font-black text-[#c47529] italic text-xl">
//       جاري فتح عالم الحكايات... ✨
//     </div>
//   )

//   return (
//     <div className="w-full min-h-screen bg-[#fffcf1] p-4 md:p-8 font-sans antialiased text-[#3b1b0d]" dir="ltr">
      
//       {/* 🌟 زرع الـ Component لداخل (غايظهر فقط للمشترك الجديد وبناءً على شرط سوبابيس) */}
//       {showTour && profile && <OnboardingTour profileId={profile.id} />}

//       <div className="max-w-[1400px] mx-auto flex flex-col gap-6">
        
//         {/* 1. TOP BAR */}
//         <header className="w-full bg-white rounded-3xl p-4 flex items-center justify-between border border-[#f3eee0] shadow-sm">
//           <div className="flex items-center gap-3">
//             <div className="w-10 h-10 rounded-full overflow-hidden bg-[#e6e2d1] flex items-center justify-center border-2 border-[#c47529]">
//               {profile?.avatar_url ? (
//                 <img src={profile.avatar_url} alt="User Avatar" className="w-full h-full object-cover" />
//               ) : (
//                 <span className="text-xl">👦</span>
//               )}
//             </div>
//             <div className="text-left">
//               <h1 className="text-base font-black tracking-tight">Hi {profile?.kid_name || 'بطلنا'}!</h1>
//               <p className="text-xs text-[#7a6657] font-medium">Ready for a new adventure?</p>
//             </div>
//           </div>
          
//           {/* 🌟 زِيـادة الـ ID: topbar-xp هنا باش الـ Tooltip يعيق بـ الـ XP والـ Level */}
//           <div id="topbar-xp" className="flex items-center gap-3">
//             <div className="bg-[#fff9e5] border border-[#f59e0b]/30 px-3 py-1 rounded-full flex items-center gap-1.5 text-xs font-bold text-[#f59e0b]">
//               <span className="w-4 h-4 bg-[#f59e0b] text-white text-[10px] font-black rounded-full flex items-center justify-center">L</span>
//               Level <span className="font-black">{Math.floor((profile?.total_xp || 0) / 500) + 1}</span>
//             </div>
//             <div className="bg-[#fff3e5] border border-[#c47529]/20 px-3 py-1 rounded-full flex items-center gap-1 text-xs font-bold text-[#c47529]">
//               ✨ <span className="font-black">{profile?.total_xp || 0}</span> XP
//             </div>
//           </div>
//         </header>

//         {/* MAIN CONTAINER */}
//         <div className="w-full flex flex-col lg:flex-row gap-6 items-start">
          
//           {/* 2. SIDEBAR */}
//           <aside className="w-full lg:w-[260px] bg-white rounded-3xl p-4 flex flex-col gap-3 border border-[#f3eee0] shadow-sm lg:sticky lg:top-8">
//             <button className={`w-full text-left rounded-2xl p-3 text-sm font-black flex items-center justify-between transition-all  tracking-tight  ${pathname === '/stories' ? 'bg-[#c47529] text-white shadow-md' : 'bg-white text-[#7a6657] hover:bg-[#fffcf1]'}`}>
//               <span>Bibliothèque</span>
//               <span className="opacity-80">📚</span>
//             </button>
            
//             {/* 🌟 زِيـادة الـ ID: sidebar-profile لربط الخطوة التانية د الـ Tour الشخصي */}
//             <button id="sidebar-profile" onClick={() => window.location.href = '/profile'} className={`w-full text-left rounded-2xl p-3 text-sm font-bold flex items-center justify-between transition-all border border-transparent ${pathname === '/profile' ? 'bg-[#c47529] text-white shadow-md' : 'bg-white text-[#7a6657] hover:bg-[#fffcf1]'}`}>
//               <span>Profil</span>
//               <span className="opacity-60">🏆</span>
//             </button>
            
//             {/* 🌟 زِيـادة الـ ID: sidebar-settings لربط الخطوة التالتة د الـ Coin des parents */}
//             <button id="sidebar-settings" onClick={() => window.location.href = '/settings'} className={`w-full text-left rounded-2xl p-3 text-sm font-bold flex items-center justify-between transition-all border border-transparent ${pathname === '/settings' ? 'bg-[#c47529] text-white shadow-md' : 'bg-white text-[#7a6657] hover:bg-[#fffcf1]'}`}>
//               <span>Paramètres</span>
//               <span className="opacity-60">⚙️</span>
//             </button>
            
//             <div className="h-px bg-[#f3eee0] my-2 lg:mt-48" />
            
//             <button 
//               onClick={() => supabase.auth.signOut().then(() => window.location.href='/auth')}
//               className="w-full text-left bg-white text-[#7a6657] hover:bg-red-50 hover:text-red-600 transition-all rounded-2xl p-3 text-sm font-bold flex items-center justify-between border border-transparent"
//             >
//               <span>Se déconnecter</span>
//               <span>🚪</span>
//             </button>
//           </aside>

//           {/* 3. CONTENT AREA */}
//           <main className="flex-1 w-full bg-white rounded-[36px] p-6 md:p-8 border border-[#f3eee0] shadow-sm flex flex-col items-center">
            
//          <h2 className="text-xl md:text-2xl font-bold text-center max-w-md tracking-tight mb-6" style={{ fontFamily: "'Poppins', sans-serif" }}>
//   Qu'est-ce que tu veux lire aujourd'hui ?
// </h2>

//             {/* SEARCH */}
//             <div className="w-full max-w-[540px] relative mb-6">
//               <input 
//                 type="text" 
//                 placeholder="Quelle histoire tu veux aujourd'hui... ?" 
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//                 className="w-full bg-[#fffcf1] border border-[#e6e2d1] rounded-2xl py-3 px-4 pl-5 pr-12 text-sm font-medium focus:outline-none focus:border-[#c47529] transition-colors placeholder-[#a18f81] text-left"
//                 style={{ direction: 'ltr' }}
//               />
//               <span className="absolute right-4 top-1/2 -translate-y-1/2 opacity-40 text-lg">🔍</span>
//             </div>

//             {/* FILTERS BAR */}
//             <div className="w-full flex flex-col sm:flex-row items-center justify-center gap-4 mb-8 border-b border-[#f3eee0] pb-6">
//               <div className="flex items-center gap-2 bg-[#fffcf1] p-1.5 rounded-full border border-[#f3eee0]">
//                 {[
//                   { value: "english", label: "anglais" },
//                   { value: "french", label: "français" },
//                   { value: "arabic", label: "ARAB" }
//                 ].map((lang) => (
//                   <button
//                     key={lang.value}
//                     onClick={() => setSelectedLang(lang.value)}
//                     className={`px-5 py-1.5 rounded-full text-xs font-black uppercase tracking-tight transition-all ${
//                       selectedLang === lang.value 
//                         ? "bg-[#c47529] text-white shadow-md" 
//                         : "text-[#7a6657] hover:opacity-80"
//                     }`}
//                   >
//                     {lang.label}
//                   </button>
//                 ))}
//               </div>

//               <div className="hidden sm:block w-px h-6 bg-[#e6e2d1]" />

//               <div className="flex items-center gap-2 bg-[#fffcf1] p-1.5 rounded-full border border-[#f3eee0]">
//                 {[
//                   { value: "all", label: "Tous les cas" },
//                   { value: "new", label: "NOUVEAU" },
//                   { value: "in progress", label: "EN COURS" },
//                   { value: "completed", label: "TERMINÉ" }
//                 ].map((status) => (
//                   <button
//                     key={status.value}
//                     onClick={() => setSelectedStatus(status.value)}
//                     className={`px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-tight transition-all ${
//                       selectedStatus === status.value 
//                         ? status.value === "new" ? "bg-[#22c55e] text-white shadow-md" : status.value === "in progress" ? "bg-[#f59e0b] text-white shadow-md" : status.value === "completed" ? "bg-[#eab308] text-white shadow-md" : "bg-[#c47529] text-white shadow-md"
//                         : "text-[#7a6657] hover:opacity-80"
//                     }`}
//                   >
//                     {status.label}
//                   </button>
//                 ))}
//               </div>
//             </div>

//             {/* STORIES DYNAMIC GRID */}
//             {selectedLang !== "arabic" ? (
//               <div className="w-full py-20 text-center flex flex-col items-center justify-center gap-2">
//                 <span className="text-4xl animate-bounce">✨</span>
//                 <p className="text-base font-black uppercase  tracking-tight text-[#c47529]">Prochainement</p>
//                 <p className="text-xs text-[#7a6657] font-medium max-w-xs">Nous préparons des histoires magiques et captivantes dans d'autres langues pour notre héros !</p>
//               </div>
//             ) : filteredStories.length > 0 ? (
//               /* 🌟 زِيـادة الـ ID: library-stories هنا فوق الـ Grid د الـقصص لربط الخطوة الأولى */
//               <div id="library-stories" className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
//                 {filteredStories.map((story) => {
//                   const isNew = story.status?.toLowerCase() === "new";
//                   const isInProgress = story.status?.toLowerCase() === "in progress";
                  
//                   const borderClass = isNew ? "border-[#22c55e]" : isInProgress ? "border-[#f59e0b]" : "border-[#eab308]";
//                   const btnLabel = isNew ? "Commencer à lire" : isInProgress ? "Continuer" : "Relire";

//                   return (
//                     <motion.article 
//                       key={story.id}
//                       initial={{ opacity: 0, y: 16 }}
//                       animate={{ opacity: 1, y: 0 }}
//                       whileHover={{ y: -6, scale: 1.02 }}
//                       className={`w-full aspect-[4/3] rounded-[28px] border-[3px] ${borderClass} relative overflow-hidden group shadow-sm bg-black cursor-pointer`}
//                       onClick={() => window.location.href = `/stories/${story.id}`}
//                     >
//                       <img 
//                         src={story.cover_url || "/assets/story1.png"} 
//                         alt={story.title} 
//                         className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500" 
//                       />
//                       <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent pointer-events-none" />

//                       <div className="absolute inset-0 p-5 flex flex-col justify-end items-start text-white text-left">
//                         <div className="flex items-center gap-1.5 mb-2">
//                           <span className="bg-white/20 backdrop-blur-md text-[9px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">Arabic</span>
//                           <span className="bg-white/20 backdrop-blur-md text-[9px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
//                             {story.status?.toUpperCase()}
//                           </span>
//                         </div>
                        
//                         <h3 className="text-base font-black  tracking-tight mb-1" style={{ fontFamily: "'Poppins', sans-serif" }} >{story.title}</h3>
//                         <p className="text-xs text-white/80 font-medium leading-relaxed mb-4 line-clamp-2 max-w-[220px]">
//                           {story.description || "An epic adventure full of excitement and language learning secrets."}
//                         </p>
                        
//                         <button className="w-full bg-[#c47529] group-hover:bg-[#b0631e] transition-colors text-white text-xs font-black uppercase tracking-tight py-2.5 rounded-xl flex items-center justify-center gap-2 italic shadow-md">
//                           {btnLabel} <span>→</span>
//                         </button>
//                       </div>
//                     </motion.article>
//                   );
//                 })}
//               </div>
//             ) : (
//               <div className="w-full py-20 text-center flex flex-col items-center justify-center gap-2">
//                 <span className="text-4xl">📚</span>
//                 <p className="text-sm font-bold text-[#7a6657]">No stories found matching your filter.</p>
//               </div>
//             )}

//             {/* LOAD MORE BUTTON */}
//             {selectedLang === "arabic" && filteredStories.length > 0 && (
//               <button className="mt-8 border-2 border-[#f3eee0] text-[#7a6657] hover:bg-[#fffcf1] transition-colors font-black text-xs uppercase tracking-wider px-12 py-3 rounded-2xl shadow-sm">
//                 Load More
//               </button>
//             )}

//           </main>
//         </div>

//       </div>
//     </div>
//   );
// }