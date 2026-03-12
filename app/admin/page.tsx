'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function GlobalCMS() {
  const [stories, setStories] = useState([])
  const [activeStory, setActiveStory] = useState(null)
  const [scenes, setScenes] = useState([])
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState('')
  const [editingSceneId, setEditingSceneId] = useState(null)
  const [hoveredStory, setHoveredStory] = useState(null)

  useEffect(() => {
    fetchStories()
    const link = document.createElement('link')
    link.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&display=swap'
    link.rel = 'stylesheet'
    document.head.appendChild(link)
  }, [])

  async function fetchStories() {
    const { data } = await supabase.from('stories').select('*').order('created_at', { ascending: false })
    setStories(data || [])
  }

  async function uploadFile(file, folder, bucket = 'media') {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`
    const path = `${folder}/${fileName}`
    const { error } = await supabase.storage.from(bucket).upload(path, file)
    if (error) throw error
    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path)
    return urlData.publicUrl
  }

  async function addStory(e) {
    e.preventDefault()
    setLoading(true); setStatus('جاري الحفظ...')
    try {
      const coverFile = e.target.cover.files[0]
      let coverUrl = ''
      if (coverFile) {
        coverUrl = await uploadFile(coverFile, 'covers', 'story-covers')
      }
      const { error } = await supabase.from('stories').insert([{ title, cover_url: coverUrl }])
      if (!error) { setTitle(''); e.target.reset(); fetchStories(); setStatus('تمت الإضافة ✅') }
    } catch (err) { alert('خطأ: ' + err.message) }
    finally { setLoading(false); setTimeout(() => setStatus(''), 2000) }
  }

  async function handleUpdateStoryCover(e, storyId) {
    try {
      setLoading(true); setStatus('جاري تحديث الغلاف...')
      const file = e.target.files[0]
      if (!file) return
      const newUrl = await uploadFile(file, 'covers', 'story-covers')
      await supabase.from('stories').update({ cover_url: newUrl }).eq('id', storyId)
      fetchStories()
      setStatus('تم التحديث ✅')
    } catch (err) { alert('خطأ: ' + err.message) }
    finally { setLoading(false); setTimeout(() => setStatus(''), 2000) }
  }

  async function deleteStory(id, e) {
    e.stopPropagation()
    if (confirm('واش متأكد؟ غيتمسح كلشي!')) {
      await supabase.from('stories').delete().eq('id', id)
      if (activeStory?.id === id) setActiveStory(null)
      fetchStories()
    }
  }

  async function selectStory(story) {
    setActiveStory(story)
    setEditingSceneId(null)
    const { data } = await supabase.from('scenes').select('*').eq('story_id', story.id).order('order_index', { ascending: true })
    setScenes(data || [])
  }

  async function handleAddScene(e) {
    e.preventDefault()
    setLoading(true); setStatus('جاري حفظ المشهد...')
    try {
      const vFile = e.target.video.files[0]
      const aFile = e.target.audio.files[0]
      const vUrl = await uploadFile(vFile, 'videos', 'media')
      const aUrl = await uploadFile(aFile, 'audios', 'media')
      await supabase.from('scenes').insert([{
        story_id: activeStory.id, content, video_url: vUrl, audio_url: aUrl, order_index: scenes.length + 1
      }])
      setContent(''); e.target.reset()
      await selectStory(activeStory)
      setStatus('تم حفظ المشهد ✅')
    } catch (err) { alert('خطأ: ' + err.message) }
    finally { setLoading(false); setTimeout(() => setStatus(''), 2000) }
  }

  async function deleteScene(id) {
    if (confirm('تمسح هاد المشهد؟')) {
      await supabase.from('scenes').delete().eq('id', id)
      selectStory(activeStory)
    }
  }

  const C = {
    bg: '#faf7f4', surface: '#ffffff', surfaceAlt:'#f5f0eb',
    border: '#e8ddd3', borderDark:'#c9b9a8', brown: '#7c5c3e',
    brownDark: '#5a3e28', brownMid: '#a07850', brownLight:'#d4bfa8',
    brownXLight:'#ede5dc', white: '#ffffff', red: '#c0392b',
    redLight: '#fdf0ee', redBorder: '#f0c0b8', green: '#2e7d52',
    greenLight:'#edf7f2', greenBorder:'#b0d8c0', blue: '#2c5f8a',
    blueLight: '#eef4fa', blueBorder:'#b0cce8', text: '#3a2a1a',
    textMuted: '#8a7060',
  }

  const styles = {
    root: { minHeight: '100vh', background: C.bg, fontFamily: "'IBM Plex Sans Arabic', sans-serif", direction: 'rtl', color: C.text, position: 'relative' },
    container: { position: 'relative', zIndex: 1, maxWidth: '1400px', margin: '0 auto', padding: '0 30px' },
    header: { padding: '50px 0 30px', borderBottom: `2px solid ${C.border}`, marginBottom: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
    headerTitle: { fontFamily: "'Playfair Display', serif", fontSize: '42px', fontWeight: 900, color: C.brownDark, margin: 0 },
    headerSub: { color: C.brownLight, fontSize: '16px', fontWeight: 400, marginTop: '6px', letterSpacing: '2px' },
    headerBadge: { background: C.brownXLight, border: `1px solid ${C.borderDark}`, color: C.brown, padding: '10px 25px', borderRadius: '100px', fontSize: '14px', fontWeight: 600 },
    grid: { display: 'grid', gridTemplateColumns: activeStory ? '420px 1fr' : '1fr', gap: '50px', alignItems: 'start' },
    sidebarCard: { background: C.surface, border: `1px solid ${C.border}`, borderRadius: '24px', padding: '32px', marginBottom: '30px', boxShadow: '0 4px 15px rgba(100,70,40,0.06)' },
    sidebarTitle: { fontSize: '15px', fontWeight: 700, color: C.brownMid, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px' },
    addInput: { width: '100%', background: C.surfaceAlt, border: `1px solid ${C.border}`, borderRadius: '14px', padding: '16px 20px', color: C.text, fontSize: '18px', outline: 'none', marginBottom: '15px' },
    addBtn: { width: '100%', background: C.brownDark, border: 'none', borderRadius: '14px', padding: '16px', color: C.white, fontWeight: 800, fontSize: '18px', cursor: 'pointer' },
    storyItem: (isActive, isHovered) => ({ padding: '20px', borderRadius: '16px', cursor: 'pointer', border: isActive ? `2px solid ${C.brown}` : `1px solid ${C.border}`, background: isActive ? C.brownXLight : isHovered ? C.surfaceAlt : C.surface, display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: '0.2s' }),
    mainPanel: { background: C.surface, border: `1px solid ${C.border}`, borderRadius: '28px', padding: '50px', boxShadow: '0 6px 30px rgba(100,70,40,0.08)' },
    textarea: { width: '100%', background: C.white, border: `1px solid ${C.border}`, borderRadius: '16px', padding: '20px', fontSize: '20px', minHeight: '150px', marginBottom: '25px', outline: 'none', lineHeight: '1.6' },
    fileBox: { background: C.white, border: `1px dashed ${C.borderDark}`, borderRadius: '14px', padding: '18px' },
    toast: { position: 'fixed', bottom: '40px', left: '50%', transform: 'translateX(-50%)', background: C.greenLight, border: `1px solid ${C.greenBorder}`, color: C.green, padding: '15px 35px', borderRadius: '100px', zIndex: 100, fontSize: '16px', fontWeight: 'bold' },
  }

  return (
    <>
      <style>{`* { box-sizing: border-box; } button:hover { opacity: 0.8; }`}</style>
      <div style={styles.root}>
        <div style={styles.container}>
          <header style={styles.header}>
            <div><h1 style={styles.headerTitle}>مدير الحكايات</h1><p style={styles.headerSub}>لوحة التحكم في المحتوى الرقمي</p></div>
            <span style={styles.headerBadge}>✦ CMS PREMIUM</span>
          </header>

          <div style={styles.grid}>
            <aside>
              <div style={styles.sidebarCard}>
                <div style={styles.sidebarTitle}><span>✦</span> إنشاء قصة جديدة</div>
                <form onSubmit={addStory}>
                  <input type="text" placeholder="ما هو عنوان الحكاية؟" value={title} onChange={(e) => setTitle(e.target.value)} style={styles.addInput} required />
                  <div style={{...styles.fileBox, marginBottom:'15px'}}>
                    <label style={{fontSize:'13px', fontWeight:700, display:'block', marginBottom:'8px'}}>🖼️ صورة الغلاف (Cover)</label>
                    <input type="file" name="cover" accept="image/*" required style={{fontSize:'14px'}} />
                  </div>
                  <button type="submit" style={styles.addBtn} disabled={loading}>{loading ? 'جاري الرفع...' : '+ تأكيد وإضافة'}</button>
                </form>
              </div>

              <div style={styles.sidebarCard}>
                <div style={styles.sidebarTitle}><span>◈</span> قائمة الحكايات ({stories.length})</div>
                <div style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
                  {stories.map(s => (
                    <div key={s.id}>
                      <div onClick={() => selectStory(s)} onMouseEnter={() => setHoveredStory(s.id)} onMouseLeave={() => setHoveredStory(null)} style={styles.storyItem(activeStory?.id === s.id, hoveredStory === s.id)}>
                        <div style={{display:'flex', alignItems:'center', gap:'15px'}}>
                          <div style={{width:'50px', height:'50px', borderRadius:'10px', background: s.cover_url ? `url(${s.cover_url}) center/cover` : C.brownXLight, border:`1px solid ${C.borderDark}`}} />
                          <span style={{fontWeight: activeStory?.id === s.id ? 700 : 500, fontSize:'18px'}}>{s.title}</span>
                        </div>
                        <button onClick={(e) => deleteStory(s.id, e)} style={{background:'none', border:'none', color:C.red, cursor:'pointer', fontSize:'14px', fontWeight:600}}>حذف</button>
                      </div>
                      <label style={{fontSize:'12px', color:C.brownMid, cursor:'pointer', paddingRight:'65px', textDecoration:'underline', marginTop:'8px', display:'block'}}>
                        تحديث الغلاف <input type="file" accept="image/*" style={{display:'none'}} onChange={(e) => handleUpdateStoryCover(e, s.id)} />
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </aside>

            {activeStory && (
              <main style={styles.mainPanel}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'45px', paddingBottom:'25px', borderBottom:`1px solid ${C.border}`}}>
                  <div style={{display:'flex', alignItems:'center', gap:'25px'}}>
                    <div style={{width:'90px', height:'90px', borderRadius:'18px', background: activeStory.cover_url ? `url(${activeStory.cover_url}) center/cover` : C.brownXLight, border:`2px solid ${C.border}`, boxShadow:'0 4px 10px rgba(0,0,0,0.1)'}} />
                    <h2 style={{fontFamily:"'Playfair Display', serif", fontSize:'38px', margin:0, color:C.brownDark}}>{activeStory.title}</h2>
                  </div>
                  <button onClick={() => setActiveStory(null)} style={{background:C.surfaceAlt, border:`1px solid ${C.borderDark}`, padding:'12px 24px', borderRadius:'100px', cursor:'pointer', fontSize:'15px', fontWeight:600}}>← خروج</button>
                </div>

                <div style={{background:C.brownXLight, padding:'35px', borderRadius:'24px', marginBottom:'40px'}}>
                  <div style={{...styles.sidebarTitle, color:C.brownDark, fontSize:'18px'}}>✍️ إضافة مشهد جديد للملحمة</div>
                  <form onSubmit={handleAddScene}>
                    <textarea placeholder="ابدأ كتابة تفاصيل المشهد هنا..." value={content} onChange={(e) => setContent(e.target.value)} style={styles.textarea} required />
                    <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px', marginBottom:'25px'}}>
                      <div style={styles.fileBox}><label style={{fontSize:'14px', fontWeight:700, display:'block', marginBottom:'10px'}}>📹 ملف الفيديو (4K/HD)</label><input type="file" name="video" accept="video/*" required /></div>
                      <div style={styles.fileBox}><label style={{fontSize:'14px', fontWeight:700, display:'block', marginBottom:'10px'}}>🎙️ التعليق الصوتي (Audio)</label><input type="file" name="audio" accept="audio/*" required /></div>
                    </div>
                    <button type="submit" disabled={loading} style={styles.addBtn}>{loading ? status : '✦ حفظ ونشر المشهد الآن'}</button>
                  </form>
                </div>

                <div style={{display:'flex', flexDirection:'column', gap:'20px'}}>
                  {scenes.map((sc, i) => (
                    <div key={sc.id} style={{background:C.white, border:`1px solid ${C.border}`, borderRadius:'20px', padding:'30px', boxShadow:'0 2px 8px rgba(0,0,0,0.03)'}}>
                      <div style={{display:'flex', justifyContent:'space-between', marginBottom:'15px'}}>
                        <span style={{fontFamily:"'Playfair Display', serif", fontWeight:900, color:C.brown, fontSize:'24px'}}>المشهد {i+1}</span>
                        <button onClick={() => deleteScene(sc.id)} style={{color:C.red, background:C.redLight, border:`1px solid ${C.redBorder}`, padding:'6px 15px', borderRadius:'8px', cursor:'pointer', fontSize:'13px', fontWeight:700}}>حذف المشهد</button>
                      </div>
                      <p style={{margin:0, color:C.text, lineHeight:'1.8', fontSize:'22px'}}>{sc.content}</p>
                    </div>
                  ))}
                </div>
              </main>
            )}
          </div>
        </div>
        {status && <div style={styles.toast}>{status}</div>}
      </div>
    </>
  )
}
// "use client";

// import { useState, useEffect, useRef } from "react";
// import { motion, useScroll, useTransform } from "framer-motion";

// function StoryScene({ title, text, videoSrc, audioSrc, progressRange }: any) {
//   const { scrollYProgress } = useScroll();
//   const audioRef = useRef<HTMLAudioElement>(null);
  
//   // أنيميشن الاختفاء والظهور
//   const opacity = useTransform(scrollYProgress, progressRange, [0, 1, 1, 0]);
//   const scale = useTransform(scrollYProgress, progressRange, [1.05, 1, 1, 0.95]);

//   // منطق تشغيل صوت الراوي مع السكرول
//   useEffect(() => {
//     const unsubscribe = scrollYProgress.on("change", (latest) => {
//       // إذا وصل السكرول للمجال ديال هاد المشهد
//       if (latest >= progressRange[1] && latest <= progressRange[2]) {
//         audioRef.current?.play().catch(() => {}); 
//       } else {
//         audioRef.current?.pause();
//         if (audioRef.current) audioRef.current.currentTime = 0; // يرجع للبداية
//       }
//     });
//     return () => unsubscribe();
//   }, [scrollYProgress, progressRange]);

//   return (
//     <motion.section 
//       style={{ opacity, scale }}
//       className="fixed inset-0 h-screen w-full overflow-hidden bg-black"
//     >
//       <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover opacity-50">
//         <source src={videoSrc} type="video/mp4" />
//       </video>

//       <audio ref={audioRef} src={audioSrc} preload="auto" />

//       <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6">
//         <h2 className="text-6xl md:text-8xl font-black text-white mb-6 drop-shadow-2xl uppercase tracking-tighter">
//           {title}
//         </h2>
//         <p className="text-2xl md:text-4xl text-gray-200 max-w-4xl italic font-light leading-relaxed">
//           "{text}"
//         </p>
//       </div>
//     </motion.section>
//   );
// }

// export default function StoryApp() {
//   const [hasStarted, setHasStarted] = useState(false);
//   const { scrollYProgress } = useScroll();

//   return (
//     <main className="relative h-[1000vh] bg-black">
      
//       {!hasStarted ? (
//         <div className="fixed inset-0 z-[100] bg-zinc-950 flex flex-col items-center justify-center">
//           <h1 className="text-yellow-400 text-6xl font-black mb-12 tracking-tighter">حكايات سحرية 📖</h1>
//           <button 
//             onClick={() => setHasStarted(true)}
//             className="px-14 py-6 bg-yellow-400 text-black font-black rounded-full text-2xl hover:scale-110 transition-transform shadow-[0_0_50px_rgba(250,204,21,0.4)]"
//           >
//             ابدأ المغامرة بصوت الراوي 🎬
//           </button>
//         </div>
//       ) : (
//         <>
//           {/* المشهد 1 */}
//           <StoryScene 
//             title="فجر جديد" 
//             text="في الصباح الباكر، استيقظ بطلنا على صوت العصافير في الغابة."
//             videoSrc="/video1.mp4" 
//             audioSrc="/audio1.m4a" // بدلنا mp3 بـ m4a
//             progressRange={[0, 0.1, 0.2, 0.3]} 
//           />

//           {/* المشهد 2 */}
//           <StoryScene 
//             title="البحث" 
//             text="بدأ الأرنب يتبع آثار الأقدام القديمة المرسومة في الخريطة."
//             videoSrc="/video2.mp4" 
//             audioSrc="/audio2.m4a" // بدلنا mp3 بـ m4a
//             progressRange={[0.35, 0.45, 0.55, 0.65]} 
//           />

//           {/* المشهد 3 */}
//           <StoryScene 
//             title="السر الكبير" 
//             text="وأخيراً، اكتشف أن الكنز لم يكن ذهباً، بل كان كتاباً مليئاً بالقصص."
//             videoSrc="/video3.mp4" 
//             audioSrc="/audio3.m4a" // بدلنا mp3 بـ m4a
//             progressRange={[0.7, 0.8, 0.9, 1]} 
//           />

//           {/* بار التقدم */}
//           <motion.div 
//             className="fixed top-0 left-0 right-0 h-1.5 bg-yellow-400 z-50 origin-left shadow-[0_0_15px_rgba(250,204,21,0.8)]"
//             style={{ scaleX: scrollYProgress }}
//           />
//         </>
//       )}
//     </main>
//   );
// }