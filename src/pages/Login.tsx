import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from '@/hooks/use-toast'
import { Loader2 } from 'lucide-react'

const Login: React.FC = () => {
  const [username, setUsername] = useState('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [checkingUser, setCheckingUser] = useState(false)
  const [userValid, setUserValid] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Session lock (local-only): 3 attempts -> 30 minutes lock
  const LOCK_KEY = 'login.lockUntil'
  const LOCK_COUNT_KEY = 'login.lockCount'
  const ATTEMPTS_KEY = 'login.attempts'
  const isLocked = useMemo(() => {
    try {
      const ts = Number(localStorage.getItem(LOCK_KEY) || 0)
      return ts > 0 && Date.now() < ts
    } catch { return false }
  }, [])
  const [locked, setLocked] = useState<boolean>(isLocked)

  function lockSession() {
    try {
      const prev = Number(localStorage.getItem(LOCK_COUNT_KEY) || 0) + 1
      localStorage.setItem(LOCK_COUNT_KEY, String(prev))
      const minutes = Math.min(30, Math.pow(2, Math.max(0, prev - 1))) // 1,2,4,8,16,30 (cap)
      const until = Date.now() + minutes * 60 * 1000
      localStorage.setItem(LOCK_KEY, String(until))
      setLocked(true)
    } catch {}
  }
  function resetAttempts() {
    try { localStorage.removeItem(ATTEMPTS_KEY) } catch {}
  }
  function incAttempts() {
    try {
      const n = Number(localStorage.getItem(ATTEMPTS_KEY) || 0) + 1
      localStorage.setItem(ATTEMPTS_KEY, String(n))
      if (n >= 3) {
        lockSession()
        localStorage.removeItem(ATTEMPTS_KEY)
      }
    } catch {}
  }
  const [remaining, setRemaining] = useState<number>(0)
  useEffect(() => {
    const tick = () => {
      try {
        const ts = Number(localStorage.getItem(LOCK_KEY) || 0)
        const diff = ts ? Math.max(0, Math.floor((ts - Date.now()) / 1000)) : 0
        setRemaining(diff)
        if (ts && Date.now() >= ts) {
          localStorage.removeItem(LOCK_KEY)
          setLocked(false)
        }
      } catch {}
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])
  const { refresh } = useAuth()
  const nav = useNavigate()
  const otpRef = useRef<HTMLDivElement | null>(null)

  // Enfocar automáticamente el primer slot del OTP cuando el usuario es válido
  useEffect(() => {
    if (userValid && !locked) {
      const t = setTimeout(() => {
        try { otpRef.current?.querySelector('input')?.focus() } catch {}
      }, 0)
      return () => clearTimeout(t)
    }
  }, [userValid, locked])

  const verify = async () => {
    if (locked || loading) return
    const usernameTrim = username.trim()
    const clean = code.replace(/\D/g, '')
    if (!usernameTrim || clean.length !== 6) return
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: usernameTrim, code: clean }) })
      if (!res.ok) {
        const msg = await res.text()
        throw new Error(msg || 'Error de verificación')
      }
      try { await res.json() } catch {}
      await refresh()
      nav('/')
      resetAttempts()
    } catch (e: any) {
      incAttempts()
      const m = e?.message || 'Error'
      setErrorMsg(m)
      toast({ description: m, variant: 'destructive', duration: 2000 })
    } finally { setLoading(false) }
  }

  const checkUser = async () => {
    setCheckingUser(true)
    setErrorMsg(null)
    setUserValid(false)
    try {
      const res = await fetch(`/api/auth/check?username=${encodeURIComponent(username.trim())}`)
      if (!res.ok) throw new Error(await res.text())
      const data = await res.json()
      if (data?.exists) {
        setUserValid(true)
        setCode('')
        // Silencioso: no toast al éxito, solo desbloquea OTP
      } else {
        setUserValid(false)
        const m = 'Usuario no encontrado'
        setErrorMsg(m)
        toast({ description: m, variant: 'destructive', duration: 2000 })
      }
    } catch (e: any) {
      const m = e?.message || 'No se pudo validar el usuario'
      setErrorMsg(m)
      toast({ description: m, variant: 'destructive', duration: 2000 })
    } finally { setCheckingUser(false) }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Iniciar sesión</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form
            className="space-y-2"
            onSubmit={(e)=>{ e.preventDefault(); if (locked) return; if (!userValid) void checkUser(); }}
          >
            <label className="text-sm">Usuario</label>
            <div className="relative">
              <input
                className="w-full rounded-md border bg-background px-3 py-2 pr-9 text-sm"
                placeholder="tu-usuario"
                value={username}
                onChange={(e)=>{ setUsername(e.target.value); setUserValid(false); setErrorMsg(null); }}
                disabled={locked || checkingUser}
              />
              {checkingUser ? (
                <span aria-hidden className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </span>
              ) : null}
            </div>
          </form>

          {/* Mensajes inline desactivados para UX minimalista; usamos toasts */}

          <AnimatePresence initial={false}>
            {userValid && (
              <motion.div
                key="otp"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="space-y-3"
                ref={otpRef}
              >
                <div className="space-y-2">
                  <label className="text-sm">Código de 6 dígitos</label>
                  <div className={locked ? 'pointer-events-none opacity-60' : ''}>
                  <div className="flex items-center gap-2">
                  <InputOTP
                    maxLength={6}
                    value={code}
                    onChange={(v)=>{
                      // Solo dígitos
                      const digits = v.replace(/\D/g, '')
                      setCode(digits); setErrorMsg(null)
                      if (digits.length === 6 && !loading && !locked) { /* no-op here; onComplete dispara */ }
                    }}
                    onComplete={(v)=>{ const digits = v.replace(/\D/g,''); setCode(digits); if (!loading && !locked && digits.length===6) void verify() }}
                    disabled={locked || loading}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                  {loading && (
                    <span aria-hidden className="inline-flex items-center justify-center px-1">
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    </span>
                  )}
                  </div>
                  </div>
                </div>
                {/* Sin botones: auto-submit al completar 6 dígitos */}
              </motion.div>
            )}
          </AnimatePresence>

          {locked && remaining > 0 && (
            <div className="text-sm text-muted-foreground">
              Sesión bloqueada por intentos fallidos. Inténtalo en {String(Math.floor(remaining/60)).padStart(2,'0')}:{String(remaining%60).padStart(2,'0')}.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default Login
