'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { BookOpen, ArrowLeft, Calendar, MapPin, User, BookMarked, AlertCircle } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

interface Book {
  id: string
  isbn: string
  title: string
  author: string
  edition?: string
  publisher?: string
  publishedYear?: number
  description?: string
  quantity: number
  available: number
  rackNo?: string
  category: {
    id: string
    name: string
    description?: string
  }
}

export default function BookDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const [user, setUser] = useState<any>(null)
  const [book, setBook] = useState<Book | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isIssuing, setIsIssuing] = useState(false)

  const bookId = params.id as string

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        let token: string | null = null
        let userData: string | null = null

        // First, check URL parameters (for preview environment)
        if (typeof window !== 'undefined') {
          const urlParams = new URLSearchParams(window.location.search)
          const userParam = urlParams.get('u')
          const tokenParam = urlParams.get('t')

          if (userParam && tokenParam) {
            userData = decodeURIComponent(userParam)
            token = decodeURIComponent(tokenParam)

            // Store in both storages
            sessionStorage.setItem('user', userData)
            sessionStorage.setItem('token', token)
            localStorage.setItem('user', userData)
            localStorage.setItem('token', token)
          }
        }

        // Try sessionStorage
        if (!token || !userData) {
          token = sessionStorage.getItem('token')
          userData = sessionStorage.getItem('user')
        }

        // Fall back to localStorage
        if (!token || !userData) {
          token = localStorage.getItem('token')
          userData = localStorage.getItem('user')
        }

        if (!token || !userData) {
          console.log('No authentication data found in book details page')
          router.replace('/')
          return
        }

        const user = JSON.parse(userData)
        setUser(user)
        fetchBookDetails(bookId)
      } catch (error) {
        console.error('Storage access error:', error)
        router.replace('/')
      }
    }, 200)

    return () => clearTimeout(timer)
  }, [bookId])

  const fetchBookDetails = async (id: string) => {
    try {
      const response = await fetch(`/api/books/${id}`)
      const data = await response.json()

      if (response.ok) {
        setBook(data.book)
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to load book details',
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Failed to fetch book details:', error)
      toast({
        title: 'Error',
        description: 'Failed to load book details',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleIssueBook = async () => {
    if (!book || !user) return

    setIsIssuing(true)

    try {
      const response = await fetch('/api/issues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookId: book.id,
          userId: user.id
        })
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: 'Success',
          description: data.message || 'Book issued successfully!',
        })
        // Refresh book details
        fetchBookDetails(bookId)
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to issue book',
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Issue book error:', error)
      toast({
        title: 'Error',
        description: 'Failed to issue book',
        variant: 'destructive'
      })
    } finally {
      setIsIssuing(false)
    }
  }

  const canIssue = () => {
    if (!book || !user) return false
    if (book.available === 0) return false
    // Librarians issue books via the management panel
    return false 
  }

  const getIssueLimit = () => {
    if (!user) return 0
    return user.role === 'STUDENT' ? 3 : 5
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-muted-foreground">Loading book details...</p>
        </div>
      </div>
    )
  }

  if (!book) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Book Not Found</h3>
            <Button onClick={() => router.push('/books')}>Back to Books</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center space-x-3">
              <BookOpen className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">Book Details</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Book Details */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex flex-wrap gap-2 mb-2">
                  <Badge variant="outline">{book.category.name}</Badge>
                  <Badge variant={book.available > 0 ? 'default' : 'destructive'} className={book.available > 0 ? 'bg-green-600' : ''}>
                    {book.available > 0 ? `${book.available} Available` : 'Not Available'}
                  </Badge>
                </div>
                <CardTitle className="text-3xl">{book.title}</CardTitle>
                <CardDescription className="text-lg">
                  by {book.author}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Separator />

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <BookMarked className="h-4 w-4 mr-2" />
                      ISBN
                    </div>
                    <div className="font-medium">{book.isbn}</div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <BookMarked className="h-4 w-4 mr-2" />
                      Edition
                    </div>
                    <div className="font-medium">{book.edition || 'N/A'}</div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-2" />
                      Published Year
                    </div>
                    <div className="font-medium">{book.publishedYear || 'N/A'}</div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 mr-2" />
                      Rack Number
                    </div>
                    <div className="font-medium">{book.rackNo || 'N/A'}</div>
                  </div>
                </div>

                {book.publisher && (
                  <>
                    <Separator />
                    <div className="space-y-1">
                      <div className="text-sm text-muted-foreground">Publisher</div>
                      <div className="font-medium">{book.publisher}</div>
                    </div>
                  </>
                )}

                {book.description && (
                  <>
                    <Separator />
                    <div className="space-y-1">
                      <div className="text-sm text-muted-foreground">Description</div>
                      <div className="font-medium">{book.description}</div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Category Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Category: {book.category.name}</CardTitle>
              </CardHeader>
              {book.category.description && (
                <CardContent>
                  <p className="text-muted-foreground">{book.category.description}</p>
                </CardContent>
              )}
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Availability Card */}
            <Card>
              <CardHeader>
                <CardTitle>Availability</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center py-4">
                  <div className="text-4xl font-bold mb-2">
                    {book.available} <span className="text-lg text-muted-foreground">/ {book.quantity}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    copies available
                  </div>
                </div>

                  <>
                    {(user?.role === 'STUDENT' || user?.role === 'FACULTY') && (
                       <div className="text-center py-4 text-slate-500 text-sm italic">
                         Contact the librarian to issue this book.
                       </div>
                    )}
                    {(user?.role === 'LIBRARIAN' || user?.role === 'ADMIN') && (
                      <div className="space-y-3 pt-4">
                        <Button className="w-full" onClick={() => router.push(`/issues?bookId=${book.id}`)}>
                          Issue This Book
                        </Button>
                        <div className="grid grid-cols-2 gap-2">
                          <Button variant="outline" onClick={() => router.push(`/books/${book.id}/edit`)}>
                            Edit Details
                          </Button>
                          <Button variant="destructive" onClick={async () => {
                            if (confirm('Are you sure you want to delete this book?')) {
                              const resp = await fetch(`/api/books/${book.id}`, { method: 'DELETE' });
                              if (resp.ok) {
                                toast({ title: 'Deleted', description: 'Book removed from library' });
                                router.push('/books');
                              }
                            }
                          }}>
                            Delete
                          </Button>
                        </div>
                      </div>
                    )}
                  </>

                {book.available === 0 && (
                  <div className="text-center py-2 text-destructive text-sm font-medium">
                    All copies are currently borrowed
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Info */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Total Copies</span>
                  <span className="font-medium">{book.quantity}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Currently Issued</span>
                  <span className="font-medium">{book.quantity - book.available}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Available</span>
                  <span className="font-medium">{book.available}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
