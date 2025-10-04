import { Button } from "@/components/ui/button";
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

  const GlassCard = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
    <div className={`glass-card ${className}`}>
      <div className="glass-filter" />
      <div className="glass-distortion-overlay" />
      <div className="glass-overlay" />
      <div className="glass-specular" />
      <div className="glass-content">
        {children}
      </div>
    </div>
  );

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
          <GlassCard className="!w-auto !h-auto">
            <Button 
              asChild 
              className="bg-transparent border-0 text-white hover:bg-transparent transition-all duration-300"
            >
              <Link to="/organizer-login">
                Get Started
              </Link>
            </Button>
          </GlassCard>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 container mx-auto px-4 py-20">
        <div className="text-center max-w-5xl mx-auto">
          {/* Glass Hero Container */}
          <GlassCard className="!w-full !h-auto mb-16">
            <h1 className="text-7xl font-bold mb-6 bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
              E-Invite Pro
            </h1>
            <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed">
              Create stunning digital invitations for your guests; create memories that are eternal and deliver unforgettable experiences to your loved ones.
            </p>
          </GlassCard>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Upload, title: "Instant Share", color: "purple", desc: "Share your e-invite instantly via WhatsApp, SMS, email, or social media. Each of your guests gets an intimate and unique personalised access to your event." },
              { icon: Users, title: "Guest Management", color: "blue", desc: "Track RSVPs in real-time for easy planning and organisation" },
              { icon: Calendar, title: "Event Itinerary", color: "purple", desc: "Create detailed schedules with locations and share interactive itineraries so your guests are uptodate with any and all changes" },
              { icon: Smartphone, title: "Mobile Optimized", color: "blue", desc: "Beautiful mobile-first design ensures perfect viewing on any device, anywhere and at anytime. You dont have to worry about your e-invites getting lost." }
            ].map((feature, idx) => (
              <GlassCard key={idx} className="!w-full !h-auto hover-lift">
                <div className="mb-4 relative">
                  <div className={`absolute inset-0 ${feature.color === 'purple' ? 'bg-purple-500/20' : 'bg-blue-500/20'} blur-xl rounded-full transition-all`} />
                  <feature.icon className={`w-10 h-10 mx-auto ${feature.color === 'purple' ? 'text-purple-300' : 'text-blue-300'} relative z-10`} />
                </div>
                <h3 className="text-lg font-semibold text-white mb-3">{feature.title}</h3>
                <p className="text-white/80 text-sm leading-relaxed">{feature.desc}</p>
              </GlassCard>
            ))}
          </div>

          {/* CTA Section */}
          <GlassCard className="!w-full !h-auto mt-20">
            <h2 className="text-4xl font-bold text-white mb-4">
              Ready to Create Something Beautiful?
            </h2>
            <p className="text-white/80 text-lg mb-8">
              Join hundreds of adventurers creating unforgettable digital experiences
            </p>
            
          </GlassCard>
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
        .glass-card {
          position: relative;
          width: 300px;
          height: 200px;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 6px 24px rgba(0, 0, 0, 0.2);
        }

        .glass-filter,
        .glass-overlay,
        .glass-specular {
          position: absolute;
          inset: 0;
          border-radius: inherit;
        }

        .glass-filter {
          z-index: 1;
          backdrop-filter: blur(4px);
          filter: url(#glass-distortion) saturate(120%) brightness(1.15);
        }

        .glass-distortion-overlay {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 20% 30%, rgba(255,255,255,0.05) 0%, transparent 80%),
                      radial-gradient(circle at 80% 70%, rgba(255,255,255,0.05) 0%, transparent 80%);
          background-size: 300% 300%;
          animation: floatDistort 10s infinite ease-in-out;
          mix-blend-mode: overlay;
          z-index: 2;
          pointer-events: none;
        }

        @keyframes floatDistort {
          0% { background-position: 0% 0%; }
          50% { background-position: 100% 100%; }
          100% { background-position: 0% 0%; }
        }

        .glass-overlay {
          z-index: 2;
          background: rgba(255, 255, 255, 0.25);
        }

        .glass-specular {
          z-index: 3;
          box-shadow: inset 1px 1px 1px rgba(255, 255, 255, 0.75);
        }

        .glass-content {
          position: relative;
          z-index: 4;
          padding: 20px;
          color: #ffffff;
          text-align: center;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          height: 100%;
        }

        .hover-lift {
          transition: transform 0.3s ease;
        }

        .hover-lift:hover {
          transform: translateY(-5px);
        }

        @media (prefers-color-scheme: dark) {
          .glass-overlay {
            background: rgba(0, 0, 0, 0.25);
          }
          
          .glass-specular {
            box-shadow: inset 1px 1px 1px rgba(255, 255, 255, 0.15);
          }
        }
      `}</style>
    </div>
  );
};

export default Index;
