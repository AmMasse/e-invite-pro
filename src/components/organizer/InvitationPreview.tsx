import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, CheckCircle2, XCircle, HelpCircle } from "lucide-react";

interface InvitationPreviewProps {
  eventName: string;
  eventDescription?: string;
  eventDate?: string;
  organizerName: string;
  customMessage?: string;
}

export const InvitationPreview = ({
  eventName,
  eventDescription,
  eventDate,
  organizerName,
  customMessage,
}: InvitationPreviewProps) => {
  return (
    <div className="bg-gradient-to-br from-background via-secondary/30 to-accent/5 rounded-lg p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            You're Invited!
          </h1>
          <p className="text-muted-foreground">From {organizerName}</p>
        </div>

        {/* Guest Info */}
        <Card className="border-accent/20">
          <CardHeader>
            <CardTitle>Hello, [Guest Name]! 👋</CardTitle>
            <CardDescription>
              Your personal invitation to {eventName}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Current RSVP Status:</span>
              <Badge variant="outline">Pending</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Event Details */}
        <Card className="border-accent/20">
          <CardHeader>
            <CardTitle className="text-2xl">{eventName}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {eventDescription && (
              <p className="text-muted-foreground">{eventDescription}</p>
            )}
            
            {eventDate && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-accent" />
                <span>{new Date(eventDate).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Custom Message */}
        {customMessage && (
          <Card className="border-accent/20 bg-accent/5">
            <CardHeader>
              <CardTitle className="text-lg">Personal Message</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground italic">{customMessage}</p>
            </CardContent>
          </Card>
        )}

        {/* RSVP Buttons */}
        <Card className="border-accent/20">
          <CardHeader>
            <CardTitle>Please Respond</CardTitle>
            <CardDescription>
              Let us know if you can make it
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3">
              <Button variant="outline" className="gap-2" disabled>
                <CheckCircle2 className="w-4 h-4" />
                Yes
              </Button>
              
              <Button variant="outline" className="gap-2" disabled>
                <HelpCircle className="w-4 h-4" />
                Maybe
              </Button>
              
              <Button variant="outline" className="gap-2" disabled>
                <XCircle className="w-4 h-4" />
                No
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
