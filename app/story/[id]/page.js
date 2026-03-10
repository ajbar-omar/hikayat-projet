'use client'
import React, { useEffect, useState, useRef, use } from 'react'
import { motion, useScroll, useTransform } from "framer-motion"
import { supabase } from '@/lib/supabase'

function StoryScene({ scene, index, totalScenes }) {
  const { scrollYProgress } = useScroll();
  const audioRef = useRef(null);
  const start = index / totalScenes;
  const end = (index + 1) / totalScenes;
  
  const opacity = useTransform(scrollYProgress, [start, start + 0.1, end - 0.1, end], [0, 1, 1, 0]);
  const scale = useTransform(scrollYProgress, [start, start + 0.1, end - 0.1, end], [1.1, 1, 1, 0.9]);

  useEffect(() => {
    const unsubscribe = scrollYProgress.on("change", (v) => {
      if (v >= start && v <= end) audioRef.current?.play().catch(() => {});
      else { audioRef.current?.pause(); if(audioRef.current) audioRef.current.currentTime = 0; }
    });
    return () => unsubscribe();
  }, [scrollYProgress, start, end]);

  return (
    <motion.section style={{ opacity, scale }} className="fixed inset-0 h-screen w-full overflow-hidden bg-black flex items-center justify-center">
      <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover opacity-60" src={scene.video_url} />
      <audio ref={audioRef} src={scene.audio_url} preload="auto" />
      <div className="relative z-10 text-center px-6 max-w-5xl">
        <div className="bg-black/85 border-[6px] border-white p-8 md:p-12 shadow-2xl">
           <p className="text-3xl md:text-6xl font-black text-white leading-tight uppercase tracking-tighter">{scene.content}</p>
        </div>
      </div>
    </motion.section>
  );
}

export default function StoryApp({ params }) {
  const resolvedParams = use(params);
  const storyId = resolvedParams.id;
  const [scenes, setScenes] = useState([]);
  const [hasStarted, setHasStarted] = useState(false);
  const { scrollYProgress } = useScroll();

  useEffect(() => {
    async function fetchScenes() {
      const { data } = await supabase.from('scenes').select('*').eq('story_id', storyId).order('order_index', { ascending: true });
      setScenes(data || []);
    }
    fetchScenes();
  }, [storyId]);

  if (scenes.length === 0) return <div className="h-screen bg-black text-white flex items-center justify-center">جاري تحميل أسطورتك...</div>;

  return (
    <main className="relative bg-black" style={{ height: `${scenes.length * 200}vh` }}>
      <style dangerouslySetInnerHTML={{ __html: `body { overflow-x: hidden; background-color: black; } ::-webkit-scrollbar { display: none; } * { scrollbar-width: none; }` }} />

      {!hasStarted ? (
        <div className="fixed inset-0 z-[200] bg-black flex flex-col items-center justify-center p-6 text-center">
          <h1 className="text-white text-6xl md:text-8xl font-black mb-12 tracking-tighter italic">HIKAYAT <span className="text-yellow-400">AI</span></h1>
          <button onClick={() => setHasStarted(true)} className="px-16 py-6 bg-white text-black font-black text-2xl border-4 border-white shadow-xl hover:scale-105 transition-transform">ابدأ المغامرة ▶️</button>
        </div>
      ) : (
        <>
          {scenes.map((scene, index) => (
            <StoryScene key={scene.id} scene={scene} index={index} totalScenes={scenes.length} />
          ))}
          <motion.div className="fixed top-0 left-0 right-0 h-2 bg-yellow-400 z-[300] origin-left shadow-lg" style={{ scaleX: scrollYProgress }} />
        </>
      )}
    </main>
  );
}