import { Table } from '../shared/Table'
import { Badge } from '../shared/Badge'
import { Button } from '../shared/Button'
import { Pagination } from '../shared/Pagination'
import { CountryFlag } from '../shared/CountryFlag'
import { MoreVertical, Shield, Ban } from 'lucide-react'

// Temporary inline formatter until formatters.js is ready
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium' }).format(new Date(dateString));
}

export function AdminUsersTable({ 
  users = [], 
  isLoading, 
  page, 
  totalPages, 
  onPageChange,
  onManageRole,
  onBanUser
}) {
  const columns = [
    {
      key: 'user',
      label: 'User',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center text-stone-600 font-bold uppercase">
            {row.name.charAt(0)}
          </div>
          <div>
            <p className="font-medium text-stone-900">{row.name}</p>
            <p className="text-xs text-stone-500">{row.email}</p>
          </div>
        </div>
      )
    },
    {
      key: 'location',
      label: 'Location',
      render: (row) => (
        <div className="flex items-center gap-2">
          {/* Assuming CountryFlag takes a 2-letter ISO code */}
          <CountryFlag code={row.countryCode} /> 
          <span className="text-sm text-stone-600">{row.countryName}</span>
        </div>
      )
    },
    {
      key: 'role',
      label: 'Role',
      render: (row) => (
        <Badge variant={row.role === 'ADMIN' ? 'danger' : row.role === 'MODERATOR' ? 'primary' : 'default'}>
          {row.role}
        </Badge>
      )
    },
    {
      key: 'joinedAt',
      label: 'Joined',
      render: (row) => formatDate(row.joinedAt)
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <Badge variant={row.isBanned ? 'danger' : row.isActive ? 'success' : 'warning'}>
          {row.isBanned ? 'Banned' : row.isActive ? 'Active' : 'Inactive'}
        </Badge>
      )
    },
    {
      key: 'actions',
      label: '',
      render: (row) => (
        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={() => onManageRole(row)}>
            <Shield size={16} />
          </Button>
          <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50" onClick={() => onBanUser(row)}>
            <Ban size={16} />
          </Button>
        </div>
      )
    }
  ]

  return (
    <div className="space-y-4">
      <Table 
        columns={columns} 
        data={users} 
        emptyMessage={isLoading ? "Loading users..." : "No users found matching your criteria."} 
      />
      <div className="flex justify-between items-center px-2">
        <span className="text-sm text-stone-500">
          Showing page {page} of {totalPages || 1}
        </span>
        <Pagination page={page} totalPages={totalPages} onPageChange={onPageChange} />
      </div>
    </div>
  )
}