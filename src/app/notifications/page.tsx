'use client'

import { useEffect, useState } from 'react'
import { Sidebar } from '@/components/sidebar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Bell, CheckCircle, Info, AlertTriangle, Clock, Trash2 } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

interface Notification {
  id: string
  title: string
  message: string
  type: 'INFO' | 'WARNING' | 'DANGER' | 'SUCCESS' | 'ALERT'
  is_read: boolean
  created_at: string
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const checkUser = async () => {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setUser({
          id: session.user.id,
          name: session.user.user_metadata.name,
          email: session.user.email,
          role: session.user.user_metadata.role
        })
        fetchNotifications(session.user.id)
      }
    }
    checkUser()
  }, [])

  const fetchNotifications = async (userId: string) => {
    try {
      const response = await fetch(`/api/notifications?userId=${userId}`)
      if (response.ok) {
        const data = await response.json()
        setNotifications(data)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const markAsRead = async (id: string) => {
    try {
      const response = await fetch(`/api/notifications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_read: true })
      })
      if (response.ok) {
        setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n))
      }
    } catch (error) {}
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'SUCCESS': return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'WARNING': return <Clock className="h-5 w-5 text-amber-500" />
      case 'DANGER':
      case 'ALERT': return <AlertTriangle className="h-5 w-5 text-red-500" />
      default: return <Info className="h-5 w-5 text-blue-500" />
    }
  }

  if (!user) return null

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar user={user} />
      
      <main className="flex-1 overflow-y-auto p-6 lg:p-10">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Notifications</h1>
              <p className="text-slate-500 dark:text-slate-400 mt-2">
                Stay updated with your book status and library alerts.
              </p>
            </div>
            <Bell className="h-8 w-8 text-slate-300 dark:text-slate-700" />
          </div>

          <Card className="border-0 shadow-sm bg-white dark:bg-slate-900">
            <CardHeader className="border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">Recent Alerts</CardTitle>
                <div className="flex gap-2">
                  <Badge variant="outline" className="font-normal capitalize">
                    {notifications.filter(n => !n.is_read).length} Unread
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-8 text-center text-slate-500">Loading notifications...</div>
              ) : notifications.length === 0 ? (
                <div className="p-12 text-center">
                  <Bell className="h-12 w-12 text-slate-200 dark:text-slate-800 mx-auto mb-4" />
                  <p className="text-slate-500">No notifications yet</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {notifications.map((notification) => {
                      const isUrgent = notification.type === 'ALERT' || notification.type === 'DANGER';
                      const isUnread = !notification.is_read;

                      return (
                        <div 
                          key={notification.id} 
                          className={cn(
                            "p-5 flex gap-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 border-l-4",
                            isUnread 
                              ? (isUrgent 
                                  ? "bg-red-50/50 dark:bg-red-900/10 border-red-500" 
                                  : "bg-blue-50/30 dark:bg-blue-900/10 border-blue-500")
                              : "opacity-80 border-transparent"
                          )}
                        >
                          <div className="mt-1">{getTypeIcon(notification.type)}</div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <h3 className={cn(
                                "font-semibold text-slate-900 dark:text-white text-sm",
                                isUnread && (isUrgent ? "text-red-700 dark:text-red-400" : "text-primary")
                              )}>
                                {notification.title}
                              </h3>
                              <span className="text-[10px] text-slate-400 whitespace-nowrap font-medium uppercase tracking-wider">
                                {new Date(notification.created_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                              </span>
                            </div>
                            <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                              {notification.message}
                            </p>
                            {isUnread && (
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => markAsRead(notification.id)}
                                className={cn(
                                  "mt-3 h-7 text-[10px] h-8 px-2 uppercase tracking-wide font-bold",
                                  isUrgent 
                                    ? "text-red-600 hover:text-red-700 hover:bg-red-50" 
                                    : "text-primary hover:text-primary hover:bg-primary/10"
                                )}
                              >
                                Mark as read
                              </Button>
                            )}
                          </div>
                        </div>
                      )
                    })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
