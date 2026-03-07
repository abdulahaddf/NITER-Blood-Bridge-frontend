import { useState } from 'react';
import { 
  Check, 
  X, 
  User, 
  AlertTriangle,
  Search
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
import { mockDeletionRequests, mockDonorProfiles } from '@/data/mockData';
import { toast } from 'sonner';

export function AdminDeletionsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [adminNote, setAdminNote] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [action, setAction] = useState<'confirm' | 'reject' | null>(null);

  const pendingRequests = mockDeletionRequests.filter(r => r.status === 'PENDING');
  
  const filteredRequests = pendingRequests.filter(request => {
    const profile = mockDonorProfiles.find(p => p.id === request.profileId);
    return profile?.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
           profile?.studentId.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleAction = (actionType: 'confirm' | 'reject') => {
    setAction(actionType);
    setShowConfirmDialog(true);
  };

  const confirmAction = () => {
    if (action === 'confirm') {
      toast.success('Deletion request confirmed');
    } else {
      toast.success('Deletion request rejected');
    }
    setShowConfirmDialog(false);
    setAdminNote('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Deletion Requests</h1>
        <p className="text-muted-foreground">
          Review and manage profile deletion requests
        </p>
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
            {filteredRequests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                    <Check className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground">No pending deletion requests</p>
                </TableCell>
              </TableRow>
            ) : (
              filteredRequests.map((request) => {
                const profile = mockDonorProfiles.find(p => p.id === request.profileId);
                return (
                  <TableRow key={request.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        <span className="font-medium">{profile?.fullName}</span>
                      </div>
                    </TableCell>
                    <TableCell>{profile?.studentId}</TableCell>
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
                          onClick={() => handleAction('reject')}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleAction('confirm')}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Confirm
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
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
