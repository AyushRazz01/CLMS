'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, Plus, Edit, Trash2, UserPlus, AlertCircle, BookOpen, Clock, DollarSign, Send, Calendar as CalendarIcon, Users } from 'lucide-react'
import { Sidebar } from '@/components/sidebar'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

interface BorrowRecord {
  id: string
  status: 'BORROWED' | 'RETURNED'
  borrow_date: string
  due_date: string
  book: { title: string }
}

interface User {
  id: string
  full_name: string
  email: string
  role: 'STUDENT' | 'FACULTY' | 'LIBRARIAN' | 'ADMIN'
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  branch?: string
  year?: number
  semester?: number
  phone?: string
  created_at: string
  borrow_records: BorrowRecord[]
}

export default function UsersPage() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const { data: { user: supabaseUser } } = await supabase.auth.getUser()
      if (!supabaseUser) {
        router.push('/')
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .single()
      
      if (profile) {
        setCurrentUser(profile)
      }
    }

    checkAuth()
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users')
      if (!response.ok) throw new Error('Failed to fetch users')
      const data = await response.json()
      setUsers(data)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load users',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return

    try {
      const response = await fetch(`/api/users/${userId}`, { method: 'DELETE' })
      const data = await response.json()
      
      if (!response.ok) throw new Error(data.error || 'Failed to delete user')
      
      toast({ title: 'Success', description: 'User deleted successfully' })
      fetchUsers()
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' })
    }
  }

  const handleUpdateStatus = async (userId: string, status: string) => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update status')
      }
      
      toast({ title: 'Success', description: `User ${status.toLowerCase()} successfully` })
      fetchUsers()
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' })
    }
  }

  const handleNotifyUser = async (userId: string) => {
    const message = prompt('Enter message for user:')
    if (!message) return

    try {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          user_id: userId, 
          title: 'Librarian Notification', 
          message,
          type: 'INFO'
        })
      })
      if (!response.ok) throw new Error('Failed to send notification')
      toast({ title: 'Success', description: 'Notification sent successfully' })
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to send notification', variant: 'destructive' })
    }
  }

  const handleAddFine = async (userId: string, recordId: string, bookTitle: string) => {
    const amount = prompt(`Enter fine amount for "${bookTitle}":`, '50')
    if (!amount || isNaN(Number(amount))) {
      if (amount) toast({ title: 'Error', description: 'Invalid amount', variant: 'destructive' })
      return
    }

    const reason = prompt('Enter reason for fine:', `Overdue fine for ${bookTitle}`)
    if (!reason) return

    try {
      const response = await fetch('/api/fines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId, 
          borrowRecordId: recordId, 
          amount: Number(amount), 
          reason 
        })
      })
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to issue fine')
      }
      toast({ title: 'Success', description: `Fine of $${amount} issued successfully` })
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' })
    }
  }

  // Priority and Sorting
  const getUserPriority = (user: User) => {
    const activeRecords = user.borrow_records?.filter(r => r.status === 'BORROWED') || []
    const now = new Date()
    
    const hasOverdue = activeRecords.some(r => new Date(r.due_date) < now)
    if (hasOverdue) return 3 // Absolute priority

    const isNearDeadline = activeRecords.some(r => {
      const dueDate = new Date(r.due_date)
      const diffDays = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      return diffDays <= 3 && diffDays > 0
    })
    if (isNearDeadline) return 2

    return 1
  }

  const filteredUsers = (Array.isArray(users) ? users : [])
    .filter(user => {
      const matchesSearch = (user.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (user.email || '').toLowerCase().includes(searchTerm.toLowerCase())
      
      let matchesRole = true
      if (roleFilter === 'OVERDUE') {
        const activeRecords = user.borrow_records?.filter(r => r.status === 'BORROWED') || []
        matchesRole = activeRecords.some(r => new Date(r.due_date) < new Date())
      } else if (roleFilter !== 'all') {
        matchesRole = user.role === roleFilter
      }
      
      return matchesSearch && matchesRole
    })
    .sort((a, b) => getUserPriority(b) - getUserPriority(a))

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
      case 'LIBRARIAN': return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
      case 'FACULTY': return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
      case 'STUDENT': return 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300'
    }
  }

  if (loading || !currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex">
      <Sidebar user={currentUser} />
      
      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">User Management</h1>
              <p className="text-sm text-slate-500 mt-1">Manage users, monitor borrowings, and handle penalties</p>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <UserPlus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </div>

          <Card className="bg-white dark:bg-slate-800 border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold">Directory</CardTitle>
                <CardDescription>Overdue issues are strictly prioritized at the top with a red pulse.</CardDescription>
              </div>
              <Badge variant="outline" className="text-[10px] uppercase tracking-wider font-bold text-red-500 border-red-200 animate-pulse bg-red-50">
                Live Status Enabled
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search by name, email or university ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 shadow-none focus-visible:ring-1"
                  />
                </div>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-full sm:w-56 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 shadow-none">
                    <SelectValue placeholder="Filter Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="OVERDUE" className="text-red-500 font-medium">⚠️ Overdue Cases</SelectItem>
                    <SelectItem value="STUDENT">Students Only</SelectItem>
                    <SelectItem value="FACULTY">Faculty Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="rounded-xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm overflow-x-auto">
                <Table className="bg-white dark:bg-slate-800">
                  <TableHeader className="bg-slate-50 dark:bg-slate-900">
                    <TableRow className="hover:bg-transparent border-b border-slate-100 dark:border-slate-800 text-[11px] uppercase tracking-wider font-bold">
                      <TableHead className="py-4">User Details</TableHead>
                      <TableHead>Academic Info</TableHead>
                      <TableHead className="min-w-[300px]">Active Borrows (Issue & Due)</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right pr-6">Management</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-20 text-slate-400">
                          <div className="flex flex-col items-center gap-2">
                            <Users className="h-10 w-10 opacity-20" />
                            <p>No matching users found in the system</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredUsers.map((user) => {
                        const activeBorrows = user.borrow_records?.filter(r => r.status === 'BORROWED') || []
                        const overdueRecords = activeBorrows.filter(r => new Date(r.due_date) < new Date())
                        const hasOverdue = overdueRecords.length > 0

                        return (
                          <TableRow key={user.id} className={cn(
                            "hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-all border-b border-slate-50 dark:border-slate-800",
                            hasOverdue && "bg-red-50/40 dark:bg-red-900/10 shadow-[inset_4px_0_0_0_#ef4444]"
                          )}>
                            <TableCell className="py-5">
                              <div className="flex flex-col">
                                <span className={cn(
                                  "font-bold flex items-center gap-2 text-sm",
                                  hasOverdue ? "text-red-700 dark:text-red-400" : "text-slate-900 dark:text-white"
                                )}>
                                  {user.full_name}
                                  {hasOverdue && (
                                    <Badge className="bg-red-600 hover:bg-red-600 text-[9px] h-4 px-1.5 animate-pulse shadow-sm">
                                      CRITICAL OVERDUE
                                    </Badge>
                                  )}
                                </span>
                                <span className="text-xs text-slate-500 mt-0.5">{user.email}</span>
                                <div className="flex items-center gap-2 mt-2">
                                  <Badge variant="secondary" className={cn("text-[9px] h-4 px-1 leading-none font-extrabold uppercase", getRoleColor(user.role))}>
                                    {user.role}
                                  </Badge>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col text-xs space-y-1">
                                <span className="text-slate-700 dark:text-slate-300 font-medium">{user.branch || 'General Dept.'}</span>
                                <div className="flex items-center gap-2 text-slate-400 font-mono">
                                  <span>Yr {user.year || '-'}</span>
                                  <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                  <span>Sem {user.semester || '-'}</span>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="py-4">
                              <div className="grid grid-cols-1 gap-2">
                                {activeBorrows.length > 0 ? (
                                  activeBorrows.map(record => {
                                    const isOverdue = new Date(record.due_date) < new Date()
                                    return (
                                      <div key={record.id} className={cn(
                                        "group relative flex flex-col gap-2 p-3 rounded-lg border transition-all duration-200",
                                        isOverdue 
                                          ? "border-red-300 bg-red-100/70 dark:border-red-900/50 dark:bg-red-900/30" 
                                          : "border-slate-100 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900/50"
                                      )}>
                                        <div className="flex justify-between items-start gap-4">
                                          <div className={cn(
                                            "font-bold text-xs line-clamp-1 flex-1",
                                            isOverdue ? "text-red-900 dark:text-red-200" : "text-slate-900 dark:text-white"
                                          )}>
                                            {record.book?.title}
                                          </div>
                                          {isOverdue && (
                                            <Button 
                                              variant="destructive" 
                                              size="sm" 
                                              className="h-7 px-2 text-[10px] font-bold uppercase tracking-wider shadow-sm animate-bounce"
                                              onClick={() => handleAddFine(user.id, record.id, record.book?.title)}
                                            >
                                              <DollarSign className="h-3 w-3 mr-1" />
                                              Fine
                                            </Button>
                                          )}
                                        </div>
                                        
                                        <div className="flex flex-wrap gap-x-5 gap-y-1.5 mt-0.5">
                                          <div className="flex items-center gap-2 text-[10px] text-slate-600 dark:text-slate-400 font-medium">
                                            <CalendarIcon className="h-3 w-3 text-blue-500" />
                                            <span>Issued:</span>
                                            <span className="text-slate-900 dark:text-slate-200">
                                              {new Date(record.borrow_date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                                            </span>
                                          </div>
                                          <div className={cn(
                                            "flex items-center gap-2 text-[10px] font-semibold",
                                            isOverdue ? "text-red-700 dark:text-red-400" : "text-slate-600 dark:text-slate-400"
                                          )}>
                                            <Clock className={cn("h-3 w-3", isOverdue ? "text-red-600 animate-spin-slow" : "text-orange-500")} />
                                            <span>Due:</span>
                                            <span>
                                              {new Date(record.due_date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                                            </span>
                                          </div>
                                        </div>

                                        {isOverdue && (
                                          <div className="absolute -top-2 -right-2 bg-red-600 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full shadow-sm">
                                            LATE
                                          </div>
                                        )}
                                      </div>
                                    )
                                  })
                                ) : (
                                  <div className="flex items-center gap-2 text-slate-400 text-[11px] italic opacity-70 px-1 py-4 border border-dashed rounded-lg">
                                    <BookOpen className="h-4 w-4" />
                                    No active borrowings recorded
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col gap-2">
                                <Badge 
                                  variant={user.status === 'APPROVED' ? 'default' : user.status === 'PENDING' ? 'outline' : 'destructive'}
                                  className={cn(
                                    "text-[9px] h-5 px-2 font-bold uppercase tracking-widest",
                                    user.status === 'APPROVED' ? "bg-emerald-600 hover:bg-emerald-600 border-0" : "",
                                    user.status === 'PENDING' ? "text-amber-600 border-amber-200 bg-amber-50" : ""
                                  )}
                                >
                                  {user.status}
                                </Badge>
                                {hasOverdue && (
                                  <Badge variant="destructive" className="text-[8px] h-4 px-1.5 font-black animate-pulse border-2 border-white shadow-sm">
                                    PENALTY HUB
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-right pr-6">
                              <div className="flex justify-end gap-1.5">
                                {user.status === 'PENDING' && (
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="h-8 px-2 text-[10px] font-black uppercase tracking-tight text-emerald-600 border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300 shadow-sm"
                                    onClick={() => handleUpdateStatus(user.id, 'APPROVED')}
                                  >
                                    Verify
                                  </Button>
                                )}
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  className="h-8 w-8 text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all active:scale-90"
                                  onClick={() => handleNotifyUser(user.id)}
                                  title="Send Direct Message"
                                >
                                  <Send className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all active:scale-95"
                                  onClick={() => handleDeleteUser(user.id)}
                                  title="Remove Profile"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

function UsersIcon({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}
