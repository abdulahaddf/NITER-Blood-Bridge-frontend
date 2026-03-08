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
import { dashboardStats, bloodGroupStats, mockUsers } from "@/data/mockData";
import { BloodGroupLabels } from "@/types";

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

export function AdminDashboardPage() {
  const navigate = useNavigate();
  const recentUsers = mockUsers.slice(0, 5);

  const statsCards = [
    {
      title: "Total Users",
      value: dashboardStats.totalUsers,
      icon: Users,
      color: "bg-blue-500",
      link: "/dashboard/users",
    },
    {
      title: "Verified Profiles",
      value: dashboardStats.verifiedProfiles,
      icon: UserCheck,
      color: "bg-green-500",
      link: "/dashboard/users",
    },
    {
      title: "Eligible Donors",
      value: dashboardStats.eligibleDonors,
      icon: HeartPulse,
      color: "bg-red-500",
      link: "/search",
    },
    {
      title: "Pending Deletions",
      value: dashboardStats.pendingDeletions,
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
                  <p className="text-3xl font-bold">{stat.value}</p>
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
              {bloodGroupStats.map((stat) => (
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
                          width: `${(stat.eligibleCount / stat.count) * 100}%`,
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
              {recentUsers.map((user) => (
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
