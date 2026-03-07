import { useState } from 'react';
import { 
  Search, 
  Check, 
  X,
  Link as LinkIcon,
  Upload
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { mockSeedDonors } from '@/data/mockData';
import { BloodGroupLabels } from '@/types';
import { toast } from 'sonner';

const bloodGroupColors: Record<string, string> = {
  A_POS: 'bg-blue-500',
  A_NEG: 'bg-blue-700',
  B_POS: 'bg-orange-500',
  B_NEG: 'bg-orange-700',
  AB_POS: 'bg-purple-500',
  AB_NEG: 'bg-purple-700',
  O_POS: 'bg-green-500',
  O_NEG: 'bg-green-700',
};

export function AdminSeedDataPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSeeds = mockSeedDonors.filter(seed => 
    seed.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    seed.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    BloodGroupLabels[seed.bloodGroup].toLowerCase().includes(searchQuery.toLowerCase())
  );

  const claimedCount = mockSeedDonors.filter(s => s.isClaimed).length;
  const unclaimedCount = mockSeedDonors.filter(s => !s.isClaimed).length;

  const handleManualLink = () => {
    toast.info('Manual linking feature coming soon');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Seed Data</h1>
          <p className="text-muted-foreground">
            Manage imported student records from NITER database
          </p>
        </div>
        <Button variant="outline" onClick={() => toast.info('Import feature coming soon')}>
          <Upload className="h-4 w-4 mr-2" />
          Import New Data
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card rounded-xl card-shadow p-4">
          <p className="text-sm text-muted-foreground">Total Records</p>
          <p className="text-2xl font-bold">{mockSeedDonors.length}</p>
        </div>
        <div className="bg-card rounded-xl card-shadow p-4">
          <p className="text-sm text-muted-foreground">Claimed</p>
          <p className="text-2xl font-bold text-green-600">{claimedCount}</p>
        </div>
        <div className="bg-card rounded-xl card-shadow p-4">
          <p className="text-sm text-muted-foreground">Unclaimed</p>
          <p className="text-2xl font-bold text-gray-500">{unclaimedCount}</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, ID, or blood group..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Seed Data Table */}
      <div className="bg-card rounded-xl card-shadow overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Blood Group</TableHead>
              <TableHead>Hometown</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSeeds.map((seed) => (
              <TableRow key={seed.id}>
                <TableCell className="font-medium">{seed.studentId}</TableCell>
                <TableCell>{seed.fullName}</TableCell>
                <TableCell>
                  <span className={`blood-group-badge ${bloodGroupColors[seed.bloodGroup]}`}>
                    {BloodGroupLabels[seed.bloodGroup]}
                  </span>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {seed.hometown || '-'}
                </TableCell>
                <TableCell>
                  {seed.isClaimed ? (
                    <Badge variant="default" className="flex items-center gap-1 w-fit">
                      <Check className="h-3 w-3" />
                      Claimed
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                      <X className="h-3 w-3" />
                      Unclaimed
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {!seed.isClaimed && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleManualLink}
                    >
                      <LinkIcon className="h-4 w-4 mr-1" />
                      Link
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
