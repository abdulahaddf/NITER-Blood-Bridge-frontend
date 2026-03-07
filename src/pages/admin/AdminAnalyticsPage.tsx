import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Users,
  Droplets
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { bloodGroupStats, dashboardStats } from '@/data/mockData';
import { BloodGroupLabels } from '@/types';

const bloodGroupColors: Record<string, string> = {
  A_POS: '#3B82F6',
  A_NEG: '#1D4ED8',
  B_POS: '#F97316',
  B_NEG: '#C2410C',
  AB_POS: '#A855F7',
  AB_NEG: '#7C3AED',
  O_POS: '#22C55E',
  O_NEG: '#16A34A',
};

export function AdminAnalyticsPage() {
  // Calculate percentages for pie chart
  const totalDonors = bloodGroupStats.reduce((acc, stat) => acc + stat.count, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">
          Insights and statistics about the donor community
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Donors</p>
                <p className="text-3xl font-bold">{dashboardStats.totalUsers}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-blue-500 flex items-center justify-center">
                <Users className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Eligible Now</p>
                <p className="text-3xl font-bold">{dashboardStats.eligibleDonors}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-green-500 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Verified</p>
                <p className="text-3xl font-bold">{dashboardStats.verifiedProfiles}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-purple-500 flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Blood Groups</p>
                <p className="text-3xl font-bold">8</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-red-500 flex items-center justify-center">
                <Droplets className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Blood Group Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5 text-primary" />
              Blood Group Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {bloodGroupStats.map((stat) => {
                const percentage = ((stat.count / totalDonors) * 100).toFixed(1);
                return (
                  <div key={stat.bloodGroup} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: bloodGroupColors[stat.bloodGroup] }}
                        />
                        <span className="font-medium">{BloodGroupLabels[stat.bloodGroup]}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground">
                          {stat.eligibleCount} eligible
                        </span>
                        <span className="text-sm font-medium w-12 text-right">
                          {percentage}%
                        </span>
                      </div>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all"
                        style={{ 
                          width: `${percentage}%`,
                          backgroundColor: bloodGroupColors[stat.bloodGroup]
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Eligibility Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Eligibility Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <p className="text-3xl font-bold text-green-600">
                    {dashboardStats.eligibleDonors}
                  </p>
                  <p className="text-sm text-green-700">Eligible to Donate</p>
                </div>
                <div className="bg-yellow-50 rounded-lg p-4 text-center">
                  <p className="text-3xl font-bold text-yellow-600">
                    {dashboardStats.totalUsers - dashboardStats.eligibleDonors}
                  </p>
                  <p className="text-sm text-yellow-700">Not Eligible Yet</p>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">Eligibility Rate</h4>
                <div className="h-4 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-500 rounded-full"
                    style={{ 
                      width: `${(dashboardStats.eligibleDonors / dashboardStats.totalUsers) * 100}%` 
                    }}
                  />
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {((dashboardStats.eligibleDonors / dashboardStats.totalUsers) * 100).toFixed(1)}% of donors are currently eligible
                </p>
              </div>

              <div>
                <h4 className="font-medium mb-3">Verification Rate</h4>
                <div className="h-4 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 rounded-full"
                    style={{ 
                      width: `${(dashboardStats.verifiedProfiles / dashboardStats.totalUsers) * 100}%` 
                    }}
                  />
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {((dashboardStats.verifiedProfiles / dashboardStats.totalUsers) * 100).toFixed(1)}% of users have verified profiles
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Department Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Department Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { name: 'Textile Engineering', code: 'TE', count: 18 },
              { name: 'Industrial & Production', code: 'IP', count: 12 },
              { name: 'Electrical Engineering', code: 'EE', count: 15 },
              { name: 'Computer Science', code: 'CS', count: 20 },
              { name: 'Fashion Design', code: 'FD', count: 8 },
            ].map((dept) => (
              <div key={dept.code} className="bg-muted rounded-lg p-4 text-center">
                <p className="text-2xl font-bold">{dept.count}</p>
                <p className="text-sm text-muted-foreground">{dept.code}</p>
                <p className="text-xs text-muted-foreground mt-1">{dept.name}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
