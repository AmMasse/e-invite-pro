import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LogOut, Calendar, Users, Mail } from "lucide-react";

const OrganizerDashboard = () => {
  const { user, logout } = useAuth();

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
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Event Overview
              </CardTitle>
              <CardDescription>Manage your event details</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                View and edit your event information, dates, and settings.
              </p>
            </CardContent>
          </Card>

          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Guest Management
              </CardTitle>
              <CardDescription>Manage your guest list</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                View RSVPs, manage guest information, and track attendance.
              </p>
            </CardContent>
          </Card>

          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-primary" />
                Invitations
              </CardTitle>
              <CardDescription>Customize invitation content</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Create and customize your invitation messages and content.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle>Event ID: {user?.eventId}</CardTitle>
              <CardDescription>
                This dashboard will be expanded with full functionality in upcoming phases
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Phase 1 Complete: Authentication and basic dashboard structure are now ready.
                Next phases will add guest management, Excel upload processing, and itinerary features.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default OrganizerDashboard;