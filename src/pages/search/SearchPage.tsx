import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  MapPin, 
  Droplets,
  X,
  SlidersHorizontal,
  HeartPulse,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useSearch } from '@/hooks/useSearch';
import { BloodGroupLabels, DepartmentLabels, calculateEligibility, type BloodGroup, type Department } from '@/types';
import { cn } from '@/lib/utils';

const bloodGroups: BloodGroup[] = ['A_POS', 'A_NEG', 'B_POS', 'B_NEG', 'AB_POS', 'AB_NEG', 'O_POS', 'O_NEG'];
const departments: Department[] = ['TE', 'IP', 'EE', 'CS', 'FD'];

const bloodGroupColors: Record<BloodGroup, string> = {
  A_POS: 'bg-blue-500 hover:bg-blue-600',
  A_NEG: 'bg-blue-700 hover:bg-blue-800',
  B_POS: 'bg-orange-500 hover:bg-orange-600',
  B_NEG: 'bg-orange-700 hover:bg-orange-800',
  AB_POS: 'bg-purple-500 hover:bg-purple-600',
  AB_NEG: 'bg-purple-700 hover:bg-purple-800',
  O_POS: 'bg-green-500 hover:bg-green-600',
  O_NEG: 'bg-green-700 hover:bg-green-800',
};


function DonorCard({ donor }: { donor: ReturnType<typeof useSearch>['profiles'][0] }) {
  const navigate = useNavigate();
  const eligibility = calculateEligibility(donor);
  return (
    <div 
      onClick={() => navigate(`/donor/${donor.id}`)}
      className="bg-card rounded-xl card-shadow hover:card-shadow-hover transition-all duration-300 cursor-pointer overflow-hidden group"
    >
      <div className="p-5">
        {/* Header with Blood Group */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
              {donor.fullName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                {donor.fullName}
              </h3>
              <p className="text-sm text-muted-foreground">
                {DepartmentLabels[donor.department]} · {donor.batch}th Batch
              </p>
            </div>
          </div>
          <span className={`blood-group-badge ${bloodGroupColors[donor.bloodGroup]}`}>
            {BloodGroupLabels[donor.bloodGroup]}
          </span>
        </div>

        {/* Eligibility Status */}
        <div className="mb-4">
          {eligibility.status === 'ELIGIBLE' && (
            <span className="status-eligible">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              ELIGIBLE TO DONATE
            </span>
          )}
          {eligibility.status === 'UNCONFIRMED' && (
            <span className="status-unconfirmed">
              <span className="w-2 h-2 rounded-full bg-yellow-500" />
              UNCONFIRMED
            </span>
          )}
          {eligibility.status === 'NOT_YET' && (
            <span className="status-not-yet">
              <span className="w-2 h-2 rounded-full bg-gray-400" />
              {eligibility.label}
            </span>
          )}
          {eligibility.status === 'OPTED_OUT' && (
            <span className="status-not-yet">
              <span className="w-2 h-2 rounded-full bg-gray-400" />
              NOT ACCEPTING REQUESTS
            </span>
          )}
        </div>

        {/* Location */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span className="line-clamp-1">{donor.currentLocation}</span>
        </div>

        {/* Footer */}
        <div className="mt-4 pt-4 border-t flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Droplets className="h-4 w-4" />
            <span>{donor.totalDonations} donations</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={cn(
              'w-2.5 h-2.5 rounded-full',
              donor.availabilityStatus === 'AVAILABLE' ? 'bg-green-500' : 'bg-gray-400'
            )} />
            <span className="text-sm text-muted-foreground">
              {donor.availabilityStatus === 'AVAILABLE' ? 'Available' : 'Unavailable'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function FilterSidebar({ 
  filters, 
  updateFilters, 
  toggleBloodGroup, 
  toggleDepartment, 
  clearFilters,
  hasActiveFilters 
}: {
  filters: ReturnType<typeof useSearch>['filters'];
  updateFilters: ReturnType<typeof useSearch>['updateFilters'];
  toggleBloodGroup: ReturnType<typeof useSearch>['toggleBloodGroup'];
  toggleDepartment: ReturnType<typeof useSearch>['toggleDepartment'];
  clearFilters: ReturnType<typeof useSearch>['clearFilters'];
  hasActiveFilters: boolean;
}) {
  return (
    <div className="space-y-6">
      {/* Blood Group Filter */}
      <div>
        <h4 className="font-medium mb-3">Blood Group</h4>
        <div className="flex flex-wrap gap-2">
          {bloodGroups.map((group) => (
            <button
              key={group}
              onClick={() => toggleBloodGroup(group)}
              className={cn(
                'px-3 py-1.5 rounded-full text-sm font-medium transition-all',
                filters.bloodGroups.includes(group)
                  ? bloodGroupColors[group] + ' text-white'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              )}
            >
              {BloodGroupLabels[group]}
            </button>
          ))}
        </div>
        
        {/* Compatibility Mode */}
        <div className="flex items-center gap-2 mt-3">
          <Switch
            checked={filters.compatibilityMode}
            onCheckedChange={(checked) => updateFilters({ compatibilityMode: checked })}
          />
          <Label className="text-sm cursor-pointer">
            Compatibility Mode
          </Label>
        </div>
        {filters.compatibilityMode && filters.bloodGroups.length > 0 && (
          <p className="text-xs text-muted-foreground mt-1">
            Showing donors compatible with selected groups
          </p>
        )}
      </div>

      {/* Eligibility Filter */}
      <div>
        <h4 className="font-medium mb-3">Eligibility</h4>
        <div className="flex items-center gap-2">
          <Switch
            checked={filters.eligibilityOnly}
            onCheckedChange={(checked) => updateFilters({ eligibilityOnly: checked })}
          />
          <Label className="text-sm cursor-pointer">
            Eligible donors only
          </Label>
        </div>
      </div>

      {/* Department Filter */}
      <div>
        <h4 className="font-medium mb-3">Department</h4>
        <div className="space-y-2">
          {departments.map((dept) => (
            <div key={dept} className="flex items-center gap-2">
              <Checkbox
                id={`dept-${dept}`}
                checked={filters.departments.includes(dept)}
                onCheckedChange={() => toggleDepartment(dept)}
              />
              <Label htmlFor={`dept-${dept}`} className="text-sm cursor-pointer">
                {DepartmentLabels[dept]}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Batch Range */}
      <div>
        <h4 className="font-medium mb-3">Batch Range</h4>
        <div className="px-2">
          <Slider
            value={filters.batchRange}
            min={1}
            max={16}
            step={1}
            onValueChange={(value) => updateFilters({ batchRange: value as [number, number] })}
          />
          <div className="flex justify-between text-sm text-muted-foreground mt-2">
            <span>{filters.batchRange[0]}th</span>
            <span>{filters.batchRange[1]}th</span>
          </div>
        </div>
      </div>

      {/* On Campus Only */}
      <div className="flex items-center gap-2">
        <Switch
          checked={filters.onCampusOnly}
          onCheckedChange={(checked) => updateFilters({ onCampusOnly: checked })}
        />
        <Label className="text-sm cursor-pointer">
          On-campus only
        </Label>
      </div>

      {/* Willing to Donate */}
      <div className="flex items-center gap-2">
        <Switch
          checked={filters.willingToDonate}
          onCheckedChange={(checked) => updateFilters({ willingToDonate: checked })}
        />
        <Label className="text-sm cursor-pointer">
          Willing to donate
        </Label>
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button 
          variant="outline" 
          className="w-full"
          onClick={clearFilters}
        >
          <X className="h-4 w-4 mr-2" />
          Clear All Filters
        </Button>
      )}
    </div>
  );
}

export function SearchPage() {
  const navigate = useNavigate();
  const { 
    profiles, 
    isLoading, 
    filters, 
    updateFilters, 
    toggleBloodGroup, 
    toggleDepartment, 
    clearFilters,
    hasActiveFilters,
    stats,
    page,
    setPage,
    totalPages
  } = useSearch();

  return (
    <div className="min-h-screen bg-background">
      <div className="container-max section-padding py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold mb-1">Find Blood Donors</h1>
            <p className="text-muted-foreground">
              {stats.total} donors found {filters.eligibilityOnly && '(eligible only)'}
            </p>
          </div>
          <Button 
            onClick={() => navigate('/request-blood')}
            className="btn-primary"
          >
            <HeartPulse className="h-4 w-4 mr-2" />
            Request Blood
          </Button>
        </div>

        {/* Search and Filters Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or student ID..."
              value={filters.searchQuery}
              onChange={(e) => updateFilters({ searchQuery: e.target.value })}
              className="pl-10"
            />
          </div>

          {/* Sort Dropdown */}
          <Select 
            value={filters.sortBy} 
            onValueChange={(value) => updateFilters({ sortBy: value as typeof filters.sortBy })}
          >
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="eligible">Eligible First</SelectItem>
              <SelectItem value="donations">Most Donations</SelectItem>
              <SelectItem value="recent">Recently Active</SelectItem>
              <SelectItem value="batch">Same Batch</SelectItem>
            </SelectContent>
          </Select>

          {/* Mobile Filter Button */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="md:hidden">
                <Filter className="h-4 w-4 mr-2" />
                Filters
                {hasActiveFilters && (
                  <span className="ml-2 w-2 h-2 rounded-full bg-primary" />
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[80vh]">
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
              </SheetHeader>
              <div className="mt-6 overflow-y-auto h-full pb-20">
                <FilterSidebar
                  filters={filters}
                  updateFilters={updateFilters}
                  toggleBloodGroup={toggleBloodGroup}
                  toggleDepartment={toggleDepartment}
                  clearFilters={clearFilters}
                  hasActiveFilters={hasActiveFilters}
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <div className="flex gap-8">
          {/* Desktop Sidebar */}
          <aside className="hidden md:block w-64 flex-shrink-0">
            <div className="sticky top-24 bg-card rounded-xl card-shadow p-6">
              <div className="flex items-center gap-2 mb-6">
                <SlidersHorizontal className="h-5 w-5" />
                <h3 className="font-semibold">Filters</h3>
              </div>
              <FilterSidebar
                filters={filters}
                updateFilters={updateFilters}
                toggleBloodGroup={toggleBloodGroup}
                toggleDepartment={toggleDepartment}
                clearFilters={clearFilters}
                hasActiveFilters={hasActiveFilters}
              />
            </div>
          </aside>

          {/* Results Grid */}
          <div className="flex-1">
            {isLoading ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-card rounded-xl p-5 animate-pulse">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-full bg-muted" />
                      <div className="flex-1">
                        <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                        <div className="h-3 bg-muted rounded w-1/2" />
                      </div>
                    </div>
                    <div className="h-6 bg-muted rounded w-1/3 mb-4" />
                    <div className="h-4 bg-muted rounded w-full" />
                  </div>
                ))}
              </div>
            ) : profiles.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
                  <Search className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No donors found</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  No eligible donors match your current filters. Try adjusting your search criteria 
                  or enabling compatibility mode.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Button variant="outline" onClick={clearFilters}>
                    <X className="h-4 w-4 mr-2" />
                    Clear Filters
                  </Button>
                  <Button onClick={() => navigate('/request-blood')} className="btn-primary">
                    <HeartPulse className="h-4 w-4 mr-2" />
                    Submit Blood Request
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 mb-8">
                  {profiles.map((donor) => (
                    <DonorCard key={donor.id} donor={donor} />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-4 mt-8">
                    <Button 
                      variant="outline" 
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1}
                    >
                      <ChevronLeft className="w-4 h-4 mr-2" />
                      Previous
                    </Button>
                    <span className="text-sm font-medium">
                      Page {page} of {totalPages}
                    </span>
                    <Button 
                      variant="outline" 
                      onClick={() => setPage(page + 1)}
                      disabled={page === totalPages}
                    >
                      Next
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
