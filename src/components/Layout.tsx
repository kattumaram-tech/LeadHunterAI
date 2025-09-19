import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import leadHunterIcon from '@/assets/leadhunter-icon.png';
import { cn } from '@/lib/utils';
import { Home, User, History, LogOut } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const { logout } = useAuth();
  const location = useLocation();

  const navLinks = [
    { href: '/', label: 'Busca', icon: Home },
    { href: '/profile', label: 'Perfil', icon: User },
    { href: '/history', label: 'Histórico', icon: History },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      <header className="w-full border-b border-border/40 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img 
                src={leadHunterIcon} 
                alt="LeadHunterAI" 
                className="w-10 h-10 rounded-xl shadow-soft"
              />
              <div>
                <h1 className="text-xl font-bold text-foreground">LeadHunterAI</h1>
              </div>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={cn(
                    'text-sm font-medium transition-colors hover:text-primary',
                    location.pathname === link.href ? 'text-primary' : 'text-muted-foreground'
                  )}
                >
                  <link.icon className="w-4 h-4 mr-2 inline-block" />
                  {link.label}
                </Link>
              ))}
            </nav>
            <Button variant="outline" size="sm" onClick={logout}>
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
};
