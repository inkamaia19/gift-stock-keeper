import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from '@/hooks/use-toast'

export const CreateUserDialog = ({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean)=>void }) => {
  const [username, setUsername] = useState('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const submit = async () => {
    const u = username.trim(); const c = code.trim()
    if (!u || !/^\d{6}$/.test(c)) { toast({ description: 'Completa usuario y 6 dígitos', variant: 'destructive' }); return }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ username: u, code: c }) })
      if (!res.ok) throw new Error(await res.text())
      toast({ description: 'Usuario guardado' })
      onOpenChange(false)
    } catch (e:any) { toast({ description: e?.message || 'Error', variant: 'destructive' }) } finally { setLoading(false) }
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crear usuario</DialogTitle>
          <DialogDescription>Define usuario y código de 6 dígitos.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <Input placeholder="usuario" value={username} onChange={(e)=>setUsername(e.target.value)} disabled={loading} />
          <Input placeholder="código (6 dígitos)" value={code} onChange={(e)=>setCode(e.target.value.replace(/\D/g,''))} maxLength={6} disabled={loading} />
        </div>
        <DialogFooter>
          <Button onClick={submit} disabled={loading || !username.trim() || code.length!==6}>{loading ? 'Guardando…' : 'Guardar'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export const ChangeCodeDialog = ({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean)=>void }) => {
  const [username, setUsername] = useState('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const submit = async () => {
    const u = username.trim(); const c = code.trim()
    if (!u || !/^\d{6}$/.test(c)) { toast({ description: 'Completa usuario y 6 dígitos', variant: 'destructive' }); return }
    setLoading(true)
    try {
      const res = await fetch(`/api/auth/users/${encodeURIComponent(u)}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ code: c }) })
      if (!res.ok) throw new Error(await res.text())
      toast({ description: 'Código actualizado' })
      onOpenChange(false)
    } catch (e:any) { toast({ description: e?.message || 'Error', variant: 'destructive' }) } finally { setLoading(false) }
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Modificar contraseña</DialogTitle>
          <DialogDescription>Actualiza el código de 6 dígitos del usuario.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <Input placeholder="usuario" value={username} onChange={(e)=>setUsername(e.target.value)} disabled={loading} />
          <Input placeholder="nuevo código (6 dígitos)" value={code} onChange={(e)=>setCode(e.target.value.replace(/\D/g,''))} maxLength={6} disabled={loading} />
        </div>
        <DialogFooter>
          <Button onClick={submit} disabled={loading || !username.trim() || code.length!==6}>{loading ? 'Actualizando…' : 'Actualizar'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
