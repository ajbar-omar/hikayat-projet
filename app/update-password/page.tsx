'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setMessage('')

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.")
      return
    }

    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.")
      return
    }

    setLoading(true)
    
    // 🌟 هادي هي الدالة ديال Supabase لي كتبدل المودپاس 🌟
    const { error } = await supabase.auth.updateUser({
      password: password
    })

    if (error) {
      setError("Erreur lors de la mise à jour : " + error.message)
    } else {
      setMessage("Votre mot de passe a été mis à jour avec succès !")
      // كنمحو الخانات باش ميبقاش المودپاس باين
      setPassword('')
      setConfirmPassword('')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#fdf8eb] flex flex-col items-center justify-center p-6 font-sans">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
        body { font-family: 'Poppins', sans-serif; }
        .input-field { background-color: #f4f4f4; border: 2px solid transparent; border-radius: 14px; padding: 14px 18px; width: 100%; outline: none; transition: 0.3s; font-size: 15px; color: #1f2937; font-weight: 500; }
        .input-field:focus { border-color: #c5772d; background-color: white; box-shadow: 0 4px 12px rgba(197, 119, 45, 0.08); }
        .label-style { font-weight: 700; font-size: 14px; color: #374151; margin-bottom: 8px; display: block; }
        .btn-main { background-color: #c5772d; color: white; padding: 16px; border-radius: 16px; font-weight: 700; font-size: 17px; transition: 0.3s; box-shadow: 0 10px 25px rgba(197, 119, 45, 0.2); width: 100%; border: none; cursor: pointer; }
      `}</style>

      {/* 🌟 لوغو ديال حكايات 🌟 */}
      <img src="/logo.svg" alt="Hikayat Logo" className="h-12 w-auto mb-10" style={{ filter: 'brightness(0) invert(0)' }} />

      <div className="bg-white w-full max-w-md rounded-[40px] shadow-xl p-10">
        <h2 className="text-3xl font-bold text-gray-900 tracking-tight mb-2 text-center">Nouveau mot de passe</h2>
        <p className="text-gray-400 font-medium text-center mb-8">Veuillez entrer votre nouveau mot de passe ci-dessous.</p>

        {message ? (
          <div className="flex flex-col items-center text-center animate-in fade-in zoom-in duration-300">
            <div className="bg-green-100 text-green-600 w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
            </div>
            <p className="text-green-600 font-bold mb-8">{message}</p>
            <a href="/auth" className="btn-main text-center hover:scale-105 inline-block">
              Aller à la connexion
            </a>
          </div>
        ) : (
          <form onSubmit={handleUpdatePassword} className="space-y-5">
            <div>
              <label className="label-style">Nouveau mot de passe</label>
              <input 
                type="password" 
                className="input-field" 
                placeholder="••••••••" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            
            <div>
              <label className="label-style">Confirmer le mot de passe</label>
              <input 
                type="password" 
                className="input-field" 
                placeholder="••••••••" 
                required 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            {error && <p className="text-sm text-red-500 font-bold mt-2">⚠️ {error}</p>}

            <button type="submit" disabled={loading} className="btn-main mt-4 hover:scale-105 active:scale-95">
              {loading ? 'Mise à jour...' : 'Sauvegarder le mot de passe'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}