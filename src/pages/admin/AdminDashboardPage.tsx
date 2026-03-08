import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import {
  Users,
  UserCheck,
  HeartPulse,
  Trash2,
  Droplets,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BloodGroupLabels } from "@/types";
import { api } from "@/lib/api";
import type { BloodGroup } from "@/types";

interface DashboardStats {
  totalUsers: number;
  verifiedProfiles: number;
  eligibleDonors: number;
  pendingDeletions: number;
  openBloodRequests?: number;
}

interface BloodGroupStat {
  bloodGroup: BloodGroup;
  count: number;
  eligibleCount: number;
}

interface DonorStats {
  byBloodGroup?: Record<BloodGroup, { total: number; eligible: number }>;
  bloodGroupStats?: BloodGroupStat[];
}

interface RecentUser {
  id: string;
  email: string;
  emailVerified: boolean;
  createdAt: string;
  role: string;
}

const bloodGroupColors: Record<string, string> = {
  A_POS: "bg-blue-500",
  A_NEG: "bg-blue-700",
  B_POS: "bg-orange-500",
  B_NEG: "bg-orange-700",
  AB_POS: "bg-purple-500",
  AB_NEG: "bg-purple-700",
  O_POS: "bg-green-500",
  O_NEG: "bg-green-700",
};

const BLOOD_GROUPS: BloodGroup[] = ['A_POS','A_NEG','B_POS','B_NEG','AB_POS','AB_NEG','O_POS','O_NEG'];

export function AdminDashboardPage() {
  const navigate = useNavigate();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [bloodGroupStats, setBloodGroupStats] = useState<BloodGroupStat[]>([]);
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      api.get<DashboardStats>('/api/admin/dashboard'),
      api.get<DonorStats>('/api/donors/stats'),
      api.get<{ data: RecentUser[] } | RecentUser[]>('/api/users', { limit: 5, page: 1 }),
    ]).then(([dashboardRes, donorStatsRes, usersRes]) => {
      if (dashboardRes.status === 'fulfilled') {
        setStats(dashboardRes.value);
      }
      if (donorStatsRes.status === 'fulfilled') {
        const ds = donorStatsRes.value;
        // Handle different response shapes
        if (ds.bloodGroupStats) {
          setBloodGroupStats(ds.bloodGroupStats);
        } else if (ds.byBloodGroup) {
          const converted = BLOOD_GROUPS.map(bg => ({
            bloodGroup: bg,
            count: ds.byBloodGroup![bg]?.total ?? 0,
            eligibleCount: ds.byBloodGroup![bg]?.eligible ?? 0,
          }));
          setBloodGroupStats(converted);
        }
      }
      if (usersRes.status === 'fulfilled') {
        const val = usersRes.value;
        setRecentUsers(Array.isArray(val) ? val : (val as { data: RecentUser[] }).data ?? []);
      }
      setIsLoading(false);
    });
  }, []);

  const statsCards = [
    {
      title: "Total Users",
      value: stats?.totalUsers ?? '—',
      icon: Users,
      color: "bg-blue-500",
      link: "/dashboard/users",
    },
    {
      title: "Verified Profiles",
      value: stats?.verifiedProfiles ?? '—',
      icon: UserCheck,
      color: "bg-green-500",
      link: "/dashboard/users",
    },
    {
      title: "Eligible Donors",
      value: stats?.eligibleDonors ?? '—',
      icon: HeartPulse,
      color: "bg-red-500",
      link: "/search",
    },
    {
      title: "Pending Deletions",
      value: stats?.pendingDeletions ?? '—',
      icon: Trash2,
      color: "bg-orange-500",
      link: "/dashboard/deletions",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Dashboard Overview</h1>
        <p className="text-muted-foreground">
          Welcome to the NITER Blood Bridge admin panel
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat) => (
          <Card
            key={stat.title}
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate(stat.link)}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    {stat.title}
                  </p>
                  <p className="text-3xl font-bold">
                    {isLoading ? (
                      <span className="inline-block w-10 h-8 bg-muted rounded animate-pulse" />
                    ) : stat.value}
                  </p>
                </div>
                <div
                  className={`w-12 h-12 rounded-lg ${stat.color} flex items-center justify-center`}
                >
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Blood Group Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Droplets className="h-5 w-5 text-primary" />
              Blood Group Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {isLoading
                ? [...Array(4)].map((_, i) => (
                    <div key={i} className="h-8 bg-muted rounded animate-pulse" />
                  ))
                : bloodGroupStats.map((stat) => (
                    <div key={stat.bloodGroup} className="flex items-center gap-4">
                      <span
                        className={`blood-group-badge w-12 justify-center ${bloodGroupColors[stat.bloodGroup]}`}
                      >
                        {BloodGroupLabels[stat.bloodGroup]}
                      </span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm">
                            {stat.eligibleCount} eligible
                          </span>
                          <span className="text-sm text-muted-foreground">
                            of {stat.count}
                          </span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full ${bloodGroupColors[stat.bloodGroup]}`}
                            style={{
                              width: stat.count > 0 ? `${(stat.eligibleCount / stat.count) * 100}%` : '0%',
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Registrations */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Recent Registrations
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/dashboard/users")}
            >
              View All
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {isLoading
                ? [...Array(3)].map((_, i) => (
                    <div key={i} className="h-12 bg-muted rounded animate-pulse" />
                  ))
                : recentUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="font-medium text-primary">
                            {user.email.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-sm">{user.email}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Badge variant={user.emailVerified ? "default" : "secondary"}>
                        {user.emailVerified ? "Verified" : "Pending"}
                      </Badge>
                    </div>
                  ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Links */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Manage Users", link: "/dashboard/users", icon: Users },
              {
                label: "Deletion Requests",
                link: "/dashboard/deletions",
                icon: Trash2,
              },
              {
                label: "View Analytics",
                link: "/dashboard/analytics",
                icon: TrendingUp,
              },
              {
                label: "Send Broadcast",
                link: "/dashboard/broadcast",
                icon: HeartPulse,
              },
            ].map((action) => (
              <Button
                key={action.label}
                variant="outline"
                className="h-auto py-4 flex flex-col items-center gap-2"
                onClick={() => navigate(action.link)}
              >
                <action.icon className="h-6 w-6" />
                <span className="text-sm">{action.label}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
