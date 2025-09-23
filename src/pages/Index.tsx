import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Calendar, Users, Upload, Smartphone } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-primary/5">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[var(--gradient-hero)] opacity-10" />
        <div className="relative z-10 container mx-auto px-4 py-16">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              E-Invite Pro
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Create stunning digital invitations, manage guest lists with Excel, and deliver unforgettable event experiences.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Link to="/organizer-login">Organizer Login</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-primary text-primary hover:bg-primary/10">
                <Link to="/admin">Admin Access</Link>
              </Button>
            </div>

            {/* Features Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
              <Card className="border-primary/20 hover:shadow-[var(--shadow-card)] transition-all duration-300">
                <CardHeader className="text-center">
                  <Upload className="w-10 h-10 mx-auto mb-4 text-primary" />
                  <CardTitle className="text-lg">Excel Integration</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Upload guest lists via Excel and automatically generate unique invitation links
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="border-primary/20 hover:shadow-[var(--shadow-card)] transition-all duration-300">
                <CardHeader className="text-center">
                  <Users className="w-10 h-10 mx-auto mb-4 text-accent" />
                  <CardTitle className="text-lg">Guest Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Track RSVPs in real-time and manage guest communications effortlessly
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="border-primary/20 hover:shadow-[var(--shadow-card)] transition-all duration-300">
                <CardHeader className="text-center">
                  <Calendar className="w-10 h-10 mx-auto mb-4 text-primary" />
                  <CardTitle className="text-lg">Event Itinerary</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Create detailed schedules with locations and share interactive itineraries
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="border-primary/20 hover:shadow-[var(--shadow-card)] transition-all duration-300">
                <CardHeader className="text-center">
                  <Smartphone className="w-10 h-10 mx-auto mb-4 text-accent" />
                  <CardTitle className="text-lg">Mobile Optimized</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Beautiful mobile-first design ensures perfect viewing on any device
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border mt-20 py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© 2024 E-Invite Pro. Crafting memorable digital experiences.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
