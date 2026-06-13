'use client'
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { style } from "framer-motion/client";
// 🌟 جبنا الأيقونات ديال السوشيال ميديا و LE PROCESSUS من المكتبة باش يخدمو نيشات 🌟
import { BookOpen, Globe, ShieldCheck, TrendingUp, Facebook, Instagram, Linkedin, Check, List, CheckCircle } from "lucide-react";

const ASSETS = {
  logo: "/assets/logo.svg", 
  magicWorld: "/assets/magic_world.jpg", 
  sectionBackground: "/assets/sectionBackground.png",
  section2Books: [
    "/assets/story1.png",
    "/assets/story2.png",
    "/assets/story3.png",
    "/assets/story4.png",
    "/assets/story5.png",
    "/assets/story6.png",
  ],
  processBooks: [
    "/assets/story1.png",
    "/assets/story2.png",
    "/assets/story3.png",
    "/assets/story4.png",
    "/assets/story5.png",
    "/assets/story6.png",
  ],
  arrowRight: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth='3' d='M14 5l7 7m0 0l-7 7m7-7H3'/></svg>",
  playIcon: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' fill='currentColor' viewBox='0 0 24 24'><path d='M8 5v14l11-7z'/></svg>",
  ctaCharacter: "/assets/nanna-zahra-4.png",
  ctaArrow: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M14 5l7 7m0 0l-7 7m7-7H3'/></svg>",
  footerLogo: "/assets/logo.svg",
  footerDivider: "",
} as const;

const NAV_LINKS = [
  { label: "Accueil", href: "#home" },
  { label: "À propos", href: "#how-it-works" },
  { label: "Le processus", href: "#process" },
  { label: "La mission", href: "#mission" }
] as const;

const fadeInUp = {
  hidden: { opacity: 0, y: 48 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

// 🌟 حطينا الأيقونات الحقيقية ديال lucide-react هنا 🌟
const PROCESS_STEPS = [
  { step: 1, label: "Choisissez une histoire", icon: Check, position: "top" as const, leftPercent: 18.7 },
  { step: 2, label: "Lisez l'histoire", icon: BookOpen, position: "bottom" as const, leftPercent: 50 },
  { step: 3, label: "Répondez aux questions", icon: List, position: "top" as const, leftPercent: 65.6 },
  { step: 4, label: "Gagnez des points", icon: CheckCircle, position: "bottom" as const, leftPercent: 81.2 },
] as const;

const BOOK_OVERLAP = 64;

const MISSION_VALUES = [ 
  { icon: BookOpen, title: "Préserver", description: "Préserver la richesse de nos histoires et de notre culture." },
  { icon: Globe, title: "Partager", description: "Rendre les histoires accessibles aux enfants, aux familles et aux éducateurs." },
  { icon: ShieldCheck, title: "Protéger", description: "Chaque histoire est examinée pour être sûre, respectueuse et culturellement précise." },
  { icon: TrendingUp, title: "Grandir", description: "Nous construisons une plateforme qui soutient les conteurs et inspire les nouvelles générations." }
] as const;

const FOOTER_LINKS = {
  product: [
    { label: "Support", href: "#how-it-works" },
    { label: "Contact", href: "#stories" },
  ],
  company: [
    { label: "À Propos", href: "#how-it-works" },
    { label: "Histoires", href: "#contact" },
  ],
  legal: [
    { label: "Les conditions", href: "#privacy" },
   
  ],
} as const;

export default function HekayatHeroSection() {
  const [isLoading, setIsLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const imagesToLoad = [ASSETS.magicWorld];
    let loadedCount = 0;
    imagesToLoad.forEach((src) => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        loadedCount++;
        if (loadedCount === imagesToLoad.length) setTimeout(() => setIsLoading(false), 1200);
      };
      img.onerror = () => {
        loadedCount++;
        if (loadedCount === imagesToLoad.length) setIsLoading(false);
      };
    });
  }, []);

  return (
    <main className="relative w-full min-h-screen bg-white overflow-x-hidden">
      
      <style dangerouslySetInnerHTML={{ __html: `
        html { scroll-behavior: smooth; }
        @keyframes instant-pulse { 0%, 100% { transform: scale(1) rotate(0deg); opacity: 1; } 50% { transform: scale(1.1) rotate(3deg); opacity: 0.8; } }
        .loading-overlay { position: fixed; inset: 0; background: #fffcf1; display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 9999; transition: opacity 0.6s ease-out, visibility 0.6s; }
        .loading-overlay.hidden { opacity: 0; visibility: hidden; pointer-events: none; }
        .instant-logo { width: 80px; height: auto; animation: instant-pulse 1.8s ease-in-out infinite; }
        @media (min-width: 768px) { .instant-logo { width: 120px; } }
        .progress-bar-container { width: 180px; height: 4px; background: rgba(196, 117, 41, 0.1); border-radius: 10px; margin-top: 30px; overflow: hidden; }
        .progress-bar-fill { width: 100%; height: 100%; background: #c47529; transform: translateX(-100%); animation: slide-progress 2s infinite linear; }
        @keyframes slide-progress { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />

      <div className={`loading-overlay ${!isLoading ? 'hidden' : ''}`}>
        <img src={ASSETS.logo} className="instant-logo" alt="Loading..." />
        <div className="progress-bar-container"><div className="progress-bar-fill" /></div>
        <p style={{ marginTop: '20px', color: '#c47529', fontWeight: '900', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase' }}>Loading Adventure...</p>
      </div>

      <motion.section 
        id="home"
        initial={{ opacity: 0 }} 
        animate={{ opacity: isLoading ? 0 : 1 }} 
        transition={{ duration: 0.8 }} 
        className="relative flex flex-col min-h-screen bg-black"
      >
        <div className="pointer-events-none absolute inset-0 z-0" aria-hidden>
          <img src={ASSETS.magicWorld} alt="" className="h-full w-full object-cover brightness-[0.55] contrast-[1.05]" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/35 to-[#fffcf1]" />
        </div>

        <header className="relative z-[100] flex w-full items-center justify-between px-6 py-4 bg-black/15 backdrop-blur-md shadow-sm md:px-20 border-b border-white/5 h-[80px]">
          <a href="#home" className="z-10 relative">
            <img src={ASSETS.logo} alt="Hekayat" className="h-10 md:h-12 w-auto object-contain" />
          </a>

          <button className="lg:hidden text-white p-2 z-10 relative" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"} />
            </svg>
          </button>

          <nav className={`${isMenuOpen ? 'flex' : 'hidden'} absolute top-full left-0 w-full flex-col bg-black/95 p-6 shadow-xl gap-8 z-[90] lg:flex lg:w-auto lg:flex-row lg:bg-transparent lg:p-0 lg:shadow-none lg:absolute lg:top-1/2 lg:left-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2`}>
            {NAV_LINKS.map((link) => (
              <a 
                key={link.label} 
                href={link.href} 
                onClick={() => setIsMenuOpen(false)} 
                className="text-sm font-black text-white/90 uppercase tracking-tighter hover:text-[#c47529] transition-all"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-4 z-10 relative">
            <a href="/auth" className="rounded-2xl border border-white/40 px-7 py-2.5 text-xs font-black uppercase text-white hover:bg-white/10 transition-colors">
             S'inscrire
            </a>
            <a href="/auth" className="rounded-2xl bg-[#c47529] px-7 py-2.5 text-xs font-black uppercase text-white shadow-lg transition-transform hover:scale-105">
             Se connecter
            </a>
          </div>
        </header>

        <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 text-center pb-20">
          <motion.span initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="mb-6 inline-flex rounded-full bg-[#c47529] px-8 py-2 text-[10px] md:text-xs font-black text-white shadow-xl uppercase tracking-widest">Adapté aux enfants et préadolescents.</motion.span>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="max-w-5xl text-3xl md:text-5xl lg:text-[63px] font-black leading-tight text-white uppercase  tracking-tighter md:leading-[1.1] drop-shadow-md" style={{ fontFamily: "'IM FELL English SC', serif" }}>Transformez <br />la lecture en une aventure passionnante ! </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }} style={{ fontFamily: "'poppins', sans-serif" }}  className="mt-6 max-w-2xl text-lg  md:text-2xl whitespace-nowrap font-medium text-white/90 drop-shadow-sm">Première plateforme interactive d'histoires au Maroc</motion.p>
          <motion.div initial={{ opacity: 20, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1 }} className="mt-10 flex flex-wrap justify-center gap-4 md:gap-6">
            <a href="#how-it-works" className="inline-flex items-center gap-3 bg-[#c47529] text-white px-10 py-4 rounded-2xl font-black uppercase shadow-2xl transition-transform hover:scale-105 ">
              Comment ça fonctionne <img src={ASSETS.arrowRight} className="h-5 w-5 invert" alt="" />
            </a>
            <a href="/auth" className="inline-flex items-center gap-3 bg-white border-2 border-white text-[#7a6657] px-10 py-4 rounded-2xl font-black uppercase shadow-lg  transition-colors hover:bg-gray-50">
              Commencez ici <img src={ASSETS.playIcon} className="h-5 w-5 opacity-40" alt="" />
            </a>
          </motion.div>
        </main>
      </motion.section>

      <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.8 }} className="relative bg-gradient-to-b from-[#fffcf1] via-[#fffcf1] to-[#fffcf1]">

        {/* SECTION 2: Problem */}
        <motion.section id="how-it-works" className="relative z-10 mx-auto flex max-w-[1280px] flex-col items-center gap-16 px-6 py-20 md:flex-row md:items-center md:justify-between md:gap-20 lg:gap-32 md:px-20 md:py-28 lg:py-32" initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={stagger}>
          <motion.div variants={fadeInUp} className="max-w-[550px] flex-1 text-left">
            <span className="mb-6 inline-flex rounded-full border border-white bg-[#c47529] font-black  px-6 py-1 md:text-base text-white shadow-[0_0_54px_rgba(218,170,69,0.4)]">À PROPOS</span>
            <h2 className="text-3xl font-normal uppercase leading-tight text-[#3b1b0d] sm:text-4xl lg:text-[48px] lg:leading-[45px]" style={{ fontFamily: "'IM FELL English SC', serif" }}>La lecture innovante</h2>
            <p className="mt-4 text-lg  leading-[29px] text-[#3b1b0d] md:text-xl" style={{ fontFamily: "'atlan', sans-serif" }} >Face aux distractions, les méthodes traditionnelles ne suffisent plus, Hikayat est la première plateforme interactive de contes au Maroc.
            Nous transformons la lecture en une aventure active où l'enfant lit, répond et joue en même temps, pour lui donner le goût de lire grâce à une expérience 100% interactive.</p>
          </motion.div>
          <motion.div variants={fadeInUp} className="flex w-full flex-1 items-center justify-center lg:justify-end">
            <ul className="relative flex h-[280px] w-full max-w-[490px] items-center justify-center sm:h-[350px]">
              {ASSETS.section2Books.map((src, index) => (
                <motion.li key={index} initial={{ opacity: 0, x: 40, rotate: -30 }} whileInView={{ opacity: 1, x: 0, rotate: -21.65 }} viewport={{ once: true }} transition={{ delay: 0.15 + index * 0.08, duration: 0.8, type: "spring", stiffness: 50 }} className="absolute origin-bottom" style={{ left: `${index * 90}px` }}>
                  <img src={src} alt="preview" className="h-[200px] w-[600px] object-contain drop-shadow-xl sm:h-[285px] sm:w-[229px]" />
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </motion.section>

        <motion.section id="process" className="relative z-10 mx-auto max-w-[1280px] px-6 pb-24 pt-8 md:px-20 md:pb-32" initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={stagger}>
          <motion.div variants={fadeInUp} className="mx-auto max-w-[790px] text-center mb-16">
            <span className="mb-6 inline-flex rounded-full border border-white bg-[#c47529] font-black  px-6 py-1 md:text-base text-white shadow-[0_0_50px_rgba(218,170,69,0.4)]">LE PROCESSUS</span>
            <h2 className="text-3xl font-normal uppercase leading-tight text-[#3b1b0d] sm:text-4xl lg:text-[48px] lg:leading-[52px]" style={{ fontFamily: "'IM FELL English SC', serif" }}>Un parcours simple et efficace</h2>
          </motion.div>

          <motion.div variants={fadeInUp} className="relative mx-auto mt-16 w-full max-w-[1055px] overflow-x-auto px-2 md:overflow-visible md:px-0">
            <div className="relative mx-auto w-max min-w-full py-20 sm:py-28">
              <ul className="relative flex items-center justify-center">
                {ASSETS.processBooks.map((src, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.15 + index * 0.07, duration: 0.65 }}
                    className="relative shrink-0"
                    style={{ marginRight: index < ASSETS.processBooks.length - 1 ? -BOOK_OVERLAP : 0, zIndex: index }}
                  >
                    <img src={src} alt="Story" className="h-[200px] w-[140px] object-contain sm:h-[285px] sm:w-[229px] brightness-90 drop-shadow-md" />
                  </motion.li>
                ))}
              </ul>

              {PROCESS_STEPS.map((item, index) => {
                const IconComponent = item.icon; // 🌟 كنقراو المكون ديال الأيقونة 🌟
                return (
                  <motion.div
                    key={item.step}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    className={`absolute z-50 flex -translate-x-1/2 flex-col items-center gap-2 ${
                      item.position === "top" ? "top-0" : "bottom-0"
                    }`}
                    style={{ left: `${item.leftPercent}%` }}
                  >
                    {item.position === "top" && (
                      <div className="w-max inline-flex items-center justify-center gap-2.5 rounded-full border-2 border-[#c47529] bg-white px-5 py-1.5 text-[10px] md:text-sm font-black text-[#c47529] shadow-md uppercase">
                        <IconComponent className="h-4 w-4 shrink-0" /> 
                        <span>{item.label}</span>
                      </div>
                    )}

                    <div
                      className="flex items-center justify-center rounded-full font-black text-white text-2xl sm:text-3xl shadow-lg shrink-0"
                      style={{
                        width: 64,
                        height: 64,
                        background: "radial-gradient(circle at 35% 35%, #e8922a, #c47529 60%, #9a5a1a)",
                        border: "4px solid white",
                        boxShadow: "0 4px 20px rgba(196,117,41,0.5)",
                      }}
                    >
                      {item.step}
                    </div>

                    {item.position === "bottom" && (
                      <div className="w-max inline-flex items-center justify-center gap-2.5 rounded-full border-2 border-[#c47529] bg-white px-5 py-1.5 text-[10px] md:text-sm font-black text-[#c47529] shadow-md uppercase">
                        <IconComponent className="h-4 w-4 shrink-0" /> 
                        <span>{item.label}</span>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </motion.section>
      </motion.div>

      <motion.section
        id="mission"
        className="relative z-10 w-full py-24 bg-gradient-to-b from-[#fffcf1] to-[#fdf8eb] overflow-hidden"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        variants={stagger}
      >
        <div className="max-w-[1200px] mx-auto px-6 md:px-12 relative z-10">
          
          <div className="flex flex-col items-center text-center mb-16">
            <motion.span 
              variants={fadeInUp}
              className="bg-[#c47529] text-white text-[11px] md:text-base font-black uppercase tracking-wider py-2 md:py-2.5 px-6 rounded-full mb-6 shadow-sm"
            >
              Notre mission
            </motion.span>
            
            <motion.h2 
              variants={fadeInUp}
              className="text-3xl md:text-[44px] lg:text-[52px] leading-tight  text-[#3b1b0d] mb-6 uppercase tracking-tight" style={{ fontFamily: "'IM FELL English SC', serif" }}
            >
              Notre mission et nos valeurs
            </motion.h2>
            
            <motion.p 
              variants={fadeInUp}
              className="text-[#7a6657] text-base md:text-lg max-w-2xl font-medium leading-relaxed" style={{ fontFamily: "'atlan', sans-serif" }} >
              Le Maroc a une riche tradition de conteurs. Hikayat aide à la préserver et à la rendre accessible aux enfants d'aujourd'hui
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6 max-w-[900px] mx-auto">
            {MISSION_VALUES.map((item, index) => {
              const IconComponent = item.icon;
              return (
                <motion.div
                  key={index}
                  variants={fadeInUp}
                  whileHover={{ y: -5 }}
                  className="bg-white rounded-[28px] p-8 md:p-10 border-[1.5px] border-[#c47529]/40 hover:border-[#c47529] hover:shadow-lg transition-all duration-300 text-left"
                >
                  <IconComponent className="w-8 h-8 text-[#3b1b0d] mb-5" strokeWidth={1.5} />
                  <h3 className="text-[22px] font-black text-[#3b1b0d] mb-3 tracking-tight">
                    {item.title}
                  </h3>
                  <p className="text-[#7a6657] text-[15px] font-medium leading-relaxed">
                    {item.description}
                  </p>
                </motion.div>
              );
            })}
          </div>

        </div>
      </motion.section>

      <motion.section
        id="cta"
        className="relative z-10 bg-[#fdf8eb] px-6 pt-12 pb-24 md:px-20 md:pt-16 md:pb-32"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        variants={stagger}
      >
        <motion.div
          variants={fadeInUp}
          className="relative mx-auto flex max-w-[1280px] flex-col rounded-[32px] border border-[#c47529] bg-white p-8 md:rounded-[64px] md:p-16 lg:flex-row lg:items-center lg:justify-between"
        >
          <motion.div className="relative z-10 flex max-w-xl flex-col items-start gap-4">
            
            <h2
              className="text-2xl uppercase leading-[40px] text-[#3b1b0d] md:text-[32px]"
              style={{ fontFamily: "'IM FELL English SC', serif" }}
            >
              Lancez-vous aujourd'hui.
            </h2>
            <p className="max-w-[567px] text-lg leading-[29px] text-[#3b1b0d]" style={{ fontFamily: "'atlan', sans-serif" }}>
              Offrez à votre enfant un moyen d'apprendre à lire avec Hikayat.</p>
            <motion.div className="mt-2 flex flex-wrap gap-4">
              <a
                href="/auth"
                className="inline-flex items-center gap-2.5 rounded-2xl border-2 border-[#c47529] bg-[#c47529] px-8 py-4 text-base font-bold text-white transition-transform hover:scale-105"
              >
                Create account
                <img src={ASSETS.ctaArrow} alt="" className="h-6 w-6 invert" aria-hidden />
              </a>
              <a
                href="/auth"
                className="rounded-2xl border-2 border-[#c47529] bg-white px-8 py-4 text-base font-bold text-[#c47529] transition-colors hover:bg-[#c47529]/5"
              >
                Start free trial
              </a>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="relative mx-auto mt-8 flex h-[280px] w-full items-end justify-center z-20 pointer-events-none lg:absolute lg:-right-[-20px] lg:bottom-0 lg:mt-0 lg:h-[120%] lg:w-auto"
          >
            <img
              src={ASSETS.ctaCharacter}
              alt="Nanna Zahra Narrator"
              className="h-full w-auto object-contain object-bottom drop-shadow-[0_10px_25px_rgba(0,0,0,0.15)]"
            />
          </motion.div>
        </motion.div>
      </motion.section>

      <motion.footer
        className="relative z-10 bg-[#c47529] px-6 pb-8 pt-24 text-white md:px-20 md:pt-[120px]"
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.7 }}
      >
        <motion.div className="mx-auto max-w-[1280px]">
          <motion.div className="flex flex-col gap-12 lg:flex-row lg:items-start lg:justify-between">
            <motion.div className="max-w-[280px] space-y-6">
              <img src={ASSETS.logo} alt="Hikayat" className="h-12 w-auto brightness-0 invert" />
              <p className="text-xl whitespace-nowrap leading-8" style={{ fontFamily: "'atlan', sans-serif" }} >
              Lire devient une aventure pour vos enfants .
              </p>
              
              {/* 🌟 الأيقونات ديال السوشيال ميديا الحقيقية 🌟 */}
              <motion.div className="flex gap-4">
                <a href="#" aria-label="Facebook" className="opacity-90 transition-opacity hover:opacity-100">
                  <Facebook className="h-6 w-6" />
                </a>
                <a href="#" aria-label="Instagram" className="opacity-90 transition-opacity hover:opacity-100">
                  <Instagram className="h-6 w-6" />
                </a>
                <a href="#" aria-label="LinkedIn" className="opacity-90 transition-opacity hover:opacity-100">
                  <Linkedin className="h-6 w-6" />
                </a>
              </motion.div>

            </motion.div>

            <motion.div className="flex flex-wrap gap-12 md:gap-24 lg:gap-40">
              <motion.div>
                <p className="mb-5 text-base font-bold">Blog</p>
                <ul className="space-y-5 text-base">
                  {FOOTER_LINKS.product.map((link) => (
                    <li key={link.label}>
                      <a href={link.href} className="opacity-90 hover:opacity-100" style={{ fontFamily: "'atlan', sans-serif" }}>
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </motion.div>
              <motion.div>
                <p className="mb-5 text-base font-bold" style={{ fontFamily: "'atlan', sans-serif" }} >Hikayat</p>
                <ul className="space-y-5 text-base" style={{ fontFamily: "'atlan', sans-serif" }}>
                  {FOOTER_LINKS.company.map((link) => (
                    <li key={link.label}>
                      <a href={link.href} className="opacity-90 hover:opacity-100">
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </motion.div>
              <motion.div>
                <p className="mb-5 text-base font-bold" style={{ fontFamily: "'atlan', sans-serif" }} >Confidentialité</p>
                <ul className="space-y-5 text-base" style={{ fontFamily: "'atlan', sans-serif" }}>
                  {FOOTER_LINKS.legal.map((link) => (
                    <li key={link.label}>
                      <a href={link.href} className="opacity-90 hover:opacity-100">
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </motion.div>
          </motion.div>

          <motion.div className="my-10 w-full">
            <img src={ASSETS.footerDivider} alt="" className="h-px w-full opacity-40" aria-hidden />
          </motion.div>

          <p className="text-xl" style={{ fontFamily: "'atlan', sans-serif" }} >© 2026 Hikayat. Tous droits réservés.</p>
        </motion.div>
      </motion.footer>
    </main>
  );
}

// 'use client'
// import { motion, useScroll, useTransform, useSpring } from 'framer-motion'
// import { useRef } from 'react'
// import Link from 'next/link'

// export default function UltimateLanding() {
//   const containerRef = useRef<HTMLDivElement>(null)

//   const { scrollYProgress } = useScroll({
//     target: containerRef,
//     offset: ["start start", "end end"]
//   })

//   const smoothProgress = useSpring(scrollYProgress, { stiffness: 40, damping: 25 })

//   // --- DOORS ---
//   const doorLeftX = useTransform(smoothProgress, [0, 0.45], ["0vw", "-100vw"])
//   const doorRightX = useTransform(smoothProgress, [0, 0.45], ["0vw", "100vw"])
//   const doorsOpacity = useTransform(smoothProgress, [0.45, 0.6], [1, 0])

//   // --- WORLD ---
//   const worldScale = useTransform(smoothProgress, [0, 0.6], [1.15, 1])
//   const worldOpacity = useTransform(smoothProgress, [0.1, 0.5], [0, 1])

//   // --- LOGO (FIXED TIMING) ---
//   const logoFade = useTransform(smoothProgress, [0.52, 0.75], [0, 1])
//   const logoScale = useTransform(smoothProgress, [0.52, 0.75], [0.85, 1])

//   // --- ✅ BLUR FIX ---
//   const logoBlur = useTransform(smoothProgress, [0.52, 0.75], [10, 0])
//   const logoBlurFilter = useTransform(logoBlur, (v) => `blur(${v}px)`)

//   // --- CARDS ---
//   const cardVariants = {
//     hidden: { opacity: 0, y: 30 },
//     show: { opacity: 1, y: 0, transition: { duration: 0.6 } }
//   }

//   return (
//     <main className="bg-[#0c0a09] font-['IBM_Plex_Sans_Arabic'] w-full">
      
//       {/* 🚪 PORTAL */}
//       <div ref={containerRef} className="h-[400vh] relative">
//         <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center">
          
//           {/* 🌍 WORLD */}
//           <motion.div 
//             style={{ scale: worldScale, opacity: worldOpacity }}
//             className="absolute inset-0 z-0 bg-black"
//           >
//             <img src="/assets/magic_world.jpg" alt="World" className="w-full h-full object-cover" />
//             <div className="absolute inset-0 bg-black/40 z-10" />
            
//             <div className="relative z-20 h-full flex flex-col items-center justify-center text-center px-4">
              
//               {/* 🔥 LOGO */}
//               <motion.h1 
//                 style={{ 
//                   opacity: logoFade, 
//                   scale: logoScale,
//                   filter: logoBlurFilter
//                 }}
//                 className="text-white text-5xl md:text-[140px] font-black tracking-tighter italic uppercase"
//               >
//                 HIKAYAT
//               </motion.h1>

//               <motion.p 
//                 style={{ opacity: logoFade }}
//                 className="text-[#c5772d] text-lg md:text-3xl font-bold mt-4" 
//                 dir="rtl"
//               >
//                 عالمك الخاص يبدأ هنا
//               </motion.p>

//               <Link href="/auth" className="mt-8 pointer-events-auto">
//                 <button className="bg-[#c5772d] text-white px-10 py-4 md:px-16 md:py-5 rounded-full font-black text-xl md:text-2xl shadow-2xl transition-all hover:scale-105 active:scale-95">
//                   ابدأ المغامرة
//                 </button>
//               </Link>
//             </div>
//           </motion.div>

//           {/* 🚪 DOORS */}
//           <div className="absolute inset-0 z-50 pointer-events-none">
//             <div className="relative w-full h-full flex overflow-hidden">
              
//               {/* LEFT */}
//               <motion.div 
//                 style={{ x: doorLeftX, opacity: doorsOpacity }}
//                 className="w-1/2 h-full overflow-hidden"
//               >
//                 <img src="/assets/door_left.png" alt="Left" className="w-full h-full object-cover object-right" />
//               </motion.div>

//               {/* RIGHT */}
//               <motion.div 
//                 style={{ x: doorRightX, opacity: doorsOpacity }}
//                 className="w-1/2 h-full overflow-hidden"
//               >
//                 <img src="/assets/door_right.png" alt="Right" className="w-full h-full object-cover object-left" />
//               </motion.div>

//               {/* CENTER SEAL */}
//               <motion.div 
//                 style={{ opacity: useTransform(smoothProgress, [0, 0.05], [1, 0]) }}
//                 className="absolute left-1/2 top-0 -translate-x-1/2 w-[3px] h-full bg-black z-[60]"
//               />
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* 🧊 FEATURES */}
//       <section className="relative z-[100] min-h-screen bg-[#0c0a09] py-32 px-6 border-t border-white/5">
//         <div className="max-w-6xl mx-auto text-center">
          
//           <div className="mb-16">
//             <h2 className="text-[#c5772d] font-bold tracking-[0.3em] uppercase text-sm mb-4 italic">
//               The Future of Storytelling
//             </h2>
//             <h3 className="text-white text-5xl md:text-7xl font-black italic tracking-tighter">
//               لماذا حكايات؟
//             </h3>
//           </div>

//           <motion.div 
//             initial="hidden"
//             whileInView="show"
//             viewport={{ once: true, margin: "-100px" }}
//             transition={{ staggerChildren: 0.15 }}
//             className="grid grid-cols-1 md:grid-cols-3 gap-6"
//             dir="rtl"
//           >
            
//             <motion.div variants={cardVariants} className="md:col-span-2 p-10 bg-white/[0.02] border border-white/5 rounded-[40px] backdrop-blur-3xl hover:border-[#c5772d]/30 transition-all text-right">
//               <span className="text-5xl mb-6 block">✨</span>
//               <h4 className="text-white text-3xl font-bold mb-4 italic">ذكاء اصطناعي تفاعلي</h4>
//               <p className="text-white/40 text-lg leading-relaxed max-w-xl">
//                 بطل القصة هو طفلك. تقنياتنا تسمح له بتغيير مسار الأحداث واكتشاف نهايات لا محدودة.
//               </p>
//             </motion.div>

//             <motion.div variants={cardVariants} className="p-10 bg-white/[0.02] border border-white/5 rounded-[40px] backdrop-blur-3xl hover:border-[#c5772d]/30 transition-all">
//               <span className="text-5xl mb-6 block">🎭</span>
//               <h4 className="text-white text-2xl font-bold mb-4 italic">تجربة غامرة</h4>
//               <p className="text-white/40">عوالم بصرية وصوتية تأخذ الطفل داخل القصة.</p>
//             </motion.div>

//             <motion.div variants={cardVariants} className="p-10 bg-white/[0.02] border border-white/5 rounded-[40px] backdrop-blur-3xl hover:border-[#c5772d]/30 transition-all">
//               <span className="text-5xl mb-6 block">📈</span>
//               <h4 className="text-white text-2xl font-bold mb-4 italic">تطور المهارات</h4>
//               <p className="text-white/40">تنمية الخيال والتفكير.</p>
//             </motion.div>

//           </motion.div>
//         </div>
//       </section>

//       {/* NAV */}
//       <nav className="fixed top-0 w-full z-[120] p-8 flex justify-between items-center mix-blend-difference pointer-events-auto">
//         <div className="text-white font-black text-2xl tracking-tighter italic uppercase">
//           Hikayat.
//         </div>
//         <div className="text-[#c5772d] text-xs font-bold tracking-[0.5em] uppercase animate-pulse">
//           Scroll to open
//         </div>
//       </nav>

//     </main>
//   )
// }


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