import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabaseClient } from '../utils/supabase/client';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  accessToken: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; errorType?: 'invalid_credentials' | 'email_not_found' | 'wrong_password' | 'other' }>;
  signup: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  updateEmail: (newEmail: string, password: string) => Promise<{ success: boolean; error?: string }>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  updateDisplayName: (newName: string, password: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

// Use the shared Supabase client instance
const supabase = supabaseClient;

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  // Check for existing session on mount
  useEffect(() => {
    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          setIsLoading(false);
          return;
        }

        if (session?.user) {
          const user: User = {
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
            createdAt: session.user.created_at
          };
          setUser(user);
          setAccessToken(session.access_token);
        }
      } catch (error) {
        console.error('Error in getSession:', error);
      } finally {
        setIsLoading(false);
      }
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const user: User = {
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
            createdAt: session.user.created_at
          };
          setUser(user);
          setAccessToken(session.access_token);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setAccessToken(null);
        }
        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string; errorType?: 'invalid_credentials' | 'email_not_found' | 'wrong_password' | 'other' }> => {
    try {
      setIsLoading(true);
      
      const { data: { session }, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Categorize error types for better handling
        let errorMessage = error.message;
        let errorType: 'invalid_credentials' | 'email_not_found' | 'wrong_password' | 'other' = 'other';
        
        if (error.message.includes('Invalid login credentials')) {
          // This is the expected error for wrong credentials - don't log as an error
          // For security reasons, Supabase doesn't distinguish between wrong password and non-existent email
          errorMessage = 'Invalid email or password. Please check your credentials and try again.';
          errorType = 'invalid_credentials';
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = 'Please check your email and click the confirmation link.';
          errorType = 'other';
        } else if (error.message.includes('Too many requests')) {
          errorMessage = 'Too many login attempts. Please wait a moment and try again.';
          errorType = 'other';
        } else {
          // Only log unexpected authentication errors
          console.error('Unexpected login error:', error);
        }
        
        return { success: false, error: errorMessage, errorType };
      }

      if (session?.user) {
        const user: User = {
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
          createdAt: session.user.created_at
        };
        setUser(user);
        setAccessToken(session.access_token);
        return { success: true };
      }

      return { success: false, error: 'Login failed - no session created', errorType: 'other' };
    } catch (error) {
      console.error('Unexpected login error:', error);
      return { success: false, error: 'An unexpected error occurred during login', errorType: 'other' };
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string, name: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      
      // Call our server endpoint for signup
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-958a9ca9/auth/signup`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password, name })
      });

      const data = await response.json();

      if (!response.ok) {
        let errorMessage = data.error || 'Signup failed';
        
        // Provide more user-friendly error messages
        if (errorMessage.includes('already registered') || errorMessage.includes('already exists')) {
          errorMessage = 'An account with this email already exists. Please try signing in instead.';
        } else if (errorMessage.includes('invalid email')) {
          errorMessage = 'Please enter a valid email address.';
        } else if (errorMessage.includes('weak password')) {
          errorMessage = 'Password is too weak. Please use a stronger password with at least 6 characters.';
        } else if (errorMessage.includes('rate limit')) {
          errorMessage = 'Too many signup attempts. Please wait a moment and try again.';
        } else {
          // Only log unexpected signup errors
          console.error('Unexpected signup error:', data);
        }
        
        setIsLoading(false);
        return { success: false, error: errorMessage };
      }

      console.log('Signup successful, attempting login...');
      
      // After successful signup, sign in the user
      const loginResult = await login(email, password);
      setIsLoading(false);
      return loginResult;
    } catch (error) {
      console.error('Unexpected signup error:', error);
      setIsLoading(false);
      return { success: false, error: 'Signup failed. Please check your internet connection and try again.' };
    }
  };

  const updateEmail = async (newEmail: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // First verify the current password by attempting to sign in
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: user?.email || '',
        password,
      });

      if (verifyError) {
        return { success: false, error: 'Current password is incorrect' };
      }

      // Update the email
      const { error: updateError } = await supabase.auth.updateUser({
        email: newEmail
      });

      if (updateError) {
        console.error('Email update error:', updateError);
        return { success: false, error: updateError.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Unexpected email update error:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  const updatePassword = async (currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // First verify the current password by attempting to sign in
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: user?.email || '',
        password: currentPassword,
      });

      if (verifyError) {
        return { success: false, error: 'Current password is incorrect' };
      }

      // Update the password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) {
        console.error('Password update error:', updateError);
        return { success: false, error: updateError.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Unexpected password update error:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  const updateDisplayName = async (newName: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // First verify the current password by attempting to sign in
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: user?.email || '',
        password,
      });

      if (verifyError) {
        return { success: false, error: 'Current password is incorrect' };
      }

      // Update the display name in user metadata
      const { data, error: updateError } = await supabase.auth.updateUser({
        data: { name: newName }
      });

      if (updateError) {
        console.error('Display name update error:', updateError);
        return { success: false, error: updateError.message };
      }

      // Update the local user state
      if (user && data.user) {
        setUser({
          ...user,
          name: newName
        });
      }

      return { success: true };
    } catch (error) {
      console.error('Unexpected display name update error:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  const resetPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        console.error('Password reset error:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Unexpected password reset error:', error);
      return { success: false, error: 'An unexpected error occurred during password reset' };
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Logout error:', error);
      }
      setUser(null);
      setAccessToken(null);
    } catch (error) {
      console.error('Unexpected logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    isLoading,
    accessToken,
    login,
    signup,
    logout,
    resetPassword,
    updateEmail,
    updatePassword,
    updateDisplayName
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}