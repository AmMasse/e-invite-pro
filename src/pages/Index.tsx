import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, useNavigate } from "react-router-dom";
import { Calendar, Users, Upload, Smartphone, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

const Index = () => {
  const navigate = useNavigate();
  const [clickCount, setClickCount] = useState(0);
  const [lastClickTime, setLastClickTime] = useState(0);

  // Handle triple-click on heading
  const handleHeadingClick = () => {
    const now = Date.now();
    
    // Reset if more than 1 second has passed
    if (now - lastClickTime > 1000) {
      setClickCount(1);
    } else {
      setClickCount(prev => prev + 1);
    }
    
    setLastClickTime(now);
    
    // Check if triple-clicked
    if (clickCount + 1 === 3) {
      navigate('/admin');
      setClickCount(0);
    }
  };

  // Handle Shift + D keyboard shortcut
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.shiftKey && e.key === 'D') {
        navigate('/admin');
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Navigation */}
      <nav className="relative z-20 container mx-auto px-4 py-6">
        <div className="flex justify-between items-center">
          <div className="text-2xl font-bold text-white">
            <span 
              onClick={handleHeadingClick}
              className="cursor-pointer select-none"
            >
              E-Invite Pro
            </span>
          </div>
          <Button 
            asChild 
            className="bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-all duration-300"
          >
            <Link to="/organizer-login">
              <Sparkles className="w-4 h-4 mr-2" />
              Get Started
            </Link>
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 container mx-auto px-4 py-20">
        <div className="text-center max-w-5xl mx-auto">
          {/* Glass container for hero content */}
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-12 shadow-2xl mb-16">
            <h1 className="text-7xl font-bold mb-6 bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
              E-Invite Pro
            </h1>
            <p className="text-xl text-white/80 mb-8 max-w-3xl mx-auto leading-relaxed">
              Create stunning digital invitations for your guests; create memories that are eternal and deliver unforgettable experiences to your loved ones.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-105 hover:shadow-2xl group">
              <CardHeader className="text-center">
                <div className="mb-4 relative">
                  <div className="absolute inset-0 bg-purple-500/20 blur-xl rounded-full group-hover:bg-purple-500/30 transition-all" />
                  <Upload className="w-10 h-10 mx-auto text-purple-300 relative z-10" />
                </div>
                <CardTitle className="text-lg text-white">Instant Share</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-white/70">
                  Share your e-invite instantly via WhatsApp, SMS, email, or social media. Each of your guests gets an intimate and unique personalised access to your event.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-105 hover:shadow-2xl group">
              <CardHeader className="text-center">
                <div className="mb-4 relative">
                  <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full group-hover:bg-blue-500/30 transition-all" />
                  <Users className="w-10 h-10 mx-auto text-blue-300 relative z-10" />
                </div>
                <CardTitle className="text-lg text-white">Guest Management</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-white/70">
                  Track RSVPs in real-time for easy planning and organisation
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-105 hover:shadow-2xl group">
              <CardHeader className="text-center">
                <div className="mb-4 relative">
                  <div className="absolute inset-0 bg-purple-500/20 blur-xl rounded-full group-hover:bg-purple-500/30 transition-all" />
                  <Calendar className="w-10 h-10 mx-auto text-purple-300 relative z-10" />
                </div>
                <CardTitle className="text-lg text-white">Event Itinerary</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-white/70">
                  Create detailed schedules with locations and share interactive itineraries so your guests are uptodate with any and all changes
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-105 hover:shadow-2xl group">
              <CardHeader className="text-center">
                <div className="mb-4 relative">
                  <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full group-hover:bg-blue-500/30 transition-all" />
                  <Smartphone className="w-10 h-10 mx-auto text-blue-300 relative z-10" />
                </div>
                <CardTitle className="text-lg text-white">Mobile Optimized</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-white/70">
                  Beautiful mobile-first design ensures perfect viewing on any device, anywhere and at anytime. You dont have to worry about your e-invites getting lost.
                </CardDescription>
              </CardContent>
            </Card>
          </div>

          {/* CTA Section */}
          <div className="mt-20 bg-gradient-to-r from-purple-500/10 to-blue-500/10 backdrop-blur-xl rounded-3xl border border-white/10 p-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              Ready to Create Something Beautiful?
            </h2>
            <p className="text-white/70 text-lg mb-8">
              Join hundreds of organizers creating unforgettable digital experiences
            </p>
            <Button 
              asChild 
              size="lg"
              className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
            >
              <Link to="/organizer-login">
                <Sparkles className="w-5 h-5 mr-2" />
                Get Started Now
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 mt-20 py-8 bg-black/20 backdrop-blur-md">
        <div className="container mx-auto px-4 text-center text-white/60">
          <p>© 2025 E-Invite Pro. Crafting memorable digital experiences.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
