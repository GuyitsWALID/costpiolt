"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Github, Calculator } from "lucide-react";
import Link from "next/link";

export default function AuthPage() {
  const [loading, setLoading] = useState<'google' | 'github' | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        router.push('/dashboard');
        return;
      }
      
      setCheckingAuth(false);
    };
    
    checkSession();
  }, [router]);

  // Show loading while checking auth status
  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Calculator className="h-8 w-8 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }

  const handleGoogleSignIn = async () => {
    try {
      setLoading('google');
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (error) {
      console.error('Error signing in with Google:', error);
      setLoading(null);
    }
  };

  const handleGithubSignIn = async () => {
    try {
      setLoading('github');
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (error) {
      console.error('Error signing in with GitHub:', error);
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground bg-gradient-to-br dark:from-slate-900 dark:via-blue-900 dark:to-slate-900 light:from-blue-50 light:via-white light:to-blue-50 relative overflow-hidden">
      {/* Simple Grid Background */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Vertical Lines */}
        <div className="absolute left-1/4 top-0 bottom-0 w-px bg-blue-600/20 dark:bg-blue-400/20"></div>
        <div className="absolute left-2/4 top-0 bottom-0 w-px bg-blue-600/20 dark:bg-blue-400/20"></div>
        <div className="absolute left-3/4 top-0 bottom-0 w-px bg-blue-600/20 dark:bg-blue-400/20"></div>
        
        {/* Horizontal Lines */}
        <div className="absolute left-0 right-0 top-1/4 h-px bg-blue-600/20 dark:bg-blue-400/20"></div>
        <div className="absolute left-0 right-0 top-2/4 h-px bg-blue-600/20 dark:bg-blue-400/20"></div>
        <div className="absolute left-0 right-0 top-3/4 h-px bg-blue-600/20 dark:bg-blue-400/20"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 p-6">
        <nav className="flex items-center justify-between max-w-7xl mx-auto">
          <Link href="/" className="flex items-center space-x-2">
            <Calculator className="h-8 w-8 text-blue-500" />
            <span className="text-3xl font-array font-bold text-foreground">CostPilot</span>
          </Link>
          <ThemeToggle />
        </nav>
      </header>

      {/* Auth Form */}
      <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-120px)] px-6">
        <div className="w-full max-w-md">
          {/* Background blocker for the form area */}
          <div className="absolute inset-0 bg-background rounded-2xl transform scale-110 z-30"></div>
          
          <div className="bg-card border border-border p-8 rounded-2xl shadow-xl relative z-40">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-array font-bold text-card-foreground mb-2">
                Welcome <span className="text-3xl font-array font-bold text-card-foreground">to</span> <span className="text-blue-600 dark:text-blue-400">CostPilot</span>
              </h1>
              <p className="font-khand text-muted-foreground">
                Sign in to start optimizing your AI project budgets
              </p>
            </div>

            <div className="space-y-4">
              {/* Google Sign In */}
              <Button
                onClick={handleGoogleSignIn}
                disabled={loading !== null || !supabase}
                className="w-full h-12 bg-white text-gray-900 border border-gray-300 flex items-center justify-center space-x-3 font-khand hover:bg-white hover:text-gray-900 hover:scale-105 transition-transform duration-200"
                variant="outline"
              >
                {loading === 'google' ? (
                  <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                ) : (
                  <>
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    <span>Continue with Google</span>
                  </>
                )}
              </Button>

              {/* GitHub Sign In */}
              <Button
                onClick={handleGithubSignIn}
                disabled={loading !== null || !supabase}
                className="w-full h-12 bg-gray-900 text-white flex items-center justify-center space-x-3 font-khand hover:bg-gray-900 hover:scale-105 transition-transform duration-200"
              >
                {loading === 'github' ? (
                  <div className="w-5 h-5 border-2 border-gray-300 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Github className="w-5 h-5" />
                    <span>Continue with GitHub</span>
                  </>
                )}
              </Button>
            </div>

            <div className="mt-8 text-center">
              <p className="text-sm font-khand text-muted-foreground">
                By signing in, you agree to our{" "}
                <Link href="#" className="text-blue-600 hover:text-blue-700">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="#" className="text-blue-600 hover:text-blue-700">
                  Privacy Policy
                </Link>
              </p>
            </div>
          </div>

          <div className="mt-6 text-center relative">
            {/* Background blocker for the button */}
            <div className="absolute inset-0 bg-background rounded-lg transform scale-110 z-30"></div>
            
            <Link href="/">
              <Button 
                variant="outline" 
                className="bg-card hover:bg-muted border border-border rounded-lg shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105 font-khand relative z-40"
              >
                ← Back to home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}