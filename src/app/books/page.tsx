'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, BookOpen, ArrowLeft, Grid3X3, List, Filter } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

interface Book {
  id: string
  isbn: string
  title: string
  author: string
  edition?: string
  publisher?: string
  published_year?: number
  description?: string
  total_copies: number
  available_copies: number
  rack_no?: string
  category: {
    id: string
    name: string
  }
}

interface Category {
  id: string
  name: string
}

export default function BooksPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [books, setBooks] = useState<Book[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([])

  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [availabilityFilter, setAvailabilityFilter] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const userData = sessionStorage.getItem('user') || localStorage.getItem('user')
        if (!userData) {
          router.replace('/')
          return
        }
        setUser(JSON.parse(userData))
        fetchBooks()
        fetchCategories()
      } catch (error) {
        console.error('Storage access error:', error)
        router.replace('/')
      }
    }, 200)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    let filtered = books
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(book =>
        book.title.toLowerCase().includes(query) ||
        book.author.toLowerCase().includes(query) ||
        book.isbn.toLowerCase().includes(query)
      )
    }
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(book => book.category.id === selectedCategory)
    }
    if (availabilityFilter === 'available') {
      filtered = filtered.filter(book => book.available_copies > 0)
    }
    setFilteredBooks(filtered)
  }, [searchQuery, selectedCategory, availabilityFilter, books])

  const fetchBooks = async () => {
    try {
      const response = await fetch('/api/books')
      const data = await response.json()
      if (response.ok) {
        setBooks(data.books)
        setFilteredBooks(data.books)
      }
    } catch (error) {
      console.error('Failed to fetch books:', error)
      toast({ title: 'Error', description: 'Failed to load books', variant: 'destructive' })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      const data = await response.json()
      if (response.ok) setCategories(data.categories)
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    }
  }

  const getAvailabilityBadge = (book: Book) => {
    if (book.available_copies === 0) return <Badge variant="destructive">Not Available</Badge>
    if (book.available_copies === book.total_copies) return <Badge variant="default" className="bg-green-600">Available</Badge>
    return <Badge variant="secondary">Available ({book.available_copies}/{book.total_copies})</Badge>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" onClick={() => router.back()}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center space-x-3">
                <BookOpen className="h-6 w-6 text-primary" />
                <div>
                  <h1 className="text-2xl font-bold text-foreground">Browse Books</h1>
                  <p className="text-sm text-muted-foreground">{filteredBooks.length} books found</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant={viewMode === 'grid' ? 'default' : 'outline'} size="icon" onClick={() => setViewMode('grid')}>
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button variant={viewMode === 'list' ? 'default' : 'outline'} size="icon" onClick={() => setViewMode('list')}>
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search by title, author, or ISBN..." className="pl-10" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              </div>
              <div className="w-full md:w-48">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-full md:w-48">
                <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
                  <SelectTrigger><SelectValue placeholder="Availability" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Books</SelectItem>
                    <SelectItem value="available">Available Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button variant="outline" onClick={() => { setSearchQuery(''); setSelectedCategory('all'); setAvailabilityFilter('all'); }}>
                <Filter className="h-4 w-4 mr-2" /> Reset
              </Button>
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
            <p className="mt-4 text-muted-foreground">Loading books...</p>
          </div>
        ) : filteredBooks.length === 0 ? (
          <Card><CardContent className="flex flex-col items-center justify-center py-12"><BookOpen className="h-16 w-16 text-muted-foreground mb-4" /><h3 className="text-xl font-semibold mb-2">No books found</h3></CardContent></Card>
        ) : (
          <div className={viewMode === 'grid' ? "grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "space-y-4"}>
            {filteredBooks.map(book => (
              <Card key={book.id} className="cursor-pointer hover:shadow-lg transition-all duration-200">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <Badge variant="outline" className="text-xs">{book.category.name}</Badge>
                    {getAvailabilityBadge(book)}
                  </div>
                  <CardTitle className="line-clamp-2 text-lg">{book.title}</CardTitle>
                  <CardDescription>by {book.author}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    {book.isbn && <p><strong>ISBN:</strong> {book.isbn}</p>}
                    {book.edition && <p><strong>Edition:</strong> {book.edition}</p>}
                    {book.rack_no && <p><strong>Rack:</strong> {book.rack_no}</p>}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" variant="outline" onClick={() => router.push(`/books/${book.id}`)}>View Details</Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
