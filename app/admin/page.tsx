'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
// 🌟 استدعاء الـ Icons من مكتبة lucide-react 🌟
import { 
  Sparkles, PlusCircle, Library, Trash2, Film, ChevronUp, ChevronDown, 
  ImagePlus, Mic, CheckCircle, BrainCircuit, Edit2, LogOut, Save
} from 'lucide-react'

export default function GlobalCMS() {
  const [stories, setStories] = useState([])
  const [activeStory, setActiveStory] = useState(null)
  const [scenes, setScenes] = useState([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState('')
  const [editingSceneId, setEditingSceneId] = useState(null)
  const [hoveredStory, setHoveredStory] = useState(null)
  const [openSection, setOpenSection] = useState('scenes')

  const [sceneMedia, setSceneMedia] = useState(null) 
  const [sceneAudio, setSceneAudio] = useState(null) 

  const [editContent, setEditContent] = useState('')
  const [editMediaFile, setEditMediaFile] = useState(null)
  const [editAudioFile, setEditAudioFile] = useState(null)

  const [quizData, setQuizData] = useState([
    { question: '', options: ['', '', '', ''], correct_answer_index: 0 },
    { question: '', options: ['', '', '', ''], correct_answer_index: 0 },
    { question: '', options: ['', '', '', ''], correct_answer_index: 0 }
  ])

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

  async function selectStory(story) {
    setActiveStory(story)
    setOpenSection('scenes')
    setEditingSceneId(null)
    const { data: scenesData } = await supabase.from('scenes').select('*').eq('story_id', story.id).order('order_index', { ascending: true })
    setScenes(scenesData || [])
    const { data: quizDataDB } = await supabase.from('quizzes').select('*').eq('story_id', story.id).limit(3)
    if (quizDataDB && quizDataDB.length === 3) { setQuizData(quizDataDB) } else {
      setQuizData([{ question: '', options: ['', '', '', ''], correct_answer_index: 0 }, { question: '', options: ['', '', '', ''], correct_answer_index: 0 }, { question: '', options: ['', '', '', ''], correct_answer_index: 0 }])
    }
  }

  async function handleDeleteStory(e, storyId) {
    e.stopPropagation() 
    if (!confirm('واش متأكد بغيتي تمسح هاد القصة كلياً من المنصة؟')) return
    setLoading(true)
    setStatus('جاري الحذف...')
    
    const { error } = await supabase.from('stories').delete().eq('id', storyId)
    
    if (!error) {
      if (activeStory?.id === storyId) setActiveStory(null)
      fetchStories()
      setStatus('تم المسح بنجاح')
    } else {
      alert('خطأ فالحذف: ' + error.message)
    }
    setLoading(false); setTimeout(() => setStatus(''), 2000)
  }

  async function uploadToMedia(file) {
    if (!file) return null
    const fileName = `scenes/${Date.now()}_${file.name.replace(/\s/g, '_')}`
    const { data, error } = await supabase.storage.from('media').upload(fileName, file)
    if (error) throw error
    const { data: urlData } = supabase.storage.from('media').getPublicUrl(fileName)
    return urlData.publicUrl
  }

  async function handleAddScene() {
    if (!content) return alert('عافاك اكتب نص المشهد')
    setLoading(true); setStatus('جاري رفع الملفات والحفظ...')
    try {
      const videoUrl = await uploadToMedia(sceneMedia)
      const audioUrl = await uploadToMedia(sceneAudio)

      const { error } = await supabase.from('scenes').insert([{
        story_id: activeStory.id,
        content: content,
        video_url: videoUrl,
        audio_url: audioUrl,
        order_index: scenes.length + 1
      }])

      if (error) throw error

      setContent(''); setSceneMedia(null); setSceneAudio(null)
      await selectStory(activeStory)
      setStatus('تم حفظ المشهد بنجاح')
    } catch (err) {
      alert('فشل الرفع: ' + err.message)
      console.error(err)
    } finally {
      setLoading(false); setTimeout(() => setStatus(''), 2000)
    }
  }

  async function saveSceneEdit(sc) {
    setLoading(true); setStatus('جاري تحديث المشهد والميديا...')
    
    let updatedVideoUrl = sc.video_url
    let updatedAudioUrl = sc.audio_url

    try {
      if (editMediaFile) updatedVideoUrl = await uploadToMedia(editMediaFile)
      if (editAudioFile) updatedAudioUrl = await uploadToMedia(editAudioFile)

      const { error } = await supabase.from('scenes').update({ 
        content: editContent,
        video_url: updatedVideoUrl,
        audio_url: updatedAudioUrl
      }).eq('id', sc.id)

      if (error) throw error

      setEditingSceneId(null)
      await selectStory(activeStory)
      setStatus('تم تحديث المشهد بنجاح')
    } catch (err) {
      alert('فشل التحديث: ' + err.message)
    } finally {
      setLoading(false); setTimeout(() => setStatus(''), 2000)
    }
  }

  async function handleSaveQuiz() {
    if (!activeStory) return
    setLoading(true); setStatus('جاري حفظ اختبار القصة...')
    try {
      await supabase.from('quizzes').delete().eq('story_id', activeStory.id)
      const finalQuizzes = quizData.map(q => ({ story_id: activeStory.id, question: q.question, options: q.options, correct_answer_index: q.correct_answer_index }))
      const { error } = await supabase.from('quizzes').insert(finalQuizzes)
      if (!error) setStatus('تم حفظ الاختبار بنجاح')
    } catch (err) { alert('خطأ: ' + err.message) }
    finally { setLoading(false); setTimeout(() => setStatus(''), 2000) }
  }

  const C = {
    bg: '#faf7f4', surface: '#ffffff', surfaceAlt: '#f5f0eb',
    border: '#e8ddd3', borderDark: '#c9b9a8', brown: '#7c5c3e',
    brownDark: '#5a3e28', brownMid: '#a07850', brownLight: '#d4bfa8',
    brownXLight: '#ede5dc', white: '#ffffff', red: '#c0392b',
    green: '#2e7d52', text: '#3a2a1a'
  }

  return (
    <div dir="rtl" style={{ minHeight: '100vh', background: C.bg, fontFamily: "'IBM Plex Sans Arabic', sans-serif", color: C.text, paddingBottom: '100px' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 30px' }}>
        
        <header style={{ padding: '40px 0', borderBottom: `2px solid ${C.border}`, marginBottom: '50px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontFamily: "'Poppins', sans-serif", fontSize: '40px', fontWeight:700, color: C.brownDark, margin: 0 }}>Content Management System</h1>
            <p style={{ color: C.brownMid, fontSize: '14px', marginTop: '5px' }}>تحكم كامل في كل قصة واختباراتها</p>
          </div>
          <div style={{ background: C.brownXLight, padding: '10px 25px', borderRadius: '50px', color: C.brown, fontWeight: 'bold', fontSize: '13px', border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sparkles size={16} /> 
          </div>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: activeStory ? '420px 1fr' : '1fr', gap: '40px' }}>
          <aside>
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '24px', padding: '30px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: C.brownMid, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <PlusCircle size={18} /> إضافة حكاية جديدة
              </h3>
              <form onSubmit={async (e) => {
                  e.preventDefault(); setLoading(true); setStatus('جاري الحفظ...')
                  const coverFile = e.target.cover.files[0]
                  const fileName = `${Date.now()}_${coverFile.name}`
                  await supabase.storage.from('story-covers').upload(`covers/${fileName}`, coverFile)
                  const { data: urlData } = supabase.storage.from('story-covers').getPublicUrl(`covers/${fileName}`)
                  const { error } = await supabase.from('stories').insert([{ title, description, cover_url: urlData.publicUrl }])
                  if (!error) { setTitle(''); setDescription(''); e.target.reset(); fetchStories(); setStatus('تمت الإضافة بنجاح') }
                  setLoading(false); setTimeout(() => setStatus(''), 2000)
              }}>
                <input style={{ width: '100%', padding: '16px', borderRadius: '12px', border: `1px solid ${C.border}`, marginBottom: '15px', background: C.surfaceAlt }} placeholder="عنوان القصة..." value={title} onChange={(e) => setTitle(e.target.value)} required />
                
                <textarea 
                  style={{ width: '100%', padding: '16px', borderRadius: '12px', border: `1px solid ${C.border}`, marginBottom: '15px', background: C.surfaceAlt, minHeight: '80px', resize: 'none' }} 
                  placeholder="وصف القصة (بالفرنسية أو الإنجليزية)..." 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                  required 
                />

                <div style={{ padding: '20px', border: `1px dashed ${C.borderDark}`, borderRadius: '12px', marginBottom: '15px', textAlign: 'center' }}>
                  <input type="file" name="cover" accept="image/*" required style={{ fontSize: '12px' }} />
                </div>
                <button type="submit" disabled={loading} style={{ width: '100%', padding: '16px', borderRadius: '12px', background: C.brownDark, color: 'white', border: 'none', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <Save size={18} /> حفظ القصة
                </button>
              </form>
            </div>

            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '24px', padding: '30px', marginTop: '30px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: C.brownMid, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Library size={18} /> مكتبة القصص ({stories.length})
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {stories.map(s => (
                  <div key={s.id} onClick={() => selectStory(s)} onMouseEnter={() => setHoveredStory(s.id)} onMouseLeave={() => setHoveredStory(null)} style={{ 
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px', borderRadius: '18px', cursor: 'pointer',
                    border: activeStory?.id === s.id ? `2px solid ${C.brown}` : `1px solid ${C.border}`,
                    background: activeStory?.id === s.id ? C.brownXLight : hoveredStory === s.id ? C.surfaceAlt : C.surface, transition: '0.3s'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                      <div style={{ width: '55px', height: '55px', borderRadius: '12px', background: s.cover_url ? `url(${s.cover_url}) center/cover` : C.brownLight, border: `1px solid ${C.border}` }} />
                      <span style={{ fontWeight: 600 }}>{s.title}</span>
                    </div>
                    <button 
                      onClick={(e) => handleDeleteStory(e, s.id)} 
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.red, opacity: hoveredStory === s.id || activeStory?.id === s.id ? 1 : 0.3, transition: '0.3s' }} 
                      title="مسح القصة كلياً"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          {activeStory && (
            <main style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '32px', padding: '45px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '45px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '25px' }}>
                    <div style={{ width: '80px', height: '80px', borderRadius: '20px', background: `url(${activeStory.cover_url}) center/cover`, border: `2px solid ${C.border}` }} />
                    <h2 style={{ fontSize: '32px', color: C.brownDark, margin: 0 }}>{activeStory.title}</h2>
                  </div>
                  <button onClick={() => setActiveStory(null)} style={{ padding: '10px 25px', borderRadius: '50px', border: `1px solid ${C.borderDark}`, background: C.surfaceAlt, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <LogOut size={16} /> خروج
                  </button>
              </div>

              {/* Accordion المشاهد */}
              <div style={{ marginBottom: '25px' }}>
                <div onClick={() => setOpenSection(openSection === 'scenes' ? '' : 'scenes')} style={{ padding: '22px 35px', background: C.brownXLight, borderRadius: '22px 22px 0 0', display: 'flex', justifyContent: 'space-between', cursor: 'pointer', border: `1px solid ${C.border}` }}>
                  <span style={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Film size={20} /> إدارة مشاهد الحكاية (نص + ميديا)
                  </span>
                  <span>{openSection === 'scenes' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}</span>
                </div>
                {openSection === 'scenes' && (
                  <div style={{ padding: '35px', border: `1px solid ${C.border}`, borderTop: 0, borderRadius: '0 0 22px 22px' }}>
                    
                    <div style={{ background: C.surfaceAlt, padding: '25px', borderRadius: '20px', marginBottom: '30px' }}>
                      <textarea style={{ width: '100%', padding: '15px', borderRadius: '12px', border: `1px solid ${C.border}`, minHeight: '100px', marginBottom: '20px' }} placeholder="نص المشهد..." value={content} onChange={(e) => setContent(e.target.value)} />
                      
                      <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
                        <label style={{ flex: 1, padding: '15px', border: `2px dashed ${C.borderDark}`, borderRadius: '12px', textAlign: 'center', cursor: 'pointer', background: sceneMedia ? '#f0fff4' : 'white' }}>
                          <span style={{fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: sceneMedia ? C.green : C.text}}>
                            {sceneMedia ? <><CheckCircle size={16}/> ميديا مختارة</> : <><ImagePlus size={16}/> ارفع ميديا (فيديو/صورة)</>}
                          </span>
                          <input type="file" hidden onChange={(e) => setSceneMedia(e.target.files[0])} />
                        </label>
                        <label style={{ flex: 1, padding: '15px', border: `2px dashed ${C.borderDark}`, borderRadius: '12px', textAlign: 'center', cursor: 'pointer', background: sceneAudio ? '#f0fff4' : 'white' }}>
                          <span style={{fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: sceneAudio ? C.green : C.text}}>
                            {sceneAudio ? <><CheckCircle size={16}/> صوت مختار</> : <><Mic size={16}/> ارفع ملف صوتي</>}
                          </span>
                          <input type="file" hidden accept="audio/*" onChange={(e) => setSceneAudio(e.target.files[0])} />
                        </label>
                      </div>

                      <button onClick={handleAddScene} disabled={loading} style={{ width: '100%', padding: '15px', borderRadius: '12px', background: C.brownDark, color: 'white', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        {loading ? 'جاري الحفظ...' : <><PlusCircle size={18}/> حفظ المشهد بالوسائط</>}
                      </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                      {scenes.map((sc) => (
                        <div key={sc.id} style={{ borderRadius: '18px', border: `1px solid ${C.border}`, background: C.bg, padding: '20px' }}>
                          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                            <div style={{ width: '100px', height: '70px', borderRadius: '10px', background: sc.video_url ? `url(${sc.video_url}) center/cover` : '#eee', border: `1px solid ${C.border}` }} />
                            
                            <div style={{flex: 1}}>
                              {editingSceneId === sc.id ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                  <textarea 
                                    value={editContent} 
                                    onChange={(e) => setEditContent(e.target.value)}
                                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: `1px solid ${C.border}`, minHeight: '60px' }}
                                  />
                                  <div style={{ display: 'flex', gap: '10px' }}>
                                    <label style={{ flex: 1, padding: '8px', border: `1px dashed ${C.borderDark}`, borderRadius: '8px', textAlign: 'center', cursor: 'pointer', background: editMediaFile ? '#f0fff4' : 'white', fontSize: '11px', fontWeight: 600 }}>
                                      <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', color: editMediaFile ? C.green : C.text }}>
                                        {editMediaFile ? <><CheckCircle size={14}/> ميديا جديدة اختيرت</> : <><ImagePlus size={14}/> تغيير الميديا</>}
                                      </span>
                                      <input type="file" hidden onChange={(e) => setEditMediaFile(e.target.files[0])} />
                                    </label>
                                    <label style={{ flex: 1, padding: '8px', border: `1px dashed ${C.borderDark}`, borderRadius: '8px', textAlign: 'center', cursor: 'pointer', background: editAudioFile ? '#f0fff4' : 'white', fontSize: '11px', fontWeight: 600 }}>
                                      <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', color: editAudioFile ? C.green : C.text }}>
                                        {editAudioFile ? <><CheckCircle size={14}/> صوت جديد اختير</> : <><Mic size={14}/> تغيير الصوت</>}
                                      </span>
                                      <input type="file" hidden accept="audio/*" onChange={(e) => setEditAudioFile(e.target.files[0])} />
                                    </label>
                                  </div>
                                  <div style={{ display: 'flex', gap: '10px' }}>
                                    <button onClick={() => saveSceneEdit(sc)} disabled={loading} style={{ flex: 1, background: C.green, color: 'white', border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
                                      {loading ? 'يتم التحديث...' : 'حفظ التعديل'}
                                    </button>
                                    <button onClick={() => setEditingSceneId(null)} style={{ background: C.surfaceAlt, color: C.text, border: `1px solid ${C.border}`, padding: '8px 15px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>إلغاء</button>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <p style={{ margin: 0, fontWeight: 600 }}>{sc.content}</p>
                                  {sc.audio_url && <audio src={sc.audio_url} controls style={{height: '30px', marginTop: '10px', width: '200px'}} />}
                                </>
                              )}
                            </div>
                            
                            {editingSceneId !== sc.id && (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                  <button onClick={() => {
                                    setEditingSceneId(sc.id)
                                    setEditContent(sc.content)
                                    setEditMediaFile(null)
                                    setEditAudioFile(null)
                                  }} style={{ color: C.green, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    <Edit2 size={16} /> تعديل
                                  </button>
                                  <button onClick={() => { if(confirm('تمسح المشهد؟')) supabase.from('scenes').delete().eq('id', sc.id).then(() => selectStory(activeStory)) }} style={{ color: C.red, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    <Trash2 size={16} /> حذف
                                  </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 🌟 Accordion الاختبار المصلح والاحترافي 🌟 */}
              <div style={{ marginBottom: '20px' }}>
                <div onClick={() => setOpenSection(openSection === 'quiz' ? '' : 'quiz')} style={{ padding: '22px 35px', background: openSection === 'quiz' ? '#edf7f2' : C.surfaceAlt, borderRadius: openSection === 'quiz' ? '22px 22px 0 0' : '22px', display: 'flex', justifyContent: 'space-between', cursor: 'pointer', border: `1px solid ${C.border}` }}>
                  <span style={{ fontWeight: 800, color: C.green, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <BrainCircuit size={20} /> اختبار الذكاء
                  </span>
                  <span>{openSection === 'quiz' ? <ChevronUp size={20} color={C.green} /> : <ChevronDown size={20} color={C.green} />}</span>
                </div>
                {openSection === 'quiz' && (
                  <div style={{ padding: '35px', border: `1px solid ${C.border}`, borderTop: 0, borderRadius: '0 0 22px 22px' }}>
                    {quizData.map((q, qIndex) => (
                      <div key={qIndex} style={{ padding: '25px', border: `1px solid ${C.border}`, borderRadius: '20px', marginBottom: '20px', background: C.bg }}>
                        
                        {/* إدخال السؤال مع الـ Placeholder */}
                        <input 
                          placeholder={`السؤال ${qIndex + 1}...`}
                          style={{ width: '100%', padding: '12px', borderRadius: '10px', border: `1px solid ${C.border}`, marginBottom: '15px', fontWeight: 600, outline: 'none' }} 
                          value={q.question} 
                          onChange={(e) => { const n = [...quizData]; n[qIndex].question = e.target.value; setQuizData(n); }} 
                        />
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                          {q.options.map((opt, oIndex) => {
                            const isCorrect = q.correct_answer_index === oIndex;
                            return (
                              <div key={oIndex} style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                
                                {/* زر اختيار الجواب الصحيح */}
                                <button
                                  type="button"
                                  onClick={(e) => { e.preventDefault(); const n = [...quizData]; n[qIndex].correct_answer_index = oIndex; setQuizData(n); }}
                                  style={{
                                    position: 'absolute',
                                    right: '12px',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: isCorrect ? C.green : '#ccc',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: 0,
                                    transition: 'color 0.2s'
                                  }}
                                  title="تعيين كجواب صحيح"
                                >
                                  <CheckCircle size={18} />
                                </button>

                                {/* إدخال الخيار مع الـ Placeholder المتغير */}
                                <input 
                                  placeholder={isCorrect ? `الخيار ${oIndex + 1} (الجواب الصحيح)` : `الخيار ${oIndex + 1}...`}
                                  style={{ 
                                    width: '100%', 
                                    padding: '12px 35px 12px 12px', // خلينا مسافة ف اليمين باش ما يغطيش على الأيقونة
                                    borderRadius: '8px', 
                                    border: isCorrect ? `2px solid ${C.green}` : `1px solid ${C.border}`,
                                    background: isCorrect ? '#f0fff4' : '#fff',
                                    outline: 'none',
                                    transition: 'all 0.2s'
                                  }} 
                                  value={opt} 
                                  onChange={(e) => { const n = [...quizData]; n[qIndex].options[oIndex] = e.target.value; setQuizData(n); }} 
                                />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                    <button onClick={handleSaveQuiz} disabled={loading} style={{ width: '100%', padding: '15px', borderRadius: '12px', background: C.green, color: 'white', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      <Save size={18} /> حفظ الاختبار
                    </button>
                  </div>
                )}
              </div>
            </main>
          )}
        </div>
      </div>
      {status && <div style={{ position: 'fixed', bottom: '40px', left: '50%', transform: 'translateX(-50%)', background: C.brownDark, color: 'white', padding: '15px 45px', borderRadius: '100px', fontWeight: 700, zIndex: 3000, display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle size={18}/> {status}</div>}
    </div>
  )
}

// 'use client'
// import { useState, useEffect } from 'react'
// import { supabase } from '@/lib/supabase'

// export default function GlobalCMS() {
//   const [stories, setStories] = useState([])
//   const [activeStory, setActiveStory] = useState(null)
//   const [scenes, setScenes] = useState([])
//   const [title, setTitle] = useState('')
//   const [content, setContent] = useState('')
//   const [loading, setLoading] = useState(false)
//   const [status, setStatus] = useState('')
//   const [editingSceneId, setEditingSceneId] = useState(null)
//   const [hoveredStory, setHoveredStory] = useState(null)
//   const [openSection, setOpenSection] = useState('scenes')

//   // --- إضافات الميديا الجديدة ---
//   const [sceneMedia, setSceneMedia] = useState(null) // للصورة أو الفيديو (video_url)
//   const [sceneAudio, setSceneAudio] = useState(null) // للصوت (audio_url)

//   const [quizData, setQuizData] = useState([
//     { question: '', options: ['', '', '', ''], correct_answer_index: 0 },
//     { question: '', options: ['', '', '', ''], correct_answer_index: 0 },
//     { question: '', options: ['', '', '', ''], correct_answer_index: 0 }
//   ])

//   useEffect(() => {
//     fetchStories()
//     const link = document.createElement('link')
//     link.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&display=swap'
//     link.rel = 'stylesheet'
//     document.head.appendChild(link)
//   }, [])

//   async function fetchStories() {
//     const { data } = await supabase.from('stories').select('*').order('created_at', { ascending: false })
//     setStories(data || [])
//   }

//   async function selectStory(story) {
//     setActiveStory(story)
//     setOpenSection('scenes')
//     setEditingSceneId(null)
//     const { data: scenesData } = await supabase.from('scenes').select('*').eq('story_id', story.id).order('order_index', { ascending: true })
//     setScenes(scenesData || [])
//     const { data: quizDataDB } = await supabase.from('quizzes').select('*').eq('story_id', story.id).limit(3)
//     if (quizDataDB && quizDataDB.length === 3) { setQuizData(quizDataDB) } else {
//       setQuizData([{ question: '', options: ['', '', '', ''], correct_answer_index: 0 }, { question: '', options: ['', '', '', ''], correct_answer_index: 0 }, { question: '', options: ['', '', '', ''], correct_answer_index: 0 }])
//     }
//   }

//   // دالة الرفع المصلحة
//   async function uploadToMedia(file) {
//     if (!file) return null
//     const fileName = `scenes/${Date.now()}_${file.name.replace(/\s/g, '_')}`
//     const { data, error } = await supabase.storage.from('media').upload(fileName, file)
//     if (error) throw error
//     const { data: urlData } = supabase.storage.from('media').getPublicUrl(fileName)
//     return urlData.publicUrl
//   }

//   async function handleAddScene() {
//     if (!content) return alert('عافاك اكتب نص المشهد')
//     setLoading(true); setStatus('جاري رفع الملفات والحفظ...')
//     try {
//       // 1. رفع الميديا أولاً
//       const videoUrl = await uploadToMedia(sceneMedia)
//       const audioUrl = await uploadToMedia(sceneAudio)

//       // 2. حفظ البيانات في الجدول (باستعمال السميات اللي فالتصويرة ديالك)
//       const { error } = await supabase.from('scenes').insert([{
//         story_id: activeStory.id,
//         content: content,
//         video_url: videoUrl,
//         audio_url: audioUrl,
//         order_index: scenes.length + 1
//       }])

//       if (error) throw error

//       setContent(''); setSceneMedia(null); setSceneAudio(null)
//       await selectStory(activeStory)
//       setStatus('تم حفظ المشهد بنجاح ✅')
//     } catch (err) {
//       alert('فشل الرفع: ' + err.message)
//       console.error(err)
//     } finally {
//       setLoading(false); setTimeout(() => setStatus(''), 2000)
//     }
//   }

//   async function handleUpdateScene(id) {
//     setLoading(true)
//     const { error } = await supabase.from('scenes').update({ content }).eq('id', id)
//     if (!error) { setEditingSceneId(null); setContent(''); selectStory(activeStory); setStatus('تم تحديث المشهد ✅') }
//     setLoading(false); setTimeout(() => setStatus(''), 2000)
//   }

//   async function handleSaveQuiz() {
//     if (!activeStory) return
//     setLoading(true); setStatus('جاري حفظ اختبار القصة...')
//     try {
//       await supabase.from('quizzes').delete().eq('story_id', activeStory.id)
//       const finalQuizzes = quizData.map(q => ({ story_id: activeStory.id, question: q.question, options: q.options, correct_answer_index: q.correct_answer_index }))
//       const { error } = await supabase.from('quizzes').insert(finalQuizzes)
//       if (!error) setStatus('تم حفظ الاختبار بنجاح ✅')
//     } catch (err) { alert('خطأ: ' + err.message) }
//     finally { setLoading(false); setTimeout(() => setStatus(''), 2000) }
//   }

//   const C = {
//     bg: '#faf7f4', surface: '#ffffff', surfaceAlt: '#f5f0eb',
//     border: '#e8ddd3', borderDark: '#c9b9a8', brown: '#7c5c3e',
//     brownDark: '#5a3e28', brownMid: '#a07850', brownLight: '#d4bfa8',
//     brownXLight: '#ede5dc', white: '#ffffff', red: '#c0392b',
//     green: '#2e7d52', text: '#3a2a1a'
//   }

//   return (
//     <div dir="rtl" style={{ minHeight: '100vh', background: C.bg, fontFamily: "'IBM Plex Sans Arabic', sans-serif", color: C.text, paddingBottom: '100px' }}>
//       <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 30px' }}>
        
//         <header style={{ padding: '40px 0', borderBottom: `2px solid ${C.border}`, marginBottom: '50px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//           <div>
//             <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '40px', fontWeight: 900, color: C.brownDark, margin: 0 }}>مدير الحكايات</h1>
//             <p style={{ color: C.brownMid, fontSize: '14px', marginTop: '5px' }}>تحكم كامل في كل قصة واختباراتها</p>
//           </div>
//           <div style={{ background: C.brownXLight, padding: '10px 25px', borderRadius: '50px', color: C.brown, fontWeight: 'bold', fontSize: '13px', border: `1px solid ${C.border}` }}>✦ CMS PREMIUM</div>
//         </header>

//         <div style={{ display: 'grid', gridTemplateColumns: activeStory ? '420px 1fr' : '1fr', gap: '40px' }}>
//           <aside>
//             <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '24px', padding: '30px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
//               <h3 style={{ fontSize: '15px', fontWeight: 700, color: C.brownMid, marginBottom: '20px' }}>✦ إضافة حكاية جديدة</h3>
//               <form onSubmit={async (e) => {
//                   e.preventDefault(); setLoading(true); setStatus('جاري الحفظ...')
//                   const coverFile = e.target.cover.files[0]
//                   const fileName = `${Date.now()}_${coverFile.name}`
//                   await supabase.storage.from('story-covers').upload(`covers/${fileName}`, coverFile)
//                   const { data: urlData } = supabase.storage.from('story-covers').getPublicUrl(`covers/${fileName}`)
//                   const { error } = await supabase.from('stories').insert([{ title, cover_url: urlData.publicUrl }])
//                   if (!error) { setTitle(''); e.target.reset(); fetchStories(); setStatus('تمت الإضافة ✅') }
//                   setLoading(false); setTimeout(() => setStatus(''), 2000)
//               }}>
//                 <input style={{ width: '100%', padding: '16px', borderRadius: '12px', border: `1px solid ${C.border}`, marginBottom: '15px', background: C.surfaceAlt }} placeholder="عنوان القصة..." value={title} onChange={(e) => setTitle(e.target.value)} required />
//                 <div style={{ padding: '20px', border: `1px dashed ${C.borderDark}`, borderRadius: '12px', marginBottom: '15px', textAlign: 'center' }}>
//                   <input type="file" name="cover" accept="image/*" required style={{ fontSize: '12px' }} />
//                 </div>
//                 <button type="submit" disabled={loading} style={{ width: '100%', padding: '16px', borderRadius: '12px', background: C.brownDark, color: 'white', border: 'none', fontWeight: 700 }}>حفظ القصة</button>
//               </form>
//             </div>

//             <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '24px', padding: '30px', marginTop: '30px' }}>
//               <h3 style={{ fontSize: '15px', fontWeight: 700, color: C.brownMid, marginBottom: '20px' }}>◈ مكتبة القصص ({stories.length})</h3>
//               <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
//                 {stories.map(s => (
//                   <div key={s.id} onClick={() => selectStory(s)} onMouseEnter={() => setHoveredStory(s.id)} onMouseLeave={() => setHoveredStory(null)} style={{ 
//                     display: 'flex', alignItems: 'center', gap: '15px', padding: '15px', borderRadius: '18px', cursor: 'pointer',
//                     border: activeStory?.id === s.id ? `2px solid ${C.brown}` : `1px solid ${C.border}`,
//                     background: activeStory?.id === s.id ? C.brownXLight : hoveredStory === s.id ? C.surfaceAlt : C.surface, transition: '0.3s'
//                   }}>
//                     <div style={{ width: '55px', height: '55px', borderRadius: '12px', background: s.cover_url ? `url(${s.cover_url}) center/cover` : C.brownLight, border: `1px solid ${C.border}` }} />
//                     <span style={{ fontWeight: 600 }}>{s.title}</span>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </aside>

//           {activeStory && (
//             <main style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '32px', padding: '45px' }}>
//               <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '45px' }}>
//                   <div style={{ display: 'flex', alignItems: 'center', gap: '25px' }}>
//                     <div style={{ width: '80px', height: '80px', borderRadius: '20px', background: `url(${activeStory.cover_url}) center/cover`, border: `2px solid ${C.border}` }} />
//                     <h2 style={{ fontSize: '32px', color: C.brownDark, margin: 0 }}>{activeStory.title}</h2>
//                   </div>
//                   <button onClick={() => setActiveStory(null)} style={{ padding: '10px 25px', borderRadius: '50px', border: `1px solid ${C.borderDark}`, background: C.surfaceAlt, fontWeight: 600 }}>خروج</button>
//               </div>

//               {/* Accordion المشاهد المصلح */}
//               <div style={{ marginBottom: '25px' }}>
//                 <div onClick={() => setOpenSection(openSection === 'scenes' ? '' : 'scenes')} style={{ padding: '22px 35px', background: C.brownXLight, borderRadius: '22px 22px 0 0', display: 'flex', justifyContent: 'space-between', cursor: 'pointer', border: `1px solid ${C.border}` }}>
//                   <span style={{ fontWeight: 800 }}>🎬 إدارة مشاهد الحكاية (نص + ميديا)</span>
//                   <span>{openSection === 'scenes' ? '▲' : '▼'}</span>
//                 </div>
//                 {openSection === 'scenes' && (
//                   <div style={{ padding: '35px', border: `1px solid ${C.border}`, borderTop: 0, borderRadius: '0 0 22px 22px' }}>
                    
//                     <div style={{ background: C.surfaceAlt, padding: '25px', borderRadius: '20px', marginBottom: '30px' }}>
//                       <textarea style={{ width: '100%', padding: '15px', borderRadius: '12px', border: `1px solid ${C.border}`, minHeight: '100px', marginBottom: '20px' }} placeholder="نص المشهد..." value={content} onChange={(e) => setContent(e.target.value)} />
                      
//                       <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
//                         <label style={{ flex: 1, padding: '15px', border: `2px dashed ${C.borderDark}`, borderRadius: '12px', textAlign: 'center', cursor: 'pointer', background: sceneMedia ? '#f0fff4' : 'white' }}>
//                           <span style={{fontSize: '13px', fontWeight: 700}}>{sceneMedia ? '✅ ميديا مختارة' : '🖼️ ارفع ميديا (فيديو/صورة)'}</span>
//                           <input type="file" hidden onChange={(e) => setSceneMedia(e.target.files[0])} />
//                         </label>
//                         <label style={{ flex: 1, padding: '15px', border: `2px dashed ${C.borderDark}`, borderRadius: '12px', textAlign: 'center', cursor: 'pointer', background: sceneAudio ? '#f0fff4' : 'white' }}>
//                           <span style={{fontSize: '13px', fontWeight: 700}}>{sceneAudio ? '✅ صوت مختار' : '🎙️ ارفع ملف صوتي'}</span>
//                           <input type="file" hidden accept="audio/*" onChange={(e) => setSceneAudio(e.target.files[0])} />
//                         </label>
//                       </div>

//                       <button onClick={handleAddScene} disabled={loading} style={{ width: '100%', padding: '15px', borderRadius: '12px', background: C.brownDark, color: 'white', fontWeight: 700 }}>
//                         {loading ? 'جاري الحفظ...' : '+ حفظ المشهد بالوسائط'}
//                       </button>
//                     </div>

//                     <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
//                       {scenes.map((sc) => (
//                         <div key={sc.id} style={{ borderRadius: '18px', border: `1px solid ${C.border}`, background: C.bg, padding: '20px' }}>
//                             <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
//                                 <div style={{ width: '100px', height: '70px', borderRadius: '10px', background: sc.video_url ? `url(${sc.video_url}) center/cover` : '#eee', border: `1px solid ${C.border}` }} />
//                                 <div style={{flex: 1}}>
//                                     <p style={{ margin: 0, fontWeight: 600 }}>{sc.content}</p>
//                                     {sc.audio_url && <audio src={sc.audio_url} controls style={{height: '30px', marginTop: '10px', width: '200px'}} />}
//                                 </div>
//                                 <button onClick={() => { if(confirm('تمسح؟')) supabase.from('scenes').delete().eq('id', sc.id).then(() => selectStory(activeStory)) }} style={{ color: C.red, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}>حذف</button>
//                             </div>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 )}
//               </div>

//               {/* Accordion الاختبار (نفس اللي كان عندك) */}
//               <div style={{ marginBottom: '20px' }}>
//                 <div onClick={() => setOpenSection(openSection === 'quiz' ? '' : 'quiz')} style={{ padding: '22px 35px', background: openSection === 'quiz' ? '#edf7f2' : C.surfaceAlt, borderRadius: openSection === 'quiz' ? '22px 22px 0 0' : '22px', display: 'flex', justifyContent: 'space-between', cursor: 'pointer', border: `1px solid ${C.border}` }}>
//                   <span style={{ fontWeight: 800, color: C.green }}>🧠 اختبار الذكاء</span>
//                   <span>{openSection === 'quiz' ? '▲' : '▼'}</span>
//                 </div>
//                 {openSection === 'quiz' && (
//                   <div style={{ padding: '35px', border: `1px solid ${C.border}`, borderTop: 0, borderRadius: '0 0 22px 22px' }}>
//                     {quizData.map((q, qIndex) => (
//                       <div key={qIndex} style={{ padding: '25px', border: `1px solid ${C.border}`, borderRadius: '20px', marginBottom: '20px', background: C.bg }}>
//                         <input style={{ width: '100%', padding: '12px', borderRadius: '10px', border: `1px solid ${C.border}`, marginBottom: '10px' }} value={q.question} onChange={(e) => { const n = [...quizData]; n[qIndex].question = e.target.value; setQuizData(n); }} />
//                         <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
//                           {q.options.map((opt, oIndex) => (
//                             <input key={oIndex} style={{ padding: '10px', borderRadius: '8px', border: q.correct_answer_index === oIndex ? `2px solid ${C.green}` : `1px solid ${C.border}` }} value={opt} onChange={(e) => { const n = [...quizData]; n[qIndex].options[oIndex] = e.target.value; setQuizData(n); }} />
//                           ))}
//                         </div>
//                       </div>
//                     ))}
//                     <button onClick={handleSaveQuiz} style={{ width: '100%', padding: '15px', borderRadius: '12px', background: C.green, color: 'white', fontWeight: 800 }}>حفظ الاختبار</button>
//                   </div>
//                 )}
//               </div>
//             </main>
//           )}
//         </div>
//       </div>
//       {status && <div style={{ position: 'fixed', bottom: '40px', left: '50%', transform: 'translateX(-50%)', background: C.brownDark, color: 'white', padding: '15px 45px', borderRadius: '100px', fontWeight: 700, zIndex: 3000 }}>{status}</div>}
//     </div>
//   )
// }