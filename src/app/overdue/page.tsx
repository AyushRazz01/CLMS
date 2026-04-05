'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AlertCircle, Book, Calendar, User, Mail } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

interface OverdueIssue {
  id: string
  user: {
    id: string
    full_name: string
    email: string
    role: string
  }
  book: {
    id: string
    title: string
    author: string
    isbn: string
  }
  borrow_date: string
  due_date: string
  status: string
}

export default function OverduePage() {
  const [overdueIssues, setOverdueIssues] = useState<OverdueIssue[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchOverdueIssues()
  }, [])

  const fetchOverdueIssues = async () => {
    try {
      const response = await fetch('/api/issues/overdue')
      if (!response.ok) throw new Error('Failed to fetch overdue issues')
      const data = await response.json()
      setOverdueIssues(data)
    } catch (error) {
      console.error('Error fetching overdue issues:', error)
      toast({
        title: 'Error',
        description: 'Failed to load overdue books',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const calculateDaysOverdue = (dueDate: string) => {
    const due = new Date(dueDate)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - due.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const sendReminder = async (userId: string, issueId: string) => {
    try {
      const response = await fetch('/api/issues/send-reminder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, issueId }),
      })
      
      if (!response.ok) throw new Error('Failed to send reminder')
      
      toast({
        title: 'Success',
        description: 'Reminder sent successfully',
      })
    } catch (error) {
      console.error('Error sending reminder:', error)
      toast({
        title: 'Error',
        description: 'Failed to send reminder',
        variant: 'destructive'
      })
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <AlertCircle className="h-8 w-8 text-red-600" />
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Overdue Books</h1>
          <p className="text-slate-600 dark:text-slate-400">Books that need to be returned</p>
        </div>
      </div>

      {overdueIssues.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <AlertCircle className="h-16 w-16 text-green-600 mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              No Overdue Books
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-center">
              All books have been returned on time. Great job!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                Overdue Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {overdueIssues.length}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    Total Overdue Books
                  </div>
                </div>
                <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {Math.max(...overdueIssues.map(issue => calculateDaysOverdue(issue.due_date)), 0)}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    Max Days Overdue
                  </div>
                </div>
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {new Set(overdueIssues.map(issue => issue.user.id)).size}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    Unique Users
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4">
            {overdueIssues.map((issue) => {
              const daysOverdue = calculateDaysOverdue(issue.due_date)
              
              return (
                <Card key={issue.id} className="border-l-4 border-l-red-500">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-start gap-3">
                          <Book className="h-5 w-5 text-slate-600 dark:text-slate-400 mt-0.5" />
                          <div>
                            <h3 className="font-semibold text-slate-900 dark:text-white">
                              {issue.book.title}
                            </h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              by {issue.book.author}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-500">
                              ISBN: {issue.book.isbn}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                            <span className="text-sm text-slate-600 dark:text-slate-400">
                              Due: {new Date(issue.due_date).toLocaleDateString()}
                            </span>
                          </div>
                          <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                            {daysOverdue} days overdue
                          </Badge>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => sendReminder(issue.user.id, issue.id)}
                          className="flex items-center gap-2"
                        >
                          <Mail className="h-4 w-4" />
                          Send Reminder
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
