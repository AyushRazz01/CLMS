'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from '@/hooks/use-toast'
import { Plus, Check, ChevronsUpDown } from 'lucide-react'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface IssueBookModalProps {
  onSuccess: () => void
}

export function IssueBookModal({ onSuccess }: IssueBookModalProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  
  const [books, setBooks] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [openUser, setOpenUser] = useState(false)
  const [openBook, setOpenBook] = useState(false)

  const [formData, setFormData] = useState({
    user_id: '',
    book_id: '',
    due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // Default 14 days
  })

  useEffect(() => {
    if (open) {
      fetchBooks()
      fetchUsers()
    }
  }, [open])

  const fetchBooks = async () => {
    try {
      const response = await fetch('/api/books')
      const data = await response.json()
      console.log("BOOKS API RESPONSE:", data)
      setBooks(data.books || [])
    } catch (error) {
      console.error("Error fetching books:", error)
      setBooks([])
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users')
      const data = await response.json()
      console.log("USERS API RESPONSE:", data)
      if (Array.isArray(data)) {
        setUsers(data.filter((u: any) => u.role === 'STUDENT' || u.role === 'FACULTY'))
      } else {
        setUsers([])
      }
    } catch (error) {
      console.error("Error fetching users:", error)
      setUsers([])
    }
  }

  const filteredBooks = Array.isArray(books) ? books.slice(0, 20) : []
  const filteredUsers = Array.isArray(users) ? users.slice(0, 20) : []

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("SUBMITTING ISSUE FORM:", formData)
    
    if (!formData.user_id || !formData.book_id) {
      toast({ title: 'Error', description: 'Please select both user and book', variant: 'destructive' })
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/issues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: formData.user_id,
          bookId: formData.book_id,
          dueDate: formData.due_date
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to issue book')
      }

      toast({ title: 'Success', description: 'Book issued successfully' })
      setOpen(false)
      onSuccess()
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Button onClick={() => setOpen(true)} className="bg-primary hover:bg-primary/90">
        <Plus className="h-4 w-4 mr-2" />
        Issue New Book
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Issue New Book</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6 py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Select Student / Faculty</Label>
                <Popover open={openUser} onOpenChange={setOpenUser}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openUser}
                      className="w-full justify-between"
                    >
                      {formData.user_id
                        ? users.find((u) => u.id === formData.user_id)?.full_name
                        : "Select user..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[400px] p-0">
                    <Command>
                      <CommandInput placeholder="Search user..." />
                      <CommandList>
                        <CommandEmpty>No user found.</CommandEmpty>
                        <CommandGroup>
                          {filteredUsers.map((u) => (
                            <CommandItem
                              key={u.id}
                              value={`${u.full_name} ${u.email}`}
                              onSelect={() => {
                                setFormData((prev) => ({ ...prev, user_id: u.id }))
                                setOpenUser(false)
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  formData.user_id === u.id ? "opacity-100" : "opacity-0"
                                )}
                              />
                              <div>
                                <div className="font-medium">{u.full_name}</div>
                                <div className="text-xs text-muted-foreground">{u.email}</div>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Select Book</Label>
                <Popover open={openBook} onOpenChange={setOpenBook}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openBook}
                      className="w-full justify-between"
                    >
                      {formData.book_id
                        ? books.find((b) => b.id === formData.book_id)?.title
                        : "Select book..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[400px] p-0">
                    <Command>
                      <CommandInput placeholder="Search book..." />
                      <CommandList>
                        <CommandEmpty>No book found.</CommandEmpty>
                        <CommandGroup>
                          {filteredBooks.map((b) => (
                            <CommandItem
                              key={b.id}
                              value={`${b.title} ${b.isbn}`}
                              onSelect={() => {
                                setFormData((prev) => ({ ...prev, book_id: b.id }))
                                setOpenBook(false)
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  formData.book_id === b.id ? "opacity-100" : "opacity-0"
                                )}
                              />
                              <div>
                                <div className="font-medium">{b.title}</div>
                                <div className="text-xs text-muted-foreground">{b.isbn}</div>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="due_date">Due Date</Label>
                <Input 
                  id="due_date" 
                  type="date" 
                  value={formData.due_date} 
                  onChange={(e) => setFormData({...formData, due_date: e.target.value})} 
                  required 
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Issuing...' : 'Confirm Issue'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
