'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
// 🌟 جلبنا سوبابيس باش نسيفطو الـ update د التقفال ديريكت
import { supabase } from '@/lib/supabase'

const TOUR_STEPS = [
  {
    targetId: 'library-stories',
    title: "Moi, c'est Nanna Zahra",
    text: "Bienvenue petit lecteur ! C'est ici que commence la magie. Choisis ta première histoire et plonge avec moi dans l'aventure !",
    mascotSrc: '/assets/nanna-zahra-1.png',
    position: 'center',
    hasArrow: false,
    arrowStyle: {}
  },
  {
    targetId: 'sidebar-profile',
    title: "Voici ton espace secret !",
    text: "Ici, tu peux voir ton niveau, tes points d'expérience (XP) et les superbes badges que tu as gagnés !",
    mascotSrc: '/assets/nanna-zahra-2.png',
    position: 'right-side',
    hasArrow: true,
    // ✨ حافظنا على الأبعاد والـ بوزيشن لّي عدلتي بيدك
    arrowStyle: { top: '60px', left: '-110px', width: '130px', height: '95px' }
  },
  {
    targetId: 'sidebar-settings',
    title: "Et là, c'est le coin des parents !",
    text: "Ils peuvent régler le son ou le temps de lecture pour te protéger",
    mascotSrc: '/assets/nanna-zahra-3.png',
    position: 'right-side',
    hasArrow: true,
    // ✨ حافظنا على الأبعاد والـ بوزيشن لّي عدلتي بيدك
    arrowStyle: { top: '60px', left: '-110px', width: '130px', height: '95px' }
  },
  {
    targetId: 'topbar-xp',
    title: "Bienvenue petit lecteur !",
    text: "N'oublie pas que plus tu lis et réponds aux quiz, plus tu gagneras de points d'XP pour monter les niveaux et devenir le roi des contes enchantés !",
    mascotSrc: '/assets/nanna-zahra-4.png',
    position: 'center',
    hasArrow: false,
    arrowStyle: {}
  }
]

// 🌟 رجعنا الـ profileId كشرط أساسي مأمن للـتسليم نهار الـ Deadline
export default function OnboardingTour({ profileId }: { profileId: string }) {
  const [currentStep, setCurrentStep] = useState(0)
  const [coords, setCoords] = useState({ top: 0, left: 0 }) // حيدنا الـ الافتراضي د التيست
  const [isVisible, setIsVisible] = useState(true) // التحكم فـ إخفاء المودال

  useEffect(() => {
    const updatePosition = () => {
      const step = TOUR_STEPS[currentStep]
      const element = document.getElementById(step.targetId)
      
      if (step.position === 'center') {
        setCoords({
          top: (window.innerHeight / 2) - 140,
          left: (window.innerWidth / 2) - 270
        })
      } else if (step.position === 'right-side') {
        if (element) {
          const rect = element.getBoundingClientRect()
          setCoords({
            top: rect.top + (rect.height / 2) - 100,
            left: rect.right + 90
          })
        }
      }
    }

    const timer = setTimeout(updatePosition, 60)
    window.addEventListener('resize', updatePosition)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('resize', updatePosition)
    }
  }, [currentStep])

  // 🔐 قفلنا الـ لّوجيك د الـ Next باش يسيفط الحالة د المشاهدة لسوبابيس ف الخطوة الأخيرة
  const handleNext = async () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1)
    } else {
      setIsVisible(false) // خبي الـ Tour ف البلاصة ف الـ UI
      
      // 💾 تّحديث صارم ف الداتابيز: هاد البطل شاف الـ Tour ومابقاش غاتعاود تطلع ليه
      await supabase
        .from('profiles')
        .update({ has_seen_onboarding: true })
        .eq('id', profileId)
    }
  }

  // 🛑 إيلا تسالاو الخطوات أو الـ Tour تخبات كيرجع null ديريكت
  if (!isVisible) return null

  const stepInfo = TOUR_STEPS[currentStep]

  return (
    <AnimatePresence>
      {/* الـ Backdrop */}
      <div className="fixed inset-0 bg-black/25 z-[9998]" />

      {/* الـ Tooltip Card الكبيرة بـأبعاد 540px */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ type: "spring", stiffness: 350, damping: 28 }}
        style={{ 
          position: 'fixed', 
          top: coords.top, 
          left: coords.left 
        }}
        className="w-[540px] h-[250px] bg-[#fff9e6] rounded-[48px] p-8 shadow-2xl z-[9999] flex flex-col justify-between text-left font-sans border-2 border-white/60 relative"
      >
        {/* الأسهم بـالـ الأبعاد والنقاء لّي ضبطتي */}
        {stepInfo.hasArrow && (
          <div className="absolute pointer-events-none z-[10000]" style={stepInfo.arrowStyle}>
            <img src="/assets/arrow.svg" alt="Arrow" className="w-full h-full object-contain" />
          </div>
        )}

        {/* النص الدخلاني */}
        <div className="w-[60%] flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 bg-[#c47529] text-white font-black text-sm rounded-full flex items-center justify-center shadow-sm">
              {currentStep + 1}
            </span>
            <h3 className="text-xl font-black text-[#3b1b0d] tracking-tight">
              {stepInfo.title}
            </h3>
          </div>
          <p className="text-xs text-[#7a6657] font-bold leading-relaxed pr-2">
            {stepInfo.text}
          </p>
        </div>

        {/* أزرار الـ Navigation */}
        <div className="flex items-center gap-3 w-[55%]">
          <button
            onClick={() => setCurrentStep(0)}
            className="bg-white hover:bg-gray-50 text-[#7a6657] border border-[#e6e2d1] font-black text-xs px-6 py-3 rounded-full transition-all active:scale-95 shadow-sm"
          >
            Réinitialiser
          </button>
          <button
            onClick={handleNext}
            className="bg-[#c47529] hover:bg-[#b06520] text-white font-black text-xs px-8 py-3 rounded-full transition-all active:scale-95 shadow-md flex-1 text-center"
          >
            {currentStep === TOUR_STEPS.length - 1 ? "Finir ✨" : "Suivant"}
          </button>
        </div>

        {/* 🦊 نانا زهرة وتأثير الـ 3D والـ الـ بوزيشن التحتاني لّي قاديتي بيدك */}
        <div className="absolute bottom-[-10px] right-[-10px] w-[230px] h-[310px] pointer-events-none z-[10000]">
          <img src={stepInfo.mascotSrc} alt="Mascot" className="w-full h-full object-contain drop-shadow-[0_15px_15px_rgba(0,0,0,0.2)]" />
        </div>
      </motion.div>
    </AnimatePresence>
  )
}





















// 'use client'
// import { useState, useEffect } from 'react'
// import { motion, AnimatePresence } from 'framer-motion'

// const TOUR_STEPS = [
//   {
//     targetId: 'library-stories',
//     title: "Moi, c'est Nanna Zahra",
//     text: "Bienvenue petit lecteur ! C'est ici que commence la magie. Choisis ta première histoire et plonge avec moi dans l'aventure !",
//     mascotSrc: '/assets/nanna-zahra-1.png',
//     position: 'center',
//     hasArrow: false,
//     arrowStyle: {}
//   },
//   {
//     targetId: 'sidebar-profile',
//     title: "Voici ton espace secret !",
//     text: "Ici, tu peux voir ton niveau, tes points d'expérience (XP) et les superbes badges que tu as gagnés !",
//     mascotSrc: '/assets/nanna-zahra-2.png',
//     position: 'right-side',
//     hasArrow: true,
//     arrowStyle: { top: '60px', left: '-110px', width: '130px', height: '95px' }
//   },
//   {
//     targetId: 'sidebar-settings',
//     title: "Et là, c'est le coin des parents !",
//     text: "Ils peuvent régler le son ou le temps de lecture pour te protéger",
//     mascotSrc: '/assets/nanna-zahra-3.png',
//     position: 'right-side',
//     hasArrow: true,
//     arrowStyle: { top: '60px', left: '-110px', width: '130px', height: '95px' }
//   },
//   {
//     targetId: 'topbar-xp',
//     title: "Bienvenue petit lecteur !",
//     text: "N'oublie pas que plus tu lis et réponds aux quiz, plus tu gagneras de points d'XP pour monter les niveaux et devenir le roi des contes enchantés !",
//     mascotSrc: '/assets/nanna-zahra-4.png',
//     position: 'center',
//     hasArrow: false,
//     arrowStyle: {}
//   }
// ]

// export default function OnboardingTour() { // 🌟 حيدنا الـ profileId مؤقتاً باش ما يحبسش الـ Component
//   const [currentStep, setCurrentStep] = useState(0)
//   const [coords, setCoords] = useState({ top: 150, left: 300 }) // 🌟 عطينا موقع افتراضي باش تبان بزز

//   useEffect(() => {
//     const updatePosition = () => {
//       const step = TOUR_STEPS[currentStep]
//       const element = document.getElementById(step.targetId)
      
//       if (step.position === 'center') {
//         setCoords({
//           top: (window.innerHeight / 2) - 140,
//           left: (window.innerWidth / 2) - 270
//         })
//       } else if (step.position === 'right-side') {
//         if (element) {
//           const rect = element.getBoundingClientRect()
//           setCoords({
//             top: rect.top + (rect.height / 2) - 100,
//             left: rect.right + 90
//           })
//         } else {
//           // 💡 إيلا مالقاش زر السايدبار ف الكود، كيجيبها ف النص باش ما تختفيش
//           setCoords({
//             top: (window.innerHeight / 2) - 140,
//             left: (window.innerWidth / 2) - 270
//           })
//         }
//       }
//     }

//     const timer = setTimeout(updatePosition, 60)
//     window.addEventListener('resize', updatePosition)
//     return () => {
//       clearTimeout(timer)
//       window.removeEventListener('resize', updatePosition)
//     }
//   }, [currentStep])

//   const handleNext = () => {
//     if (currentStep < TOUR_STEPS.length - 1) {
//       setCurrentStep(prev => prev + 1)
//     } else {
//       setCurrentStep(0) // Loop التست
//     }
//   }

//   const stepInfo = TOUR_STEPS[currentStep]

//   return (
//     <AnimatePresence>
//       <div className="fixed inset-0 bg-black/25 z-[9998]" />

//       <motion.div
//         initial={{ opacity: 0, scale: 0.96 }}
//         animate={{ opacity: 1, scale: 1 }}
//         exit={{ opacity: 0, scale: 0.96 }}
//         transition={{ type: "spring", stiffness: 350, damping: 28 }}
//         style={{ 
//           position: 'fixed', 
//           top: coords.top, 
//           left: coords.left 
//         }}
//         className="w-[540px] h-[250px] bg-[#fff9e6] rounded-[48px] p-8 shadow-2xl z-[9999] flex flex-col justify-between text-left font-sans border-2 border-white/60 relative"
//       >
//         {stepInfo.hasArrow && (
//           <div className="absolute pointer-events-none z-[10000]" style={stepInfo.arrowStyle}>
//             <img src="/assets/arrow.svg" alt="Arrow" className="w-full h-full object-contain" />
//           </div>
//         )}

//         <div className="w-[60%] flex flex-col gap-3">
//           <div className="flex items-center gap-3">
//             <span className="w-8 h-8 bg-[#c47529] text-white font-black text-sm rounded-full flex items-center justify-center shadow-sm">
//               {currentStep + 1}
//             </span>
//             <h3 className="text-xl font-black text-[#3b1b0d] tracking-tight">
//               {stepInfo.title}
//             </h3>
//           </div>
//           <p className="text-xs text-[#7a6657] font-bold leading-relaxed pr-2">
//             {stepInfo.text}
//           </p>
//         </div>

//         <div className="flex items-center gap-3 w-[55%]">
//           <button
//             onClick={() => setCurrentStep(0)}
//             className="bg-white hover:bg-gray-50 text-[#7a6657] border border-[#e6e2d1] font-black text-xs px-6 py-3 rounded-full transition-all active:scale-95 shadow-sm"
//           >
//             Reset
//           </button>
//           <button
//             onClick={handleNext}
//             className="bg-[#c47529] hover:bg-[#b06520] text-white font-black text-xs px-8 py-3 rounded-full transition-all active:scale-95 shadow-md flex-1 text-center"
//           >
//             {currentStep === TOUR_STEPS.length - 1 ? "Loop Tour 🔄" : "Next"}
//           </button>
//         </div>

//         <div className="absolute bottom-[-10px] right-[-10px] w-[230px] h-[310px] pointer-events-none z-[10000]">
//           <img src={stepInfo.mascotSrc} alt="Mascot" className="w-full h-full object-contain drop-shadow-[0_15px_15px_rgba(0,0,0,0.2)]" />
//         </div>
//       </motion.div>
//     </AnimatePresence>
//   )
// }


















// 'use client'
// import { useState, useEffect } from 'react'
// import { motion, AnimatePresence } from 'framer-motion'
// import { supabase } from '@/lib/supabase'

// const TOUR_STEPS = [
//   {
//     targetId: 'library-stories',
//     title: "Moi, c'est Nanna Zahra",
//     text: "Bienvenue petit lecteur ! C'est ici que commence la magie. Choisis ta première histoire et plonge avec moi dans l'aventure !",
//     mascotSrc: '/assets/nanna-zahra-1.png',
//     position: 'center',
//     hasArrow: false,
//     arrowStyle: {} // لا يوجد سهم ف الخطوة الأولى
//   },
//   {
//     targetId: 'sidebar-profile',
//     title: "Voici ton espace secret !",
//     text: "Ici, tu peux voir ton niveau, tes points d'expérience (XP) et les superbes badges que tu as gagnés !",
//     mascotSrc: '/assets/nanna-zahra-2.png',
//     position: 'right-side',
//     hasArrow: true,
//     // 📐 مـوازَنـة الـسّـهـم بـالـ بـيـكـسـل جـيـهـة الـ Profile
//     arrowStyle: { top: '35px', left: '-50px', width: '45px', height: '45px' }
//   },
//   {
//     targetId: 'sidebar-settings',
//     title: "Et là, c'est le coin des parents !",
//     text: "Ils peuvent régler le son ou le temps de lecture pour te protéger",
//     mascotSrc: '/assets/nanna-zahra-3.png',
//     position: 'right-side',
//     hasArrow: true,
//     // 📐 مـوازَنـة الـسّـهـم بـالـ بـيـكـسـل جـيـهـة الـ Settings (ملتوي لأسفل)
//     arrowStyle: { top: '35px', left: '-50px', width: '45px', height: '45px' }
//   },
//   {
//     targetId: 'topbar-xp',
//     title: "Bienvenue petit lecteur !",
//     text: "N'oublie pas que plus tu lis et réponds aux quiz, plus tu gagneras de points d'XP pour monter les niveaux et devenir le roi des contes enchantés !",
//     mascotSrc: '/assets/nanna-zahra-4.png',
//     position: 'center',
//     hasArrow: false,
//     arrowStyle: {}
//   }
// ]

// export default function OnboardingTour({ profileId }: { profileId: string }) {
//   const [currentStep, setCurrentStep] = useState(0)
//   const [coords, setCoords] = useState({ top: 0, left: 0 })
//   const [isVisible, setIsVisible] = useState(true)

//   useEffect(() => {
//     const updatePosition = () => {
//       const step = TOUR_STEPS[currentStep]
//       const element = document.getElementById(step.targetId)
      
//       if (step.position === 'center') {
//         setCoords({
//           top: (window.innerHeight / 2) - 120,
//           left: (window.innerWidth / 2) - 240
//         })
//       } else if (step.position === 'right-side' && element) {
//         const rect = element.getBoundingClientRect()
//         setCoords({
//           top: rect.top + (rect.height / 2) - 80,
//           left: rect.right + 50 // اتساع مـثـالـي لـلـ سّـهـم الـمـلـتـوي
//         })
//       }
//     }

//     const timer = setTimeout(updatePosition, 50)
//     window.addEventListener('resize', updatePosition)
//     return () => {
//       clearTimeout(timer)
//       window.removeEventListener('resize', updatePosition)
//     }
//   }, [currentStep])

//   const handleNext = async () => {
//     if (currentStep < TOUR_STEPS.length - 1) {
//       setCurrentStep(prev => prev + 1)
//     } else {
//       setIsVisible(false)
//       await supabase
//         .from('profiles')
//         .update({ has_seen_onboarding: true })
//         .eq('id', profileId)
//     }
//   }

//   if (!isVisible) return null

//   const stepInfo = TOUR_STEPS[currentStep]

//   return (
//     <AnimatePresence>
//       {/* 🌟 1. الـ Backdrop الـمـظـلـم الـنَّـقـي (مـافـيـهـاش Blur ومـوزونـة بـالـ Contrast د الـ سّـواد الـخـفـيـف) */}
//       <div className="fixed inset-0 bg-black/25 z-[9998]" />

//       {/* 2. الـ Tooltip Card */}
//       <motion.div
//         initial={{ opacity: 0, scale: 0.96 }}
//         animate={{ opacity: 1, scale: 1 }}
//         exit={{ opacity: 0, scale: 0.96 }}
//         transition={{ type: "spring", stiffness: 350, damping: 28 }}
//         style={{ 
//           position: 'fixed', 
//           top: coords.top, 
//           left: coords.left 
//         }}
//         className="w-[480px] bg-[#fff9e6] rounded-[40px] p-8 shadow-2xl z-[9999] flex flex-col gap-4 text-left font-sans border-2 border-white/60 relative select-none"
//       >
        
//         {/* 🌟 3. اسـتـدعـاء الـ سّـهـم ديـالـك كـ صـورة شـفّـافـة مـن الـ Assets لـبـرّة */}
//         {stepInfo.hasArrow && (
//           <div 
//             className="absolute pointer-events-none"
//             style={stepInfo.arrowStyle}
//           >
//             <img 
//               src="/assets/arrow.svg" // 🌟 حـط الـ سّـهـم الـمـلـتـوي ديـالـك هـنـا بـ هاد الـإِسـم د الـحـرف
//               alt="Arrow Pointer" 
//               className="w-full h-full object-contain"
//             />
//           </div>
//         )}

//         {/* الـ Content ديـال الـ نّـص */}
//         <div className="w-[65%] flex flex-col gap-2">
//           <div className="flex items-center gap-3">
//             <span className="w-7 h-7 bg-[#c47529] text-white font-black text-sm rounded-full flex items-center justify-center">
//               {currentStep + 1}
//             </span>
//             <h3 className="text-lg font-black text-[#3b1b0d] tracking-tight">
//               {stepInfo.title}
//             </h3>
//           </div>
          
//           <p className="text-xs text-[#7a6657] font-bold leading-relaxed pr-2">
//             {stepInfo.text}
//           </p>
//         </div>

//         {/* الـ الـ Buttons ديـال الـ تّـوجـيـه */}
//         <div className="flex items-center gap-3 mt-4 w-[65%]">
//           <button
//             onClick={() => setIsVisible(false)}
//             className="bg-white hover:bg-gray-50 text-[#7a6657] border border-[#e6e2d1] font-black text-xs px-5 py-2.5 rounded-full transition-all active:scale-95 shadow-sm"
//           >
//             Skip
//           </button>
//           <button
//             onClick={handleNext}
//             className="bg-[#c47529] hover:bg-[#b06520] text-white font-black text-xs px-7 py-2.5 rounded-full transition-all active:scale-95 shadow-md flex-1 text-center"
//           >
//             {currentStep === TOUR_STEPS.length - 1 ? "C'est parti ! 🚀" : "Next"}
//           </button>
//         </div>

//         {/* 🦊 نـانـا زهـرة الـشّـفّـافـة */}
//         <div className="absolute bottom-[-15px] right-[5px] w-[170px] h-[240px] pointer-events-none">
//           <img 
//             src={stepInfo.mascotSrc} 
//             alt="Nanna Zahra" 
//             className="w-full h-full object-contain drop-shadow-lg"
//           />
//         </div>

//       </motion.div>
//     </AnimatePresence>
//   )
// }