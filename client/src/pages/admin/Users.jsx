import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Search, Shield, UserCircle, ChevronDown } from 'lucide-react'
import { adminApi } from '../../api/admin.api'
import { Badge } from '../../components/shared/Badge'
import { Button } from '../../components/shared/Button'
import { Spinner } from '../../components/shared/Spinner'
import { Modal } from '../../components/shared/Modal'
import { Select } from '../../components/shared/Select'
import { Pagination } from '../../components/shared/Pagination'
import { EmptyState } from '../../components/shared/EmptyState'
import { formatNumber } from '../../lib/utils'
import { ROLES } from '../../lib/constants'
import { formatDistanceToNow } from 'date-fns'
import toast from 'react-hot-toast'

const ROLE_OPTIONS = [
    { value: ROLES.ADMIN,       label: 'Admin' },
{ value: ROLES.RESEARCHER,  label: 'Researcher' },
{ value: ROLES.CONTRIBUTOR, label: 'Contributor' },
{ value: ROLES.INSTITUTION, label: 'Institution' },
]

const ROLE_META = {
    admin:       { variant: 'danger',  label: 'Admin' },
    researcher:  { variant: 'info',    label: 'Researcher' },
    contributor: { variant: 'success', label: 'Contributor' },
    institution: { variant: 'warning', label: 'Institution' },
}

function RoleBadge({ role }) {
    const { variant, label } = ROLE_META[role] ?? { variant: 'default', label: role }
    return <Badge variant={variant}>{label}</Badge>
}

export default function Users() {
    const [users, setUsers]           = useState([])
    const [total, setTotal]           = useState(0)
    const [totalPages, setTotalPages] = useState(1)
    const [page, setPage]             = useState(1)
    const [loading, setLoading]       = useState(true)
    const [search, setSearch]         = useState('')
    const [roleFilter, setRoleFilter] = useState('')

    // Role update modal
    const [editUser, setEditUser]     = useState(null)
    const [newRole, setNewRole]       = useState('')
    const [saving, setSaving]         = useState(false)

    const fetchUsers = useCallback(() => {
        setLoading(true)
        adminApi.listUsers({ page, limit: 20, role: roleFilter || undefined })
        .then((res) => {
            setUsers(res.data.users)
            setTotal(res.data.total)
            setTotalPages(res.data.totalPages)
        })
        .catch(() => toast.error('Failed to load users'))
        .finally(() => setLoading(false))
    }, [page, roleFilter])

    useEffect(() => { fetchUsers() }, [fetchUsers])

    // Client-side search filter (name/email/username)
    const filtered = search.trim()
    ? users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.username.toLowerCase().includes(search.toLowerCase())
    )
    : users

    function openEdit(user) {
        setEditUser(user)
        setNewRole(user.role)
    }

    async function handleRoleUpdate() {
        if (!editUser || newRole === editUser.role) return setEditUser(null)
            setSaving(true)
            try {
                await adminApi.updateUserRole(editUser._id, newRole)
                toast.success(`Role updated to ${newRole}`)
                setUsers((prev) =>
                prev.map((u) => (u._id === editUser._id ? { ...u, role: newRole } : u))
                )
                setEditUser(null)
            } catch {
                toast.error('Failed to update role')
            } finally {
                setSaving(false)
            }
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
        <h1 className="text-2xl font-bold text-stone-900">Users</h1>
        <p className="text-sm text-stone-500 mt-0.5">
        {formatNumber(total)} registered {total === 1 ? 'user' : 'users'}
        </p>
        </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
        <input
        type="text"
        placeholder="Search name, email or username…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full pl-9 pr-3 py-2 text-sm rounded-md border border-stone-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white"
        />
        </div>
        <select
        value={roleFilter}
        onChange={(e) => { setRoleFilter(e.target.value); setPage(1) }}
        className="px-3 py-2 text-sm rounded-md border border-stone-300 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white text-stone-700"
        >
        <option value="">All roles</option>
        {ROLE_OPTIONS.map((r) => (
            <option key={r.value} value={r.value}>{r.label}</option>
        ))}
        </select>
        </div>

        {/* Table */}
        {loading ? (
            <div className="flex justify-center py-16"><Spinner size="lg" /></div>
        ) : filtered.length === 0 ? (
            <EmptyState icon={UserCircle} title="No users found" description="Try adjusting your filters." />
        ) : (
            <>
            <div className="rounded-xl border border-stone-200 overflow-hidden">
            <table className="w-full text-sm">
            <thead className="bg-stone-50 border-b border-stone-200">
            <tr>
            {['User', 'Email', 'Role', 'Joined', 'Last Login', 'Actions'].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide">
                {h}
                </th>
            ))}
            </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
            {filtered.map((user) => (
                <tr key={user._id} className="hover:bg-stone-50">
                <td className="px-4 py-3">
                <div className="flex items-center gap-2.5">
                {user.avatar?.url ? (
                    <img
                    src={user.avatar.url}
                    alt={user.name}
                    className="w-7 h-7 rounded-full object-cover shrink-0"
                    />
                ) : (
                    <div className="w-7 h-7 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-orange-700">
                    {user.name.charAt(0).toUpperCase()}
                    </span>
                    </div>
                )}
                <div className="min-w-0">
                <Link
                to={`/users/${user.username}`}
                className="font-medium text-stone-800 hover:text-orange-700 block truncate max-w-[140px]"
                >
                {user.name}
                </Link>
                <span className="text-xs text-stone-400">@{user.username}</span>
                </div>
                </div>
                </td>
                <td className="px-4 py-3 text-stone-500 text-xs">{user.email}</td>
                <td className="px-4 py-3"><RoleBadge role={user.role} /></td>
                <td className="px-4 py-3 text-xs text-stone-400 whitespace-nowrap">
                {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
                </td>
                <td className="px-4 py-3 text-xs text-stone-400 whitespace-nowrap">
                {user.lastLogin
                    ? formatDistanceToNow(new Date(user.lastLogin), { addSuffix: true })
                    : '—'}
                    </td>
                    <td className="px-4 py-3">
                    <button
                    onClick={() => openEdit(user)}
                    className="inline-flex items-center gap-1 text-xs text-stone-500 hover:text-orange-700 font-medium"
                    >
                    <Shield size={13} />
                    Change role
                    <ChevronDown size={12} />
                    </button>
                    </td>
                    </tr>
            ))}
            </tbody>
            </table>
            </div>

            <div className="flex justify-center mt-4">
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
            </>
        )}

        {/* Role Update Modal */}
        <Modal
        open={!!editUser}
        onClose={() => setEditUser(null)}
        title="Update User Role"
        size="sm"
        >
        {editUser && (
            <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-lg">
            <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center">
            <span className="text-sm font-bold text-orange-700">
            {editUser.name.charAt(0).toUpperCase()}
            </span>
            </div>
            <div>
            <p className="text-sm font-medium text-stone-800">{editUser.name}</p>
            <p className="text-xs text-stone-500">{editUser.email}</p>
            </div>
            </div>
            <Select
            label="New Role"
            value={newRole}
            onChange={(e) => setNewRole(e.target.value)}
            options={ROLE_OPTIONS}
            />
            <div className="flex justify-end gap-2 pt-1">
            <Button variant="outline" size="sm" onClick={() => setEditUser(null)}>
            Cancel
            </Button>
            <Button size="sm" onClick={handleRoleUpdate} loading={saving}>
            Save
            </Button>
            </div>
            </div>
        )}
        </Modal>

        </div>
    )
}
