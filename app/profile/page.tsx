'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
// 🌟 جلبنا الـ Icons ديريكت من المكتبة لّي درنا ليها Install
import { BookOpen, Trophy, Settings, LogOut } from 'lucide-react'

interface UserProfile {
  id?: string;
  kid_name?: string;
  child_username?: string;
  avatar_url?: string;
  total_xp: number;
  city?: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [leaderboard, setLeaderboard] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const pathname = usePathname()

  // 🏆 مصفوفة الأوسمة مربوطة بالـ Paths المباشرة
  const allBadges = [
    { id: 'little-listener', title: 'Petit Lecteur', xp: 1000, img: '/assets/little-listener.svg' },
    { id: 'story-explorer', title: 'Explorateur d\'histoires', xp: 2500, img: '/assets/story-explorer.svg' },
    { id: 'tale-adventurer', title: 'Chevalier des histoires', xp: 5000, img: '/assets/tale-adventurer.svg' },
    { id: 'story-hero', title: 'Champion des histoires', xp: 7500, img: '/assets/story-hero.svg' },
    { id: 'story-master', title: 'Maître des histoires', xp: 10000, img: '/assets/story-master.svg' },
  ]

  useEffect(() => {
    async function getProfileAndLeaderboard() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        let currentUserId = ''
        
        if (session?.user) {
          currentUserId = session.user.id
          const { data: userData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', currentUserId)
            .single()
          
          if (userData) {
            setProfile(userData)
          } else {
            setProfile({ id: currentUserId, kid_name: 'Samia', child_username: 'samia_hero', total_xp: 3050, city: 'Tangier' })
          }
        } else {
          // Fallback للمعاينة المحلية (3050 XP)
          setProfile({ id: 'mock-id-1', kid_name: 'Samia', child_username: 'samia_hero', total_xp: 3050, city: 'Tangier' })
          currentUserId = 'mock-id-1'
        }

        const { data: leaders } = await supabase
          .from('profiles')
          .select('id, kid_name, child_username, avatar_url, total_xp, city')
          .order('total_xp', { ascending: false })

        if (leaders && leaders.length > 0) {
          setLeaderboard(leaders)
        } else {
          setLeaderboard([
            { id: 'mock-id-2', kid_name: 'Imane', child_username: 'imane_dx', total_xp: 4200, city: 'Oujda' },
            { id: currentUserId, kid_name: 'Samia', child_username: 'samia_hero', total_xp: 3050, city: 'Tangier' },
            { id: 'mock-id-3', kid_name: 'Amine', child_username: 'amine_hero', total_xp: 2650, city: 'Rabat' },
            { id: 'mock-id-4', kid_name: 'Omar Benbrahim', child_username: 'omar_b', total_xp: 445, city: 'Rabat' },
          ].sort((a, b) => b.total_xp - a.total_xp))
        }
        
      } catch (error) {
        console.error("Error loading profile or leaderboard:", error)
      } finally {
        setLoading(false)
      }
    }
    getProfileAndLeaderboard()
  }, [])

  // 📊 حسبة الـ Level والـ Progress (كل 500 XP كيعمر الـ Bar الكبيرة ويتصفر للحماس)
  const totalXp = profile?.total_xp || 0
  const level = Math.floor(totalXp / 500) + 1
  const levelProgressXp = totalXp % 500 // الباقي من الـ 500 الحالية
  const levelProgressPercentage = (levelProgressXp / 500) * 100

  // 🔍 تحديد الـ Badge القادم والـ Target الكامل ديالو
  const nextBadge = allBadges.find(badge => totalXp < badge.xp)
  const nextBadgeTargetXp = nextBadge ? nextBadge.xp : 10000

  const top1 = leaderboard[0]
  const top2 = leaderboard[1]
  const top3 = leaderboard[2]
  const restOfKids = leaderboard.slice(3)

  if (loading) return (
    <div className="h-screen bg-[#fffcf1] flex items-center justify-center font-black text-[#c47529] italic text-xl">
      Loading Hero Records... ✨
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
              <h1 className="text-base font-black tracking-tight">Salut  {profile?.kid_name || 'Explorer'}!</h1>
              <p className="text-xs text-[#7a6657] font-medium">Prêt pour une nouvelle aventure?</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="bg-[#fff9e5] border border-[#f59e0b]/30 px-3 py-1 rounded-full flex items-center gap-1.5 text-xs font-bold text-[#f59e0b]">
              <span className="w-4 h-4 bg-[#f59e0b] text-white text-[10px] font-black rounded-full flex items-center justify-center">L</span>
              Niveau <span className="font-black">{level}</span>
            </div>
            <div className="bg-[#fff3e5] border border-[#c47529]/20 px-3 py-1 rounded-full flex items-center gap-1 text-xs font-bold text-[#c47529]">
              Badges <span className="font-black">🎖️</span>
            </div>
          </div>
        </header>

        {/* MAIN LAYOUT */}
        <div className="w-full flex flex-col lg:flex-row gap-6 items-start">
          
          {/* 2. SIDEBAR - مـفـيـنـي بـ الـ Icons د الـمـكـتـبـة دابـا تـانـي كـي الـمـكّـانـي */}
          <aside className="w-full lg:w-[260px] bg-white rounded-3xl p-4 flex flex-col gap-3 border border-[#f3eee0] shadow-sm lg:sticky lg:top-8 text-left">
            <Link href="/stories" className="w-full">
              <button className={`w-full text-left rounded-2xl p-3 text-sm font-bold flex items-center justify-between transition-all tracking-tight ${pathname === '/stories' ? 'bg-[#c47529] text-white shadow-md' : 'text-[#7a6657] hover:bg-[#fffcf1]'}`}>
                <span>Bibliothèque</span>
                <BookOpen className={`w-5 h-5 ${pathname === '/stories' ? 'text-white' : 'text-[#7a6657] opacity-80'}`} />
              </button>
            </Link>
            
            <Link href="/profile" className="w-full">
              <button className={`w-full text-left rounded-2xl p-3 text-sm font-black flex items-center justify-between transition-all tracking-tight  bg-[#c47529] text-white shadow-md`}>
                <span>Profil</span>
                <Trophy className="w-5 h-5 text-white" />
              </button>
            </Link>
            
            <Link href="/settings" className="w-full">
              <button className={`w-full text-left bg-white text-[#7a6657] hover:bg-[#fffcf1] transition-colors rounded-2xl p-3 text-sm font-bold flex items-center justify-between tracking-tight`}>
                <span>Paramètres</span>
                <Settings className="w-5 h-5 text-[#7a6657] opacity-60" />
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

          {/* 3. MAIN CONTENT */}
          <main className="flex-1 w-full flex flex-col gap-6">
            
            {/* HERO CARD, XP & BADGES ROW */}
            <section className="w-full bg-white rounded-[36px] p-6 md:p-8 border border-[#f3eee0] shadow-sm flex flex-col gap-6">
              
              {/* Identity info */}
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-[#c47529] bg-[#e6e2d1] relative">
                  <img src={profile?.avatar_url || "/assets/avatar-default.png"} className="w-full h-full object-cover" alt="avatar" />
                </div>
                <div className="flex flex-col items-start gap-1">
                  <h2 className="text-xl font-black text-[#3b1b0d]">{profile?.kid_name}</h2>
                  <div className="bg-[#c47529] text-white text-xs font-black px-3 py-1 rounded-xl flex items-center gap-1.5 shadow-sm italic uppercase">
                    <span>Explorer Lv.{level}</span> 🏆
                  </div>
                </div>
              </div>

              {/* XP PROGRESS BAR */}
              <div className="w-full bg-[#c47529] rounded-2xl p-5 text-white flex flex-col gap-2 relative overflow-hidden shadow-sm">
                <div className="flex justify-between items-center font-black text-xs uppercase tracking-wider">
                  <span>Progression du niveau</span>
                  <span>{levelProgressXp} / 500 XP</span>
                </div>
                
                <div className="w-full bg-white/20 h-4 rounded-full overflow-hidden p-0.5">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${levelProgressPercentage}%` }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    className="bg-white h-full rounded-full shadow-inner"
                  />
                </div>
                
                <div className="flex justify-between items-center text-[10px] font-bold mt-1 text-white/90">
                  <span>
                    {nextBadge ? `Accumulez ${nextBadgeTargetXp.toLocaleString()} XP pour atteindre le prochain badge (${nextBadge.title})! 🎖️` : "🎉 Max Badges!"}
                  </span>
                  <span>✨ Total: <span className="font-black text-white">{totalXp.toLocaleString()} XP</span></span>
                </div>
              </div>

              {/* GRID BADGES BOX */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mt-2">
                {allBadges.map((badge) => {
                  const isUnlocked = totalXp >= badge.xp

                  return (
                    <div 
                      key={badge.id}
                      className={`flex flex-col items-center justify-center p-5 rounded-2xl border transition-all aspect-[4/5] relative ${
                        isUnlocked 
                          ? 'bg-white border-[#c47529] shadow-sm scale-100 opacity-100' 
                          : 'bg-[#fffcf1]/40 border-[#f3eee0] opacity-40 grayscale'
                      }`}
                    >
                      <div className="w-16 h-16 flex items-center justify-center mb-3 relative">
                        <img 
                          src={badge.img} 
                          alt={badge.title} 
                          className="max-w-full max-h-full object-contain"
                        />
                        {!isUnlocked && (
                          <div className="absolute inset-0 flex items-center justify-center bg-white/20 backdrop-blur-[1px] rounded-full">
                            <span className="text-xl">🔒</span>
                          </div>
                        )}
                      </div>
                      
                      <span className="text-xs font-black text-center text-[#3b1b0d] tracking-tight">
                        {badge.title}
                      </span>
                      <span className={`text-[10px] mt-1 font-bold ${isUnlocked ? 'text-[#c47529]' : 'text-[#7a6657]/70'}`}>
                        {badge.xp.toLocaleString()} XP
                      </span>
                    </div>
                  )
                })}
              </div>

            </section>

            {/* LEADERBOARD */}
            <section className="w-full bg-white rounded-[36px] p-6 md:p-8 border border-[#f3eee0] shadow-sm flex flex-col gap-6 text-left">
              <div className="flex items-center gap-2 text-base font-black text-[#3b1b0d]"><span>🏆</span><h3>Les champions des histoires</h3></div>
              <div className="w-full max-w-2xl mx-auto flex items-end justify-center gap-3 sm:gap-6 pt-10 pb-4">
                {top2 && (
                  <div className="flex flex-col items-center flex-1">
                    <div className="relative mb-3">
                      <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden border-2 shadow-sm bg-[#faf7f4] relative ${profile?.id === top2.id ? 'border-[#c47529]' : 'border-slate-300'}`}>
                        <img src={top2.avatar_url || "/assets/avatar-default.png"} className="w-full h-full object-cover" alt="Rank 2" />
                        {profile?.id === top2.id && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 bg-[#c47529] text-white text-[8px] px-1 rounded font-black">YOU</span>}
                      </div>
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-lg">🥈</span>
                    </div>
                    <span className="text-xs font-black text-[#3b1b0d] truncate max-w-[90px]">{top2.kid_name}</span>
                    <span className="text-[10px] text-[#7a6657] font-bold">Level {Math.floor(top2.total_xp / 500) + 1}</span>
                    <div className="w-full bg-[#f2f4f8] border border-slate-200/60 rounded-t-2xl h-24 flex items-center justify-center mt-3 shadow-inner"><span className="text-xl font-black text-slate-400">#2</span></div>
                  </div>
                )}
                {top1 && (
                  <div className="flex flex-col items-center flex-1 z-10">
                    <div className="relative mb-3">
                      <div className={`w-18 h-18 sm:w-20 sm:h-20 rounded-full overflow-hidden border-4 shadow-md bg-[#faf7f4] relative ${profile?.id === top1.id ? 'border-[#c47529]' : 'border-amber-400'}`}>
                        <img src={top1.avatar_url || "/assets/avatar-default.png"} className="w-full h-full object-cover" alt="Rank 1" />
                        {profile?.id === top1.id && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 bg-[#c47529] text-white text-[8px] px-1 rounded font-black">YOU</span>}
                      </div>
                      <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-2xl animate-pulse">👑</span>
                    </div>
                    <span className="text-xs font-black text-[#3b1b0d] truncate max-w-[100px]">{top1.kid_name}</span>
                    <span className="text-[10px] text-[#7a6657] font-bold">Level {Math.floor(top1.total_xp / 500) + 1}</span>
                    <div className="w-full bg-[#fff9e5] border border-amber-200/50 rounded-t-2xl h-32 flex items-center justify-center mt-3 shadow-sm"><span className="text-2xl font-black text-amber-500">#1</span></div>
                  </div>
                )}
                {top3 && (
                  <div className="flex flex-col items-center flex-1">
                    <div className="relative mb-3">
                      <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden border-2 shadow-sm bg-[#faf7f4] relative ${profile?.id === top3.id ? 'border-[#c47529]' : 'border-orange-300'}`}>
                        <img src={top3.avatar_url || "/assets/avatar-default.png"} className="w-full h-full object-cover" alt="Rank 3" />
                        {profile?.id === top3.id && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 bg-[#c47529] text-white text-[8px] px-1 rounded font-black">YOU</span>}
                      </div>
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-lg">🥉</span>
                    </div>
                    <span className="text-xs font-black text-[#3b1b0d] truncate max-w-[90px]">{top3.kid_name}</span>
                    <span className="text-[10px] text-[#7a6657] font-bold">Level {Math.floor(top3.total_xp / 500) + 1}</span>
                    <div className="w-full bg-[#fff5eb] border border-orange-200/40 rounded-t-2xl h-20 flex items-center justify-center mt-3 shadow-inner"><span className="text-xl font-black text-orange-400">#3</span></div>
                  </div>
                )}
              </div>

              {/* LIST */}
              <div className="w-full flex flex-col gap-2.5 mt-4">
                {restOfKids.map((kid, index) => {
                  const rankNumber = index + 4
                  const kidLevel = Math.floor(kid.total_xp / 500) + 1
                  const isMe = profile?.id === kid.id
                  return (
                    <div key={kid.id} className={`w-full transition-all rounded-2xl p-3.5 flex items-center justify-between border ${isMe ? 'bg-[#fff3e5]/70 border-[#c47529]' : 'bg-[#fffcf1]/60 border-[#f3eee0]'}`}>
                      <div className="flex items-center gap-4">
                        <span className={`w-6 h-6 rounded-full text-xs font-black flex items-center justify-center ${isMe ? 'bg-[#c47529] text-white' : 'bg-[#fff3e5] text-[#c47529]'}`}>{rankNumber}</span>
                        <div className="w-10 h-10 rounded-full overflow-hidden border border-[#e6e2d1]"><img src={kid.avatar_url || "/assets/avatar-default.png"} className="w-full h-full object-cover" alt={kid.kid_name} /></div>
                        <div className="text-left">
                          <p className="text-xs font-black text-[#3b1b0d]">
                            {kid.kid_name} {isMe && <span className="ml-1 text-[9px] bg-[#c47529] text-white px-1 rounded font-black">YOU</span>}
                          </p>
                          <p className="text-[10px] text-[#7a6657] font-medium">Lvl {kidLevel} • {kid.city || 'Tangier'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-8 text-right">
                        <div className="flex flex-col items-end"><span className="text-xs font-black text-[#3b1b0d]">4</span><span className="text-[9px] text-[#7a6657] font-bold uppercase tracking-tight">Stories</span></div>
                        <div className="flex flex-col items-end min-w-[45px]"><span className="text-xs font-black text-[#c47529]">{kid.total_xp}</span><span className="text-[9px] text-[#c47529] font-bold uppercase tracking-tight">XP</span></div>
                      </div>
                    </div>
                  )
                })}
              </div>
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
//   id?: string;
//   kid_name?: string;
//   child_username?: string;
//   avatar_url?: string;
//   total_xp: number;
//   city?: string;
// }

// export default function ProfilePage() {
//   const [profile, setProfile] = useState<UserProfile | null>(null)
//   const [leaderboard, setLeaderboard] = useState<UserProfile[]>([])
//   const [loading, setLoading] = useState(true)
//   const pathname = usePathname()

//   // 🏆 مصفوفة الأوسمة مربوطة بالـ Paths المباشرة
//   const allBadges = [
//     { id: 'little-listener', title: 'Little Listener', xp: 1000, img: '/assets/little-listener.svg' },
//     { id: 'story-explorer', title: 'Story Explorer', xp: 2500, img: '/assets/story-explorer.svg' },
//     { id: 'tale-adventurer', title: 'Tale Adventurer', xp: 5000, img: '/assets/tale-adventurer.svg' },
//     { id: 'story-hero', title: 'Story Hero', xp: 7500, img: '/assets/story-hero.svg' },
//     { id: 'story-master', title: 'Story Master', xp: 10000, img: '/assets/story-master.svg' },
//   ]

//   useEffect(() => {
//     async function getProfileAndLeaderboard() {
//       try {
//         const { data: { session } } = await supabase.auth.getSession()
//         let currentUserId = ''
        
//         if (session?.user) {
//           currentUserId = session.user.id
//           const { data: userData } = await supabase
//             .from('profiles')
//             .select('*')
//             .eq('id', currentUserId)
//             .single()
          
//           if (userData) {
//             setProfile(userData)
//           } else {
//             setProfile({ id: currentUserId, kid_name: 'Samia', child_username: 'samia_hero', total_xp: 3050, city: 'Tangier' })
//           }
//         } else {
//           // Fallback للمعاينة المحلية (3050 XP)
//           setProfile({ id: 'mock-id-1', kid_name: 'Samia', child_username: 'samia_hero', total_xp: 3050, city: 'Tangier' })
//           currentUserId = 'mock-id-1'
//         }

//         const { data: leaders } = await supabase
//           .from('profiles')
//           .select('id, kid_name, child_username, avatar_url, total_xp, city')
//           .order('total_xp', { ascending: false })

//         if (leaders && leaders.length > 0) {
//           setLeaderboard(leaders)
//         } else {
//           setLeaderboard([
//             { id: 'mock-id-2', kid_name: 'Imane', child_username: 'imane_dx', total_xp: 4200, city: 'Oujda' },
//             { id: currentUserId, kid_name: 'Samia', child_username: 'samia_hero', total_xp: 3050, city: 'Tangier' },
//             { id: 'mock-id-3', kid_name: 'Amine', child_username: 'amine_hero', total_xp: 2650, city: 'Rabat' },
//             { id: 'mock-id-4', kid_name: 'Omar Benbrahim', child_username: 'omar_b', total_xp: 445, city: 'Rabat' },
//           ].sort((a, b) => b.total_xp - a.total_xp))
//         }
        
//       } catch (error) {
//         console.error("Error loading profile or leaderboard:", error)
//       } finally {
//         setLoading(false)
//       }
//     }
//     getProfileAndLeaderboard()
//   }, [])

//   // 📊 حسبة الـ Level والـ Progress (كل 500 XP كيعمر الـ Bar الكبيرة ويتصفر للحماس)
//   const totalXp = profile?.total_xp || 0
//   const level = Math.floor(totalXp / 500) + 1
//   const levelProgressXp = totalXp % 500 // الباقي من الـ 500 الحالية
//   const levelProgressPercentage = (levelProgressXp / 500) * 100

//   // 🔍 تحديد الـ Badge القادم والـ Target الكامل ديالو
//   const nextBadge = allBadges.find(badge => totalXp < badge.xp)
//   const nextBadgeTargetXp = nextBadge ? nextBadge.xp : 10000

//   const top1 = leaderboard[0]
//   const top2 = leaderboard[1]
//   const top3 = leaderboard[2]
//   const restOfKids = leaderboard.slice(3)

//   if (loading) return (
//     <div className="h-screen bg-[#fffcf1] flex items-center justify-center font-black text-[#c47529] italic text-xl">
//       Loading Hero Records... ✨
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
//               <button className={`w-full text-left rounded-2xl p-3 text-sm font-bold flex items-center justify-between transition-all ${pathname === '/stories' ? 'bg-[#c47529] text-white shadow-md font-black' : 'text-[#7a6657] hover:bg-[#fffcf1]'}`}>
//                 <span>Library</span><span className="opacity-60">📚</span>
//               </button>
//             </Link>
//             <Link href="/profile" className="w-full">
//               <button className={`w-full text-left rounded-2xl p-3 text-sm font-black flex items-center justify-between bg-[#c47529] text-white shadow-md italic uppercase tracking-tight`}>
//                 <span>Profile</span><span className="opacity-80">👤</span>
//               </button>
//             </Link>
//             <Link href="/settings" className="w-full">
//               <button className={`w-full text-left bg-white text-[#7a6657] hover:bg-[#fffcf1] transition-colors rounded-2xl p-3 text-sm font-bold flex items-center justify-between`}>
//                 <span>Settings</span><span className="opacity-60">⚙️</span>
//               </button>
//             </Link>
//             <div className="h-px bg-[#f3eee0] my-2 lg:mt-48" />
//             <button onClick={() => supabase.auth.signOut().then(() => window.location.href='/auth')} className="w-full text-left bg-white text-[#7a6657] hover:bg-red-50 hover:text-red-600 transition-all rounded-2xl p-3 text-sm font-bold flex items-center justify-between"><span>Log out</span><span>🚪</span></button>
//           </aside>

//           {/* 3. MAIN CONTENT */}
//           <main className="flex-1 w-full flex flex-col gap-6">
            
//             {/* HERO CARD, XP & BADGES ROW */}
//             <section className="w-full bg-white rounded-[36px] p-6 md:p-8 border border-[#f3eee0] shadow-sm flex flex-col gap-6">
              
//               {/* Identity info */}
//               <div className="flex items-center gap-4">
//                 <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-[#c47529] bg-[#e6e2d1] relative">
//                   <img src={profile?.avatar_url || "/assets/avatar-default.png"} className="w-full h-full object-cover" alt="avatar" />
//                 </div>
//                 <div className="flex flex-col items-start gap-1">
//                   <h2 className="text-xl font-black text-[#3b1b0d]">{profile?.kid_name}</h2>
//                   <div className="bg-[#c47529] text-white text-xs font-black px-3 py-1 rounded-xl flex items-center gap-1.5 shadow-sm italic uppercase">
//                     <span>Explorer Lv.{level}</span> 🏆
//                   </div>
//                 </div>
//               </div>

//               {/* XP PROGRESS BAR */}
//               <div className="w-full bg-[#c47529] rounded-2xl p-5 text-white flex flex-col gap-2 relative overflow-hidden shadow-sm">
//                 <div className="flex justify-between items-center font-black text-xs uppercase tracking-wider">
//                   <span>Level Progress</span>
//                   <span>{levelProgressXp} / 500 XP</span>
//                 </div>
                
//                 <div className="w-full bg-white/20 h-4 rounded-full overflow-hidden p-0.5">
//                   <motion.div 
//                     initial={{ width: 0 }}
//                     animate={{ width: `${levelProgressPercentage}%` }}
//                     transition={{ duration: 1.2, ease: "easeOut" }}
//                     className="bg-white h-full rounded-full shadow-inner"
//                   />
//                 </div>
                
//                 {/* 🎯 تَمَّ تَقْلِيبْ الأَمَاكِنْ هُنَا: الـ Badge على اليسار والـ Total على اليمين */}
//                 <div className="flex justify-between items-center text-[10px] font-bold mt-1 text-white/90">
//                   <span>
//                     {nextBadge ? `Reach ${nextBadgeTargetXp.toLocaleString()} XP for next badge (${nextBadge.title})! 🎖️` : "🎉 Max Badges!"}
//                   </span>
//                   <span>✨ Total: <span className="font-black text-white">{totalXp.toLocaleString()} XP</span></span>
//                 </div>
//               </div>

//               {/* GRID BADGES BOX */}
//               <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mt-2">
//                 {allBadges.map((badge) => {
//                   const isUnlocked = totalXp >= badge.xp

//                   return (
//                     <div 
//                       key={badge.id}
//                       className={`flex flex-col items-center justify-center p-5 rounded-2xl border transition-all aspect-[4/5] relative ${
//                         isUnlocked 
//                           ? 'bg-white border-[#c47529] shadow-sm scale-100 opacity-100' 
//                           : 'bg-[#fffcf1]/40 border-[#f3eee0] opacity-40 grayscale'
//                       }`}
//                     >
//                       <div className="w-16 h-16 flex items-center justify-center mb-3 relative">
//                         <img 
//                           src={badge.img} 
//                           alt={badge.title} 
//                           className="max-w-full max-h-full object-contain"
//                         />
//                         {!isUnlocked && (
//                           <div className="absolute inset-0 flex items-center justify-center bg-white/20 backdrop-blur-[1px] rounded-full">
//                             <span className="text-xl">🔒</span>
//                           </div>
//                         )}
//                       </div>
                      
//                       <span className="text-xs font-black text-center text-[#3b1b0d] tracking-tight">
//                         {badge.title}
//                       </span>
//                       <span className={`text-[10px] mt-1 font-bold ${isUnlocked ? 'text-[#c47529]' : 'text-[#7a6657]/70'}`}>
//                         {badge.xp.toLocaleString()} XP
//                       </span>
//                     </div>
//                   )
//                 })}
//               </div>

//             </section>

//             {/* LEADERBOARD */}
//             <section className="w-full bg-white rounded-[36px] p-6 md:p-8 border border-[#f3eee0] shadow-sm flex flex-col gap-6 text-left">
//               <div className="flex items-center gap-2 text-base font-black text-[#3b1b0d]"><span>🏆</span><h3>Story champions</h3></div>
//               <div className="w-full max-w-2xl mx-auto flex items-end justify-center gap-3 sm:gap-6 pt-10 pb-4">
//                 {top2 && (
//                   <div className="flex flex-col items-center flex-1">
//                     <div className="relative mb-3">
//                       <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden border-2 shadow-sm bg-[#faf7f4] relative ${profile?.id === top2.id ? 'border-[#c47529]' : 'border-slate-300'}`}>
//                         <img src={top2.avatar_url || "/assets/avatar-default.png"} className="w-full h-full object-cover" alt="Rank 2" />
//                         {profile?.id === top2.id && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 bg-[#c47529] text-white text-[8px] px-1 rounded font-black">YOU</span>}
//                       </div>
//                       <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-lg">🥈</span>
//                     </div>
//                     <span className="text-xs font-black text-[#3b1b0d] truncate max-w-[90px]">{top2.kid_name}</span>
//                     <span className="text-[10px] text-[#7a6657] font-bold">Level {Math.floor(top2.total_xp / 500) + 1}</span>
//                     <div className="w-full bg-[#f2f4f8] border border-slate-200/60 rounded-t-2xl h-24 flex items-center justify-center mt-3 shadow-inner"><span className="text-xl font-black text-slate-400">#2</span></div>
//                   </div>
//                 )}
//                 {top1 && (
//                   <div className="flex flex-col items-center flex-1 z-10">
//                     <div className="relative mb-3">
//                       <div className={`w-18 h-18 sm:w-20 sm:h-20 rounded-full overflow-hidden border-4 shadow-md bg-[#faf7f4] relative ${profile?.id === top1.id ? 'border-[#c47529]' : 'border-amber-400'}`}>
//                         <img src={top1.avatar_url || "/assets/avatar-default.png"} className="w-full h-full object-cover" alt="Rank 1" />
//                         {profile?.id === top1.id && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 bg-[#c47529] text-white text-[8px] px-1 rounded font-black">YOU</span>}
//                       </div>
//                       <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-2xl animate-pulse">👑</span>
//                     </div>
//                     <span className="text-xs font-black text-[#3b1b0d] truncate max-w-[100px]">{top1.kid_name}</span>
//                     <span className="text-[10px] text-[#7a6657] font-bold">Level {Math.floor(top1.total_xp / 500) + 1}</span>
//                     <div className="w-full bg-[#fff9e5] border border-amber-200/50 rounded-t-2xl h-32 flex items-center justify-center mt-3 shadow-sm"><span className="text-2xl font-black text-amber-500">#1</span></div>
//                   </div>
//                 )}
//                 {top3 && (
//                   <div className="flex flex-col items-center flex-1">
//                     <div className="relative mb-3">
//                       <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden border-2 shadow-sm bg-[#faf7f4] relative ${profile?.id === top3.id ? 'border-[#c47529]' : 'border-orange-300'}`}>
//                         <img src={top3.avatar_url || "/assets/avatar-default.png"} className="w-full h-full object-cover" alt="Rank 3" />
//                         {profile?.id === top3.id && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 bg-[#c47529] text-white text-[8px] px-1 rounded font-black">YOU</span>}
//                       </div>
//                       <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-lg">🥉</span>
//                     </div>
//                     <span className="text-xs font-black text-[#3b1b0d] truncate max-w-[90px]">{top3.kid_name}</span>
//                     <span className="text-[10px] text-[#7a6657] font-bold">Level {Math.floor(top3.total_xp / 500) + 1}</span>
//                     <div className="w-full bg-[#fff5eb] border border-orange-200/40 rounded-t-2xl h-20 flex items-center justify-center mt-3 shadow-inner"><span className="text-xl font-black text-orange-400">#3</span></div>
//                   </div>
//                 )}
//               </div>

//               {/* LIST */}
//               <div className="w-full flex flex-col gap-2.5 mt-4">
//                 {restOfKids.map((kid, index) => {
//                   const rankNumber = index + 4
//                   const kidLevel = Math.floor(kid.total_xp / 500) + 1
//                   const isMe = profile?.id === kid.id
//                   return (
//                     <div key={kid.id} className={`w-full transition-all rounded-2xl p-3.5 flex items-center justify-between border ${isMe ? 'bg-[#fff3e5]/70 border-[#c47529]' : 'bg-[#fffcf1]/60 border-[#f3eee0]'}`}>
//                       <div className="flex items-center gap-4">
//                         <span className={`w-6 h-6 rounded-full text-xs font-black flex items-center justify-center ${isMe ? 'bg-[#c47529] text-white' : 'bg-[#fff3e5] text-[#c47529]'}`}>{rankNumber}</span>
//                         <div className="w-10 h-10 rounded-full overflow-hidden border border-[#e6e2d1]"><img src={kid.avatar_url || "/assets/avatar-default.png"} className="w-full h-full object-cover" alt={kid.kid_name} /></div>
//                         <div className="text-left">
//                           <p className="text-xs font-black text-[#3b1b0d]">
//                             {kid.kid_name} {isMe && <span className="ml-1 text-[9px] bg-[#c47529] text-white px-1 rounded font-black">YOU</span>}
//                           </p>
//                           <p className="text-[10px] text-[#7a6657] font-medium">Lvl {kidLevel} • {kid.city || 'Tangier'}</p>
//                         </div>
//                       </div>
//                       <div className="flex items-center gap-8 text-right">
//                         <div className="flex flex-col items-end"><span className="text-xs font-black text-[#3b1b0d]">4</span><span className="text-[9px] text-[#7a6657] font-bold uppercase tracking-tight">Stories</span></div>
//                         <div className="flex flex-col items-end min-w-[45px]"><span className="text-xs font-black text-[#c47529]">{kid.total_xp}</span><span className="text-[9px] text-[#c47529] font-bold uppercase tracking-tight">XP</span></div>
//                       </div>
//                     </div>
//                   )
//                 })}
//               </div>
//             </section>
//           </main>
//         </div>

//       </div>
//     </div>
//   )
// }