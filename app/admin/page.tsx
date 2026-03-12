'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase' // الربط الحقيقي مع السوبابيس

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
    // استيراد الخطوط الأنيقة
    const link = document.createElement('link')
    link.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=IBM+Plex+Sans+Arabic:wght@300;400;600;700&display=swap'
    link.rel = 'stylesheet'
    document.head.appendChild(link)
  }, [])

  // جلب البيانات الحقيقية
  async function fetchStories() {
    const { data } = await supabase.from('stories').select('*').order('created_at', { ascending: false })
    setStories(data || [])
  }

  async function addStory(e) {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.from('stories').insert([{ title }])
    if (!error) { setTitle(''); fetchStories() }
    setLoading(false)
  }

  async function deleteStory(id, e) {
    e.stopPropagation()
    if (confirm('واش متأكد؟ غيتمسح كلشي فهاد القصة!')) {
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

  async function uploadFile(file, folder) {
    const path = `${folder}/${Date.now()}_${file.name}`
    const { error } = await supabase.storage.from('media').upload(path, file)
    if (error) throw error
    const { data: urlData } = supabase.storage.from('media').getPublicUrl(path)
    return urlData.publicUrl
  }

  // إضافة مشهد حقيقي مع رفع الملفات
  async function handleAddScene(e) {
    e.preventDefault()
    setLoading(true); setStatus('جاري الحفظ...')
    try {
      const vFile = e.target.video.files[0]
      const aFile = e.target.audio.files[0]
      const vUrl = await uploadFile(vFile, 'videos')
      const aUrl = await uploadFile(aFile, 'audios')

      const { error } = await supabase.from('scenes').insert([{
        story_id: activeStory.id,
        content,
        video_url: vUrl,
        audio_url: aUrl,
        order_index: scenes.length + 1
      }])

      if (error) throw error
      setContent(''); e.target.reset()
      await selectStory(activeStory)
      setStatus('تم الحفظ بنجاح! ✅')
    } catch (err) { alert('خطأ: ' + err.message) }
    finally { setLoading(false); setTimeout(() => setStatus(''), 2000) }
  }

  async function deleteScene(id) {
    if (confirm('تمسح هاد المشهد؟')) {
      await supabase.from('scenes').delete().eq('id', id)
      selectStory(activeStory)
    }
  }

  // تحديث المشهد (نص وميديا)
  async function handleUpdateScene(e, sceneId) {
    e.preventDefault()
    setLoading(true); setStatus('جاري التحديث...')
    try {
      const newContent = e.target.editContent.value
      const vFile = e.target.editVideo.files[0]
      const aFile = e.target.editAudio.files[0]

      let updateData = { content: newContent }
      if (vFile) updateData.video_url = await uploadFile(vFile, 'videos')
      if (aFile) updateData.audio_url = await uploadFile(aFile, 'audios')

      await supabase.from('scenes').update(updateData).eq('id', sceneId)
      setEditingSceneId(null)
      await selectStory(activeStory)
      setStatus('تم التحديث ✅')
    } catch (err) { alert('خطأ: ' + err.message) }
    finally { setLoading(false); setTimeout(() => setStatus(''), 2000) }
  }

  // Color tokens — الستايل الأنيق
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
    header: { padding: '40px 0 30px', borderBottom: `2px solid ${C.border}`, marginBottom: '50px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
    headerTitle: { fontFamily: "'Playfair Display', serif", fontSize: '38px', fontWeight: 900, color: C.brownDark, margin: 0 },
    headerSub: { color: C.brownLight, fontSize: '13px', fontWeight: 400, marginTop: '4px', letterSpacing: '2px', textTransform: 'uppercase' },
    headerBadge: { background: C.brownXLight, border: `1px solid ${C.borderDark}`, color: C.brown, padding: '8px 20px', borderRadius: '100px', fontSize: '12px', fontWeight: 600 },
    grid: { display: 'grid', gridTemplateColumns: activeStory ? '380px 1fr' : '1fr', gap: '40px', alignItems: 'start' },
    sidebarCard: { background: C.surface, border: `1px solid ${C.border}`, borderRadius: '20px', padding: '28px', marginBottom: '24px', boxShadow: '0 2px 12px rgba(100,70,40,0.06)' },
    sidebarTitle: { fontSize: '13px', fontWeight: 700, color: C.brownMid, letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' },
    addInput: { width: '100%', background: C.surfaceAlt, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '14px 18px', color: C.text, fontSize: '15px', outline: 'none', marginBottom: '12px', boxSizing: 'border-box' },
    addBtn: { width: '100%', background: C.brownDark, border: 'none', borderRadius: '12px', padding: '13px', color: C.white, fontWeight: 800, cursor: 'pointer' },
    storyItem: (isActive, isHovered) => ({ padding: '18px 20px', borderRadius: '14px', cursor: 'pointer', border: isActive ? `2px solid ${C.brown}` : `1px solid ${C.border}`, background: isActive ? C.brownXLight : isHovered ? C.surfaceAlt : C.surface, marginBottom: '10px', transition: 'all 0.2s', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }),
    deleteBtn: { background: C.redLight, border: `1px solid ${C.redBorder}`, color: C.red, borderRadius: '8px', padding: '5px 10px', cursor: 'pointer', fontSize: '11px', fontWeight: 600 },
    mainPanel: { background: C.surface, border: `1px solid ${C.border}`, borderRadius: '24px', padding: '40px', boxShadow: '0 4px 24px rgba(100,70,40,0.08)' },
    panelHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', paddingBottom: '28px', borderBottom: `1px solid ${C.border}` },
    panelTitle: { fontFamily: "'Playfair Display', serif", fontSize: '32px', fontWeight: 900, color: C.brownDark, margin: 0 },
    backBtn: { background: C.surfaceAlt, border: `1px solid ${C.borderDark}`, color: C.brown, padding: '10px 22px', borderRadius: '100px', cursor: 'pointer', fontWeight: 600 },
    addSceneForm: { background: C.brownXLight, border: `1px solid ${C.borderDark}`, borderRadius: '20px', padding: '30px', marginBottom: '40px' },
    textarea: { width: '100%', background: C.white, border: `1px solid ${C.border}`, borderRadius: '14px', padding: '16px 18px', color: C.text, fontSize: '16px', lineHeight: '1.7', outline: 'none', resize: 'vertical', minHeight: '100px', marginBottom: '20px', boxSizing: 'border-box' },
    fileGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' },
    fileBox: { background: C.white, border: `1px dashed ${C.borderDark}`, borderRadius: '12px', padding: '16px' },
    saveBtn: { width: '100%', background: C.brownDark, border: 'none', borderRadius: '14px', padding: '16px', color: C.white, fontWeight: 800, fontSize: '16px', cursor: 'pointer' },
    sceneCard: { background: C.surface, border: `1px solid ${C.border}`, borderRadius: '18px', padding: '28px', marginBottom: '18px', boxShadow: '0 1px 6px rgba(100,70,40,0.05)' },
    sceneNum: { fontFamily: "'Playfair Display', serif", fontSize: '22px', fontWeight: 900, color: C.brown },
    toast: { position: 'fixed', bottom: '30px', left: '50%', transform: 'translateX(-50%)', background: C.greenLight, border: `1px solid ${C.greenBorder}`, color: C.green, padding: '12px 28px', borderRadius: '100px', zIndex: 100 },
  }

  return (
    <>
      <style>{`
        * { box-sizing: border-box; }
        input:focus, textarea:focus { border-color: #a07850 !important; box-shadow: 0 0 0 3px rgba(124,92,62,0.1); }
        button:hover { opacity: 0.85; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: #f5f0eb; } ::-webkit-scrollbar-thumb { background: #c9b9a8; border-radius: 4px; }
      `}</style>

      <div style={styles.root}>
        <div style={styles.container}>
          <header style={styles.header}>
            <div>
              <h1 style={styles.headerTitle}>مدير الحكايات</h1>
              <p style={styles.headerSub}>نظام إدارة المحتوى القصصي</p>
            </div>
            <span style={styles.headerBadge}>✦ لوحة التحكم</span>
          </header>

          <div style={styles.grid}>
            <aside>
              <div style={styles.sidebarCard}>
                <div style={styles.sidebarTitle}><span>✦</span> إضافة حكاية جديدة</div>
                <form onSubmit={addStory}>
                  <input type="text" placeholder="عنوان الحكاية..." value={title} onChange={(e) => setTitle(e.target.value)} style={styles.addInput} required />
                  <button type="submit" style={styles.addBtn} disabled={loading}>{loading ? '...' : '+ أضف حكاية'}</button>
                </form>
              </div>

              <div style={styles.sidebarCard}>
                <div style={styles.sidebarTitle}><span>◈</span> حكاياتي ({stories.length})</div>
                {stories.map(s => (
                  <div key={s.id} onClick={() => selectStory(s)} onMouseEnter={() => setHoveredStory(s.id)} onMouseLeave={() => setHoveredStory(null)} style={styles.storyItem(activeStory?.id === s.id, hoveredStory === s.id)}>
                    <div style={{ fontWeight: activeStory?.id === s.id ? 700 : 500 }}>{s.title}</div>
                    <button onClick={(e) => deleteStory(s.id, e)} style={styles.deleteBtn}>حذف</button>
                  </div>
                ))}
              </div>
            </aside>

            {activeStory && (
              <main style={styles.mainPanel}>
                <div style={styles.panelHeader}>
                  <h2 style={styles.panelTitle}>{activeStory.title}</h2>
                  <button onClick={() => setActiveStory(null)} style={styles.backBtn}>← رجوع</button>
                </div>

                <div style={styles.addSceneForm}>
                  <div style={styles.sidebarTitle}><span>✦</span> إضافة مشهد جديد</div>
                  <form onSubmit={handleAddScene}>
                    <textarea placeholder="اكتب نص المشهد هنا..." value={content} onChange={(e) => setContent(e.target.value)} style={styles.textarea} required />
                    <div style={styles.fileGrid}>
                      <div style={styles.fileBox}>
                        <label style={{fontSize: '11px', fontWeight:700, display:'block', marginBottom:'8px'}}>📹 فيديو المشهد</label>
                        <input type="file" name="video" accept="video/*" required />
                      </div>
                      <div style={styles.fileBox}>
                        <label style={{fontSize: '11px', fontWeight:700, display:'block', marginBottom:'8px'}}>🎙️ صوت الراوي</label>
                        <input type="file" name="audio" accept="audio/*" required />
                      </div>
                    </div>
                    <button type="submit" disabled={loading} style={styles.saveBtn}>{loading ? status : '✦ حفظ ونشر المشهد'}</button>
                  </form>
                </div>

                {scenes.map((sc, i) => (
                  <div key={sc.id} style={styles.sceneCard}>
                    <div style={{display:'flex', justifyContent:'space-between', marginBottom:'15px'}}>
                      <div style={styles.sceneNum}>{String(i + 1).padStart(2, '0')} <span style={{fontSize:'10px', color:C.brownLight}}>مشهد</span></div>
                      <div style={{display:'flex', gap:'10px'}}>
                        <button onClick={() => setEditingSceneId(editingSceneId === sc.id ? null : sc.id)} style={{background:C.blueLight, color:C.blue, border:`1px solid ${C.blueBorder}`, padding:'5px 12px', borderRadius:'8px', cursor:'pointer', fontWeight:600}}>تعديل</button>
                        <button onClick={() => deleteScene(sc.id)} style={{background:C.redLight, color:C.red, border:`1px solid ${C.redBorder}`, padding:'5px 12px', borderRadius:'8px', cursor:'pointer', fontWeight:600}}>حذف</button>
                      </div>
                    </div>

                    {editingSceneId === sc.id ? (
                      <form onSubmit={(e) => handleUpdateScene(e, sc.id)} style={{display:'grid', gap:'15px', background:C.blueLight, padding:'20px', borderRadius:'12px'}}>
                        <textarea name="editContent" defaultValue={sc.content} style={styles.textarea} required />
                        <div style={styles.fileGrid}>
                          <input type="file" name="editVideo" accept="video/*" />
                          <input type="file" name="editAudio" accept="audio/*" />
                        </div>
                        <button type="submit" style={{background:C.green, color:'#fff', padding:'10px', border:'none', borderRadius:'8px', fontWeight:700}}>تحديث المشهد</button>
                      </form>
                    ) : (
                      <>
                        <p style={{fontSize:'17px', lineHeight:'1.8', color:C.textMuted}}>{sc.content}</p>
                        <div style={{display:'flex', gap:'10px', marginTop:'15px'}}>
                          <span style={{fontSize:'11px', background:C.blueLight, color:C.blue, padding:'4px 10px', borderRadius:'100px'}}>📹 فيديو موجود</span>
                          <span style={{fontSize:'11px', background:C.greenLight, color:C.green, padding:'4px 10px', borderRadius:'100px'}}>🎙️ صوت موجود</span>
                        </div>
                      </>
                    )}
                  </div>
                ))}
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