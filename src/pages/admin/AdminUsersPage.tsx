import { useState, useEffect, useCallback } from 'react';
import { 
  Search, 
  Filter, 
  MoreVertical, 
  UserX, 
  Shield,
  Trash2,
  Download,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { DepartmentLabels, BloodGroupLabels } from '@/types';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface UserWithProfile {
  id: string;
  email: string;
  emailVerified: boolean;
  role: string;
  isActive: boolean;
  createdAt: string;
  profile?: {
    fullName?: string;
    studentId?: string;
    department?: string;
    bloodGroup?: string;
  };
}

export function AdminUsersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [users, setUsers] = useState<UserWithProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadUsers = useCallback(async (search?: string) => {
    setIsLoading(true);
    try {
      const params: Record<string, string | number | boolean | undefined> = { limit: 100, page: 1 };
      if (search) params.search = search;
      // The backend returns { data, meta } for paginated results
      const response = await api.get<{ data: UserWithProfile[], meta?: any }>('/api/users', params);
      setUsers(Array.isArray(response) ? response : response.data ?? []);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Client-side filter for real-time search feedback while debounce can be added later
  const filteredUsers = users.filter(user => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      user.email.toLowerCase().includes(q) ||
      user.profile?.fullName?.toLowerCase().includes(q) ||
      user.profile?.studentId?.toLowerCase().includes(q)
    );
  });

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const toggleAllSelection = () => {
    setSelectedUsers(
      selectedUsers.length === filteredUsers.length ? [] : filteredUsers.map(u => u.id)
    );
  };

  const handleDeactivate = async (userId: string) => {
    try {
      await api.post(`/api/users/${userId}/deactivate`);
      toast.success('User deactivated');
      loadUsers(searchQuery || undefined);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to deactivate user');
    }
  };

  const handleReactivate = async (userId: string) => {
    try {
      await api.post(`/api/users/${userId}/reactivate`);
      toast.success('User reactivated');
      loadUsers(searchQuery || undefined);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to reactivate user');
    }
  };

  const handlePromote = async (userId: string) => {
    try {
      await api.patch(`/api/users/${userId}/role`, { role: 'ADMIN' });
      toast.success('User promoted to admin');
      loadUsers(searchQuery || undefined);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to promote user');
    }
  };

  const handleDelete = async (userId: string) => {
    try {
      await api.delete(`/api/users/${userId}`);
      toast.success('User deleted');
      setUsers(prev => prev.filter(u => u.id !== userId));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete user');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Users</h1>
          <p className="text-muted-foreground">
            Manage user accounts and permissions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => loadUsers(searchQuery || undefined)}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" onClick={() => toast.info('Export feature coming soon')}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
      </div>

      {/* Bulk Actions */}
      {selectedUsers.length > 0 && (
        <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
          <span className="text-sm">{selectedUsers.length} selected</span>
          <Button variant="outline" size="sm" onClick={() => setSelectedUsers([])}>
            Clear
          </Button>
          <Button variant="destructive" size="sm">
            Deactivate
          </Button>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-card rounded-xl card-shadow overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <Checkbox
                  checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                  onCheckedChange={toggleAllSelection}
                />
              </TableHead>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Profile</TableHead>
              <TableHead>Blood Group</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="w-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={8}>
                    <div className="h-10 bg-muted rounded animate-pulse" />
                  </TableCell>
                </TableRow>
              ))
            ) : filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedUsers.includes(user.id)}
                    onCheckedChange={() => toggleUserSelection(user.id)}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-medium text-primary">
                        {user.email.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-sm">{user.profile?.fullName || 'No Profile'}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={user.role === 'SUPER_ADMIN' ? 'destructive' : user.role === 'ADMIN' ? 'default' : 'secondary'}>
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  {user.profile ? (
                    <div className="text-sm">
                      <p>{user.profile.studentId}</p>
                      <p className="text-xs text-muted-foreground">
                        {user.profile.department ? DepartmentLabels[user.profile.department as keyof typeof DepartmentLabels] : '-'}
                      </p>
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">No profile</span>
                  )}
                </TableCell>
                <TableCell>
                  {user.profile?.bloodGroup ? (
                    <Badge className="blood-group-badge">
                      {BloodGroupLabels[user.profile.bloodGroup as keyof typeof BloodGroupLabels]}
                    </Badge>
                  ) : (
                    <span className="text-sm text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant={user.isActive ? 'default' : 'secondary'}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handlePromote(user.id)}>
                        <Shield className="h-4 w-4 mr-2" />
                        Promote to Admin
                      </DropdownMenuItem>
                      {user.isActive ? (
                        <DropdownMenuItem onClick={() => handleDeactivate(user.id)}>
                          <UserX className="h-4 w-4 mr-2" />
                          Deactivate
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem onClick={() => handleReactivate(user.id)}>
                          <UserX className="h-4 w-4 mr-2" />
                          Reactivate
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleDelete(user.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
