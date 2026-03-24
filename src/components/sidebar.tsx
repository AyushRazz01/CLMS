'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from '@/hooks/use-toast'
import { createClient } from '@/lib/supabase/client'
import {
  BookOpen,
  LayoutDashboard,
  Library,
  BookMarked,
  Users,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  User,
  AlertCircle,
  DollarSign
} from 'lucide-react'

interface SidebarProps {
  user: {
    id: string
    name: string
    email: string
    role: string
    branch?: string
    year?: number
    semester?: number
  }
}

const navigation = {
  STUDENT: [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Browse Books', href: '/books', icon: Library },
    { name: 'My Issues', href: '/issues', icon: BookMarked },
  ],
  FACULTY: [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Browse Books', href: '/books', icon: Library },
    { name: 'My Issues', href: '/issues', icon: BookMarked },
  ],
  LIBRARIAN: [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Manage Books', href: '/books', icon: Library },
    { name: 'Issue/Return', href: '/issues', icon: BookMarked },
    { name: 'Overdue', href: '/overdue', icon: AlertCircle },
  ],
  ADMIN: [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Manage Books', href: '/books', icon: Library },
    { name: 'All Issues', href: '/issues', icon: BookMarked },
    { name: 'Users', href: '/users', icon: Users },
    { name: 'Fines', href: '/fines', icon: DollarSign },
  ],
}

export function Sidebar({ user }: SidebarProps) {
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)

  const handleLogout = async () => {
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      
      sessionStorage.clear()
      localStorage.clear()
      
      router.replace('/')
      toast({
        title: 'Logged out',
        description: 'You have been successfully logged out.',
      })
    } catch (error) {
      console.error('Logout error:', error)
      router.replace('/')
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
      case 'LIBRARIAN': return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
      case 'FACULTY': return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
      case 'STUDENT': return 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300'
    }
  }

  const userNav = navigation[user.role as keyof typeof navigation] || navigation.STUDENT

  return (
    <div
      className={cn(
        'flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 transition-all duration-300 h-screen sticky top-0',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo Section */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
        {!collapsed && (
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-primary rounded-lg">
              <BookOpen className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-sm">CLMS</span>
          </div>
        )}
        {collapsed && (
          <div className="p-1.5 bg-primary rounded-lg mx-auto">
            <BookOpen className="h-5 w-5 text-primary-foreground" />
          </div>
        )}
        {!collapsed && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(true)}
            className="h-8 w-8"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}
        {collapsed && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(false)}
            className="h-8 w-8 mx-auto"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* User Info */}
      {!collapsed && (
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full">
              <User className="h-5 w-5 text-slate-600 dark:text-slate-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-xs text-slate-500 truncate">{user.email}</p>
              <span className={cn('inline-block mt-1 px-2 py-0.5 text-xs rounded-full', getRoleColor(user.role))}>
                {user.role}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {userNav.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              'flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
              'hover:bg-slate-100 dark:hover:bg-slate-800',
              'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            )}
          >
            <item.icon className="h-5 w-5 flex-shrink-0" />
            {!collapsed && <span>{item.name}</span>}
          </Link>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-2 border-t border-slate-200 dark:border-slate-700">
        <Button
          variant="ghost"
          className={cn(
            'w-full justify-start text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800',
            collapsed && 'justify-center'
          )}
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          {!collapsed && <span className="ml-3">Logout</span>}
        </Button>
      </div>
    </div>
  )
}
