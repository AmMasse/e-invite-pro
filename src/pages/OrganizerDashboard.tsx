import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut, ChartBar as BarChart3, Users, Mail, Calendar } from "lucide-react";
import { EventOverview } from "@/components/organizer/EventOverview";
import { GuestList } from "@/components/organizer/GuestList";
import { InvitationEditor } from "@/components/organizer/InvitationEditor";
import { ItineraryManager } from "@/components/organizer/ItineraryManager";

const OrganizerDashboard = () => {
  const { user, logout } = useAuth();

  if (!user?.eventId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-destructive">Error: No event ID found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-primary/5">
      <header className="border-b border-primary/10 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-primary">E-Invite Dashboard</h1>
            <p className="text-muted-foreground">Welcome, {user?.name}</p>
          </div>
          <Button variant="outline" onClick={logout} className="gap-2">
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full max-w-2xl grid-cols-4">
            <TabsTrigger value="overview" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="guests" className="gap-2">
              <Users className="w-4 h-4" />
              Guests
            </TabsTrigger>
            <TabsTrigger value="invitation" className="gap-2">
              <Mail className="w-4 h-4" />
              Invitation
            </TabsTrigger>
            <TabsTrigger value="itinerary" className="gap-2">
              <Calendar className="w-4 h-4" />
              Itinerary
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <EventOverview eventId={user.eventId} />
          </TabsContent>

          <TabsContent value="guests">
            <GuestList eventId={user.eventId} />
          </TabsContent>

          <TabsContent value="invitation">
            <InvitationEditor eventId={user.eventId} />
          </TabsContent>

          <TabsContent value="itinerary">
            <ItineraryManager eventId={user.eventId} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default OrganizerDashboard;