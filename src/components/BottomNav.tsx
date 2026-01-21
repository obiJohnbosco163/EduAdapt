import { Link, useLocation } from 'react-router-dom';
import { Home, BookOpen, MessageCircle, Download, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/dashboard', icon: Home, label: 'Home' },
  { path: '/topics', icon: BookOpen, label: 'Topics' },
  { path: '/ai-tutor', icon: MessageCircle, label: 'AI Tutor' },
  { path: '/downloads', icon: Download, label: 'Offline' },
  { path: '/profile', icon: User, label: 'Profile' },
];

export function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border safe-area-pb">
      <div className="flex items-center justify-around py-2 px-4 max-w-lg mx-auto">
        {navItems.map(({ path, icon: Icon, label }) => {
          const isActive = location.pathname === path || 
            (path !== '/dashboard' && location.pathname.startsWith(path));
          
          return (
            <Link
              key={path}
              to={path}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all",
                isActive 
                  ? "text-primary bg-primary/10" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-xs font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}