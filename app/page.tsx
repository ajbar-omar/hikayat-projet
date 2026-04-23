'use client'
import { motion, useScroll, useTransform, useSpring } from 'framer-motion'
import { useRef } from 'react'
import Link from 'next/link'

export default function ResponsivePortal() {
  // الـ ref غانحطوه غير على الديف اللي فيه 400vh
  const containerRef = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  })

  const smoothProgress = useSpring(scrollYProgress, { stiffness: 40, damping: 25 })

  // الأبواب
  const doorLeftX = useTransform(smoothProgress, [0, 0.45], ["0%", "-100%"])
  const doorRightX = useTransform(smoothProgress, [0, 0.45], ["0%", "100%"])
  const doorsOpacity = useTransform(smoothProgress, [0.45, 0.6], [1, 0])

  // العالم
  const worldScale = useTransform(smoothProgress, [0, 0.6], [1.1, 1])
  const worldOpacity = useTransform(smoothProgress, [0.1, 0.4], [0, 1])

  return (
    // 🔴 الحل 1: حيدنا overflow-x-hidden من هاد الديف الرئيسي باش sticky يخدم
    <div className="bg-black relative font-['IBM_Plex_Sans_Arabic']">
      
      {/* 🔴 الحل 2: الديف ديال 400vh عزلناه بوحدو وحطينا فيه الـ ref */}
      <div ref={containerRef} className="h-[400vh] relative">
        
        {/* Container الرئيسي - دابا غايلصق (Pinned) حيت حيدنا overflow-x-hidden */}
        <div className="sticky top-0 h-screen w-full overflow-hidden">
          
          {/* الطبقة 0: العالم السحري (Background) */}
          <motion.div 
            style={{ scale: worldScale, opacity: worldOpacity }}
            className="absolute inset-0 z-0 bg-black"
          >
            <img src="/assets/magic_world.jpg" alt="World" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 z-10" />
            
            <div className="relative z-20 h-full flex flex-col items-center justify-center text-center px-4">
              <h1 className="text-white text-5xl md:text-[120px] font-black tracking-tighter italic uppercase">HIKAYAT</h1>
              <p className="text-[#c5772d] text-lg md:text-3xl font-bold mt-4 max-w-md md:max-w-none" dir="rtl">مرحباً بك في عالم الأساطير</p>
              <Link href="/auth" className="mt-8 pointer-events-auto">
                <button className="bg-[#c5772d] text-white px-8 py-3 md:px-16 md:py-5 rounded-full font-black text-lg md:text-2xl shadow-2xl transition-all active:scale-95">ابدأ الآن</button>
              </Link>
            </div>
          </motion.div>

          {/* الطبقة 1: الأبواب (The Grid System) */}
          <div className="absolute inset-0 z-50 pointer-events-none">
            <div className="grid grid-cols-2 h-full w-full">
              
              <motion.div 
                style={{ x: doorLeftX, opacity: doorsOpacity }}
                className="relative h-full w-[50.1vw] overflow-hidden justify-self-end"
              >
                <img 
                  src="/assets/door_left.png" 
                  alt="Left" 
                  className="w-full h-full object-cover object-right" 
                />
              </motion.div>

              <motion.div 
                style={{ x: doorRightX, opacity: doorsOpacity }}
                className="relative h-full w-[50.1vw] overflow-hidden justify-self-start"
              >
                <img 
                  src="/assets/door_right.png" 
                  alt="Right" 
                  className="w-full h-full object-cover object-left" 
                />
              </motion.div>

            </div>

            {/* خط الوسط (The Gap Filler) */}
            <motion.div 
              style={{ opacity: useTransform(smoothProgress, [0, 0.03], [1, 0]) }}
              className="absolute left-1/2 top-0 -translate-x-1/2 w-[3px] md:w-[6px] h-full bg-black z-[60]"
            />
          </div>
        </div>
      </div>

      {/* 🔴 الحل 3: المحتوى السفلي خرجناه على برا ديال 400vh */}
      <section className="h-screen bg-[#0c0a09] relative z-[70] flex items-center justify-center p-10">
          <h2 className="text-white/20 text-3xl md:text-5xl font-black uppercase tracking-[0.5em] text-center">Your Story Starts Here</h2>
      </section>

      {/* Nav Responsive */}
      <nav className="fixed top-0 w-full z-[100] p-6 md:p-10 flex justify-between items-center mix-blend-difference pointer-events-auto text-white">
         <div className="font-black text-xl md:text-2xl tracking-tighter italic uppercase">Hikayat.</div>
         <div className="hidden md:block text-[#c5772d] text-[10px] font-black tracking-[0.5em] uppercase animate-pulse">Scroll to open</div>
      </nav>
    </div>
  )
}




// 'use client'
// import * as THREE from 'three'
// import { useRef, useMemo } from 'react'
// import { Canvas, useFrame } from '@react-three/fiber'
// import { OrbitControls, Float, Stars, Text, MeshDistortMaterial } from '@react-three/drei'
// import { motion } from 'framer-motion'
// import Link from 'next/link'

// // مكون الإعصار السحري (Vortex)
// function MagicVortex() {
//   const points = useMemo(() => {
//     const p = new Array(2000).fill(0).map(() => (Math.random() - 0.5) * 10)
//     return new Float32Array(p)
//   }, [])

//   const pointsRef = useRef<any>(null)

//   useFrame((state) => {
//     const time = state.clock.getElapsedTime()
//     if (pointsRef.current) {
//       pointsRef.current.rotation.y = time * 0.1
//       pointsRef.current.rotation.z = time * 0.05
//     }
//   })

//   return (
//     <group ref={pointsRef}>
//       <points>
//         <bufferGeometry>
//           <bufferAttribute
//             attach="attributes-position"
//             count={points.length / 3}
//             array={points}
//             itemSize={3}
//           />
//         </bufferGeometry>
//         <pointsMaterial size={0.02} color="#c5772d" transparent opacity={0.6} sizeAttenuation />
//       </points>
      
//       {/* كرة طاقة في الوسط كتدور وتتغير شكلها */}
//       <Float speed={5} rotationIntensity={2} floatIntensity={2}>
//         <mesh>
//           <sphereGeometry args={[1, 64, 64]} />
//           <MeshDistortMaterial color="#c5772d" speed={3} distort={0.6} radius={1} />
//         </mesh>
//       </Float>
//     </group>
//   )
// }

// export default function EpicLanding() {
//   return (
//     <div className="h-screen w-full bg-[#0c0a09] relative overflow-hidden font-['IBM_Plex_Sans_Arabic']">
      
//       {/* UI Overlay - هادشي كيبان فوق الـ 3D */}
//       <div className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-between p-8 md:p-16">
//         <nav className="flex justify-between items-center pointer-events-auto">
//           <div className="text-white font-black text-2xl tracking-tighter italic">
//             HIKAYAT<span className="text-[#c5772d]">.</span>
//           </div>
//           <Link href="/auth">
//             <button className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-8 py-3 rounded-full font-bold text-xs uppercase tracking-widest hover:bg-[#c5772d] transition-all">
//               Entry Portal
//             </button>
//           </Link>
//         </nav>

//         <div className="max-w-3xl self-end text-right pointer-events-auto" dir="rtl">
//           <motion.h1 
//             initial={{ opacity: 0, y: 50 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 1 }}
//             className="text-white font-black text-7xl md:text-[120px] mb-6 leading-[0.85] tracking-tighter"
//           >
//             عـالـم <br /> <span className="text-[#c5772d]">يـتـنـفـس.</span>
//           </motion.h1>
//           <p className="text-gray-500 text-lg md:text-xl font-medium max-w-md ml-auto leading-relaxed">
//             مغامرة سينمائية تتجاوز حدود الواقع. طفلك هو البطل في كون من الحكايات التفاعلية 3D.
//           </p>
//         </div>
//       </div>

//       {/* 3D Scene - هادي هي اللي غاتعطيك الضوء والتحرك */}
//       <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
//         <color attach="background" args={['#0c0a09']} />
//         <ambientLight intensity={0.5} />
//         <pointLight position={[10, 10, 10]} intensity={2} color="#c5772d" />
        
//         <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        
//         <MagicVortex />
        
//         <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} />
//       </Canvas>

//       {/* ديكور تقني خفيف فـ الجناب */}
//       <div className="absolute bottom-10 left-10 text-[8px] text-[#c5772d] font-black uppercase tracking-[1.5em] opacity-40">
//         Engine: R3F-Vortex-Core-v4
//       </div>
//     </div>
//   )
// }



// 'use client'
// import { motion, useScroll, useTransform } from 'framer-motion'
// import Link from 'next/link'
// import { useRef } from 'react'

// const CARDS = [
//   {
//     title: "رؤية سينمائية",
//     desc: "مشاهد فيديو بدقة عالية تتفاعل مع قرارات الطفل.",
//     color: "bg-[#e8ddd3]",
//     text: "text-[#3a2a1a]",
//     icon: "🎬"
//   },
//   {
//     title: "ذكاء تفاعلي",
//     desc: "نظام كويزات ذكي يقيس مستوى استيعاب البطل الصغير.",
//     color: "bg-[#1d1d1f]",
//     text: "text-white",
//     icon: "🧠"
//   },
//   {
//     title: "لوحة تحكم الأهل",
//     desc: "تقارير دقيقة لمتابعة تطور المهارات والذكاء.",
//     color: "bg-[#c5772d]",
//     text: "text-white",
//     icon: "📈"
//   }
// ]

// export default function ShopifyAwraqLanding() {
//   const containerRef = useRef(null)
//   const { scrollYProgress } = useScroll({
//     target: containerRef,
//     offset: ["start start", "end end"]
//   })

//   return (
//     <div ref={containerRef} className="bg-[#f5f5f7] font-['IBM_Plex_Sans_Arabic'] selection:bg-[#c5772d] selection:text-white">
      
//       {/* --- Section 1: Hero --- */}
//       <section className="h-screen flex items-center justify-center bg-white relative z-0">
//         <div className="text-center px-6">
//           <motion.h1 
//             initial={{ opacity: 0, scale: 0.9 }}
//             animate={{ opacity: 1, scale: 1 }}
//             className="text-[12vw] font-black tracking-tighter leading-none text-[#1d1d1f]"
//           >HIKAYAT<span className="text-[#c5772d]">.</span></motion.h1>
//           <p className="mt-10 text-xl text-gray-400 font-medium">Scroll to explore the editions</p>
//         </div>
//       </section>

//       {/* --- Section 2: Stacking Awraq --- */}
//       <section className="relative z-10">
//         {CARDS.map((card, i) => (
//           <Card key={i} card={card} index={i} progress={scrollYProgress} total={CARDS.length} />
//         ))}
//       </section>

//       {/* --- Footer CTA --- */}
//       <section className="h-screen flex flex-col items-center justify-center bg-white z-50 relative border-t border-gray-100">
//         <h2 className="text-5xl md:text-[120px] font-black mb-12 text-[#1d1d1f] tracking-tighter">Ready?</h2>
//         <Link href="/auth">
//           <button className="bg-[#1d1d1f] text-white px-16 py-6 rounded-full font-black text-xl shadow-2xl hover:bg-[#c5772d] transition-all transform active:scale-95">
//             Start Now
//           </button>
//         </Link>
//       </section>
//     </div>
//   )
// }

// function Card({ card, index, progress, total }: any) {
//   // حساب المدى (Range) ديال كل ورقة بناءً على ترتيبها
//   const start = index / total
//   const end = 1
//   const scale = useTransform(progress, [start, end], [1, 1 - (total - index) * 0.05])

//   return (
//     <div className="h-screen sticky top-0 flex items-center justify-center overflow-hidden px-4">
//       <motion.div 
//         style={{ scale }}
//         className={`relative w-full max-w-5xl h-[70vh] ${card.color} ${card.text} rounded-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.1)] p-8 md:p-16 flex flex-col justify-between border border-black/5`}
//       >
//         <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/paper.png')] pointer-events-none" />
        
//         <div className="flex justify-between items-start relative z-10" dir="rtl">
//           <span className="text-6xl md:text-8xl">{card.icon}</span>
//           <span className="font-black opacity-20 text-sm md:text-xl uppercase tracking-widest">EDITION 0{index + 1}</span>
//         </div>

//         <div className="relative z-10 text-right" dir="rtl">
//           <h3 className="text-4xl md:text-7xl font-black mb-6 leading-tight tracking-tighter">{card.title}</h3>
//           <p className="text-lg md:text-2xl opacity-70 max-w-2xl leading-relaxed font-medium">{card.desc}</p>
//         </div>
        
//         <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-white/5 rounded-full blur-[100px]" />
//       </motion.div>
//     </div>
//   )
// }