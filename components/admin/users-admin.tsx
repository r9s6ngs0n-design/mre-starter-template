'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { RequireAuth } from '@/components/admin/require-auth'
import { useAdminTheme } from '@/contexts/admin-theme-context'
import { useAuth } from '@/contexts/auth-context'
import { cn } from '@/lib/utils'
import type { Tables, UserRole } from '@/lib/database.types'

export function UsersAdmin() {
  const { t } = useAdminTheme()
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState<Tables<'users'>[]>([])
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    createClient()
      .from('users')
      .select('*')
      .order('email')
      .then(({ data }) => setUsers(data ?? []))
  }, [])

  async function updateRole(id: string, role: UserRole) {
    await createClient().from('users').update({ role }).eq('id', id)
    setUsers((u) => u.map((x) => (x.id === id ? { ...x, role } : x)))
  }

  async function toggleSuspend(id: string, suspended: boolean) {
    await createClient()
      .from('users')
      .update({ suspended_at: suspended ? new Date().toISOString() : null })
      .eq('id', id)
    setUsers((u) =>
      u.map((x) => (x.id === id ? { ...x, suspended_at: suspended ? new Date().toISOString() : null } : x))
    )
  }

  async function deleteUser(target: Tables<'users'>) {
    const label = target.full_name || target.email
    if (!window.confirm(`Delete "${label}"? This permanently removes their account and cannot be undone.`)) {
      return
    }

    setError(null)
    setDeletingId(target.id)

    try {
      const res = await fetch(`/api/admin/users/${target.id}`, { method: 'DELETE' })
      const body = (await res.json().catch(() => ({}))) as { error?: string }

      if (!res.ok) {
        setError(body.error ?? 'Failed to delete user')
        return
      }

      setUsers((u) => u.filter((x) => x.id !== target.id))
    } catch {
      setError('Failed to delete user')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <RequireAuth role="admin">
      <div className="space-y-6">
        <h1 className="text-2xl font-medium">Users</h1>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <table className="w-full text-left text-sm">
          <thead className={t.textMuted}>
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Role</th>
              <th className="p-3">Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className={t.tableRowTop}>
                <td className="p-3">{u.full_name}</td>
                <td className={cn('p-3', t.textSecondary)}>{u.email}</td>
                <td className="p-3">
                  <select
                    value={u.role}
                    onChange={(e) => updateRole(u.id, e.target.value as UserRole)}
                    className={cn(t.select, 'px-2 py-1')}
                  >
                    <option value="user">User</option>
                    <option value="agent">Agent</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td className="p-3">
                  <button
                    type="button"
                    onClick={() => toggleSuspend(u.id, !u.suspended_at)}
                    className={cn('text-xs', t.textMuted)}
                  >
                    {u.suspended_at ? 'Unsuspend' : 'Suspend'}
                  </button>
                </td>
                <td className="p-3">
                  {currentUser?.id === u.id ? (
                    <span className={cn('text-xs', t.textMuted)}>—</span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => deleteUser(u)}
                      disabled={deletingId === u.id}
                      className="text-xs text-zinc-700 hover:text-red-400 disabled:opacity-50"
                    >
                      {deletingId === u.id ? 'Deleting…' : 'Delete'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </RequireAuth>
  )
}
