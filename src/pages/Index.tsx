import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, useNavigate } from "react-router-dom";
import { Calendar, Users, Upload, Smartphone, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

const Index = () => {
  const navigate = useNavigate();
  const [clickCount, setClickCount] = useState(0);
  const [lastClickTime, setLastClickTime] = useState(0);

  const handleHeadingClick = () => {
    const now = Date.now();
    if (now - lastClickTime > 1000) {
      setClickCount(1);
    } else {
      setClickCount(prev => prev + 1);
    }
    setLastClickTime(now);
    if (clickCount + 1 === 3) {
      navigate('/admin');
      setClickCount(0);
    }
  };

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
    <div className="min-h-screen relative overflow-hidden">
      {/* SVG Filters for Glass Effect */}
      <svg className="hidden">
        <defs>
          <filter id="glass-distortion">
            <feTurbulence type="fractalNoise" baseFrequency="0.01" numOctaves="3" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="8" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>

      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(/background/image.jpg)' }}
      />
      
      {/* Dark Overlay for readability */}
      <div className="absolute inset-0 bg-black/40" />

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
          
          {/* Glass Button */}
          <div className="relative group">
            <div className="absolute inset-0 rounded-lg" style={{ backdropFilter: 'blur(4px)', filter: 'url(#glass-distortion) saturate(120%) brightness(1.15)' }} />
            <div className="absolute inset-0 rounded-lg bg-white/25" />
            <div className="absolute inset-0 rounded-lg shadow-[inset_1px_1px_1px_rgba(255,255,255,0.75)]" />
            <div className="absolute inset-0 rounded-lg overflow-hidden pointer-events-none">
              <div 
                className="absolute inset-0 opacity-50"
                style={{
                  background: 'radial-gradient(circle at 20% 30%, rgba(255,255,255,0.05) 0%, transparent 80%), radial-gradient(circle at 80% 70%, rgba(255,255,255,0.05) 0%, transparent 80%)',
                  backgroundSize: '300% 300%',
                  animation: 'floatDistort 10s infinite ease-in-out'
                }}
              />
            </div>
            <Button 
              asChild 
              className="relative z-10 bg-transparent border-0 text-white hover:bg-white/10 transition-all duration-300"
            >
              <Link to="/organizer-login">
                <Sparkles className="w-4 h-4 mr-2" />
                Get Started
              </Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 container mx-auto px-4 py-20">
        <div className="text-center max-w-5xl mx-auto">
          {/* Glass Hero Container */}
          <div className="relative mb-16">
            <div className="absolute inset-0 rounded-3xl" style={{ backdropFilter: 'blur(4px)', filter: 'url(#glass-distortion) saturate(120%) brightness(1.15)' }} />
            <div className="absolute inset-0 rounded-3xl bg-white/25" />
            <div className="absolute inset-0 rounded-3xl shadow-[inset_1px_1px_1px_rgba(255,255,255,0.75)]" />
            <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
              <div 
                className="absolute inset-0"
                style={{
                  background: 'radial-gradient(circle at 20% 30%, rgba(255,255,255,0.05) 0%, transparent 80%), radial-gradient(circle at 80% 70%, rgba(255,255,255,0.05) 0%, transparent 80%)',
                  backgroundSize: '300% 300%',
                  animation: 'floatDistort 10s infinite ease-in-out',
                  mixBlendMode: 'overlay'
                }}
              />
            </div>
            <div className="relative z-10 p-12">
              <h1 className="text-7xl font-bold mb-6 bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
                E-Invite Pro
              </h1>
              <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed">
                Create stunning digital invitations for your guests; create memories that are eternal and deliver unforgettable experiences to your loved ones.
              </p>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Upload, title: "Instant Share", color: "purple", desc: "Share your e-invite instantly via WhatsApp, SMS, email, or social media. Each of your guests gets an intimate and unique personalised access to your event." },
              { icon: Users, title: "Guest Management", color: "blue", desc: "Track RSVPs in real-time for easy planning and organisation" },
              { icon: Calendar, title: "Event Itinerary", color: "purple", desc: "Create detailed schedules with locations and share interactive itineraries so your guests are uptodate with any and all changes" },
              { icon: Smartphone, title: "Mobile Optimized", color: "blue", desc: "Beautiful mobile-first design ensures perfect viewing on any device, anywhere and at anytime. You dont have to worry about your e-invites getting lost." }
            ].map((feature, idx) => (
              <div key={idx} className="relative group">
                <div className="absolute inset-0 rounded-2xl" style={{ backdropFilter: 'blur(4px)', filter: 'url(#glass-distortion) saturate(120%) brightness(1.15)' }} />
                <div className="absolute inset-0 rounded-2xl bg-white/25 group-hover:bg-white/30 transition-all duration-300" />
                <div className="absolute inset-0 rounded-2xl shadow-[inset_1px_1px_1px_rgba(255,255,255,0.75)]" />
                <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
                  <div 
                    className="absolute inset-0"
                    style={{
                      background: 'radial-gradient(circle at 20% 30%, rgba(255,255,255,0.05) 0%, transparent 80%), radial-gradient(circle at 80% 70%, rgba(255,255,255,0.05) 0%, transparent 80%)',
                      backgroundSize: '300% 300%',
                      animation: 'floatDistort 10s infinite ease-in-out',
                      mixBlendMode: 'overlay'
                    }}
                  />
                </div>
                <Card className="relative z-10 bg-transparent border-0 shadow-none group-hover:scale-105 transition-all duration-300">
                  <CardHeader className="text-center">
                    <div className="mb-4 relative">
                      <div className={`absolute inset-0 bg-${feature.color}-500/20 blur-xl rounded-full group-hover:bg-${feature.color}-500/30 transition-all`} />
                      <feature.icon className={`w-10 h-10 mx-auto text-${feature.color}-300 relative z-10`} />
                    </div>
                    <CardTitle className="text-lg text-white">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-white/80">
                      {feature.desc}
                    </CardDescription>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>

          {/* CTA Section */}
          <div className="mt-20 relative">
            <div className="absolute inset-0 rounded-3xl" style={{ backdropFilter: 'blur(4px)', filter: 'url(#glass-distortion) saturate(120%) brightness(1.15)' }} />
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-purple-500/20 to-blue-500/20" />
            <div className="absolute inset-0 rounded-3xl shadow-[inset_1px_1px_1px_rgba(255,255,255,0.75)]" />
            <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
              <div 
                className="absolute inset-0"
                style={{
                  background: 'radial-gradient(circle at 20% 30%, rgba(255,255,255,0.05) 0%, transparent 80%), radial-gradient(circle at 80% 70%, rgba(255,255,255,0.05) 0%, transparent 80%)',
                  backgroundSize: '300% 300%',
                  animation: 'floatDistort 10s infinite ease-in-out',
                  mixBlendMode: 'overlay'
                }}
              />
            </div>
            <div className="relative z-10 p-12">
              <h2 className="text-4xl font-bold text-white mb-4">
                Ready to Create Something Beautiful?
              </h2>
              <p className="text-white/80 text-lg mb-8">
                Join hundreds of adventurers like you creating unforgettable digital experiences
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
      </div>

      {/* Footer */}
      <footer className="relative z-10 mt-20 py-8">
        <div className="absolute inset-0" style={{ backdropFilter: 'blur(4px)' }} />
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative container mx-auto px-4 text-center text-white/70">
          <p>© 2025 E-Invite Pro. Crafting memorable digital experiences.</p>
        </div>
      </footer>

      <style jsx>{`
        @keyframes floatDistort {
          0% { background-position: 0% 0%; }
          50% { background-position: 100% 100%; }
          100% { background-position: 0% 0%; }
        }
      `}</style>
    </div>
  );
};

export default Index;
