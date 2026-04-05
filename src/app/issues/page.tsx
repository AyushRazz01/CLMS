'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sidebar } from '@/components/sidebar'
import { BookMarked, Calendar, User, Search, AlertCircle, CheckCircle } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

interface Issue {
  id: string
  user_id: string
  book_id: string
  borrow_date: string
  due_date: string
  return_date?: string
  fine: number
  fine_paid: boolean
  status: 'BORROWED' | 'RETURNED' | 'OVERDUE'
  remarks?: string
  user: {
    full_name: string
    email: string
    role: string
  }
  book: {
    title: string
    author: string
    isbn: string
    rack_no?: string
  }
}

export default function IssuesPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [issues, setIssues] = useState<Issue[]>([])
  const [filteredIssues, setFilteredIssues] = useState<Issue[]>([])
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
      fetchIssues(parsedUser)
    } else {
      router.replace('/')
    }
  }, [])

  useEffect(() => {
    // Filter issues based on search and status
    let filtered = issues

    if (searchQuery) {
      filtered = filtered.filter(issue =>
        issue.book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        issue.book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        issue.user.full_name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(issue => issue.status === statusFilter)
    }

    setFilteredIssues(filtered)
  }, [issues, searchQuery, statusFilter])

  const fetchIssues = async (currentUser: any) => {
    try {
      let url = '/api/issues'
      
      // Students and faculty see only their issues
      if (currentUser.role === 'STUDENT' || currentUser.role === 'FACULTY') {
        url += `?userId=${currentUser.id}`
      }

      const response = await fetch(url)
      const data = await response.json()

      if (response.ok) {
        setIssues(data)
      } else {
        toast({
          title: 'Error',
          description: 'Failed to fetch issues',
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Error fetching issues:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch issues',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = (status: string, dueDate: string) => {
    const isOverdue = new Date(dueDate) < new Date() && status !== 'RETURNED'
    
    if (status === 'RETURNED') {
      return <Badge className="bg-green-100 text-green-800">Returned</Badge>
    } else if (isOverdue) {
      return <Badge className="bg-red-100 text-red-800">Overdue</Badge>
    } else {
      return <Badge className="bg-blue-100 text-blue-800">Active</Badge>
    }
  }

  const handleReturnBook = async (issueId: string) => {
    try {
      const response = await fetch('/api/issues/return', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ issueId })
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Book returned successfully'
        })
        // Refresh issues
        if (user) {
          fetchIssues(user)
        }
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to return book',
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Error returning book:', error)
      toast({
        title: 'Error',
        description: 'Failed to return book',
        variant: 'destructive'
      })
    }
  }

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
                {user.role === 'STUDENT' || user.role === 'FACULTY' ? 'My Issues' : 'All Issues'}
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                {user.role === 'STUDENT' || user.role === 'FACULTY' 
                  ? 'View your borrowed books and return history'
                  : 'Manage all book issues and returns'
                }
              </p>
            </div>
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
                    <SelectItem value="ISSUED">Active</SelectItem>
                    <SelectItem value="RETURNED">Returned</SelectItem>
                    <SelectItem value="OVERDUE">Overdue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Issues List */}
          <Card className="bg-white dark:bg-slate-800 border-0 shadow-sm">
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
                  <p className="ml-3 text-slate-500">Loading issues...</p>
                </div>
              ) : filteredIssues.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <BookMarked className="h-12 w-12 text-slate-400 mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">No issues found</h3>
                  <p className="text-sm text-slate-500">
                    {searchQuery || statusFilter !== 'all' 
                      ? 'Try adjusting your filters'
                      : 'No book issues available'
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
                          Issue Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Due Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Fine
                        </th>
                        {(user.role === 'LIBRARIAN' || user.role === 'ADMIN') && (
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            Actions
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                      {filteredIssues.map((issue) => (
                        <tr key={issue.id} className="hover:bg-slate-50 dark:hover:bg-slate-700">
                          <td className="px-6 py-4">
                            <div>
                              <div className="text-sm font-medium text-slate-900 dark:text-white">
                                {issue.book.title}
                              </div>
                              <div className="text-sm text-slate-500">
                                {issue.book.author}
                              </div>
                              <div className="text-xs text-slate-400">
                                ISBN: {issue.book.isbn}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <div className="text-sm font-medium text-slate-900 dark:text-white">
                                {issue.user.full_name}
                              </div>
                              <div className="text-sm text-slate-500">
                                {issue.user.role}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-slate-900 dark:text-white">
                              {new Date(issue.borrow_date).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-slate-900 dark:text-white">
                              {new Date(issue.due_date).toLocaleDateString()}
                            </div>
                            {new Date(issue.due_date) < new Date() && issue.status !== 'RETURNED' && (
                              <div className="text-xs text-red-600 dark:text-red-400">
                                Overdue
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            {getStatusBadge(issue.status, issue.due_date)}
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-slate-900 dark:text-white">
                              ${(issue.fine || 0).toFixed(2)}
                            </div>
                          </td>
                          {(user.role === 'LIBRARIAN' || user.role === 'ADMIN') && (
                            <td className="px-6 py-4">
                              {issue.status !== 'RETURNED' && (
                                <Button
                                  size="sm"
                                  onClick={() => handleReturnBook(issue.id)}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  Return Book
                                </Button>
                              )}
                            </td>
                          )}
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
