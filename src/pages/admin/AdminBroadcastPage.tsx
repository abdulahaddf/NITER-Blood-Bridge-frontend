import { useState, useEffect } from "react";
import { Send, Users, Droplets, Shield, Eye, History, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BloodGroupLabels, type BloodGroup } from "@/types";
import { api } from "@/lib/api";
import { toast } from "sonner";

const bloodGroups: BloodGroup[] = [
  "A_POS",
  "A_NEG",
  "B_POS",
  "B_NEG",
  "AB_POS",
  "AB_NEG",
  "O_POS",
  "O_NEG",
];

export function AdminBroadcastPage() {
  const [target, setTarget] = useState<"all" | "blood-group" | "admins">("all");
  const [selectedBloodGroup, setSelectedBloodGroup] =
    useState<BloodGroup>("O_POS");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [isPreview, setIsPreview] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [counts, setCounts] = useState({
    all: 0,
    admins: 3,
    byBloodGroup: {} as Record<BloodGroup, number>
  });

  useEffect(() => {
    Promise.allSettled([
      api.get<{ totalUsers: number }>('/api/admin/dashboard').catch(() => ({ totalUsers: 0 })),
      api.get<{ byBloodGroup?: Record<BloodGroup, { total: number }> }>('/api/donors/stats').catch(() => ({})),
    ]).then(([dashRes, statsRes]) => {
      const dash = dashRes.status === 'fulfilled' ? dashRes.value : { totalUsers: 0 };
      const stats = statsRes.status === 'fulfilled' ? statsRes.value : {};
      
      const bgCounts: Record<string, number> = {};
      if (stats.byBloodGroup) {
        Object.entries(stats.byBloodGroup).forEach(([bg, val]) => {
          bgCounts[bg] = val.total;
        });
      }

      setCounts({
        all: dash.totalUsers,
        admins: 3,
        byBloodGroup: bgCounts as Record<BloodGroup, number>
      });
      setIsLoading(false);
    });
  }, []);

  const getRecipientCount = () => {
    switch (target) {
      case "all":
        return counts.all;
      case "blood-group":
        return counts.byBloodGroup[selectedBloodGroup] || 0;
      case "admins":
        return counts.admins;
      default:
        return 0;
    }
  };

  const handleSend = async () => {
    // There is no broadcast API endpoint yet in the provided docs
    toast.info("Broadcast API endpoint not available. Simulation successful.");
    setTitle("");
    setMessage("");
    setIsPreview(false);
  };

  const pastBroadcasts = [
    {
      id: "1",
      title: "Urgent: O- Blood Needed",
      recipients: 6,
      date: "2024-07-15",
      type: "blood-group",
    },
    {
      id: "2",
      title: "System Maintenance Notice",
      recipients: 73,
      date: "2024-07-10",
      type: "all",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Broadcast</h1>
        <p className="text-muted-foreground">Send notifications to users</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Compose Form */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5 text-primary" />
                Compose Message
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Target Audience */}
              <div className="space-y-3">
                <Label>Target Audience</Label>
                <RadioGroup
                  value={target}
                  onValueChange={(v) => setTarget(v as typeof target)}
                  className="grid grid-cols-3 gap-4"
                >
                  <div>
                    <RadioGroupItem
                      value="all"
                      id="all"
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor="all"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer text-center"
                    >
                      <Users className="mb-3 h-6 w-6" />
                      All Users
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem
                      value="blood-group"
                      id="blood-group"
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor="blood-group"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer text-center"
                    >
                      <Droplets className="mb-3 h-6 w-6" />
                      Blood Group
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem
                      value="admins"
                      id="admins"
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor="admins"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer text-center"
                    >
                      <Shield className="mb-3 h-6 w-6" />
                      Admins
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Blood Group Selection */}
              {target === "blood-group" && (
                <div className="space-y-2">
                  <Label>Select Blood Group</Label>
                  <Select
                    value={selectedBloodGroup}
                    onValueChange={(v) =>
                      setSelectedBloodGroup(v as BloodGroup)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {bloodGroups.map((group) => (
                        <SelectItem key={group} value={group}>
                          {BloodGroupLabels[group]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Message Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter notification title"
                />
              </div>

              {/* Message Body */}
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Enter your message..."
                  rows={5}
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">
                    {isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : getRecipientCount()} recipients
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsPreview(!isPreview)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    {isPreview ? "Edit" : "Preview"}
                  </Button>
                  <Button
                    onClick={handleSend}
                    disabled={!title || !message}
                    className="btn-primary"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Send Broadcast
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview & History */}
        <div className="space-y-6">
          {/* Preview */}
          {isPreview && (
            <Card>
              <CardHeader>
                <CardTitle>Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                      <Send className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="font-medium">NITER Blood Bridge</p>
                      <p className="text-xs text-muted-foreground">Just now</p>
                    </div>
                  </div>
                  <h4 className="font-semibold mb-2">
                    {title || "Notification Title"}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {message || "Your message will appear here..."}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Past Broadcasts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5 text-primary" />
                Past Broadcasts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pastBroadcasts.map((broadcast) => (
                  <div
                    key={broadcast.id}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div>
                      <p className="font-medium">{broadcast.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {broadcast.recipients} recipients · {broadcast.date}
                      </p>
                    </div>
                    <Badge variant="secondary">
                      {broadcast.type === "all"
                        ? "All"
                        : broadcast.type === "admins"
                          ? "Admins"
                          : "Blood Group"}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
