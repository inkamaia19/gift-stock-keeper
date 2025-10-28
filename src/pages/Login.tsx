import React, { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from '@/hooks/use-toast'
import { Loader2, Clock3 } from 'lucide-react'
import { useI18n } from '@/contexts/I18nContext'

const Login: React.FC = () => {
  const [username, setUsername] = useState('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [checkingUser, setCheckingUser] = useState(false)
  const [userValid, setUserValid] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Bloqueo activado cuando el servidor devuelve 403 (1 min)
  const [locked, setLocked] = useState(false)
  const [remaining, setRemaining] = useState<number>(0)
  const ATTEMPT_THRESHOLD = 3
  const [attempts, setAttempts] = useState<number>(0)
  useEffect(() => {
    if (!locked) return
    const id = setInterval(() => {
      setRemaining((r) => {
        const next = Math.max(0, r - 1)
        if (next === 0) {
          clearInterval(id)
          setLocked(false)
        }
        return next
      })
    }, 1000)
    return () => clearInterval(id)
  }, [locked])
  const { refresh } = useAuth()
  const nav = useNavigate()
  const otpRef = useRef<HTMLDivElement | null>(null)
  const { t, lang, setLang } = useI18n()

  // Enfocar automáticamente el primer slot del OTP cuando el usuario es válido
  useEffect(() => {
    if (userValid) {
      const t = setTimeout(() => {
        try { otpRef.current?.querySelector('input')?.focus() } catch {}
      }, 0)
      return () => clearTimeout(t)
    }
  }, [userValid])

  const verify = async () => {
    if (loading || locked) return
    const usernameTrim = username.trim()
    const clean = code.replace(/\D/g, '')
    if (!usernameTrim || clean.length !== 6) return
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: usernameTrim, code: clean }) })
      if (!res.ok) {
        const msg = await res.text()
        // gestionar intentos en cliente para UX
        if (res.status === 401) {
          setAttempts(a => Math.min(ATTEMPT_THRESHOLD, a + 1))
        }
        throw new Error(msg || 'Error de verificación')
      }
      try { await res.json() } catch {}
      await refresh()
      nav('/')
      // ok
      setAttempts(0)
    } catch (e: any) {
      let m = e?.message || 'Error'
      if (typeof m === 'string' && m.toLowerCase().includes('account locked')) {
        // activar bloqueo local 60s para UX con contador
        setLocked(true)
        setRemaining(60)
        m = 'Cuenta bloqueada por intentos. Espera 01:00'
        setAttempts(0)
      }
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
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{t('login_title')}</CardTitle>
          <div className="flex items-center gap-2">
            <label className="text-xs text-muted-foreground">{lang === 'es' ? 'Idioma' : 'Language'}</label>
            <select
              className="rounded-md border bg-background px-2 py-1 text-xs"
              value={lang}
              onChange={(e)=> setLang(e.target.value as any)}
            >
              <option value="es">Español</option>
              <option value="en">English</option>
            </select>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <form
            className="space-y-2"
            onSubmit={(e)=>{ e.preventDefault(); if (!userValid) void checkUser(); }}
          >
            <label className="text-sm">{t('login_user')}</label>
            <div className="relative">
              <input
                className="w-full rounded-md border bg-background px-3 py-2 pr-9 text-sm"
                placeholder="tu-usuario"
                value={username}
                onChange={(e)=>{ setUsername(e.target.value); setUserValid(false); setErrorMsg(null); }}
                disabled={checkingUser}
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
                  <label className="text-sm">{t('login_code')}</label>
                  <div className={locked ? 'pointer-events-none opacity-60' : ''}>
                  <div className="flex items-center gap-2">
                  <InputOTP
                    maxLength={6}
                    value={code}
                    onChange={(v)=>{
                      // Solo dígitos
                      const digits = v.replace(/\D/g, '')
                      setCode(digits); setErrorMsg(null)
                      if (digits.length === 6 && !loading) { /* no-op here; onComplete dispara */ }
                    }}
                    onComplete={(v)=>{ const digits = v.replace(/\D/g,''); setCode(digits); if (!loading && digits.length===6) void verify() }}
                    disabled={loading}
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

          {locked && (
            <div className="mt-2 inline-flex items-center gap-2 rounded-md border border-border bg-muted/30 px-3 py-2 text-sm text-muted-foreground" role="status" aria-live="polite">
              <Clock3 className="h-4 w-4" />
              <span>
                {t('blocked_msg')} {String(Math.floor(remaining/60)).padStart(2,'0')}:{String(remaining%60).padStart(2,'0')}.
              </span>
            </div>
          )}

          {!locked && attempts > 0 && attempts < ATTEMPT_THRESHOLD && (
            <div className="mt-2 inline-flex items-center gap-2 rounded-md border border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
              {t('attempts_left').replace('{n}', String(ATTEMPT_THRESHOLD - attempts))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default Login
