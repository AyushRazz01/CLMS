'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from '@/hooks/use-toast'
import { Plus } from 'lucide-react'

interface AddBookModalProps {
  onSuccess: () => void
}

export function AddBookModal({ onSuccess }: AddBookModalProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    genre: '',
    total_copies: '1',
    description: '',
    cover_url: '',
    publisher: '',
    published_year: '',
    rack_no: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          total_copies: parseInt(formData.total_copies),
          available_copies: parseInt(formData.total_copies),
          published_year: formData.published_year ? parseInt(formData.published_year) : null
        })
      })

      if (!response.ok) throw new Error('Failed to add book')

      toast({
        title: 'Success',
        description: 'Book added successfully'
      })
      setOpen(false)
      setFormData({
        title: '',
        author: '',
        isbn: '',
        genre: '',
        total_copies: '1',
        description: '',
        cover_url: '',
        publisher: '',
        published_year: '',
        rack_no: ''
      })
      onSuccess()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Button onClick={() => setOpen(true)} className="bg-primary hover:bg-primary/90">
        <Plus className="h-4 w-4 mr-2" />
        Add New Book
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Book</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input 
                  id="title" 
                  value={formData.title} 
                  onChange={(e) => setFormData({...formData, title: e.target.value})} 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="author">Author *</Label>
                <Input 
                  id="author" 
                  value={formData.author} 
                  onChange={(e) => setFormData({...formData, author: e.target.value})} 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="isbn">ISBN *</Label>
                <Input 
                  id="isbn" 
                  value={formData.isbn} 
                  onChange={(e) => setFormData({...formData, isbn: e.target.value})} 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="genre">Genre</Label>
                <Input 
                  id="genre" 
                  value={formData.genre} 
                  onChange={(e) => setFormData({...formData, genre: e.target.value})} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="total_copies">Total Copies</Label>
                <Input 
                  id="total_copies" 
                  type="number"
                  min="1"
                  value={formData.total_copies} 
                  onChange={(e) => setFormData({...formData, total_copies: e.target.value})} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rack_no">Rack Number</Label>
                <Input 
                  id="rack_no" 
                  value={formData.rack_no} 
                  onChange={(e) => setFormData({...formData, rack_no: e.target.value})} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="publisher">Publisher</Label>
                <Input 
                  id="publisher" 
                  value={formData.publisher} 
                  onChange={(e) => setFormData({...formData, publisher: e.target.value})} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="published_year">Published Year</Label>
                <Input 
                  id="published_year" 
                  type="number"
                  value={formData.published_year} 
                  onChange={(e) => setFormData({...formData, published_year: e.target.value})} 
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cover_url">Cover URL</Label>
              <Input 
                id="cover_url" 
                value={formData.cover_url} 
                onChange={(e) => setFormData({...formData, cover_url: e.target.value})} 
                placeholder="https://example.com/cover.jpg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description" 
                value={formData.description} 
                onChange={(e) => setFormData({...formData, description: e.target.value})} 
                rows={3}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Adding...' : 'Add Book'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
