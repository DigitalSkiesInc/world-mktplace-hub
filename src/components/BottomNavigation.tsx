import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Grid3X3, MessageCircle, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const navItems = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/categories', icon: Grid3X3, label: 'Categories' },
  { to: '/chat', icon: MessageCircle, label: 'Chat' },
  { to: '/profile', icon: User, label: 'Profile' },
];

const disabledRoutes = [];

export const BottomNavigation: React.FC = () => {
  const location = useLocation();

   const handleClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    to: string
  ) => {
    if (disabledRoutes.includes(to)) {
      e.preventDefault(); // stop react-router from navigating
      toast.info('Coming soon',{ duration: 1000 }); // show your message (toast, alert, modal, etc.)
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 safe-area-pb">
      <div className="flex items-center justify-around h-16 px-4">
        {navItems.map(({ to, icon: Icon, label }) => {
          const isActive = location.pathname === to || 
            (to !== '/' && location.pathname.startsWith(to));
          
          return (
            <NavLink
              key={to}
              to={to}
              onClick={(e) => handleClick(e, to)}
              className={cn(
                "flex flex-col items-center justify-center min-w-0 flex-1 py-1 px-2",
                "transition-colors duration-200 rounded-lg",
                isActive 
                  ? "text-primary bg-primary/10" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <Icon size={20} className="mb-1" />
              <span className="text-xs font-medium truncate">{label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};