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
  const [openSection, setOpenSection] = useState('scenes') 

  // أسئلة الاختبار (مبدئياً خاوية حتى نعزلو القصة)
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

  // دالة اختيار القصة: هنا فين كنجيبو الداتا الخاصة بيك بوحدك
  async function selectStory(story) {
    setActiveStory(story)
    setOpenSection('scenes')
    setEditingSceneId(null)
    
    // 1. جلب مشاهد هاد القصة فقط
    const { data: scenesData } = await supabase.from('scenes')
      .select('*')
      .eq('story_id', story.id)
      .order('order_index', { ascending: true })
    setScenes(scenesData || [])

    // 2. جلب اختبار هاد القصة فقط (story_id هو الفلتر)
    const { data: quizDataDB } = await supabase.from('quizzes')
      .select('*')
      .eq('story_id', story.id)
      .limit(3)

    if (quizDataDB && quizDataDB.length === 3) {
      setQuizData(quizDataDB)
    } else {
      // إيلا ما كاينش اختبار، كنرجعو الفورم خاوي لهاد القصة
      setQuizData([
        { question: '', options: ['', '', '', ''], correct_answer_index: 0 },
        { question: '', options: ['', '', '', ''], correct_answer_index: 0 },
        { question: '', options: ['', '', '', ''], correct_answer_index: 0 }
      ])
    }
  }

  // دالة حفظ الاختبار: كتمسح القديم ديال هاد القصة وتزيد الجديد ليها
  async function handleSaveQuiz() {
    if (!activeStory) return
    setLoading(true); setStatus('جاري حفظ اختبار القصة...')
    try {
      // كنمسحو فقط الأسئلة اللي مرتبطة بـ story_id الحالي
      await supabase.from('quizzes').delete().eq('story_id', activeStory.id)
      
      const finalQuizzes = quizData.map(q => ({
        story_id: activeStory.id, // الربط بالقصة
        question: q.question,
        options: q.options,
        correct_answer_index: q.correct_answer_index
      }))

      const { error } = await supabase.from('quizzes').insert(finalQuizzes)
      if (!error) setStatus('تم حفظ الاختبار بنجاح ✅')
    } catch (err) { alert('خطأ: ' + err.message) }
    finally { setLoading(false); setTimeout(() => setStatus(''), 2000) }
  }

  // دالة تحديث المشهد
  async function handleUpdateScene(id) {
    setLoading(true)
    const { error } = await supabase.from('scenes').update({ content }).eq('id', id)
    if (!error) {
      setEditingSceneId(null)
      setContent('')
      selectStory(activeStory)
      setStatus('تم تحديث المشهد ✅')
    }
    setLoading(false)
    setTimeout(() => setStatus(''), 2000)
  }

  const C = {
    bg: '#faf7f4', surface: '#ffffff', surfaceAlt:'#f5f0eb',
    border: '#e8ddd3', borderDark:'#c9b9a8', brown: '#7c5c3e',
    brownDark: '#5a3e28', brownMid: '#a07850', brownLight:'#d4bfa8',
    brownXLight:'#ede5dc', white: '#ffffff', red: '#c0392b',
    green: '#2e7d52', text: '#3a2a1a'
  }

  return (
    <div dir="rtl" style={{ minHeight: '100vh', background: C.bg, fontFamily: "'IBM Plex Sans Arabic', sans-serif", color: C.text, paddingBottom: '100px' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 30px' }}>
        
        <header style={{ padding: '40px 0', borderBottom: `2px solid ${C.border}`, marginBottom: '50px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '40px', fontWeight: 900, color: C.brownDark, margin: 0 }}>مدير الحكايات</h1>
            <p style={{ color: C.brownMid, fontSize: '14px', marginTop: '5px' }}>تحكم كامل في كل قصة واختباراتها</p>
          </div>
          <div style={{ background: C.brownXLight, padding: '10px 25px', borderRadius: '50px', color: C.brown, fontWeight: 'bold', fontSize: '13px', border: `1px solid ${C.border}` }}>✦ CMS PREMIUM</div>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: activeStory ? '420px 1fr' : '1fr', gap: '40px' }}>
          
          <aside>
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '24px', padding: '30px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: C.brownMid, marginBottom: '20px' }}>✦ إضافة حكاية جديدة</h3>
              <form onSubmit={async (e) => {
                  e.preventDefault()
                  setLoading(true); setStatus('جاري الحفظ...')
                  const coverFile = e.target.cover.files[0]
                  const fileName = `${Date.now()}_${coverFile.name}`
                  const { error: uploadError } = await supabase.storage.from('story-covers').upload(`covers/${fileName}`, coverFile)
                  if (uploadError) return alert(uploadError.message)
                  const { data: urlData } = supabase.storage.from('story-covers').getPublicUrl(`covers/${fileName}`)
                  const { error } = await supabase.from('stories').insert([{ title, cover_url: urlData.publicUrl }])
                  if (!error) { setTitle(''); e.target.reset(); fetchStories(); setStatus('تمت الإضافة ✅') }
                  setLoading(false); setTimeout(() => setStatus(''), 2000)
              }}>
                <input style={{ width: '100%', padding: '16px', borderRadius: '12px', border: `1px solid ${C.border}`, marginBottom: '15px', background: C.surfaceAlt, outline: 'none' }} placeholder="عنوان القصة..." value={title} onChange={(e) => setTitle(e.target.value)} required />
                <div style={{ padding: '20px', border: `1px dashed ${C.borderDark}`, borderRadius: '12px', marginBottom: '15px', textAlign: 'center' }}>
                  <input type="file" name="cover" accept="image/*" required style={{ fontSize: '12px' }} />
                </div>
                <button type="submit" disabled={loading} style={{ width: '100%', padding: '16px', borderRadius: '12px', background: C.brownDark, color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer' }}>حفظ القصة</button>
              </form>
            </div>

            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '24px', padding: '30px', marginTop: '30px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: C.brownMid, marginBottom: '20px' }}>◈ مكتبة القصص ({stories.length})</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {stories.map(s => (
                  <div key={s.id} onClick={() => selectStory(s)} onMouseEnter={() => setHoveredStory(s.id)} onMouseLeave={() => setHoveredStory(null)} style={{ 
                    display: 'flex', alignItems: 'center', gap: '15px', padding: '15px', borderRadius: '18px', cursor: 'pointer',
                    border: activeStory?.id === s.id ? `2px solid ${C.brown}` : `1px solid ${C.border}`,
                    background: activeStory?.id === s.id ? C.brownXLight : hoveredStory === s.id ? C.surfaceAlt : C.surface,
                    transition: '0.3s'
                  }}>
                    <div style={{ width: '55px', height: '55px', borderRadius: '12px', background: s.cover_url ? `url(${s.cover_url}) center/cover` : C.brownLight, border: `1px solid ${C.border}` }} />
                    <span style={{ fontWeight: activeStory?.id === s.id ? 700 : 500, fontSize: '16px' }}>{s.title}</span>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          {activeStory && (
            <main style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '32px', padding: '45px', boxShadow: '0 10px 40px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '45px', paddingBottom: '30px', borderBottom: `1px solid ${C.border}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '25px' }}>
                  <div style={{ width: '100px', height: '100px', borderRadius: '20px', background: `url(${activeStory.cover_url}) center/cover`, border: `2px solid ${C.border}` }} />
                  <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '36px', color: C.brownDark, margin: 0 }}>{activeStory.title}</h2>
                </div>
                <button onClick={() => setActiveStory(null)} style={{ padding: '12px 30px', borderRadius: '100px', border: `1px solid ${C.borderDark}`, background: C.surfaceAlt, cursor: 'pointer', fontWeight: 600 }}>← خروج</button>
              </div>

              {/* Accordion 1: إدارة المشاهد */}
              <div style={{ marginBottom: '25px' }}>
                <div onClick={() => setOpenSection(openSection === 'scenes' ? '' : 'scenes')} style={{ padding: '22px 35px', background: openSection === 'scenes' ? C.brownXLight : C.surfaceAlt, borderRadius: openSection === 'scenes' ? '22px 22px 0 0' : '22px', display: 'flex', justifyContent: 'space-between', cursor: 'pointer', border: `1px solid ${C.border}` }}>
                  <span style={{ fontWeight: 800, color: C.brownDark }}>✍️ إدارة مشاهد الحكاية</span>
                  <span>{openSection === 'scenes' ? '▲' : '▼'}</span>
                </div>
                {openSection === 'scenes' && (
                  <div style={{ padding: '35px', border: `1px solid ${C.border}`, borderTop: 0, borderRadius: '0 0 22px 22px' }}>
                    {/* فورم الإضافة */}
                    <div style={{ background: C.surfaceAlt, padding: '25px', borderRadius: '20px', marginBottom: '30px' }}>
                      <textarea style={{ width: '100%', padding: '15px', borderRadius: '12px', border: `1px solid ${C.border}`, minHeight: '120px', marginBottom: '15px' }} placeholder="نص المشهد الجديد..." value={!editingSceneId ? content : ''} onChange={(e) => setContent(e.target.value)} />
                      <button onClick={async () => {
                        setLoading(true); setStatus('جاري الحفظ...')
                        // منطق الرفع (نفس اللي عندك)
                        await supabase.from('scenes').insert([{ story_id: activeStory.id, content, order_index: scenes.length + 1 }])
                        setContent(''); selectStory(activeStory)
                        setLoading(false); setStatus('تم الحفظ ✅'); setTimeout(() => setStatus(''), 2000)
                      }} style={{ width: '100%', padding: '15px', borderRadius: '12px', background: C.brownDark, color: 'white', border: 'none', fontWeight: 700 }}>+ حفظ المشهد</button>
                    </div>
                    {/* عرض القائمة مع التعديل */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                      {scenes.map((sc, i) => (
                        <div key={sc.id} style={{ borderRadius: '18px', border: `1px solid ${C.border}`, background: C.bg }}>
                          {editingSceneId !== sc.id ? (
                            <div style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <p style={{ margin: 0, fontSize: '18px', flex: 1 }}>{sc.content}</p>
                              <div style={{ display: 'flex', gap: '15px', marginLeft: '20px' }}>
                                <button onClick={() => { setEditingSceneId(sc.id); setContent(sc.content); }} style={{ color: C.brown, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}>تعديل</button>
                                <button onClick={() => { if(confirm('تمسح؟')) supabase.from('scenes').delete().eq('id', sc.id).then(() => selectStory(activeStory)) }} style={{ color: C.red, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}>حذف</button>
                              </div>
                            </div>
                          ) : (
                            <div style={{ padding: '20px', background: 'white' }}>
                              <textarea style={{ width: '100%', padding: '15px', borderRadius: '10px', border: `2px solid ${C.brown}`, minHeight: '80px', marginBottom: '10px' }} value={content} onChange={(e) => setContent(e.target.value)} />
                              <button onClick={() => handleUpdateScene(sc.id)} style={{ padding: '8px 20px', background: C.green, color: 'white', borderRadius: '8px', border: 'none', marginRight: '10px' }}>حفظ</button>
                              <button onClick={() => setEditingSceneId(null)} style={{ padding: '8px 20px', background: C.surfaceAlt, borderRadius: '8px', border: `1px solid ${C.border}` }}>إلغاء</button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Accordion 2: إدارة الاختبار الخاص بالقصة */}
              <div style={{ marginBottom: '20px' }}>
                <div onClick={() => setOpenSection(openSection === 'quiz' ? '' : 'quiz')} style={{ padding: '22px 35px', background: openSection === 'quiz' ? '#edf7f2' : C.surfaceAlt, borderRadius: openSection === 'quiz' ? '22px 22px 0 0' : '22px', display: 'flex', justifyContent: 'space-between', cursor: 'pointer', border: `1px solid ${C.border}` }}>
                  <span style={{ fontWeight: 800, color: C.green }}>🧠 اختبار الذكاء (خاص بهذه القصة)</span>
                  <span style={{ color: C.green }}>{openSection === 'quiz' ? '▲' : '▼'}</span>
                </div>
                {openSection === 'quiz' && (
                  <div style={{ padding: '35px', border: `1px solid ${C.border}`, borderTop: 0, borderRadius: '0 0 22px 22px' }}>
                    {quizData.map((q, qIndex) => (
                      <div key={qIndex} style={{ padding: '25px', border: `1px solid ${C.border}`, borderRadius: '20px', marginBottom: '25px', background: C.bg }}>
                        <p style={{ fontWeight: 800, color: C.brown, marginBottom: '10px' }}>السؤال {qIndex + 1}</p>
                        <input style={{ width: '100%', padding: '15px', borderRadius: '12px', border: `1px solid ${C.border}`, marginBottom: '15px' }} placeholder="نص السؤال..." value={q.question} onChange={(e) => { const n = [...quizData]; n[qIndex].question = e.target.value; setQuizData(n); }} />
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                          {q.options.map((opt, oIndex) => (
                            <div key={oIndex}>
                              <input style={{ width: '100%', padding: '10px', borderRadius: '10px', border: q.correct_answer_index === oIndex ? `2px solid ${C.green}` : `1px solid ${C.border}` }} value={opt} onChange={(e) => { const n = [...quizData]; n[qIndex].options[oIndex] = e.target.value; setQuizData(n); }} />
                              <button onClick={() => { const n = [...quizData]; n[qIndex].correct_answer_index = oIndex; setQuizData(n); }} style={{ fontSize: '11px', color: q.correct_answer_index === oIndex ? C.green : '#999', cursor: 'pointer', border: 'none', background: 'none', marginTop: '5px', fontWeight: 700 }}>{q.correct_answer_index === oIndex ? '✅ الجواب الصحيح' : 'تحديد كصحيح'}</button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                    <button onClick={handleSaveQuiz} style={{ width: '100%', padding: '18px', borderRadius: '12px', background: C.green, color: 'white', border: 'none', fontWeight: 800 }}>✓ حفظ اختبار هذه الحكاية</button>
                  </div>
                )}
              </div>

            </main>
          )}
        </div>
      </div>
      {status && <div style={{ position: 'fixed', bottom: '40px', left: '50%', transform: 'translateX(-50%)', background: C.brownDark, color: 'white', padding: '15px 45px', borderRadius: '100px', fontWeight: 700, zIndex: 3000, boxShadow: '0 15px 40px rgba(0,0,0,0.2)' }}>{status}</div>}
    </div>
  )
}