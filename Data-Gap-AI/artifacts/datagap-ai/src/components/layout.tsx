import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { BrainCircuit, LayoutDashboard, Database, Play } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [location] = useLocation();

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background text-foreground bg-grid-pattern overflow-x-hidden">
      <div className="fixed inset-0 pointer-events-none bg-gradient-to-b from-background via-background/90 to-background z-0"></div>
      
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/60 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 group-hover:border-primary/50 transition-colors">
              <BrainCircuit className="h-5 w-5 text-primary" />
              <div className="absolute inset-0 rounded-lg shadow-[0_0_15px_rgba(var(--primary),0.5)] opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <span className="font-display font-bold text-lg tracking-wide">
              DataGap <span className="text-primary">AI</span>
            </span>
          </Link>
          
          <nav className="flex items-center gap-6">
            <Link 
              href="/dashboard" 
              className={cn(
                "text-sm font-medium transition-colors flex items-center gap-2",
                location === "/dashboard" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Link>
            <Link 
              href="/analyze" 
              className={cn(
                "text-sm font-medium transition-colors flex items-center gap-2",
                location === "/analyze" ? "text-primary" : "text-muted-foreground hover:text-primary"
              )}
            >
              <Database className="h-4 w-4" />
              New Analysis
            </Link>
            <Link 
              href="/demo" 
              className={cn(
                "text-sm font-medium transition-colors flex items-center gap-2",
                location === "/demo" ? "text-secondary" : "text-muted-foreground hover:text-secondary"
              )}
            >
              <Play className="h-4 w-4" />
              Demo
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 relative z-10 w-full">
        {children}
      </main>
    </div>
  );
}
