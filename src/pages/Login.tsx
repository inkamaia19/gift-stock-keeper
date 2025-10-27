import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

const Login: React.FC = () => {
  const [username, setUsername] = useState('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const { refresh } = useAuth()
  const nav = useNavigate()

  const verify = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, code }) })
      if (!res.ok) {
        const msg = await res.text()
        throw new Error(msg || 'Error de verificación')
      }
      try { await res.json() } catch {}
      await refresh()
      nav('/')
    } catch (e: any) {
      alert(e?.message || 'Error')
    } finally { setLoading(false) }
  }

  // Sin enrolamiento TOTP: solo login por código fijo

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Iniciar sesión</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm">Usuario / Código</label>
            <input className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                   placeholder="tu-usuario" value={username} onChange={(e)=>setUsername(e.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-sm">Código de 6 dígitos</label>
            <InputOTP maxLength={6} value={code} onChange={setCode}>
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </div>
          <div className="flex justify-end gap-2">
            <Button onClick={verify} disabled={loading || code.length !== 6 || !username}>{loading ? 'Validando...' : 'Entrar'}</Button>
          </div>
          <div className="flex justify-end">
            <Button variant="ghost" onClick={async ()=>{ try { await fetch('/api/auth/logout', { method: 'POST' }); await refresh(); } catch {} }}>Cerrar sesión</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 

export default Login
