'use client'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
// 🌟 جبنا الأيقونات الاحترافية من المكتبة 🌟
import { Eye, EyeOff, ChevronDown, AlertTriangle } from 'lucide-react'

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(false)
  const [loading, setLoading] = useState(false)
  const [emailError, setEmailError] = useState('')
  const [status, setStatus] = useState<'idle' | 'check_email' | 'verified'>('idle')
  const [showPassword, setShowPassword] = useState(false) 
  const [showSuccessPopup, setShowSuccessPopup] = useState(false) 
  
  // 🌟 زدنا الـ States ديال استرجاع كلمة المرور 🌟
  const [isForgotPassword, setIsForgotPassword] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetMessage, setResetMessage] = useState('')

  const [countries, setCountries] = useState<any[]>([])
  const [filteredCountries, setFilteredCountries] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [showCountries, setShowCountries] = useState(false)
  const countryRef = useRef<HTMLDivElement>(null)

  const [formData, setFormData] = useState({
    fullName: '', phone: '', email: '', password: '', 
    securityQuestion: '', securityAnswer: '', 
    countryCode: '+212', countryIso: 'ma'
  })

  const securityQuestions = [
    "Quel est le nom de votre premier animal ?",
    "Quelle est votre ville de naissance ?",
    "Quel est le nom de votre école primaire ?",
    "Quelle est votre couleur préférée ?",
    "Quel est le nom de votre meilleur ami d'enfance ?"
  ]

  useEffect(() => {
    fetch('https://restcountries.com/v3.1/all?fields=translations,idd,cca2,flags')
      .then(res => res.json())
      .then(data => {
        const formatted = data.map((c: any) => ({
          name: c.translations.fra.common,
          iso: c.cca2.toLowerCase(),
          code: c.idd.root + (c.idd.suffixes ? c.idd.suffixes[0] : ''),
          flag: c.flags.png
        })).sort((a: any, b: any) => a.name.localeCompare(b.name))
        setCountries(formatted)
        setFilteredCountries(formatted)
      })
  }, [])

  useEffect(() => {
    const results = countries.filter(c => 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      c.code.includes(searchTerm)
    )
    setFilteredCountries(results)
  }, [searchTerm, countries])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (countryRef.current && !countryRef.current.contains(event.target as Node)) {
        setShowCountries(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // 🌟 هادي الـ Function اللي كتصيفط الرابط للإيميل 🌟
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setResetMessage("Envoi en cours...")

    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: `${window.location.origin}/update-password`, 
    })

    if (error) {
      setResetMessage("Erreur : Impossible d'envoyer l'email.")
    } else {
      setResetMessage("Un lien de réinitialisation a été envoyé à votre email !")
      setResetEmail("") // كنمسحو الإيميل من بعد ما يصيفط
    }
    setLoading(false)
  }

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setEmailError('')

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      })
      if (error) {
        setEmailError('Email ou mot de passe incorrect.')
        setLoading(false)
        return
      }
      window.location.href = '/stories'
    } else {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/setup`, 
          data: {
            full_name: formData.fullName,
            phone: `${formData.countryCode}${formData.phone}`,
            security_question: formData.securityQuestion,
            security_answer: formData.securityAnswer,
          }
        }
      })

      if (error) {
        if (error.message.toLowerCase().includes('already registered')) setEmailError('Ce compte existe déjà.')
        else alert(error.message)
      } else {
        await supabase.auth.signOut(); 
        setShowSuccessPopup(true)
      }
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 selection:bg-orange-100 overflow-x-hidden" style={{ direction: 'ltr', textAlign: 'left' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
        body { font-family: 'Poppins', sans-serif; }
        .bg-orange-brand { background-color: #c5772d; }
        .text-orange-brand { color: #c5772d; }
        .input-field { background-color: #f4f4f4; border: 2px solid transparent; border-radius: 14px; padding: 14px 18px; width: 100%; outline: none; transition: 0.3s; font-size: 15px; color: #1f2937; font-weight: 500; }
        .input-field:focus { border-color: #c5772d; background-color: white; box-shadow: 0 4px 12px rgba(197, 119, 45, 0.08); }
        .label-style { font-weight: 700; font-size: 14px; color: #374151; margin-bottom: 8px; display: block; }
        .btn-main { background-color: #c5772d; color: white; padding: 16px; border-radius: 16px; font-weight: 700; font-size: 17px; transition: 0.3s; box-shadow: 0 10px 25px rgba(197, 119, 45, 0.2); width: 100%; border: none; cursor: pointer; }
        .custom-scroll::-webkit-scrollbar { width: 5px; }
        .custom-scroll::-webkit-scrollbar-thumb { background: #c5772d; border-radius: 10px; }
        
        .select-icon-container { position: relative; width: 100%; }
        .select-icon-container::after {
          content: ""; position: absolute; right: 18px; top: 50%; transform: translateY(-50%);
          width: 12px; height: 12px;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke-width='2.5' stroke='%234b5563'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='m19.5 8.25-7.5 7.5-7.5-7.5' /%3E%3C/svg%3E");
          background-size: contain; background-repeat: no-repeat; pointer-events: none; opacity: 0.6;
        }
      `}</style>

      {/* --- Pop-up Success --- */}
      {showSuccessPopup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowSuccessPopup(false)}></div>
          
          <div className="relative bg-white w-full max-w-[500px] rounded-[50px] p-12 text-center shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="bg-[#c5772d] w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl shadow-orange-900/20">
              <svg width="35" height="35" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            
            <h2 className="text-3xl font-extrabold mb-4 text-gray-900">Email envoyé</h2>
            <p className="text-gray-500 font-medium mb-10 leading-relaxed px-4">
              Un lien de validation a été envoyé à votre adresse email.
            </p>
            
            <button 
              onClick={() => { setShowSuccessPopup(false); setIsLogin(true); }}
              className="w-full bg-[#c5772d] text-white py-5 rounded-2xl font-bold text-lg hover:scale-[1.02] transition active:scale-95 shadow-xl shadow-orange-900/10 mb-6"
            >
              Se connecter →
            </button>
            
            <button className="text-gray-400 font-bold text-sm hover:text-gray-600 transition underline underline-offset-4">
              Renvoyer l'email
            </button>
          </div>
        </div>
      )}

      {/* Navbar */}
      <nav className="flex justify-between items-center px-6 md:px-20 py-8 max-w-[1440px] mx-auto">
       <a href="/#home" className="inline-block transition-transform hover:scale-105">
          <img src="/logo.svg" alt="Logo" className="h-12 w-auto cursor-pointer" />
        </a>
        <div className="hidden md:flex gap-12 font-bold text-gray-400 text-[11px] tracking-widest uppercase">
          <a href="#" className="hover:text-orange-brand transition"></a>
          <a href="#" className="hover:text-orange-brand transition"></a>
          <a href="#" className="hover:text-orange-brand transition"></a>
        </div>
<a  href="/#home" 
          onClick={() => {setIsLogin(false); setIsForgotPassword(false);}} 
          className="bg-orange-brand text-white px-8 py-3 rounded-2xl font-bold text-sm shadow-lg transition-transform hover:scale-105 inline-block text-center"
        >
          Retour à l'accueil
        </a>
      </nav>

      <main className="max-w-[1300px] mx-auto flex flex-col lg:flex-row items-center justify-center px-6 py-10 lg:py-12 gap-16 lg:gap-28">
        
        <div className="bg-orange-brand w-full lg:w-[480px] rounded-[55px] p-12 md:p-14 text-white relative overflow-hidden min-h-[620px] flex flex-col shadow-2xl transition-all duration-500">
          <div className="relative z-10">
            <h1 className="text-4xl md:text-5xl font-bold mb-8 tracking-tight" style={{ fontFamily: 'atlan', lineHeight: 1.3 }}>
              {isForgotPassword ? "Mot de passe oublié ?" : (isLogin ? "Espace Parent Sécurisé" : <>Bienvenue sur <br /> HIKAYAT</>)}
            </h1>
            <p className="text-lg opacity-90 mb-12 font-medium" style={{ fontFamily: 'atlan', lineHeight: 1.6 }}>
              {isForgotPassword ? "Pas de panique ! Nous allons vous aider à récupérer l'accès à votre compte." : (isLogin ? "Connectez-vous pour gérer les informations de votre enfant." : "Créez votre compte parent et suivez la progression de vos enfants.")}
            </p>
          </div>
          {/* 🌟 الصورة كتبدل على حساب الحالة (isLogin أو isForgotPassword كتجيب ننا زهرة 3) 🌟 */}
          <img 
            src={isLogin || isForgotPassword ? "assets/nanna-zahra-3.png" : "assets/nanna-zahra-1.png"} 
            className="absolute bottom-[-10px] right-[-11px] w-[320px] md:w-[270px] object-contain select-none transition-all duration-300" 
          />
        </div>

        <div className="w-full max-w-[540px]">
          {/* 🌟 العناوين كتغير على حساب الفورم 🌟 */}
          <h2 className="text-4xl font-bold mb-3 text-gray-900 tracking-tight">
            {isForgotPassword ? "Réinitialisation" : (isLogin ? "Connexion" : "Créer un compte")}
          </h2>
          <p className="text-gray-400 mb-12 font-medium">
            {isForgotPassword ? "Recevez un lien par email" : (isLogin ? "Accédez à votre espace" : "Remplissez le formulaire")}
          </p>

          {/* 🌟 إذا كان كليك على نسيت المودپاس، غنبينو هاد الفورم 🌟 */}
          {isForgotPassword ? (
            <form onSubmit={handleResetPassword} className="space-y-6">
              <div>
                <label className="label-style">Email</label>
                <input 
                  type="email" 
                  className="input-field" 
                  placeholder="Votre adresse email" 
                  required 
                  value={resetEmail}
                  onChange={e => setResetEmail(e.target.value)} 
                />
              </div>

              {resetMessage && (
                <p className={`text-[13px] font-bold mt-2 flex items-center gap-1.5 ${resetMessage.includes('Erreur') ? 'text-red-500' : 'text-[#c5772d]'}`}>
                  {/* 🌟 أيقونة تحذير عوض الإيموجي 🌟 */}
                  {resetMessage.includes('Erreur') && <AlertTriangle className="h-4 w-4" />}
                  {resetMessage}
                </p>
              )}

              <button type="submit" disabled={loading} className="btn-main">
                {loading ? 'Chargement...' : "Envoyer le lien →"}
              </button>

              <p className="text-center text-sm font-semibold text-gray-400 mt-8 tracking-wide">
                <span onClick={() => {setIsForgotPassword(false); setResetMessage("");}} className="text-orange-brand font-bold cursor-pointer hover:underline ml-1">
                  Retour à la connexion
                </span>
              </p>
            </form>
          ) : (
            /* 🌟 الفورم العادي ديالك (Login / Signup) 🌟 */
            <form onSubmit={handleAuth} className="space-y-6">
              {!isLogin && (
                <>
                  <div><label className="label-style">Nom complet</label><input className="input-field" placeholder="Nom complet" required onChange={e => setFormData({...formData, fullName: e.target.value})} /></div>
                  
                  <div className="relative" ref={countryRef}>
                    <label className="label-style">Numéro de téléphone</label>
                    <div className="flex items-center bg-[#f4f4f4] rounded-[14px] border-2 border-transparent focus-within:border-[#c5772d] focus-within:bg-white overflow-hidden h-[55px] transition-all">
                      <div className="flex items-center gap-2 px-4 h-full cursor-pointer border-r border-gray-200 hover:bg-gray-100 min-w-[110px]" onClick={() => setShowCountries(!showCountries)}>
                        <img src={`https://flagcdn.com/w40/${formData.countryIso}.png`} className="w-6 h-auto rounded-[2px] shadow-sm" alt="flag" />
                        <span className="font-bold text-[14px] text-[#374151]">{formData.countryCode}</span>
                        {/* 🌟 أيقونة ▼ عوض الإيموجي 🌟 */}
                        <ChevronDown className="h-4 w-4 text-gray-500 opacity-60" strokeWidth={3} />
                      </div>
                      <input className="flex-1 bg-transparent px-4 h-full outline-none font-bold text-[15px] text-[#1f2937]" placeholder="6 66 66 66 66" type="tel" onChange={e => setFormData({...formData, phone: e.target.value.replace(/\D/g, '')})} />
                      
                      {showCountries && (
                        <div className="absolute top-[60px] left-0 w-[280px] bg-white border border-gray-100 rounded-2xl shadow-2xl z-[999] py-3 animate-in fade-in slide-in-from-top-2">
                          <div className="px-3 mb-2"><input type="text" className="w-full p-2 text-sm bg-gray-100 rounded-lg outline-none" placeholder="Rechercher..." onChange={e => setSearchTerm(e.target.value)} /></div>
                          <div className="max-h-[250px] overflow-y-auto custom-scroll">
                            {filteredCountries.map((c) => (
                              <div key={c.iso + c.name} className="flex items-center gap-3 px-4 py-3 hover:bg-orange-50 cursor-pointer" onClick={() => { setFormData({...formData, countryCode: c.code, countryIso: c.iso}); setShowCountries(false); }}>
                                <img src={c.flag} className="w-6 rounded-sm" />
                                <span className="text-sm font-bold text-gray-700 flex-1 truncate">{c.name}</span>
                                <span className="text-orange-brand text-xs font-black">{c.code}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
              
              <div className={isLogin ? "space-y-6" : "grid grid-cols-1 md:grid-cols-2 gap-5"}>
                <div>
                  <label className="label-style">Email</label>
                  <input type="email" className={`input-field ${emailError ? 'input-error' : ''}`} placeholder="test@gmail.com" required onChange={e => {setFormData({...formData, email: e.target.value}); setEmailError('')}} />
                  {emailError && <p className="text-[11px] text-red-500 font-bold mt-2 flex items-center gap-1.5">
                    {/* 🌟 أيقونة تحذير عوض الإيموجي 🌟 */}
                    <AlertTriangle className="h-3.5 w-3.5" /> 
                    {emailError}
                  </p>}
                </div>
                <div>
                  <label className="label-style">Mot de passe</label>
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"} 
                      className="input-field" 
                      placeholder="••••••••••••••••" 
                      required 
                      onChange={e => setFormData({...formData, password: e.target.value})} 
                    />
                    <span className="absolute right-5 top-4 cursor-pointer opacity-30 hover:opacity-100 transition-all text-gray-600" onClick={() => setShowPassword(!showPassword)}>
                      {/* 🌟 أيقونات العين والشمكر عوض الإيموجي 🌟 */}
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </span>
                  </div>
                  {/* 🌟 زدنا onClick باش نبدلو الـ State 🌟 */}
                  {isLogin && (
                    <p onClick={() => setIsForgotPassword(true)} className="text-right mt-3 text-xs font-bold text-gray-500 cursor-pointer hover:text-orange-brand transition underline underline-offset-4 tracking-wide">
                      Mot de passe oublié ?
                    </p>
                  )}
                </div>
              </div>

              {!isLogin && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="label-style">Question de sécurité</label>
                    <div className="select-icon-container">
                      <select className="input-field appearance-none cursor-pointer pr-10" required onChange={e => setFormData({...formData, securityQuestion: e.target.value})}>
                        <option value="">Sélectionnez</option>
                        {securityQuestions.map((q, idx) => (<option key={idx} value={q}>{q}</option>))}
                      </select>
                    </div>
                  </div>
                  <div><label className="label-style">Votre réponse</label><input className="input-field" placeholder="Votre réponse" required onChange={e => setFormData({...formData, securityAnswer: e.target.value})} /></div>
                </div>
              )}

              <button type="submit" disabled={loading} className="btn-main">
                {loading ? 'Chargement...' : (isLogin ? "Se connecter →" : "S'inscrire →")}
              </button>

              <p className="text-center text-sm font-semibold text-gray-400 mt-8 tracking-wide">
                {isLogin ? "Vous n'avez pas encore de compte ?" : "Vous avez déjà un compte ?"}
                <span onClick={() => {setIsLogin(!isLogin); setEmailError(''); setIsForgotPassword(false);}} className="text-orange-brand font-bold cursor-pointer hover:underline ml-1">
                  {isLogin ? "Créer un compte" : "Se connecter"}
                </span>
              </p>
            </form>
          )}
        </div>
      </main>
    </div>
  )
}


// 'use client'
// import { useState, useEffect, useRef } from 'react'
// import { supabase } from '@/lib/supabase'

// export default function AuthPage() {
//   const [isLogin, setIsLogin] = useState(false)
//   const [loading, setLoading] = useState(false)
//   const [emailError, setEmailError] = useState('')
//   const [status, setStatus] = useState<'idle' | 'check_email' | 'verified'>('idle')
//   const [showPassword, setShowPassword] = useState(false) 
//   const [showSuccessPopup, setShowSuccessPopup] = useState(false) 
  
//   const [countries, setCountries] = useState<any[]>([])
//   const [filteredCountries, setFilteredCountries] = useState<any[]>([])
//   const [searchTerm, setSearchTerm] = useState('')
//   const [showCountries, setShowCountries] = useState(false)
//   const countryRef = useRef<HTMLDivElement>(null)

//   const [formData, setFormData] = useState({
//     fullName: '', phone: '', email: '', password: '', 
//     securityQuestion: '', securityAnswer: '', 
//     countryCode: '+212', countryIso: 'ma'
//   })

//   const securityQuestions = [
//     "Quel est le nom de votre premier animal ?",
//     "Quelle est votre ville de naissance ?",
//     "Quel est le nom de votre école primaire ?",
//     "Quelle est votre couleur préférée ?",
//     "Quel est le nom de votre meilleur ami d'enfance ?"
//   ]

//   useEffect(() => {
//     fetch('https://restcountries.com/v3.1/all?fields=translations,idd,cca2,flags')
//       .then(res => res.json())
//       .then(data => {
//         const formatted = data.map((c: any) => ({
//           name: c.translations.fra.common,
//           iso: c.cca2.toLowerCase(),
//           code: c.idd.root + (c.idd.suffixes ? c.idd.suffixes[0] : ''),
//           flag: c.flags.png
//         })).sort((a: any, b: any) => a.name.localeCompare(b.name))
//         setCountries(formatted)
//         setFilteredCountries(formatted)
//       })
//   }, [])

//   useEffect(() => {
//     const results = countries.filter(c => 
//       c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
//       c.code.includes(searchTerm)
//     )
//     setFilteredCountries(results)
//   }, [searchTerm, countries])

//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (countryRef.current && !countryRef.current.contains(event.target as Node)) {
//         setShowCountries(false)
//       }
//     }
//     document.addEventListener('mousedown', handleClickOutside)
//     return () => document.removeEventListener('mousedown', handleClickOutside)
//   }, [])

//   const handleAuth = async (e: React.FormEvent) => {
//     e.preventDefault()
//     setLoading(true)
//     setEmailError('')

//     if (isLogin) {
//       const { error } = await supabase.auth.signInWithPassword({
//         email: formData.email,
//         password: formData.password,
//       })
//       if (error) {
//         setEmailError('Email ou mot de passe incorrect.')
//         setLoading(false)
//         return
//       }
//       window.location.href = '/stories'
//     } else {
//       const { data, error } = await supabase.auth.signUp({
//         email: formData.email,
//         password: formData.password,
//         options: {
//           emailRedirectTo: `${window.location.origin}/setup`, 
//           data: {
//             full_name: formData.fullName,
//             phone: `${formData.countryCode}${formData.phone}`,
//             security_question: formData.securityQuestion,
//             security_answer: formData.securityAnswer,
//           }
//         }
//       })

//       if (error) {
//         if (error.message.toLowerCase().includes('already registered')) setEmailError('Ce compte existe déjà.')
//         else alert(error.message)
//       } else {
//         // --- سد الثغرة هنا ---
//         // كنسجلو الخروج فوراً باش ما يدخلش بلا تفعيل الإيميل
//         await supabase.auth.signOut(); 
        
//         setShowSuccessPopup(true)
//       }
//     }
//     setLoading(false)
//   }

//   return (
//     <div className="min-h-screen bg-white font-sans text-gray-900 selection:bg-orange-100 overflow-x-hidden" style={{ direction: 'ltr', textAlign: 'left' }}>
//       <style>{`
//         @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
//         body { font-family: 'Poppins', sans-serif; }
//         .bg-orange-brand { background-color: #c5772d; }
//         .text-orange-brand { color: #c5772d; }
//         .input-field { background-color: #f4f4f4; border: 2px solid transparent; border-radius: 14px; padding: 14px 18px; width: 100%; outline: none; transition: 0.3s; font-size: 15px; color: #1f2937; font-weight: 500; }
//         .input-field:focus { border-color: #c5772d; background-color: white; box-shadow: 0 4px 12px rgba(197, 119, 45, 0.08); }
//         .label-style { font-weight: 700; font-size: 14px; color: #374151; margin-bottom: 8px; display: block; }
//         .btn-main { background-color: #c5772d; color: white; padding: 16px; border-radius: 16px; font-weight: 700; font-size: 17px; transition: 0.3s; box-shadow: 0 10px 25px rgba(197, 119, 45, 0.2); width: 100%; border: none; cursor: pointer; }
//         .custom-scroll::-webkit-scrollbar { width: 5px; }
//         .custom-scroll::-webkit-scrollbar-thumb { background: #c5772d; border-radius: 10px; }
        
//         .select-icon-container { position: relative; width: 100%; }
//         .select-icon-container::after {
//           content: ""; position: absolute; right: 18px; top: 50%; transform: translateY(-50%);
//           width: 12px; height: 12px;
//           background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke-width='2.5' stroke='%234b5563'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='m19.5 8.25-7.5 7.5-7.5-7.5' /%3E%3C/svg%3E");
//           background-size: contain; background-repeat: no-repeat; pointer-events: none; opacity: 0.6;
//         }
//       `}</style>

//       {/* --- Pop-up Success (Image 2 Style) --- */}
//       {showSuccessPopup && (
//         <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
//           <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowSuccessPopup(false)}></div>
          
//           <div className="relative bg-white w-full max-w-[500px] rounded-[50px] p-12 text-center shadow-2xl animate-in zoom-in-95 duration-300">
//             <div className="bg-[#c5772d] w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl shadow-orange-900/20">
//               <svg width="35" height="35" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
//                 <polyline points="20 6 9 17 4 12"></polyline>
//               </svg>
//             </div>
            
//             <h2 className="text-3xl font-extrabold mb-4 text-gray-900">Email envoyé</h2>
//             <p className="text-gray-500 font-medium mb-10 leading-relaxed px-4">
//               Un lien de validation a été envoyé à votre adresse email.
//             </p>
            
//             <button 
//               onClick={() => { setShowSuccessPopup(false); setIsLogin(true); }}
//               className="w-full bg-[#c5772d] text-white py-5 rounded-2xl font-bold text-lg hover:scale-[1.02] transition active:scale-95 shadow-xl shadow-orange-900/10 mb-6"
//             >
//               Se connecter →
//             </button>
            
//             <button className="text-gray-400 font-bold text-sm hover:text-gray-600 transition underline underline-offset-4">
//               Renvoyer l'email
//             </button>
//           </div>
//         </div>
//       )}

//       {/* Navbar */}
//       <nav className="flex justify-between items-center px-6 md:px-20 py-8 max-w-[1440px] mx-auto">
//         <img src="/logo.svg" alt="Logo" className="h-12 w-auto cursor-pointer" />
//         <div className="hidden md:flex gap-12 font-bold text-gray-400 text-[11px] tracking-widest uppercase">
//           <a href="#" className="hover:text-orange-brand transition">Stories</a>
//           <a href="#" className="hover:text-orange-brand transition">Feedbacks</a>
//           <a href="#" className="hover:text-orange-brand transition">ABOUT</a>
//         </div>
//         <button onClick={() => setIsLogin(false)} className="bg-orange-brand text-white px-8 py-3 rounded-2xl font-bold text-sm shadow-lg">Create account</button>
//       </nav>

//       <main className="max-w-[1300px] mx-auto flex flex-col lg:flex-row items-center justify-center px-6 py-10 lg:py-12 gap-16 lg:gap-28">
        
//         <div className="bg-orange-brand w-full lg:w-[480px] rounded-[55px] p-12 md:p-14 text-white relative overflow-hidden min-h-[620px] flex flex-col shadow-2xl transition-all duration-500">
//           <div className="relative z-10">
//             <h1 className="text-4xl md:text-5xl font-bold mb-8 tracking-tight" style={{ fontFamily: 'atlan', lineHeight: 1.3 }}>
//               {isLogin ? "Espace Parent Sécurisé" : <>Bienvenue sur <br /> HIKAYAT</>}
//             </h1>
//             <p className="text-lg opacity-90 mb-12 font-medium" style={{ fontFamily: 'atlan', lineHeight: 1.6 }}>
//               {isLogin ? "Connectez-vous pour gérer les informations de votre enfant." : "Créez votre compte parent et suivez la progression de vos enfants."}
//             </p>
//           </div>
//           <img src="assets/nanna-zahra-1.png" className="absolute bottom-[-10px] right-[-11px] w-[320px] md:w-[270px] object-contain select-none" />
//         </div>

//         <div className="w-full max-w-[540px]">
//           <h2 className="text-4xl font-bold mb-3 text-gray-900 tracking-tight">{isLogin ? "Connexion" : "Créer un compte"}</h2>
//           <p className="text-gray-400 mb-12 font-medium">{isLogin ? "Accédez à votre espace" : "Remplissez le formulaire"}</p>

//           <form onSubmit={handleAuth} className="space-y-6">
//             {!isLogin && (
//               <>
//                 <div><label className="label-style">Nom complet</label><input className="input-field" placeholder="Nader slami" required onChange={e => setFormData({...formData, fullName: e.target.value})} /></div>
                
//                 <div className="relative" ref={countryRef}>
//                   <label className="label-style">Numéro de téléphone</label>
//                   <div className="flex items-center bg-[#f4f4f4] rounded-[14px] border-2 border-transparent focus-within:border-[#c5772d] focus-within:bg-white overflow-hidden h-[55px] transition-all">
//                     <div className="flex items-center gap-2 px-4 h-full cursor-pointer border-r border-gray-200 hover:bg-gray-100 min-w-[110px]" onClick={() => setShowCountries(!showCountries)}>
//                       <img src={`https://flagcdn.com/w40/${formData.countryIso}.png`} className="w-6 h-auto rounded-[2px] shadow-sm" alt="flag" />
//                       <span className="font-bold text-[14px] text-[#374151]">{formData.countryCode}</span>
//                       <span className="text-[10px] opacity-40">▼</span>
//                     </div>
//                     <input className="flex-1 bg-transparent px-4 h-full outline-none font-bold text-[15px] text-[#1f2937]" placeholder="6 66 66 66 66" type="tel" onChange={e => setFormData({...formData, phone: e.target.value.replace(/\D/g, '')})} />
                    
//                     {showCountries && (
//                       <div className="absolute top-[60px] left-0 w-[280px] bg-white border border-gray-100 rounded-2xl shadow-2xl z-[999] py-3 animate-in fade-in slide-in-from-top-2">
//                         <div className="px-3 mb-2"><input type="text" className="w-full p-2 text-sm bg-gray-100 rounded-lg outline-none" placeholder="Rechercher..." onChange={e => setSearchTerm(e.target.value)} /></div>
//                         <div className="max-h-[250px] overflow-y-auto custom-scroll">
//                           {filteredCountries.map((c) => (
//                             <div key={c.iso + c.name} className="flex items-center gap-3 px-4 py-3 hover:bg-orange-50 cursor-pointer" onClick={() => { setFormData({...formData, countryCode: c.code, countryIso: c.iso}); setShowCountries(false); }}>
//                               <img src={c.flag} className="w-6 rounded-sm" />
//                               <span className="text-sm font-bold text-gray-700 flex-1 truncate">{c.name}</span>
//                               <span className="text-orange-brand text-xs font-black">{c.code}</span>
//                             </div>
//                           ))}
//                         </div>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               </>
//             )}
            
//             <div className={isLogin ? "space-y-6" : "grid grid-cols-1 md:grid-cols-2 gap-5"}>
//               <div>
//                 <label className="label-style">Email</label>
//                 <input type="email" className={`input-field ${emailError ? 'input-error' : ''}`} placeholder="Nader.slami@gmail.com" required onChange={e => {setFormData({...formData, email: e.target.value}); setEmailError('')}} />
//                 {emailError && <p className="text-[11px] text-red-500 font-bold mt-2">⚠️ {emailError}</p>}
//               </div>
//               <div>
//                 <label className="label-style">Mot de passe</label>
//                 <div className="relative">
//                   <input 
//                     type={showPassword ? "text" : "password"} 
//                     className="input-field" 
//                     placeholder="••••••••••••••••" 
//                     required 
//                     onChange={e => setFormData({...formData, password: e.target.value})} 
//                   />
//                   <span className="absolute right-5 top-4 cursor-pointer opacity-30 hover:opacity-100 transition-all" onClick={() => setShowPassword(!showPassword)}>
//                     {showPassword ? "🙈" : "👁️"}
//                   </span>
//                 </div>
//                 {isLogin && <p className="text-right mt-3 text-xs font-bold text-gray-500 cursor-pointer hover:text-orange-brand transition underline underline-offset-4 tracking-wide">Mot de passe oublié ?</p>}
//               </div>
//             </div>

//             {!isLogin && (
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
//                 <div>
//                   <label className="label-style">Question de sécurité</label>
//                   <div className="select-icon-container">
//                     <select className="input-field appearance-none cursor-pointer pr-10" required onChange={e => setFormData({...formData, securityQuestion: e.target.value})}>
//                       <option value="">Sélectionnez</option>
//                       {securityQuestions.map((q, idx) => (<option key={idx} value={q}>{q}</option>))}
//                     </select>
//                   </div>
//                 </div>
//                 <div><label className="label-style">Votre réponse</label><input className="input-field" placeholder="Votre réponse" required onChange={e => setFormData({...formData, securityAnswer: e.target.value})} /></div>
//               </div>
//             )}

//             <button type="submit" disabled={loading} className="btn-main">
//               {loading ? 'Chargement...' : (isLogin ? "Se connecter →" : "s'inscrire →")}
//             </button>

//             <p className="text-center text-sm font-semibold text-gray-400 mt-8 tracking-wide">
//               {isLogin ? "Vous n'avez pas encore de compte ?" : "Vous avez déjà un compte ?"}
//               <span onClick={() => {setIsLogin(!isLogin); setEmailError('')}} className="text-orange-brand font-bold cursor-pointer hover:underline ml-1">
//                 {isLogin ? "Créer un compte" : "Se connecter"}
//               </span>
//             </p>
//           </form>
//         </div>
//       </main>
//     </div>
//   )
// }