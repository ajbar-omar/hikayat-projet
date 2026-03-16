'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(false)
  const [loading, setLoading] = useState(false)
  const [emailError, setEmailError] = useState('') 
  const [status, setStatus] = useState<'idle' | 'check_email' | 'verified'>('idle')
  const [formData, setFormData] = useState({
    parentName: '', email: '', phone: '', kidName: '', kidAge: 8, password: ''
  })

  useEffect(() => {
    const checkSession = async () => {
      const hasToken = window.location.hash.includes('access_token')
      const { data: { session } } = await supabase.auth.getSession()
      if (session && hasToken) {
        setStatus('verified')
        window.history.replaceState(null, '', window.location.pathname)
      }
    }
    checkSession()
  }, [])

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setEmailError('')

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      })
      if (error) setEmailError('خطأ في كلمة المرور أو الإيميل غير موجود')
      else window.location.href = '/stories'
    } else {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth`, 
          data: {
            parent_name: formData.parentName,
            phone: formData.phone,
            kid_name: formData.kidName,
            kid_age: formData.kidAge,
          }
        }
      })
      
      if (error) {
        // إظهار الرسالة تحت الـ Input في حالة كان الإيميل مسجل
        if (error.message.toLowerCase().includes('already registered')) {
          setEmailError('هذا الحساب موجود بالفعل، جرب تسجيل الدخول')
        } else {
          setEmailError(error.message)
        }
      } else if (data.user && data.user.identities?.length === 0) {
        // حالة أخرى كيعرفها سوبابيس للايميل المسجل
        setEmailError('هذا الحساب موجود بالفعل، جرب تسجيل الدخول')
      } else {
        setStatus('check_email')
      }
    }
    setLoading(false)
  }

  // زر "حسناً" يرجعك لـ Login
  const backToLogin = () => {
    setStatus('idle')
    setIsLogin(true)
    setEmailError('')
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .auth-page { min-height: 100vh; background: #0d0a07; display: flex; align-items: center; justify-content: center; padding: 20px; direction: rtl; font-family: 'Tajawal', sans-serif; color: white; }
        .card { background: #18120a; width: 100%; max-width: 480px; border-radius: 28px; border: 1px solid rgba(255,180,60,0.18); overflow: hidden; box-shadow: 0 40px 80px rgba(0,0,0,0.6); }
        .card-top { background: linear-gradient(135deg, #f5a623 0%, #d37209 100%); padding: 30px; text-align: center; }
        .card-body { padding: 25px 30px; }
        .field { margin-bottom: 15px; position: relative; }
        .field label { display: block; font-size: 13px; margin-bottom: 6px; color: #f5a623; font-weight: 700; }
        .field input { width: 100%; padding: 12px 15px; border-radius: 12px; border: 1.5px solid rgba(255,180,60,0.1); background: rgba(255,255,255,0.04); color: white; outline: none; font-family: 'Tajawal'; transition: 0.3s; }
        .field input.error { border-color: #ff4d4d; background: rgba(255,77,77,0.05); }
        .tooltip { background: #ff4d4d; color: white; font-size: 12px; padding: 6px 12px; border-radius: 8px; margin-top: 6px; display: block; animation: fadeInDown 0.3s ease; }
        @keyframes fadeInDown { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }
        .btn-submit { width: 100%; padding: 15px; border-radius: 12px; border: none; background: #f5a623; color: #1a0800; font-size: 16px; font-weight: 900; cursor: pointer; }
        .btn-back { width: 100%; padding: 15px; border-radius: 12px; border: 1.5px solid #f5a623; background: transparent; color: #f5a623; font-weight: 900; cursor: pointer; margin-top: 10px; }
        .link { color: #f5a623; cursor: pointer; font-weight: 700; text-decoration: underline; }
      `}</style>

      <div className="auth-page">
        <div className="card">
          {status === 'verified' ? (
            <div className="card-body" style={{textAlign: 'center'}}>
              <div style={{fontSize: '50px'}}>✅</div>
              <h2 style={{margin: '15px 0'}}>تم التفعيل!</h2>
              <p style={{opacity: 0.7, marginBottom: '20px'}}>حسابكم جاهز للانطلاق في عالم القصص.</p>
              <button className="btn-submit" onClick={() => window.location.href = '/stories'}>ابدأ القراءة ←</button>
            </div>
          ) : status === 'check_email' ? (
            <div className="card-body" style={{textAlign: 'center'}}>
              <div style={{fontSize: '50px'}}>📩</div>
              <h2>تأكد من بريدك</h2>
              <p style={{opacity: 0.7, margin: '15px 0'}}>أرسلنا رابط التفعيل إلى {formData.email}.</p>
              <button className="btn-submit" onClick={backToLogin}>حسناً، سأقوم بالدخول</button>
            </div>
          ) : (
            <>
              <div className="card-top">
                <h2 style={{fontSize: '24px'}}>{isLogin ? 'تسجيل الدخول' : 'إنشاء حساب جديد'}</h2>
              </div>
              <div className="card-body">
                <form onSubmit={handleAuth}>
                  {!isLogin && (
                    <>
                      <div className="field">
                        <label>اسم الأب / الأم</label>
                        <input type="text" placeholder="الاسم الكامل" required onChange={e => setFormData({...formData, parentName: e.target.value})} />
                      </div>
                      <div className="field">
                        <label>رقم الهاتف</label>
                        <input type="tel" placeholder="06XXXXXXXX" required onChange={e => setFormData({...formData, phone: e.target.value})} />
                      </div>
                      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px'}}>
                        <div className="field">
                          <label>اسم الطفل</label>
                          <input type="text" placeholder="اسم البطل" required onChange={e => setFormData({...formData, kidName: e.target.value})} />
                        </div>
                        <div className="field">
                          <label>سن الطفل</label>
                          <input type="number" min="3" max="15" value={formData.kidAge} onChange={e => setFormData({...formData, kidAge: parseInt(e.target.value)})} />
                        </div>
                      </div>
                    </>
                  )}
                  
                  <div className="field">
                    <label>البريد الإلكتروني</label>
                    <input 
                      type="email" 
                      className={emailError && !isLogin ? 'error' : ''}
                      placeholder="email@example.com" 
                      required 
                      onChange={e => {
                        setFormData({...formData, email: e.target.value});
                        setEmailError('');
                      }} 
                    />
                    {emailError && <span className="tooltip">⚠️ {emailError}</span>}
                  </div>

                  <div className="field">
                    <label>كلمة المرور</label>
                    <input type="password" placeholder="••••••••" required onChange={e => setFormData({...formData, password: e.target.value})} />
                  </div>

                  <button className="btn-submit" disabled={loading}>
                    {loading ? 'جاري المعالجة...' : (isLogin ? 'دخول المغامرة ←' : 'تسجيل بطل جديد ✨')}
                  </button>
                </form>

                <p style={{textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#888'}}>
                  {isLogin ? 'ليس لديك حساب؟ ' : 'لديك حساب؟ '}
                  <span className="link" onClick={() => { setIsLogin(!isLogin); setEmailError(''); }}>
                    {isLogin ? 'أنشئ حساباً' : 'سجل الدخول'}
                  </span>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}