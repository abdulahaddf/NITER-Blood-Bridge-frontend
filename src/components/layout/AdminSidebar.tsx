import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Trash2, 
  Database, 
  BarChart3, 
  Megaphone,
  Droplets,
  ArrowLeft
} from 'lucide-react';
import { cn } from '@/lib/utils';

const sidebarItems = [
  { path: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { path: '/dashboard/users', label: 'Users', icon: Users },
  { path: '/dashboard/deletions', label: 'Deletion Requests', icon: Trash2 },
  { path: '/dashboard/seed-data', label: 'Seed Data', icon: Database },
  { path: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/dashboard/broadcast', label: 'Broadcast', icon: Megaphone },
];

export function AdminSidebar() {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-card border-r flex flex-col">
      {/* Header */}
      <div className="p-6 border-b">
        <Link to="/search" className="flex items-center gap-2 text-primary hover:opacity-80 transition-opacity">
          <Droplets className="h-6 w-6" />
          <span className="font-bold">Admin Panel</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-1">
          {sidebarItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                isActive(item.path)
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t">
        <Link
          to="/search"
          className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to App
        </Link>
      </div>
    </aside>
  );
}
