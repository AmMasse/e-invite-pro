import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  LineChart,
  Line,
  CartesianGrid
} from "recharts";
import {
  TrendingUp,
  Users,
  Clock,
  Activity,
  Calendar,
  Mail,
  Eye
} from "lucide-react";
import { format, parseISO, differenceInDays, startOfDay } from "date-fns";

interface RSVPAnalyticsProps {
  eventId: string;
}

interface Guest {
  id: string;
  name: string;
  rsvp_status: string;
  rsvp_at: string | null;
  created_at: string;
}

interface AnalyticsData {
  totalGuests: number;
  responded: number;
  responseRate: number;
  avgResponseTime: number;
  statusBreakdown: { name: string; value: number; color: string }[];
  responseTimeline: { date: string; responses: number }[];
  recentActivity: { guest: string; action: string; time: string }[];
}

const STATUS_COLORS = {
  yes: "#22c55e",
  no: "#ef4444",
  maybe: "#f59e0b",
  pending: "#94a3b8"
};

export const RSVPAnalytics = ({ eventId }: RSVPAnalyticsProps) => {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalGuests: 0,
    responded: 0,
    responseRate: 0,
    avgResponseTime: 0,
    statusBreakdown: [],
    responseTimeline: [],
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();

    const channel = supabase
      .channel(`rsvp_analytics_${eventId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "guests",
          filter: `event_id=eq.${eventId}`,
        },
        () => {
          fetchAnalytics();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [eventId]);

  const fetchAnalytics = async () => {
    try {
      const { data: guests, error } = await supabase
        .from("guests")
        .select("id, name, rsvp_status, rsvp_at, created_at")
        .eq("event_id", eventId)
        .order("rsvp_at", { ascending: false });

      if (error) throw error;

      if (guests) {
        processAnalytics(guests);
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const processAnalytics = (guests: Guest[]) => {
    const totalGuests = guests.length;
    const respondedGuests = guests.filter(g => g.rsvp_status !== "pending");
    const responded = respondedGuests.length;
    const responseRate = totalGuests > 0 ? (responded / totalGuests) * 100 : 0;

    const responseTimes = respondedGuests
      .filter(g => g.rsvp_at && g.created_at)
      .map(g => {
        const created = parseISO(g.created_at);
        const responded = parseISO(g.rsvp_at!);
        return differenceInDays(responded, created);
      });

    const avgResponseTime = responseTimes.length > 0
      ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
      : 0;

    const statusCounts = {
      yes: guests.filter(g => g.rsvp_status === "yes").length,
      no: guests.filter(g => g.rsvp_status === "no").length,
      maybe: guests.filter(g => g.rsvp_status === "maybe").length,
      pending: guests.filter(g => g.rsvp_status === "pending").length,
    };

    const statusBreakdown = [
      { name: "Attending", value: statusCounts.yes, color: STATUS_COLORS.yes },
      { name: "Not Attending", value: statusCounts.no, color: STATUS_COLORS.no },
      { name: "Maybe", value: statusCounts.maybe, color: STATUS_COLORS.maybe },
      { name: "Pending", value: statusCounts.pending, color: STATUS_COLORS.pending },
    ].filter(item => item.value > 0);

    const timeline = respondedGuests
      .filter(g => g.rsvp_at)
      .reduce((acc, guest) => {
        const date = format(startOfDay(parseISO(guest.rsvp_at!)), "MMM dd");
        const existing = acc.find(item => item.date === date);
        if (existing) {
          existing.responses += 1;
        } else {
          acc.push({ date, responses: 1 });
        }
        return acc;
      }, [] as { date: string; responses: number }[])
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-7);

    const recentActivity = respondedGuests
      .filter(g => g.rsvp_at)
      .slice(0, 5)
      .map(g => ({
        guest: g.name,
        action: `RSVP: ${g.rsvp_status.charAt(0).toUpperCase() + g.rsvp_status.slice(1)}`,
        time: format(parseISO(g.rsvp_at!), "MMM dd, h:mm a")
      }));

    setAnalytics({
      totalGuests,
      responded,
      responseRate,
      avgResponseTime,
      statusBreakdown,
      responseTimeline: timeline,
      recentActivity
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">Loading analytics...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              Total Guests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalGuests}</div>
          </CardContent>
        </Card>

        <Card className="border-success/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-success" />
              Response Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {analytics.responseRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {analytics.responded} of {analytics.totalGuests} responded
            </p>
          </CardContent>
        </Card>

        <Card className="border-accent/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="w-4 h-4 text-accent" />
              Avg Response Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">
              {analytics.avgResponseTime.toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">days</p>
          </CardContent>
        </Card>

        <Card className="border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" />
              Engagement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.totalGuests > 0
                ? Math.round((analytics.responded / analytics.totalGuests) * 100)
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">guest engagement</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart className="w-5 h-5" />
              RSVP Status Breakdown
            </CardTitle>
            <CardDescription>Distribution of guest responses</CardDescription>
          </CardHeader>
          <CardContent>
            {analytics.statusBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analytics.statusBreakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value, percent }) =>
                      `${name}: ${value} (${(percent * 100).toFixed(0)}%)`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {analytics.statusBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No RSVP data yet
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Response Timeline
            </CardTitle>
            <CardDescription>RSVPs received over time (last 7 days)</CardDescription>
          </CardHeader>
          <CardContent>
            {analytics.responseTimeline.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analytics.responseTimeline}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="responses"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--primary))" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No timeline data yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Recent Activity
          </CardTitle>
          <CardDescription>Latest RSVP responses</CardDescription>
        </CardHeader>
        <CardContent>
          {analytics.recentActivity.length > 0 ? (
            <div className="space-y-3">
              {analytics.recentActivity.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg border bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <Eye className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-sm">{activity.guest}</p>
                      <p className="text-xs text-muted-foreground">{activity.action}</p>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {activity.time}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              No activity yet
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
