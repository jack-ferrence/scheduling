import { useState, useEffect } from 'react';
import { Outlet, useLocation, Link } from 'react-router';
import { Button } from '../components/ui/button';
import { 
  Home, 
  Calendar, 
  Building2, 
  User as UserIcon, 
  Users, 
  Moon,
  Sun,
  Menu,
  X,
  CalendarDays
} from 'lucide-react';
import { useTheme } from '../components/ThemeProvider';

export function RootLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  // Close the mobile menu whenever navigation happens or the Escape key is pressed.
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mobileMenuOpen]);

  const navItems = [
    { path: '/', label: 'Dashboard', icon: Home },
    { path: '/reservations', label: 'My Reservations', icon: Calendar },
    { path: '/calendar', label: 'Facility Schedule', icon: CalendarDays },
    { path: '/social', label: 'Game Board', icon: Users },
    { path: '/profile', label: 'Profile', icon: UserIcon },
  ];

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-card shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo and Brand */}
            <Link
              to="/"
              className="flex items-center gap-3 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <div className="size-10 rounded-md bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-semibold text-lg leading-none">B</span>
              </div>
              <div className="leading-tight">
                <h1 className="text-base font-semibold tracking-tight text-foreground">Biola Sports</h1>
                <p className="text-xs text-muted-foreground">Recreation</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                      isActive(item.path)
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                    }`}
                  >
                    <Icon className="size-4" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* User Menu & Actions */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="size-11"
                aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {theme === 'dark' ? (
                  <Sun className="size-5" />
                ) : (
                  <Moon className="size-5" />
                )}
              </Button>

              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="size-11 lg:hidden"
                aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-nav"
              >
                {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <nav id="mobile-nav" className="lg:hidden pt-4 pb-2 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      isActive(item.path)
                        ? 'bg-primary text-primary-foreground'
                        : 'text-foreground hover:bg-accent'
                    }`}
                  >
                    <Icon className="size-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main>
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t bg-card mt-12">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm text-muted-foreground text-center md:text-left">
              © {new Date().getFullYear()} Biola University. All rights reserved.
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <a
                href="mailto:campus-recreation@biola.edu"
                className="hover:text-foreground transition-colors rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Contact Support
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}