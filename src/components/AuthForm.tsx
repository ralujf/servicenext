import { useState, FormEvent } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useAuth } from './AuthProvider';
import { Loader2, Mail, Lock, User } from 'lucide-react';
import { toast } from 'sonner';

export function AuthForm() {
  const { login, signup, resetPassword, isLoading } = useAuth();
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [signupForm, setSignupForm] = useState({ email: '', password: '', name: '' });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    if (!loginForm.email || !loginForm.password) {
      setErrors({ general: 'Please fill in all fields' });
      return;
    }
    
    const result = await login(loginForm.email, loginForm.password);
    if (!result.success) {
      // Show specific errors as toasts for credential issues
      if (result.errorType === 'invalid_credentials') {
        toast.error('Login failed', {
          description: 'Invalid email or password. Please check your credentials and try again.',
          duration: 5000,
          action: {
            label: 'Reset Password',
            onClick: () => handlePasswordReset(),
          },
        });
      } else if (result.error?.includes('Too many requests')) {
        toast.error('Too many attempts', {
          description: 'Please wait a moment before trying again.',
          duration: 6000,
        });
      } else if (result.error?.includes('Email not confirmed')) {
        toast.error('Email not confirmed', {
          description: 'Please check your email and click the confirmation link.',
          duration: 6000,
        });
      } else {
        // For other errors, show as inline error
        setErrors({ general: result.error || 'Login failed' });
      }
    }
  };

  const handleSignup = async (e: FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    if (!signupForm.email || !signupForm.password || !signupForm.name) {
      setErrors({ general: 'Please fill in all fields' });
      return;
    }
    
    if (signupForm.password.length < 6) {
      setErrors({ general: 'Password must be at least 6 characters' });
      return;
    }
    
    const result = await signup(signupForm.email, signupForm.password, signupForm.name);
    if (!result.success) {
      if (result.error?.includes('already registered') || result.error?.includes('already exists')) {
        toast.error('Account already exists', {
          description: 'An account with this email already exists. Please try signing in instead.',
          duration: 5000,
          action: {
            label: 'Sign In',
            onClick: () => {
              // Switch to login tab and pre-fill email
              const loginTab = document.querySelector('[data-value="login"]') as HTMLElement;
              loginTab?.click();
              setLoginForm(prev => ({ ...prev, email: signupForm.email }));
            },
          },
        });
      } else if (result.error?.includes('invalid email')) {
        toast.error('Invalid email', {
          description: 'Please enter a valid email address.',
          duration: 4000,
        });
      } else if (result.error?.includes('weak password')) {
        toast.error('Weak password', {
          description: 'Please choose a stronger password with at least 6 characters.',
          duration: 4000,
        });
      } else {
        setErrors({ general: result.error || 'Signup failed' });
      }
    }
  };

  const handlePasswordReset = async () => {
    if (!loginForm.email) {
      toast.error('Email required', {
        description: 'Please enter your email address first.',
        duration: 3000,
      });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(loginForm.email)) {
      toast.error('Invalid email format', {
        description: 'Please enter a valid email address.',
        duration: 3000,
      });
      return;
    }

    setIsResettingPassword(true);
    try {
      const result = await resetPassword(loginForm.email);
      if (result.success) {
        toast.success('Password reset email sent', {
          description: `Check your email (${loginForm.email}) for instructions to reset your password.`,
          duration: 6000,
        });
      } else {
        if (result.error?.includes('not found') || result.error?.includes('does not exist')) {
          toast.error('Email not found', {
            description: 'No account found with this email address. Please check the email or sign up for a new account.',
            duration: 5000,
            action: {
              label: 'Sign Up',
              onClick: () => {
                const signupTab = document.querySelector('[data-value="signup"]') as HTMLElement;
                signupTab?.click();
                setSignupForm(prev => ({ ...prev, email: loginForm.email }));
              },
            },
          });
        } else {
          toast.error('Password reset failed', {
            description: result.error || 'Unable to send password reset email. Please try again.',
            duration: 4000,
          });
        }
      }
    } finally {
      setIsResettingPassword(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4" style={{ fontFamily: 'Chivo, sans-serif' }}>
      <Card className="w-full max-w-md bg-card/95 backdrop-blur-sm border-border/50 shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent" style={{ fontFamily: 'Chivo, sans-serif' }}>
            ServiceNext
          </CardTitle>
          <CardDescription style={{ fontFamily: 'Chivo, sans-serif' }}>
            Sign in to access your coding practice dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login" style={{ fontFamily: 'Chivo, sans-serif' }}>Sign In</TabsTrigger>
              <TabsTrigger value="signup" style={{ fontFamily: 'Chivo, sans-serif' }}>Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login" className="space-y-4">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email" style={{ fontFamily: 'Chivo, sans-serif' }}>Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="Enter your email"
                      value={loginForm.email}
                      onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                      className="pl-10"
                      style={{ fontFamily: 'Chivo, sans-serif' }}
                      disabled={isLoading}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="login-password" style={{ fontFamily: 'Chivo, sans-serif' }}>Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="Enter your password"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                      className="pl-10"
                      style={{ fontFamily: 'Chivo, sans-serif' }}
                      disabled={isLoading}
                    />
                  </div>
                </div>
                
                {errors.general && (
                  <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg" style={{ fontFamily: 'Chivo, sans-serif' }}>
                    {errors.general}
                  </div>
                )}
                
                <Button type="submit" className="w-full" disabled={isLoading} style={{ fontFamily: 'Chivo, sans-serif' }}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </Button>
                
                <div className="text-center">
                  <button
                    type="button"
                    onClick={handlePasswordReset}
                    disabled={isLoading || isResettingPassword}
                    className="text-sm text-primary hover:text-primary/80 transition-colors underline"
                    style={{ fontFamily: 'Chivo, sans-serif' }}
                  >
                    {isResettingPassword ? 'Sending...' : 'Forgot your password?'}
                  </button>
                </div>
              </form>
            </TabsContent>
            
            <TabsContent value="signup" className="space-y-4">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name" style={{ fontFamily: 'Chivo, sans-serif' }}>Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="Enter your full name"
                      value={signupForm.name}
                      onChange={(e) => setSignupForm(prev => ({ ...prev, name: e.target.value }))}
                      className="pl-10"
                      style={{ fontFamily: 'Chivo, sans-serif' }}
                      disabled={isLoading}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-email" style={{ fontFamily: 'Chivo, sans-serif' }}>Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="Enter your email"
                      value={signupForm.email}
                      onChange={(e) => setSignupForm(prev => ({ ...prev, email: e.target.value }))}
                      className="pl-10"
                      style={{ fontFamily: 'Chivo, sans-serif' }}
                      disabled={isLoading}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-password" style={{ fontFamily: 'Chivo, sans-serif' }}>Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="Create a password (min. 6 characters)"
                      value={signupForm.password}
                      onChange={(e) => setSignupForm(prev => ({ ...prev, password: e.target.value }))}
                      className="pl-10"
                      style={{ fontFamily: 'Chivo, sans-serif' }}
                      disabled={isLoading}
                    />
                  </div>
                </div>
                
                {errors.general && (
                  <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg" style={{ fontFamily: 'Chivo, sans-serif' }}>
                    {errors.general}
                  </div>
                )}
                
                <Button type="submit" className="w-full" disabled={isLoading} style={{ fontFamily: 'Chivo, sans-serif' }}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
          
          <div className="mt-6 space-y-3">
            <div className="text-center text-sm text-muted-foreground">
              <p style={{ fontFamily: 'Chivo, sans-serif' }}>Secure authentication powered by Supabase</p>
            </div>
            
            <div className="bg-muted/50 p-3 rounded-lg border border-border/50">
              <p className="text-xs text-muted-foreground mb-2" style={{ fontFamily: 'Chivo, sans-serif' }}>
                <strong>New to ServiceNext?</strong> Create an account to get started.
              </p>
              <p className="text-xs text-muted-foreground" style={{ fontFamily: 'Chivo, sans-serif' }}>
                <strong>Returning user?</strong> Use the credentials you created during signup.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}