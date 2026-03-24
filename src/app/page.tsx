'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { BookOpen, User, Mail, Lock, GraduationCap } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

export default function AuthPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // Reset redirect count when on login page
  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('redirectCount')
      sessionStorage.removeItem('authError')
    }
  }, [])

  // Login form state
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  // Register form state
  const [registerName, setRegisterName] = useState('')
  const [registerEmail, setRegisterEmail] = useState('')
  const [registerPassword, setRegisterPassword] = useState('')
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('')
  const [registerRole, setRegisterRole] = useState('STUDENT')
  const [registerUniversityId, setRegisterUniversityId] = useState('')
  const [registerBranch, setRegisterBranch] = useState('')
  const [registerYear, setRegisterYear] = useState('')
  const [registerSemester, setRegisterSemester] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    // Trim the inputs to remove extra spaces
    const trimmedEmail = loginEmail.trim()
    const trimmedPassword = loginPassword.trim()

    try {
      console.log('Attempting login with:', trimmedEmail)
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmedEmail, password: trimmedPassword }),
      })

      const data = await response.json()

      console.log('Login response:', response.status, data)

      if (!response.ok) {
        throw new Error(data.error || 'Login failed')
      }

      toast({
        title: 'Login successful',
        description: 'Redirecting to dashboard...',
      })

      // Store basic user info for immediate UI feedback (optional, session handled by cookies)
      localStorage.setItem('user', JSON.stringify(data.user))

      // Simple redirect - middleware will handle session verification
      router.push('/dashboard')

    } catch (err: any) {
      console.error('Login error:', err)
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validation
    if (registerPassword !== registerConfirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (registerPassword.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setIsLoading(true)

    try {
      const userData: any = {
        name: registerName,
        email: registerEmail,
        password: registerPassword,
        role: registerRole,
        university_id: registerUniversityId,
      }

      // Add student/faculty specific fields
      if (registerRole === 'STUDENT' || registerRole === 'FACULTY') {
        userData.branch = registerBranch
      }

      if (registerRole === 'STUDENT') {
        userData.year = parseInt(registerYear)
        userData.semester = parseInt(registerSemester)
      }

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed')
      }

      toast({
        title: 'Registration successful',
        description: 'You can now login with your credentials',
      })

      // Switch to login tab
      setRegisterName('')
      setRegisterEmail('')
      setRegisterUniversityId('')
      setRegisterPassword('')
      setRegisterConfirmPassword('')
      setRegisterBranch('')
      setRegisterYear('')
      setRegisterSemester('')

    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left side - Branding */}
        <div className="hidden lg:flex flex-col space-y-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-primary rounded-xl">
              <BookOpen className="h-8 w-8 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Smart CLMS</h1>
              <p className="text-muted-foreground">College Library Management System</p>
            </div>
          </div>

          <div className="space-y-4 text-muted-foreground">
            <p className="text-lg">
              A modern, digital solution for managing library operations, book circulation, and user access.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-card rounded-lg border">
                <div className="font-semibold text-foreground mb-1">📚 Quick Search</div>
                <div className="text-sm">Find books instantly</div>
              </div>
              <div className="p-4 bg-card rounded-lg border">
                <div className="font-semibold text-foreground mb-1">🔄 Easy Issue/Return</div>
                <div className="text-sm">Seamless transactions</div>
              </div>
              <div className="p-4 bg-card rounded-lg border">
                <div className="font-semibold text-foreground mb-1">📊 Analytics</div>
                <div className="text-sm">Data-driven insights</div>
              </div>
              <div className="p-4 bg-card rounded-lg border">
                <div className="font-semibold text-foreground mb-1">🔐 Secure Access</div>
                <div className="text-sm">Role-based permissions</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Auth Forms */}
        <div className="w-full max-w-md mx-auto">
          <Card className="shadow-xl">
            <CardHeader className="space-y-1">
              <div className="flex items-center justify-center space-x-2 lg:hidden mb-4">
                <BookOpen className="h-6 w-6 text-primary" />
                <CardTitle className="text-2xl">Smart CLMS</CardTitle>
              </div>
              <CardTitle className="text-center">
                {isLoading ? 'Processing...' : 'Welcome'}
              </CardTitle>
              <CardDescription className="text-center">
                Sign in to your account or create a new one
              </CardDescription>
            </CardHeader>

            <CardContent>
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="register">Register</TabsTrigger>
                </TabsList>

                {/* Login Form */}
                <TabsContent value="login">
                  <form onSubmit={handleLogin} className="space-y-4">
                    {error && (
                      <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="login-email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="login-email"
                          type="email"
                          placeholder="Enter your email"
                          className="pl-10"
                          autoComplete="off"
                          autoCorrect="off"
                          autoCapitalize="off"
                          spellCheck="false"
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="login-password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="login-password"
                          type="password"
                          placeholder="Enter your password"
                          className="pl-10"
                          autoComplete="off"
                          autoCorrect="off"
                          autoCapitalize="off"
                          spellCheck="false"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? 'Signing in...' : 'Sign In'}
                    </Button>
                  </form>
                </TabsContent>

                {/* Register Form */}
                <TabsContent value="register">
                  <form onSubmit={handleRegister} className="space-y-4">
                    {error && (
                      <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="register-name">Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="register-name"
                          placeholder="Enter your full name"
                          className="pl-10"
                          value={registerName}
                          onChange={(e) => setRegisterName(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="register-university-id">University ID / Employee ID</Label>
                      <div className="relative">
                        <GraduationCap className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="register-university-id"
                          placeholder="Enter your ID"
                          className="pl-10"
                          value={registerUniversityId}
                          onChange={(e) => setRegisterUniversityId(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="register-email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="register-email"
                          type="email"
                          placeholder="Enter your email"
                          className="pl-10"
                          value={registerEmail}
                          onChange={(e) => setRegisterEmail(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="register-role">Role</Label>
                      <Select value={registerRole} onValueChange={setRegisterRole}>
                        <SelectTrigger id="register-role">
                          <SelectValue placeholder="Select your role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="STUDENT">Student</SelectItem>
                          <SelectItem value="FACULTY">Faculty</SelectItem>
                          <SelectItem value="LIBRARIAN">Librarian</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {(registerRole === 'STUDENT' || registerRole === 'FACULTY') && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="register-branch">Branch/Department</Label>
                          <Select value={registerBranch} onValueChange={setRegisterBranch}>
                            <SelectTrigger id="register-branch">
                              <SelectValue placeholder="Select branch" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="CSE">Computer Science</SelectItem>
                              <SelectItem value="ECE">Electronics & Communication</SelectItem>
                              <SelectItem value="EEE">Electrical Engineering</SelectItem>
                              <SelectItem value="MECH">Mechanical Engineering</SelectItem>
                              <SelectItem value="CIVIL">Civil Engineering</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {registerRole === 'STUDENT' && (
                          <>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="register-year">Year</Label>
                                <Select value={registerYear} onValueChange={setRegisterYear}>
                                  <SelectTrigger id="register-year">
                                    <SelectValue placeholder="Year" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="1">1st Year</SelectItem>
                                    <SelectItem value="2">2nd Year</SelectItem>
                                    <SelectItem value="3">3rd Year</SelectItem>
                                    <SelectItem value="4">4th Year</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="register-semester">Semester</Label>
                                <Select value={registerSemester} onValueChange={setRegisterSemester}>
                                  <SelectTrigger id="register-semester">
                                    <SelectValue placeholder="Semester" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                                      <SelectItem key={sem} value={sem.toString()}>
                                        {sem}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </>
                        )}
                      </>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="register-password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="register-password"
                          type="password"
                          placeholder="Create a password (min 6 chars)"
                          className="pl-10"
                          value={registerPassword}
                          onChange={(e) => setRegisterPassword(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="register-confirm-password">Confirm Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="register-confirm-password"
                          type="password"
                          placeholder="Confirm your password"
                          className="pl-10"
                          value={registerConfirmPassword}
                          onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? 'Creating account...' : 'Create Account'}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>

            <CardFooter className="flex flex-col space-y-2 text-center text-sm text-muted-foreground">
              <p>© 2024 Smart CLMS. All rights reserved.</p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
