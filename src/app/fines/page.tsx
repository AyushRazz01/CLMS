'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sidebar } from '@/components/sidebar'
import { DollarSign, Search, CheckCircle, XCircle, AlertTriangle, BookOpen, Clock, Calendar as CalendarIcon, Users, AlertCircle, Send, Plus } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface BorrowRecord {
  id: string
  status: 'BORROWED' | 'RETURNED' | 'OVERDUE'
  borrow_date: string
  due_date: string
  book: { title: string }
}

interface UserProfile {
  id: string
  full_name: string
  email: string
  role: 'STUDENT' | 'FACULTY' | 'LIBRARIAN' | 'ADMIN'
  branch?: string
  status: string
  borrow_records: BorrowRecord[]
}

interface Fine {
  id: string
  user_id: string
  borrow_record_id?: string
  amount: number
  reason: string
  status: 'PENDING' | 'PAID' | 'WAIVED'
  paid_date?: string
  created_at: string
  updated_at: string
  user: {
    full_name: string
    email: string
    role: string
  }
  borrow_record?: {
    book: {
      title: string
      author: string
      isbn: string
    }
  }
}

interface FineCategory {
  id: string
  label: string
  defaultAmount: number
  description: string
}

const FINE_CATEGORIES: FineCategory[] = [
  { id: 'OVERDUE', label: 'Overdue Book', defaultAmount: 5, description: 'Book returned after due date (₹5 / day)' },
  { id: 'DAMAGED', label: 'Damaged Book', defaultAmount: 100, description: 'Torn pages, marks, or structural damage' },
  { id: 'LOST', label: 'Lost Item', defaultAmount: 500, description: 'Book missing or declared lost' },
  { id: 'MISCONDUCT', label: 'Library Misconduct', defaultAmount: 50, description: 'Disruptive behavior or rule violations' },
  { id: 'OTHER', label: 'Other / Manual', defaultAmount: 0, description: 'Manual fine entry' },
]

export default function FinesPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [fines, setFines] = useState<Fine[]>([])
  const [users, setUsers] = useState<UserProfile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'oversight' | 'history'>('oversight')

  // Fine Issuance State
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<UserProfile | null>(null)
  const [selectedRecordId, setSelectedRecordId] = useState<string | undefined>(undefined)
  const [fineForm, setFineForm] = useState({
    amount: '',
    reason: '',
    category: 'OVERDUE'
  })

  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const calculateOverdueFine = (dueDate: string) => {
    const now = new Date()
    const due = new Date(dueDate)
    if (now <= due) return 0
    const diffTime = Math.abs(now.getTime() - due.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays * 5
  }

  useEffect(() => {
    // Get user data from storage
    const userData = sessionStorage.getItem('user') || localStorage.getItem('user')
    if (userData) {
      const parsedUser = JSON.parse(userData)
      setUser(parsedUser)
      // For staff, default to oversight. For students, history only.
      if (parsedUser.role === 'STUDENT' || parsedUser.role === 'FACULTY') {
        setActiveTab('history')
      }
      fetchData(parsedUser)
    } else {
      router.replace('/')
    }
  }, [])

  const fetchData = async (currentUser: any) => {
    setIsLoading(true)
    try {
      // 1. Fetch Fines
      let finesUrl = '/api/fines'
      if (currentUser.role === 'STUDENT' || currentUser.role === 'FACULTY') {
        finesUrl += `?userId=${currentUser.id}`
      }
      const finesResponse = await fetch(finesUrl)
      const finesData = await finesResponse.json()
      if (finesResponse.ok) setFines(finesData)

      // 2. Fetch Users (Only for Staff - for the Oversight tab)
      if (currentUser.role === 'ADMIN' || currentUser.role === 'LIBRARIAN') {
        const usersResponse = await fetch('/api/users')
        const usersData = await usersResponse.json()
        if (usersResponse.ok) setUsers(usersData)
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      toast({ title: 'Error', description: 'Failed to fetch management records', variant: 'destructive' })
    } finally {
      setIsLoading(false)
    }
  }

  // Priority and Sorting for Oversight
  const getUserPriority = (user: UserProfile) => {
    const activeRecords = user.borrow_records?.filter(r => r.status === 'BORROWED') || []
    const now = new Date()
    const hasOverdue = activeRecords.some(r => new Date(r.due_date) < now)
    return hasOverdue ? 2 : 1
  }

  const filteredOversightUsers = (Array.isArray(users) ? users : [])
    .filter(u => {
      // Show all users but focus on those who borrow
      const isSearchMatch = (u.full_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (u.email || '').toLowerCase().includes(searchQuery.toLowerCase())
      return isSearchMatch && (u.role === 'STUDENT' || u.role === 'FACULTY')
    })
    .sort((a, b) => getUserPriority(b) - getUserPriority(a))

  const filteredFines = (Array.isArray(fines) ? fines : [])
    .filter(fine => {
      const isSearchMatch = fine.borrow_record?.book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            fine.user.full_name.toLowerCase().includes(searchQuery.toLowerCase())
      const isStatusMatch = statusFilter === 'all' || fine.status === statusFilter
      return isSearchMatch && isStatusMatch
    })

  const openFineDialog = (student: UserProfile, recordId?: string, bookTitle?: string) => {
    setSelectedStudent(student)
    setSelectedRecordId(recordId)
    const category = recordId ? 'OVERDUE' : 'MISCONDUCT'
    const preset = FINE_CATEGORIES.find(c => c.id === category)
    
    // Auto-calculate if overdue
    let amount = preset?.defaultAmount.toString() || '0'
    if (category === 'OVERDUE' && recordId) {
      const record = student.borrow_records?.find(r => r.id === recordId)
      if (record) amount = calculateOverdueFine(record.due_date).toString()
    }

    setFineForm({
      category: category,
      amount: amount,
      reason: bookTitle ? `Penalty for ${bookTitle}` : (preset?.description || '')
    })
    setIsDialogOpen(true)
  }

  const handleCategoryChange = (catId: string) => {
    const preset = FINE_CATEGORIES.find(c => c.id === catId)
    
    let amount = preset?.defaultAmount.toString() || '0'
    // If categorical overdue selected with a book already chosen
    if (catId === 'OVERDUE' && selectedRecordId && selectedStudent) {
      const record = selectedStudent.borrow_records?.find(r => r.id === selectedRecordId)
      if (record) amount = calculateOverdueFine(record.due_date).toString()
    }

    setFineForm(prev => ({
      ...prev,
      category: catId,
      amount: amount,
      reason: preset?.description || ''
    }))
  }

  const onBookChange = (recordId: string) => {
    setSelectedRecordId(recordId)
    const record = selectedStudent?.borrow_records?.find(r => r.id === recordId)
    if (fineForm.category === 'OVERDUE' && record) {
      const newAmount = calculateOverdueFine(record.due_date)
      setFineForm(prev => ({ 
        ...prev, 
        amount: newAmount.toString(),
        reason: `Overdue penalty for ${record.book.title}` 
      }))
    } else if (record) {
      setFineForm(prev => ({ 
        ...prev, 
        reason: `Penalty for ${record.book.title}` 
      }))
    }
  }

  const submitFine = async () => {
    if (!selectedStudent || !fineForm.amount || !fineForm.reason) {
      toast({ title: 'Validation Failed', description: 'Please fill all fields', variant: 'destructive' })
      return
    }

    try {
      const response = await fetch('/api/fines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: selectedStudent.id, 
          borrowRecordId: selectedRecordId, 
          amount: Number(fineForm.amount), 
          reason: fineForm.reason 
        })
      })
      if (response.ok) {
        toast({ title: 'Success', description: 'Fine successfully issued and logged.' })
        setIsDialogOpen(false)
        fetchData(user)
      } else {
        const data = await response.json()
        toast({ title: 'Error', description: data.error || 'Failed to issue fine', variant: 'destructive' })
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Server connection failed', variant: 'destructive' })
    }
  }

  const handlePayFine = async (fineId: string) => {
    try {
      const response = await fetch('/api/fines/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fineId })
      })
      if (response.ok) {
        toast({ title: 'Success', description: 'Fine paid successfully' })
        fetchData(user)
      } else {
        toast({ title: 'Error', description: 'Failed to process payment', variant: 'destructive' })
      }
    } catch (error) {
      console.error('Error paying fine:', error)
    }
  }

  const handleWaiveFine = async (fineId: string) => {
    try {
      const response = await fetch('/api/fines/waive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fineId })
      })
      if (response.ok) {
        toast({ title: 'Success', description: 'Fine waived successfully' })
        fetchData(user)
      } else {
        toast({ title: 'Error', description: 'Failed to waive fine', variant: 'destructive' })
      }
    } catch (error) {
      console.error('Error waiving fine:', error)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID': return <Badge className="bg-green-100 text-green-800 uppercase text-[9px] font-black">Paid</Badge>
      case 'WAIVED': return <Badge className="bg-yellow-100 text-yellow-800 uppercase text-[9px] font-black">Waived</Badge>
      case 'PENDING': default: return <Badge className="bg-red-100 text-red-800 uppercase text-[9px] font-black tracking-tighter">Pending</Badge>
    }
  }

  if (!user) return <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900"><div className="animate-spin rounded-full h-8 w-8 border-4 border-primary border-r-transparent"></div></div>

  const isStaff = user.role === 'ADMIN' || user.role === 'LIBRARIAN'
  const totalPending = fines.filter(f => f.status === 'PENDING').reduce((sum, f) => sum + f.amount, 0)

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex">
      <Sidebar user={user} />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900 dark:text-white uppercase tracking-tight">
                {isStaff ? 'Penalty & Recovery hub' : 'My Penalty records'}
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                {isStaff ? 'Tracking delayed returns and student debt oversight' : 'View and settle your library dues'}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              {isStaff && (
                <>
                  <div className="flex bg-white dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                    <Button 
                      variant={activeTab === 'oversight' ? 'default' : 'ghost'} 
                      size="sm"
                      onClick={() => setActiveTab('oversight')}
                      className={cn("px-4 font-bold text-[11px]", activeTab === 'oversight' && "bg-blue-600 hover:bg-blue-700")}
                    >
                      Oversight
                    </Button>
                    <Button 
                      variant={activeTab === 'history' ? 'default' : 'ghost'} 
                      size="sm"
                      onClick={() => setActiveTab('history')}
                      className={cn("px-4 font-bold text-[11px]", activeTab === 'history' && "bg-blue-600 hover:bg-blue-700")}
                    >
                      Fine History
                    </Button>
                  </div>
                  <Button 
                    className="bg-red-600 hover:bg-red-700 text-white gap-2 h-9 font-black text-[11px] uppercase tracking-tighter shadow-md"
                    onClick={() => {
                      setSelectedStudent(null)
                      setSelectedRecordId(undefined)
                      setIsDialogOpen(true)
                    }}
                  >
                    <Plus className="h-4 w-4" />
                    Direct issue
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Key Stats */}
          <div className="grid gap-4 md:grid-cols-3">
             <Card className="bg-white dark:bg-slate-800 border-0 shadow-sm border-l-4 border-red-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                  {isStaff ? 'Total Pending Recovery' : 'My Current Debt'}
                </CardTitle>
                <DollarSign className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-black text-slate-900 dark:text-white">₹{totalPending.toFixed(2)}</div>
                <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-tighter">Amount to be collected</p>
              </CardContent>
            </Card>

            {isStaff && (
              <Card className="bg-white dark:bg-slate-800 border-0 shadow-sm border-l-4 border-amber-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-[10px] font-black uppercase tracking-widest text-slate-500 tracking-tighter">Critical Overdue cases</CardTitle>
                  <AlertCircle className="h-4 w-4 text-amber-500 animate-pulse" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-black text-slate-900 dark:text-white">
                    {users.filter(u => u.borrow_records?.some(r => r.status === 'BORROWED' && new Date(r.due_date) < new Date())).length}
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-tighter">Active overdue student records</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Primary View Area */}
          <div className="space-y-4">
            <Card className="bg-white dark:bg-slate-800 border-0 shadow-sm">
              <CardContent className="p-4 flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <Input
                    placeholder={activeTab === 'oversight' ? "Quick search student database..." : "Search fine records..."}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-9 text-xs"
                  />
                </div>
                {activeTab === 'history' && (
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-48 h-9 text-xs">
                      <SelectValue placeholder="View Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Records</SelectItem>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="PAID">Paid</SelectItem>
                      <SelectItem value="WAIVED">Waived</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-slate-800 border-0 shadow-sm overflow-hidden min-h-[400px]">
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="py-20 text-center"><div className="animate-spin h-8 w-8 border-4 border-blue-600 border-r-transparent rounded-full mx-auto mb-4"></div><p className="text-slate-500">Retrieving system records...</p></div>
                ) : activeTab === 'oversight' && isStaff ? (
                  /* Oversight View */
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
                        <TableRow>
                          <TableHead className="text-[10px] uppercase font-black tracking-widest pl-6">Student</TableHead>
                          <TableHead className="text-[10px] uppercase font-black tracking-widest">Live Borrowings (Issued / Deadline)</TableHead>
                          <TableHead className="text-right text-[10px] uppercase font-black tracking-widest pr-6">Management</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredOversightUsers.map(student => {
                          const activeRecords = student.borrow_records?.filter(r => r.status === 'BORROWED') || []
                          const hasOverdue = activeRecords.some(r => new Date(r.due_date) < new Date())
                          
                          return (
                            <TableRow key={student.id} className={cn(hasOverdue && "bg-red-50/20 dark:bg-red-950/20 shadow-[inset_4px_0_0_0_#ef4444]")}>
                              <TableCell className="align-top py-6 pl-6">
                                <div className="font-black text-slate-900 dark:text-white uppercase text-[11px]">{student.full_name}</div>
                                <div className="text-[10px] text-slate-500">{student.email}</div>
                                <Badge variant="outline" className="mt-2 text-[8px] bg-slate-50 font-bold tracking-tight">{student.branch || 'GENERAL'}</Badge>
                              </TableCell>
                              <TableCell className="py-6">
                                <div className="space-y-2">
                                  {activeRecords.length > 0 ? activeRecords.map(record => {
                                    const late = new Date(record.due_date) < new Date()
                                    return (
                                      <div key={record.id} className={cn(
                                        "p-2.5 rounded border text-[11px] flex justify-between items-center group",
                                        late ? "border-red-200 bg-red-50/80 dark:bg-red-900/10" : "border-slate-100 bg-slate-50/50 dark:bg-slate-900/50"
                                      )}>
                                        <div className="flex gap-4 items-center">
                                          <div className={cn("font-bold flex-1", late ? "text-red-700 font-black" : "")}>{record.book.title}</div>
                                          <div className="flex gap-4 text-[10px] text-slate-500 font-mono">
                                             <span className="flex items-center gap-1.5 opacity-70"><CalendarIcon className="h-3 w-3" /> {new Date(record.borrow_date).toLocaleDateString()}</span>
                                             <span className={cn("flex items-center gap-1.5", late && "text-red-600 font-black underline underline-offset-4 decoration-2")}>
                                              <Clock className="h-3 w-3" /> {new Date(record.due_date).toLocaleDateString()}
                                             </span>
                                          </div>
                                        </div>
                                        <Button 
                                          variant="outline" 
                                          size="sm" 
                                          className={cn("h-7 text-[9px] font-black uppercase hidden group-hover:flex", late ? "bg-red-600 text-white border-0 hover:bg-red-700 shadow-sm" : "")}
                                          onClick={() => openFineDialog(student, record.id, record.book.title)}
                                        >
                                          Issue fine
                                        </Button>
                                      </div>
                                    )
                                  }) : <span className="text-slate-400 text-[10px] uppercase font-bold italic opacity-60">No pending returns.</span>}
                                </div>
                              </TableCell>
                              <TableCell className="text-right py-6 align-top pr-6">
                                <Button 
                                  size="sm" 
                                  variant="secondary" 
                                  className="h-8 text-[10px] font-black uppercase tracking-tighter px-4"
                                  onClick={() => openFineDialog(student)}
                                >
                                  manual penalty
                                </Button>
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  /* History View */
                  <div className="overflow-x-auto text-sm">
                    <Table>
                       <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
                        <TableRow>
                          <TableHead className="text-[10px] font-black uppercase tracking-widest pl-6">Target Record</TableHead>
                          <TableHead className="text-[10px] font-black uppercase tracking-widest">System Remark</TableHead>
                          <TableHead className="text-[10px] font-black uppercase tracking-widest">Amount</TableHead>
                          <TableHead className="text-[10px] font-black uppercase tracking-widest">Status</TableHead>
                          <TableHead className="text-right text-[10px] font-black uppercase tracking-widest pr-6">Management</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredFines.map(fine => (
                          <TableRow key={fine.id} className="hover:bg-slate-50/50">
                            <TableCell className="py-4 pl-6">
                              <div className="font-black text-slate-800 dark:text-slate-200 uppercase text-[11px]">{fine.user.full_name}</div>
                              <div className="text-[9px] text-slate-500 uppercase font-bold tracking-tight truncate max-w-[150px]">
                                {fine.borrow_record?.book.title || 'General Manual Entry'}
                              </div>
                            </TableCell>
                            <TableCell className="text-[10px] text-slate-600 max-w-[200px] truncate uppercase font-medium">{fine.reason}</TableCell>
                            <TableCell className="font-black text-slate-900 dark:text-white text-[13px]">₹{fine.amount.toFixed(2)}</TableCell>
                            <TableCell>{getStatusBadge(fine.status)}</TableCell>
                            <TableCell className="text-right pr-6">
                               {fine.status === 'PENDING' && (
                                  <div className="flex justify-end gap-2">
                                    {isStaff ? (
                                      <Button size="sm" variant="outline" className="h-7 text-[9px] font-black uppercase tracking-tight" onClick={() => handleWaiveFine(fine.id)}>WAIVE CHARGE</Button>
                                    ) : (
                                      <Button size="sm" className="bg-green-600 h-7 text-[9px] font-black uppercase px-4 shadow-sm" onClick={() => handlePayFine(fine.id)}>SETTLE DUES</Button>
                                    )}
                                  </div>
                               )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Impose Fine Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 uppercase font-black text-sm tracking-tight">
                <AlertCircle className="h-5 w-5 text-red-500" />
                Issue Official library Penalty
              </DialogTitle>
              <DialogDescription className="text-xs uppercase font-bold text-slate-500">
                {selectedStudent ? (
                  <span>Initiating charge for <strong>{selectedStudent.full_name}</strong></span>
                ) : (
                  <span>Direct penalty issuance system</span>
                )}
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-6 py-4">
              <div className="space-y-4">
                {!selectedStudent && (
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Target Student Account</Label>
                    <Select onValueChange={(val) => setSelectedStudent(users.find(u => u.id === val) || null)}>
                      <SelectTrigger className="font-bold text-[11px] h-10">
                        <SelectValue placeholder="SEARCH BY NAME OR EMAIL..." />
                      </SelectTrigger>
                      <SelectContent>
                        {users.filter(u => u.role === 'STUDENT' || u.role === 'FACULTY').map(u => (
                          <SelectItem key={u.id} value={u.id} className="text-xs">{u.full_name} ({u.email})</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Penalty Classification</Label>
                  <Select value={fineForm.category} onValueChange={handleCategoryChange}>
                    <SelectTrigger className="w-full font-bold text-[11px] h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FINE_CATEGORIES.map(cat => (
                        <SelectItem key={cat.id} value={cat.id} className="text-xs font-bold uppercase">{cat.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Conditional Book Selector */}
                {selectedStudent && (fineForm.category === 'OVERDUE' || fineForm.category === 'DAMAGED' || fineForm.category === 'LOST') && (
                   <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-red-500">Select Related Book Choice</Label>
                    <Select value={selectedRecordId} onValueChange={onBookChange}>
                      <SelectTrigger className="w-full font-bold text-[11px] h-10 border-red-200">
                        <SelectValue placeholder="WHICH BOOK IS THIS FOR?" />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedStudent.borrow_records?.filter(r => 
                          r.status === 'BORROWED' || 
                          r.status === 'OVERDUE'
                        ).map(record => (
                          <SelectItem key={record.id} value={record.id} className="text-xs font-bold">
                            {record.book.title} ({record.status === 'OVERDUE' ? 'OVERDUE' : 'DUE: ' + new Date(record.due_date).toLocaleDateString()})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                    <Label htmlFor="amount" className="text-[10px] font-black uppercase tracking-widest text-slate-500">Penalty Amount (₹)</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 font-black text-sm">₹</span>
                      <Input 
                        id="amount" 
                        type="number" 
                        value={fineForm.amount} 
                        onChange={(e) => setFineForm(prev => ({...prev, amount: e.target.value}))}
                        className="font-black text-base pl-8 h-10 border-2"
                      />
                    </div>
                    {fineForm.category === 'OVERDUE' && <p className="text-[9px] font-bold text-red-500 uppercase tracking-tighter mt-1 animate-pulse">Automatically calculated: ₹5 per day late</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reason" className="text-[10px] font-black uppercase tracking-widest text-slate-500">Detailed Statement</Label>
                  <Textarea 
                    id="reason" 
                    placeholder="Official reason for the penalty..." 
                    value={fineForm.reason}
                    onChange={(e) => setFineForm(prev => ({...prev, reason: e.target.value}))}
                    className="h-20 resize-none text-xs font-medium uppercase border-2"
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="bg-slate-50 p-4 -m-6 mt-6 rounded-b-lg border-t gap-3 sm:gap-0">
              <Button variant="ghost" onClick={() => setIsDialogOpen(false)} className="font-bold text-[11px] uppercase uppercase tracking-widest text-slate-400">Abort</Button>
              <Button 
                onClick={submitFine}
                className="bg-red-600 hover:bg-red-700 text-white px-10 font-black uppercase text-[11px] tracking-widest shadow-lg"
              >
                Log official Penalty
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}
