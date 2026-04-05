'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sidebar } from '@/components/sidebar'
import { DollarSign, Search, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

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

export default function FinesPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [fines, setFines] = useState<Fine[]>([])
  const [filteredFines, setFilteredFines] = useState<Fine[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  useEffect(() => {
    // Get user data from storage
    const userData = sessionStorage.getItem('user') || localStorage.getItem('user')
    if (userData) {
      const parsedUser = JSON.parse(userData)
      setUser(parsedUser)
      fetchFines(parsedUser)
    } else {
      router.replace('/')
    }
  }, [])

  useEffect(() => {
    // Filter fines based on search and status
    let filtered = fines

    if (searchQuery) {
      filtered = filtered.filter(fine =>
        fine.borrow_record?.book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        fine.borrow_record?.book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        fine.user.full_name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(fine => fine.status === statusFilter)
    }

    setFilteredFines(filtered)
  }, [fines, searchQuery, statusFilter])

  const fetchFines = async (currentUser: any) => {
    try {
      let url = '/api/fines'
      
      // Students and faculty see only their fines
      if (currentUser.role === 'STUDENT' || currentUser.role === 'FACULTY') {
        url += `?userId=${currentUser.id}`
      }

      const response = await fetch(url)
      const data = await response.json()

      if (response.ok) {
        setFines(data)
      } else {
        toast({
          title: 'Error',
          description: 'Failed to fetch fines',
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Error fetching fines:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch fines',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return <Badge className="bg-green-100 text-green-800">Paid</Badge>
      case 'WAIVED':
        return <Badge className="bg-yellow-100 text-yellow-800">Waived</Badge>
      case 'PENDING':
      default:
        return <Badge className="bg-red-100 text-red-800">Pending</Badge>
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PAID':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'WAIVED':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case 'PENDING':
      default:
        return <XCircle className="h-4 w-4 text-red-600" />
    }
  }

  const handlePayFine = async (fineId: string) => {
    try {
      const response = await fetch('/api/fines/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fineId })
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Fine paid successfully'
        })
        // Refresh fines
        if (user) {
          fetchFines(user)
        }
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to pay fine',
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Error paying fine:', error)
      toast({
        title: 'Error',
        description: 'Failed to pay fine',
        variant: 'destructive'
      })
    }
  }

  const handleWaiveFine = async (fineId: string) => {
    try {
      const response = await fetch('/api/fines/waive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fineId })
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Fine waived successfully'
        })
        // Refresh fines
        if (user) {
          fetchFines(user)
        }
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to waive fine',
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Error waiving fine:', error)
      toast({
        title: 'Error',
        description: 'Failed to waive fine',
        variant: 'destructive'
      })
    }
  }

  const totalPending = fines.filter(f => f.status === 'PENDING').reduce((sum, f) => sum + f.amount, 0)
  const totalPaid = fines.filter(f => f.status === 'PAID').reduce((sum, f) => sum + f.amount, 0)
  const totalWaived = fines.filter(f => f.status === 'WAIVED').reduce((sum, f) => sum + f.amount, 0)

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex">
      <Sidebar user={user} />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
                {user.role === 'STUDENT' || user.role === 'FACULTY' ? 'My Fines' : 'Manage Fines'}
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                {user.role === 'STUDENT' || user.role === 'FACULTY' 
                  ? 'View and pay your library fines'
                  : 'Manage all library fines and payments'
                }
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="bg-white dark:bg-slate-800 border-0 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">Pending Fines</CardTitle>
                <div className="p-2 bg-red-50 dark:bg-red-900 rounded-lg">
                  <XCircle className="h-4 w-4 text-red-600 dark:text-red-300" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900 dark:text-white">${totalPending.toFixed(2)}</div>
                <p className="text-xs text-slate-500 mt-1">Unpaid fines</p>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-slate-800 border-0 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">Paid Fines</CardTitle>
                <div className="p-2 bg-green-50 dark:bg-green-900 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-300" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900 dark:text-white">${totalPaid.toFixed(2)}</div>
                <p className="text-xs text-slate-500 mt-1">Total paid</p>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-slate-800 border-0 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">Waived Fines</CardTitle>
                <div className="p-2 bg-yellow-50 dark:bg-yellow-900 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-300" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900 dark:text-white">${totalWaived.toFixed(2)}</div>
                <p className="text-xs text-slate-500 mt-1">Total waived</p>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="bg-white dark:bg-slate-800 border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="Search by book title, author, or user name..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="PAID">Paid</SelectItem>
                    <SelectItem value="WAIVED">Waived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Fines List */}
          <Card className="bg-white dark:bg-slate-800 border-0 shadow-sm">
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
                  <p className="ml-3 text-slate-500">Loading fines...</p>
                </div>
              ) : filteredFines.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <DollarSign className="h-12 w-12 text-slate-400 mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">No fines found</h3>
                  <p className="text-sm text-slate-500">
                    {searchQuery || statusFilter !== 'all' 
                      ? 'Try adjusting your filters'
                      : 'No fines available'
                    }
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 dark:bg-slate-700 border-b border-slate-200 dark:border-slate-600">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Book Details
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          {user.role === 'STUDENT' || user.role === 'FACULTY' ? 'Issued To' : 'User'}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Reason
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                      {filteredFines.map((fine) => (
                        <tr key={fine.id} className="hover:bg-slate-50 dark:hover:bg-slate-700">
                          <td className="px-6 py-4">
                            {fine.borrow_record ? (
                              <div>
                                <div className="text-sm font-medium text-slate-900 dark:text-white">
                                  {fine.borrow_record.book.title}
                                </div>
                                <div className="text-sm text-slate-500">
                                  {fine.borrow_record.book.author}
                                </div>
                                <div className="text-xs text-slate-400">
                                  ISBN: {fine.borrow_record.book.isbn}
                                </div>
                              </div>
                            ) : (
                              <div className="text-sm text-slate-500 italic">General Fine</div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <div className="text-sm font-medium text-slate-900 dark:text-white">
                                {fine.user.full_name}
                              </div>
                              <div className="text-sm text-slate-500">
                                {fine.user.role}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-slate-900 dark:text-white">
                              ${fine.amount.toFixed(2)}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-slate-900 dark:text-white">
                              {fine.reason}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-2">
                              {getStatusIcon(fine.status)}
                              {getStatusBadge(fine.status)}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-slate-900 dark:text-white">
                              {new Date(fine.created_at).toLocaleDateString()}
                            </div>
                            {fine.paid_date && (
                              <div className="text-xs text-slate-500">
                                Paid: {new Date(fine.paid_date).toLocaleDateString()}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex space-x-2">
                              {fine.status === 'PENDING' && (
                                <>
                                  {(user.role === 'STUDENT' || user.role === 'FACULTY') && (
                                    <Button
                                      size="sm"
                                      onClick={() => handlePayFine(fine.id)}
                                      className="bg-green-600 hover:bg-green-700"
                                    >
                                      Pay
                                    </Button>
                                  )}
                                  {(user.role === 'LIBRARIAN' || user.role === 'ADMIN') && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleWaiveFine(fine.id)}
                                    >
                                      Waive
                                    </Button>
                                  )}
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
