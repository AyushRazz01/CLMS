'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Sidebar } from '@/components/sidebar'
import { BookOpen, BookMarked, AlertCircle, DollarSign, Library, Users, ArrowRight, LogOut, User } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { toast } from '@/hooks/use-toast'
import { createClient } from '@/lib/supabase/client'

interface UserData {
  id: string
  name: string
  email: string
  role: string
  branch?: string
  year?: number
  semester?: number
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<UserData | null>(null)
  const [stats, setStats] = useState({
    issuedBooks: 0,
    overdueBooks: 0,
    fines: 0,
    totalBooks: 0
  })
  const [borrowedBooks, setBorrowedBooks] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [authError, setAuthError] = useState<string | null>(null)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = createClient()
        const { data: { user: supabaseUser }, error } = await supabase.auth.getUser()

        if (error || !supabaseUser) {
          console.log('No active session found, redirecting to login')
          router.replace('/')
          return
        }

        // Fetch profile to get role and other details
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', supabaseUser.id)
          .single()

        if (profileError) {
          console.error('Error fetching profile:', profileError)
          // Fallback to basic info from session
          const userData: UserData = {
            id: supabaseUser.id,
            email: supabaseUser.email!,
            name: supabaseUser.user_metadata?.full_name || supabaseUser.email!,
            role: 'STUDENT'
          }
          setUser(userData)
          fetchDashboardStats(userData.id, userData.role)
        } else {
          const userData: UserData = {
            id: profile.id,
            email: profile.email || supabaseUser.email!,
            name: profile.full_name || supabaseUser.user_metadata?.full_name || supabaseUser.email!,
            role: profile.role,
            branch: profile.branch || undefined,
            year: profile.year || undefined,
            semester: profile.semester || undefined
          }
          setUser(userData)
          fetchDashboardStats(userData.id, userData.role)
          if (userData.role === 'STUDENT' || userData.role === 'FACULTY') {
            fetchBorrowedBooks(userData.id)
          }
        }
      } catch (err) {
        console.error('Auth check error:', err)
        router.replace('/')
      }
    }

    checkAuth()
  }, [])

  const fetchDashboardStats = async (userId: string, role: string) => {
    try {
      const response = await fetch(`/api/dashboard/stats?userId=${userId}&role=${role}`)
      const data = await response.json()

      if (response.ok) {
        setStats(data)
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchBorrowedBooks = async (userId: string) => {
    try {
      const response = await fetch(`/api/issues?userId=${userId}`)
      if (response.ok) {
        const data = await response.json()
        setBorrowedBooks(data)
      }
    } catch (error) {
      console.error('Failed to fetch borrowed books:', error)
    }
  }

  const handleLogout = async () => {
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      
      sessionStorage.clear()
      localStorage.clear()
      
      toast({
        title: 'Logged out successfully',
        description: 'See you again soon!',
      })
      
      router.replace('/')
    } catch (error) {
      console.error('Logout error:', error)
      router.replace('/')
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'destructive'
      case 'LIBRARIAN': return 'default'
      case 'FACULTY': return 'secondary'
      case 'STUDENT': return 'outline'
      default: return 'default'
    }
  }

  if (authError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-red-600">Authentication Error</CardTitle>
            <CardDescription>
              {authError}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              The application encountered a redirect loop. This usually happens in preview environments.
            </p>
            <Button
              onClick={() => {
                sessionStorage.clear()
                localStorage.clear()
                router.replace('/')
              }}
              className="w-full"
            >
              Clear Storage & Return to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
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
          {/* Welcome Section */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Dashboard</h1>
              <p className="text-sm text-slate-500 mt-1">
                Welcome back, <span className="font-medium text-slate-700 dark:text-slate-300">{user.name}</span>
                {user.role === 'STUDENT' && (
                  <span> • {user.branch} • Year {user.year}, Semester {user.semester}</span>
                )}
                {user.role === 'FACULTY' && (
                  <span> • {user.branch}</span>
                )}
              </p>
            </div>
            <div className="text-sm text-slate-400">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {(user.role === 'STUDENT' || user.role === 'FACULTY') && (
              <Card className="bg-white dark:bg-slate-800 border-0 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">Issued Books</CardTitle>
                  <div className="p-2 bg-blue-50 dark:bg-blue-900 rounded-lg">
                    <BookMarked className="h-4 w-4 text-blue-600 dark:text-blue-300" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">{isLoading ? '-' : stats.issuedBooks}</div>
                  <p className="text-xs text-slate-500 mt-1">Currently borrowed</p>
                </CardContent>
              </Card>
            )}

            {(user.role === 'STUDENT' || user.role === 'FACULTY') && (
              <Card className="bg-white dark:bg-slate-800 border-0 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">Overdue Books</CardTitle>
                  <div className="p-2 bg-red-50 dark:bg-red-900 rounded-lg">
                    <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-300" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">{isLoading ? '-' : stats.overdueBooks}</div>
                  <p className="text-xs text-slate-500 mt-1">Need attention</p>
                </CardContent>
              </Card>
            )}

            {(user.role === 'STUDENT' || user.role === 'FACULTY') && (
              <Card className="bg-white dark:bg-slate-800 border-0 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">Outstanding Fines</CardTitle>
                  <div className="p-2 bg-amber-50 dark:bg-amber-900 rounded-lg">
                    <DollarSign className="h-4 w-4 text-amber-600 dark:text-amber-300" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">${isLoading ? '-' : stats.fines.toFixed(2)}</div>
                  <p className="text-xs text-slate-500 mt-1">Pending payment</p>
                </CardContent>
              </Card>
            )}

            {(user.role === 'LIBRARIAN' || user.role === 'ADMIN') && (
              <>
                <Card className="bg-white dark:bg-slate-800 border-0 shadow-sm border-l-4 border-purple-500">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">Active Issues</CardTitle>
                    <div className="p-2 bg-purple-50 dark:bg-purple-900 rounded-lg">
                      <Library className="h-4 w-4 text-purple-600 dark:text-purple-300" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">{isLoading ? '-' : stats.issuedBooks}</div>
                    <p className="text-xs text-slate-500 mt-1">Currently issued</p>
                  </CardContent>
                </Card>

                <Card className="bg-white dark:bg-slate-800 border-0 shadow-sm border-l-4 border-green-500">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Available</CardTitle>
                    <div className="p-2 bg-green-50 dark:bg-green-900 rounded-lg">
                      <BookOpen className="h-4 w-4 text-green-600 dark:text-green-300" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">{isLoading ? '-' : stats.totalBooks}</div>
                    <p className="text-xs text-slate-500 mt-1">Books in circulation</p>
                  </CardContent>
                </Card>

                <Card className="bg-white dark:bg-slate-800 border-0 shadow-sm border-l-4 border-red-500">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">Overdue Books</CardTitle>
                    <div className="p-2 bg-red-50 dark:bg-red-900 rounded-lg animate-pulse">
                      <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-300" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600 dark:text-red-400">{isLoading ? '-' : stats.overdueBooks}</div>
                    <p className="text-xs text-slate-500 mt-1">Requires attention</p>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          {/* Quick Actions */}
          <Card className="bg-white dark:bg-slate-800 border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {(user.role === 'STUDENT' || user.role === 'FACULTY') && (
                  <Button 
                    className="h-auto py-6 flex flex-col items-start justify-between bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={() => router.push('/books')}
                  >
                    <Library className="h-6 w-6 mb-3" />
                    <div>
                      <span className="font-semibold block">Browse Books</span>
                      <span className="text-sm text-blue-100">Search and issue books</span>
                    </div>
                  </Button>
                )}

                {(user.role === 'STUDENT' || user.role === 'FACULTY') && (
                  <Button 
                    variant="outline" 
                    className="h-auto py-6 flex flex-col items-start justify-between border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"
                  >
                    <BookMarked className="h-6 w-6 mb-3 text-slate-600 dark:text-slate-400" />
                    <div>
                      <span className="font-semibold block text-slate-900 dark:text-white">My Issues</span>
                      <span className="text-sm text-slate-500">View borrowed books</span>
                    </div>
                  </Button>
                )}

                {user.role === 'LIBRARIAN' && (
                  <Button 
                    className="h-auto py-6 flex flex-col items-start justify-between bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={() => router.push('/books')}
                  >
                    <Library className="h-6 w-6 mb-3" />
                    <div>
                      <span className="font-semibold block">Manage Books</span>
                      <span className="text-sm text-blue-100">Add, edit, or remove books</span>
                    </div>
                  </Button>
                )}

                {(user.role === 'LIBRARIAN' || user.role === 'ADMIN') && (
                  <Button 
                    className="h-auto py-6 flex flex-col items-start justify-between bg-amber-600 hover:bg-amber-700 text-white shadow-md transition-all active:scale-[0.98]"
                    onClick={() => router.push('/fines')}
                  >
                    <DollarSign className="h-6 w-6 mb-3" />
                    <div>
                      <span className="font-semibold block">Fine Management</span>
                      <span className="text-sm text-amber-100">Manage and issue penalties</span>
                    </div>
                  </Button>
                )}

                {user.role === 'ADMIN' && (
                  <Button 
                    className="h-auto py-6 flex flex-col items-start justify-between bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Users className="h-6 w-6 mb-3" />
                    <div>
                      <span className="font-semibold block">Manage Users</span>
                      <span className="text-sm text-blue-100">Add or remove users</span>
                    </div>
                  </Button>
                )}

                {(user.role === 'ADMIN' || user.role === 'LIBRARIAN') && (
                  <Button 
                    variant="outline" 
                    className="h-auto py-6 flex flex-col items-start justify-between border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"
                  >
                    <AlertCircle className="h-6 w-6 mb-3 text-slate-600 dark:text-slate-400" />
                    <div>
                      <span className="font-semibold block text-slate-900 dark:text-white">Reports</span>
                      <span className="text-sm text-slate-500">View analytics</span>
                    </div>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Student Specific: My Borrowed Books */}
          {(user.role === 'STUDENT' || user.role === 'FACULTY') && borrowedBooks.length > 0 && (
            <Card className="bg-white dark:bg-slate-800 border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">My Borrowed Books</CardTitle>
                <CardDescription>Track your current library items</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border border-slate-100 dark:border-slate-800 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 uppercase text-xs">
                      <tr>
                        <th className="px-4 py-3 text-left">Book Name</th>
                        <th className="px-4 py-3 text-left">Issue Date</th>
                        <th className="px-4 py-3 text-left">Due Date</th>
                        <th className="px-4 py-3 text-left">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {borrowedBooks.map((record) => {
                        const isOverdue = new Date(record.due_date) < new Date() && record.status === 'BORROWED';
                        return (
                          <tr key={record.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
                            <td className="px-4 py-3 font-medium">{record.book?.title}</td>
                            <td className="px-4 py-3">{new Date(record.borrow_date).toLocaleDateString()}</td>
                            <td className="px-4 py-3">{new Date(record.due_date).toLocaleDateString()}</td>
                            <td className="px-4 py-3">
                              {isOverdue ? (
                                <Badge variant="destructive" className="animate-pulse">Overdue</Badge>
                              ) : (
                                <Badge variant="default" className="bg-green-600">Issued</Badge>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Librarian Specific: System Oversight */}
          {user.role === 'LIBRARIAN' && (
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="bg-white dark:bg-slate-800 border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Student Management</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-slate-500">Monitor student activities, book distributions, and fine records.</p>
                  <Button className="w-full" variant="outline" onClick={() => router.push('/users')}>
                    <Users className="h-4 w-4 mr-2" /> View All Students
                  </Button>
                </CardContent>
              </Card>
              <Card className="bg-white dark:bg-slate-800 border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Transaction Processing</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-slate-500">Quickly issue new books or process returns from students.</p>
                  <div className="flex gap-2">
                    <Button className="flex-1" onClick={() => router.push('/issues')}>Issue Book</Button>
                    <Button className="flex-1" variant="outline" onClick={() => router.push('/issues')}>Return Book</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
