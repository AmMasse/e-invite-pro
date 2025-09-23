import { Check, Circle, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface TodoItem {
  id: string;
  title: string;
  completed: boolean;
  inProgress?: boolean;
}

interface Phase {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'in-progress' | 'pending';
  items: TodoItem[];
}

const phases: Phase[] = [
  {
    id: 'phase1',
    title: 'Phase 1: Core Foundation & Authentication 🔐',
    description: 'Set up basic app structure and access control',
    status: 'in-progress',
    items: [
      { id: '1.1', title: 'Update main landing page with E-Invite branding', completed: true },
      { id: '1.2', title: 'Create professional design system for invitations', completed: true },
      { id: '1.3', title: 'Set up routing structure for different user types', completed: true },
      { id: '1.4', title: 'Design database schema (events, guests, invitations, itinerary)', completed: true },
      { id: '1.5', title: 'Create organizer login page', completed: true },
      { id: '1.6', title: 'Create master admin login page', completed: true },
      { id: '1.7', title: 'Implement authentication logic', completed: false, inProgress: true },
      { id: '1.8', title: 'Create protected routes and session management', completed: false }
    ]
  },
  {
    id: 'phase2',
    title: 'Phase 2: Excel Processing & Link Generation 📊',
    description: 'Core functionality for guest list management',
    status: 'pending',
    items: [
      { id: '2.1', title: 'Create Excel upload interface for organizers', completed: false },
      { id: '2.2', title: 'Implement Excel parsing (names, emails, phones)', completed: false },
      { id: '2.3', title: 'Add data validation and error handling', completed: false },
      { id: '2.4', title: 'Create preview for uploaded data', completed: false },
      { id: '2.5', title: 'Generate cryptographically secure unique links', completed: false },
      { id: '2.6', title: 'Create downloadable Excel with guest names + links', completed: false },
      { id: '2.7', title: 'Implement bulk guest insertion', completed: false },
      { id: '2.8', title: 'Create guest invitation page (/invite/:uniqueId)', completed: false },
      { id: '2.9', title: 'Add RSVP functionality (Yes/No/Maybe)', completed: false }
    ]
  },
  {
    id: 'phase3',
    title: 'Phase 3: Organizer Dashboard 📋',
    description: 'Event management interface',
    status: 'pending',
    items: [
      { id: '3.1', title: 'Create event overview dashboard', completed: false },
      { id: '3.2', title: 'Build guest list management interface', completed: false },
      { id: '3.3', title: 'Add RSVP status tracking and analytics', completed: false },
      { id: '3.4', title: 'Implement guest communication tools', completed: false },
      { id: '3.5', title: 'Create rich text editor for invitation content', completed: false },
      { id: '3.6', title: 'Add invitation preview functionality', completed: false },
      { id: '3.7', title: 'Implement message versioning and updates', completed: false },
      { id: '3.8', title: 'Add manual guest management (add/remove)', completed: false }
    ]
  },
  {
    id: 'phase4',
    title: 'Phase 4: Event Itinerary System 🗓️',
    description: 'Schedule and location management',
    status: 'pending',
    items: [
      { id: '4.1', title: 'Create itinerary builder interface', completed: false },
      { id: '4.2', title: 'Add time scheduling with date/time picker', completed: false },
      { id: '4.3', title: 'Implement location management with coordinates', completed: false },
      { id: '4.4', title: 'Create timeline view of event schedule', completed: false },
      { id: '4.5', title: 'Add interactive map integration', completed: false },
      { id: '4.6', title: 'Implement navigation links to venues', completed: false },
      { id: '4.7', title: 'Add real-time itinerary updates for guests', completed: false }
    ]
  },
  {
    id: 'phase5',
    title: 'Phase 5: Media Gallery (Backblaze Integration) 📸',
    description: 'Shared event photo/video gallery',
    status: 'pending',
    items: [
      { id: '5.1', title: 'Configure Backblaze B2 credentials via Supabase secrets', completed: false },
      { id: '5.2', title: 'Create Edge Functions for signed upload URLs', completed: false },
      { id: '5.3', title: 'Implement media metadata processing', completed: false },
      { id: '5.4', title: 'Create guest photo/video upload interface', completed: false },
      { id: '5.5', title: 'Add file validation and progress indicators', completed: false },
      { id: '5.6', title: 'Build responsive media grid gallery', completed: false },
      { id: '5.7', title: 'Create image/video viewer with navigation', completed: false },
      { id: '5.8', title: 'Implement performance optimizations and CDN', completed: false }
    ]
  },
  {
    id: 'phase6',
    title: 'Phase 6: Advanced Features & Polish ✨',
    description: 'Enhanced user experience',
    status: 'pending',
    items: [
      { id: '6.1', title: 'Create RSVP analytics dashboard', completed: false },
      { id: '6.2', title: 'Add guest engagement metrics', completed: false },
      { id: '6.3', title: 'Implement export capabilities', completed: false },
      { id: '6.4', title: 'Add email notifications for RSVPs', completed: false },
      { id: '6.5', title: 'Integrate SMS notifications (optional)', completed: false },
      { id: '6.6', title: 'Create event reminders system', completed: false },
      { id: '6.7', title: 'Add PWA capabilities', completed: false },
      { id: '6.8', title: 'Implement offline functionality', completed: false }
    ]
  },
  {
    id: 'phase7',
    title: 'Phase 7: Production Deployment 🚀',
    description: 'Live application deployment',
    status: 'pending',
    items: [
      { id: '7.1', title: 'Set up production Supabase environment', completed: false },
      { id: '7.2', title: 'Configure Backblaze production bucket', completed: false },
      { id: '7.3', title: 'Manage environment variables', completed: false },
      { id: '7.4', title: 'Optimize build for Vercel deployment', completed: false },
      { id: '7.5', title: 'Set up performance monitoring', completed: false },
      { id: '7.6', title: 'Configure custom domain', completed: false },
      { id: '7.7', title: 'Conduct end-to-end testing', completed: false },
      { id: '7.8', title: 'Perform security audit', completed: false }
    ]
  }
];

const ImplementationTodo = () => {
  const getStatusIcon = (status: Phase['status']) => {
    switch (status) {
      case 'completed':
        return <Check className="w-5 h-5 text-success" />;
      case 'in-progress':
        return <Clock className="w-5 h-5 text-accent" />;
      case 'pending':
        return <Circle className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: Phase['status']) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-success/10 text-success border-success/20">Completed</Badge>;
      case 'in-progress':
        return <Badge className="bg-accent/10 text-accent border-accent/20">In Progress</Badge>;
      case 'pending':
        return <Badge variant="outline" className="text-muted-foreground">Pending</Badge>;
    }
  };

  const getTotalProgress = () => {
    const totalItems = phases.reduce((sum, phase) => sum + phase.items.length, 0);
    const completedItems = phases.reduce((sum, phase) => 
      sum + phase.items.filter(item => item.completed).length, 0
    );
    return Math.round((completedItems / totalItems) * 100);
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">E-Invite Implementation Progress</h2>
        <div className="flex items-center justify-center gap-4">
          <div className="text-lg font-semibold">Overall Progress: {getTotalProgress()}%</div>
          <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
              style={{ width: `${getTotalProgress()}%` }}
            />
          </div>
        </div>
      </div>

      {phases.map((phase) => {
        const completedCount = phase.items.filter(item => item.completed).length;
        const progressPercentage = Math.round((completedCount / phase.items.length) * 100);
        
        return (
          <Card key={phase.id} className="border-primary/20">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                {getStatusIcon(phase.status)}
                <CardTitle className="text-lg">{phase.title}</CardTitle>
                {getStatusBadge(phase.status)}
              </div>
              <p className="text-muted-foreground text-sm">{phase.description}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-sm font-medium">{completedCount}/{phase.items.length} completed</span>
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
                <span className="text-sm text-muted-foreground">{progressPercentage}%</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {phase.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 transition-colors">
                    {item.completed ? (
                      <Check className="w-4 h-4 text-success flex-shrink-0" />
                    ) : item.inProgress ? (
                      <Clock className="w-4 h-4 text-accent flex-shrink-0" />
                    ) : (
                      <Circle className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    )}
                    <span className={`text-sm ${item.completed ? 'line-through text-muted-foreground' : item.inProgress ? 'text-accent font-medium' : ''}`}>
                      {item.title}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default ImplementationTodo;