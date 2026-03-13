import { useState } from 'react'
import { format } from 'date-fns'
import { Copy, Check, Trash2, ShieldCheck, ShieldOff, UserX, UserCheck, Plus, Users, Ticket } from 'lucide-react'
import { TopBar } from '@/components/layout/TopBar'
import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { Card } from '@/components/ui/Card'
import { useAdminUsers, useAdminTokens } from '@/hooks/useAdmin'
import { useAuthStore } from '@/store/authStore'
import { useT } from '@/hooks/useT'
import type { AdminUser, InviteToken } from '@/types/domain'

type Tab = 'users' | 'tokens'

export function Admin() {
  const [tab, setTab] = useState<Tab>('users')
  const { t } = useT()
  const a = t.admin

  return (
    <div className="flex-1">
      <TopBar title={a.title} />
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        {/* Tab bar */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
          <TabBtn active={tab === 'users'} onClick={() => setTab('users')}>
            <Users size={15} /> {a.tabs.users}
          </TabBtn>
          <TabBtn active={tab === 'tokens'} onClick={() => setTab('tokens')}>
            <Ticket size={15} /> {a.tabs.tokens}
          </TabBtn>
        </div>

        {tab === 'users' ? <UsersTab /> : <TokensTab />}
      </div>
    </div>
  )
}

function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
        active ? 'bg-white text-violet-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
      }`}
    >
      {children}
    </button>
  )
}

// ─── Users Tab ───────────────────────────────────────────────────────────────

function UsersTab() {
  const { users, loading, toggleBan, toggleAdmin, deleteUser } = useAdminUsers()
  const { user: currentUser } = useAuthStore()
  const { t } = useT()
  const a = t.admin.users

  if (loading) return <div className="text-sm text-gray-400 py-8 text-center">Loading…</div>

  return (
    <Card padding="none">
      <div className="px-6 py-4 border-b border-gray-100">
        <h2 className="font-semibold text-gray-900">{a.heading}</h2>
      </div>
      {users.length === 0 ? (
        <p className="px-6 py-8 text-sm text-gray-400 text-center">{a.noUsers}</p>
      ) : (
        <ul className="divide-y divide-gray-100">
          {users.map((u) => (
            <UserRow
              key={u.id}
              user={u}
              isSelf={u.id === currentUser?.id}
              onBan={() => toggleBan(u.id, !u.is_banned)}
              onAdmin={() => toggleAdmin(u.id, !u.is_admin)}
              onDelete={() => {
                if (confirm(a.deleteConfirm)) deleteUser(u.id)
              }}
            />
          ))}
        </ul>
      )}
    </Card>
  )
}

function UserRow({
  user: u,
  isSelf,
  onBan,
  onAdmin,
  onDelete,
}: {
  user: AdminUser
  isSelf: boolean
  onBan: () => void
  onAdmin: () => void
  onDelete: () => void
}) {
  const { t } = useT()
  const a = t.admin.users
  const [busy, setBusy] = useState(false)

  const wrap = (fn: () => void) => async () => {
    setBusy(true)
    try { fn() } finally { setBusy(false) }
  }

  return (
    <li className="flex items-center gap-4 px-6 py-4">
      <Avatar src={null} name={u.full_name} size="sm" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-medium text-gray-900 truncate">{u.full_name || '—'}</p>
          {u.is_admin && <Badge variant="info">{a.adminBadge}</Badge>}
          {u.is_banned && <Badge variant="default">{a.bannedBadge}</Badge>}
        </div>
        <p className="text-xs text-gray-500 truncate">{u.email}</p>
        <p className="text-xs text-gray-400">{u.role ?? '—'} · {format(new Date(u.created_at), 'MMM d, yyyy')}</p>
      </div>

      {!isSelf && (
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={wrap(onBan)}
            disabled={busy}
            title={u.is_banned ? a.unban : a.ban}
            className="p-1.5 rounded-lg text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
          >
            {u.is_banned ? <UserCheck size={16} /> : <UserX size={16} />}
          </button>
          <button
            onClick={wrap(onAdmin)}
            disabled={busy}
            title={u.is_admin ? a.removeAdmin : a.makeAdmin}
            className="p-1.5 rounded-lg text-gray-400 hover:text-violet-600 hover:bg-violet-50 transition-colors"
          >
            {u.is_admin ? <ShieldOff size={16} /> : <ShieldCheck size={16} />}
          </button>
          <button
            onClick={wrap(onDelete)}
            disabled={busy}
            title={a.delete}
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
      )}
    </li>
  )
}

// ─── Tokens Tab ───────────────────────────────────────────────────────────────

function TokensTab() {
  const { tokens, loading, createToken, deleteToken } = useAdminTokens()
  const [note, setNote] = useState('')
  const [email, setEmail] = useState('')
  const [creating, setCreating] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const { t } = useT()
  const a = t.admin.tokens

  const handleCreate = async () => {
    setCreating(true)
    try {
      await createToken(note || undefined, email || undefined)
      setNote('')
      setEmail('')
      setShowForm(false)
    } finally {
      setCreating(false)
    }
  }

  if (loading) return <div className="text-sm text-gray-400 py-8 text-center">Loading…</div>

  const signupBase = `${window.location.origin}/signup?token=`

  return (
    <div className="space-y-4">
      {/* Create form */}
      <Card padding="md">
        {showForm ? (
          <div className="space-y-3">
            <Input
              label={a.note}
              placeholder={a.notePlaceholder}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
            <Input
              label={a.email}
              type="email"
              placeholder={a.emailPlaceholder}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <div className="flex gap-2">
              <Button onClick={handleCreate} loading={creating} size="sm">
                {a.create}
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <Button onClick={() => setShowForm(true)} size="sm">
            <Plus size={15} /> {a.create}
          </Button>
        )}
      </Card>

      {/* Token list */}
      <Card padding="none">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">{a.heading}</h2>
        </div>
        {tokens.length === 0 ? (
          <p className="px-6 py-8 text-sm text-gray-400 text-center">{a.noTokens}</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {tokens.map((token) => (
              <TokenRow
                key={token.id}
                token={token}
                signupBase={signupBase}
                onDelete={() => {
                  if (confirm(a.deleteConfirm)) deleteToken(token.id)
                }}
              />
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}

function TokenRow({ token, signupBase, onDelete }: { token: InviteToken; signupBase: string; onDelete: () => void }) {
  const [copied, setCopied] = useState(false)
  const { t } = useT()
  const a = t.admin.tokens
  const link = `${signupBase}${token.token}`

  const copy = () => {
    navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <li className="px-6 py-4 space-y-2">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            {token.note && <p className="text-sm font-medium text-gray-900">{token.note}</p>}
            {token.assigned_email && (
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{token.assigned_email}</span>
            )}
            <Badge variant={token.used_by ? 'default' : 'success'}>
              {token.used_by ? a.used : a.unused}
            </Badge>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            {a.created}: {format(new Date(token.created_at), 'MMM d, yyyy HH:mm')}
            {token.used_at && ` · Used: ${format(new Date(token.used_at), 'MMM d, yyyy')}`}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {!token.used_by && (
            <button
              onClick={copy}
              title={a.copyLink}
              className="p-1.5 rounded-lg text-gray-400 hover:text-violet-600 hover:bg-violet-50 transition-colors"
            >
              {copied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
            </button>
          )}
          <button
            onClick={onDelete}
            title={a.delete}
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Signup link preview */}
      {!token.used_by && (
        <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
          <p className="text-xs text-gray-500 truncate flex-1 font-mono">{link}</p>
          <button onClick={copy} className="text-xs text-violet-600 hover:underline shrink-0">
            {copied ? a.copied : a.copyLink}
          </button>
        </div>
      )}
    </li>
  )
}
