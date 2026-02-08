import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { BookHeart, ShieldCheck, User } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export function Navbar() {
  const [location] = useLocation();
  const { isAuthenticated } = useAuth();

  const navItems = [
    { href: "/", label: "Home", icon: BookHeart },
    { href: "/intentions", label: "Intentions", icon: User },
    ...(isAuthenticated ? [{ href: "/admin", label: "Admin", icon: ShieldCheck }] : []),
  ];

  return (
    <nav className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 no-print">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group cursor-pointer hover:opacity-80 transition-opacity">
          <div className="w-10 h-10 flex items-center justify-center transition-colors">
            <img 
              src="/images/logo.jpg" 
              alt="Jesus Youth Logo" 
              className="w-full h-full object-contain"
              onError={(e) => {
                // Fallback if image doesn't exist yet
                (e.target as HTMLImageElement).style.display = 'none';
                if (!(e.target as HTMLImageElement).parentElement?.querySelector('.fallback-icon')) {
                  const fallback = document.createElement('div');
                  fallback.className = 'fallback-icon w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center text-primary';
                  fallback.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-book-heart w-6 h-6"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/><path d="M9 10s.5-1 2.5-1 2.5 1 2.5 1-.5 1-2.5 3c-2-2-2.5-3-2.5-3z"/></svg>';
                  (e.target as HTMLImageElement).parentElement?.appendChild(fallback);
                }
              }}
            />
          </div>
          <div className="flex flex-col">
            <span className="font-serif font-bold text-lg leading-none tracking-tight">
              JY Manipur
            </span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">
              Prayer Intentions
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-1 sm:gap-2">
          {navItems.map((item) => {
            const isActive = location === item.href;
            const Icon = item.icon;
            
            return (
              <Link key={item.href} href={item.href}>
                <div 
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 cursor-pointer",
                    isActive 
                      ? "bg-primary/15 text-primary-foreground shadow-sm" 
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  <Icon className={cn("w-4 h-4", isActive ? "text-primary" : "text-muted-foreground")} />
                  <span className={cn("hidden sm:inline", isActive && "inline")}>{item.label}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
