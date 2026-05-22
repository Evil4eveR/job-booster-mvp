"use client";

import React from 'react';
import { useTheme } from 'next-themes';
import { Sparkles, Sun, Moon, Shield, Zap, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { theme, setTheme } = useTheme();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-lg font-bold tracking-tight">
              Bewerbung<span className="text-emerald-600">Genie</span>
            </h1>
            <Badge variant="secondary" className="hidden sm:flex text-xs bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-0">
              German Market Optimized
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>
        </div>
      </header>
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-6 sm:py-10">
        {children}
      </main>
      <footer className="border-t bg-muted/30 mt-auto">
        <div className="max-w-4xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} BewerbungGenie — AI-Powered German Application Builder
          </p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> Secure Payments</span>
            <span className="flex items-center gap-1"><Zap className="w-3 h-3" /> AI-Powered</span>
            <span className="flex items-center gap-1"><Globe className="w-3 h-3" /> German Market</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
