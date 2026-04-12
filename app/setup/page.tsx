'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import Cropper from 'react-easy-crop'
import { motion, AnimatePresence } from 'framer-motion'

export default function SetupPage() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [childData, setChildData] = useState({
    kid_name: '',
    child_username: '',
    kid_age: 12,
    birth_date: '',
    avatar_url: ''
  })

  const [image, setImage] = useState<string | null>(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null)
  const [showCropper, setShowCropper] = useState(false)

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        setUserId(session.user.id)
        setUserEmail(session.user.email || null)
      } else {
        window.location.href = '/auth'
      }
    }
    getSession()
  }, [])

  const onCropComplete = useCallback((_extended: any, pixels: any) => {
    setCroppedAreaPixels(pixels)
  }, [])

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader()
      reader.addEventListener('load', () => {
        setImage(reader.result as string)
        setShowCropper(true)
      })
      reader.readAsDataURL(e.target.files[0])
    }
  }

  const createCroppedImage = async (): Promise<Blob | null> => {
    try {
      const img = new Image()
      img.src = image!
      await new Promise((res) => (img.onload = res))
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      canvas.width = croppedAreaPixels.width
      canvas.height = croppedAreaPixels.height
      ctx?.drawImage(
        img,
        croppedAreaPixels.x, croppedAreaPixels.y, croppedAreaPixels.width, croppedAreaPixels.height,
        0, 0, croppedAreaPixels.width, croppedAreaPixels.height
      )
      return new Promise((res) => canvas.toBlob((blob) => res(blob), 'image/jpeg'))
    } catch (e) { return null }
  }

  const handleCroppedUpload = async () => {
    setLoading(true)
    const blob = await createCroppedImage()
    if (!blob || !userId) return

    const fileName = `${userId}-${Date.now()}.jpg`
    const { error } = await supabase.storage.from('avatars').upload(`kids/${fileName}`, blob)

    if (!error) {
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(`kids/${fileName}`)
      setChildData({ ...childData, avatar_url: publicUrl })
      setShowCropper(false)
    }
    setLoading(false)
  }

  const handleFinalSubmit = async () => {
    setLoading(true)
    if (!userId) return

    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        email: userEmail,
        kid_name: childData.kid_name,
        child_username: childData.child_username,
        kid_age: childData.kid_age,
        birth_date: childData.birth_date,
        avatar_url: childData.avatar_url,
        is_setup_complete: true
      }, { onConflict: 'id' })

    if (!error) window.location.href = '/stories'
    else alert("Error: " + error.message)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#f8f8f8] font-sans text-gray-900" style={{ direction: 'ltr' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;800&display=swap');
        body { font-family: 'Poppins', sans-serif; }
        .bg-orange-brand { background-color: #c5772d; }
        .input-setup { background: white; border: 2px solid #f0f0f0; border-radius: 20px; padding: 18px 24px; width: 100%; outline: none; transition: 0.3s; font-weight: 500; text-align: left; }
        .input-setup:focus { border-color: #c5772d; box-shadow: 0 0 0 4px rgba(197, 119, 45, 0.1); }
      `}</style>

      {/* Modal Cropper */}
      <AnimatePresence>
        {showCropper && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center p-6 text-center">
            <div className="relative w-full max-w-[500px] h-[400px] rounded-[40px] overflow-hidden shadow-2xl border-4 border-white/10">
              <Cropper image={image!} crop={crop} zoom={zoom} aspect={1} cropShape="round" onCropChange={setCrop} onCropComplete={onCropComplete} onZoomChange={setZoom} />
            </div>
            <div className="w-full max-w-[500px] mt-10 space-y-8">
              <input type="range" value={zoom} min={1} max={3} step={0.1} onChange={(e) => setZoom(Number(e.target.value))} className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#c5772d]" />
              <div className="flex gap-4">
                <button onClick={() => setShowCropper(false)} className="flex-1 py-5 bg-white/10 text-white rounded-3xl font-bold hover:bg-white/20 transition">Annuler</button>
                <button onClick={handleCroppedUpload} className="flex-1 py-5 bg-[#c5772d] text-white rounded-3xl font-bold shadow-xl transition active:scale-95">Confirmer</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <nav className="p-10 max-w-[1400px] mx-auto flex justify-between items-center">
        <img src="/logo.svg" className="h-12 w-auto object-contain" alt="HIKAYAT" />
      </nav>

      <main className="max-w-[850px] mx-auto p-6">
        <motion.div layout className="bg-white rounded-[60px] p-12 md:p-20 shadow-[0_20px_70px_rgba(0,0,0,0.03)] relative min-h-[700px] flex flex-col items-center">
          
          {/* Stepper Dots (LTR Layout - Back to normal) */}
          <div className="flex items-center justify-between w-full max-w-[280px] mb-20 relative">
             {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center flex-1 last:flex-none">
                  <motion.div animate={{ scale: step >= i ? 1.2 : 1 }} className={`w-4 h-4 rounded-full transition-all duration-500 ${step >= i ? 'bg-[#c5772d] shadow-[0_0_0_6px_rgba(197,119,45,0.15)]' : 'bg-gray-100'}`} />
                  {i < 3 && <div className={`h-[2px] flex-1 mx-3 ${step > i ? 'bg-[#c5772d]' : 'bg-gray-100'} transition-all duration-700`} />}
                </div>
             ))}
          </div>

          <div className="w-full max-w-[480px]">
            <AnimatePresence mode="wait">
              <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.4 }}>
                
                {step > 1 && (
                  <button onClick={() => setStep(step - 1)} className="mb-8 text-gray-400 hover:text-[#c5772d] flex items-center gap-2 font-bold text-sm transition group">
                    ← Retour
                  </button>
                )}

                <h2 className="text-4xl font-extrabold mb-4 text-gray-900 tracking-tight text-left">Profil de l'enfant</h2>
                <p className="text-gray-400 mb-14 font-medium leading-relaxed text-left">Créez un profil personnalisé pour votre enfant en quelques étapes simples</p>

                {step === 1 && (
                  <div className="space-y-8 text-left">
                    <div>
                      <label className="block mb-3 font-bold text-gray-700 text-sm ml-2">Nom complet</label>
                      <input className="input-setup" placeholder="Entrez le nom" value={childData.kid_name} onChange={e => setChildData({...childData, kid_name: e.target.value})} />
                    </div>
                    <div>
                      <label className="block mb-3 font-bold text-gray-700 text-sm ml-2">Nom d'utilisateur</label>
                      <input className="input-setup" placeholder="@username" value={childData.child_username} onChange={e => setChildData({...childData, child_username: e.target.value})} />
                    </div>
                    <button onClick={() => setStep(2)} disabled={!childData.kid_name || !childData.child_username} className="bg-[#c5772d] text-white w-full py-6 rounded-[24px] font-extrabold text-lg mt-10 shadow-xl shadow-orange-900/10 hover:brightness-110 transition disabled:opacity-20">Suivant →</button>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-8 text-left">
                    <div>
                      <label className="block mb-3 font-bold text-gray-700 text-sm ml-2">Âge</label>
                      <input type="number" className="input-setup" value={childData.kid_age} onChange={e => setChildData({...childData, kid_age: parseInt(e.target.value) || 0})} />
                    </div>
                    <div>
                      <label className="block mb-3 font-bold text-gray-700 text-sm ml-2">Date de naissance</label>
                      <input type="date" className="input-setup" onChange={e => setChildData({...childData, birth_date: e.target.value})} />
                    </div>
                    <button onClick={() => setStep(3)} disabled={!childData.kid_age} className="bg-[#c5772d] text-white w-full py-6 rounded-[24px] font-extrabold text-lg mt-10 shadow-xl shadow-orange-900/10">Suivant →</button>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-10 text-center">
                    <input type="file" ref={fileInputRef} onChange={onFileChange} accept="image/*" className="hidden" />
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => fileInputRef.current?.click()} className={`w-full border-2 border-dashed ${childData.avatar_url ? 'border-green-400 bg-green-50/30' : 'border-gray-200'} rounded-[50px] p-12 flex flex-col items-center justify-center cursor-pointer min-h-[320px] relative overflow-hidden transition-all group`}>
                      {childData.avatar_url ? (
                        <img src={childData.avatar_url} className="absolute inset-0 w-full h-full object-cover animate-in fade-in zoom-in duration-500" />
                      ) : (
                        <div className="flex flex-col items-center">
                          <div className="bg-orange-50 w-20 h-20 rounded-full flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform">📸</div>
                          <span className="text-gray-400 font-bold">Cliquer pour ajouter une photo</span>
                        </div>
                      )}
                    </motion.div>
                    <button onClick={handleFinalSubmit} disabled={loading || !childData.avatar_url} className="bg-[#c5772d] text-white w-full py-6 rounded-[24px] font-extrabold text-lg shadow-2xl hover:brightness-110 transition-all disabled:opacity-30">
                      {loading ? 'Enregistrement...' : 'Valider'}
                    </button>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </main>
    </div>
  )
}