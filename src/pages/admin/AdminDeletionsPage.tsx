import { useState, useEffect, useCallback } from 'react';
import { 
  Check, 
  X, 
  User, 
  AlertTriangle,
  Search,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface DeletionRequest {
  id: string;
  userId: string;
  profileId: string;
  seedMatched: boolean;
  status: 'PENDING' | 'CONFIRMED' | 'REJECTED';
  requestedAt: string;
  profile?: {
    fullName: string;
    studentId: string;
  };
}

export function AdminDeletionsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [adminNote, setAdminNote] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [action, setAction] = useState<'confirm' | 'reject' | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<DeletionRequest | null>(null);
  const [requests, setRequests] = useState<DeletionRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadRequests = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.get<DeletionRequest[]>('/api/admin/deletions');
      setRequests(response);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load requests');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const filteredRequests = requests.filter(request => {
    const profile = request.profile;
    const q = searchQuery.toLowerCase();
    return profile?.fullName.toLowerCase().includes(q) ||
           profile?.studentId.toLowerCase().includes(q);
  });

  const handleAction = (request: DeletionRequest, actionType: 'confirm' | 'reject') => {
    setSelectedRequest(request);
    setAction(actionType);
    setShowConfirmDialog(true);
  };

  const confirmAction = async () => {
    if (!selectedRequest || !action) return;

    try {
      if (action === 'confirm') {
        await api.post(`/api/admin/deletions/${selectedRequest.id}/confirm`, { note: adminNote });
        toast.success('Deletion request confirmed');
      } else {
        await api.post(`/api/admin/deletions/${selectedRequest.id}/reject`, { note: adminNote });
        toast.success('Deletion request rejected');
      }
      loadRequests();
      setShowConfirmDialog(false);
      setAdminNote('');
      setSelectedRequest(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Action failed');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Deletion Requests</h1>
          <p className="text-muted-foreground">
            Review and manage profile deletion requests
          </p>
        </div>
        <Button variant="outline" onClick={loadRequests} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search requests..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Requests Table */}
      <div className="bg-card rounded-xl card-shadow overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Student ID</TableHead>
              <TableHead>Seed Match</TableHead>
              <TableHead>Requested</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [...Array(3)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={5}>
                    <div className="h-10 bg-muted rounded animate-pulse" />
                  </TableCell>
                </TableRow>
              ))
            ) : filteredRequests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                    <Check className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground">No pending deletion requests</p>
                </TableCell>
              </TableRow>
            ) : (
              filteredRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                      <span className="font-medium">{request.profile?.fullName || 'Unknown'}</span>
                    </div>
                  </TableCell>
                  <TableCell>{request.profile?.studentId || 'N/A'}</TableCell>
                  <TableCell>
                    {request.seedMatched ? (
                      <Badge variant="default">Yes</Badge>
                    ) : (
                      <Badge variant="secondary">No</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {new Date(request.requestedAt).toLocaleDateString()}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAction(request, 'reject')}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleAction(request, 'confirm')}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Confirm
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              {action === 'confirm' ? 'Confirm Deletion' : 'Reject Deletion Request'}
            </DialogTitle>
            <DialogDescription>
              {action === 'confirm' 
                ? 'This will permanently delete the user profile. This action cannot be undone.'
                : 'The profile will remain active and visible in search results.'
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Admin Note (Optional)</Label>
              <Textarea
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder="Add a note about this decision..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={confirmAction}
              variant={action === 'confirm' ? 'destructive' : 'default'}
            >
              {action === 'confirm' ? 'Confirm Deletion' : 'Reject Request'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
