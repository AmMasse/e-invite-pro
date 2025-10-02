import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, Save, Eye, Edit } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { InvitationPreview } from "./InvitationPreview";

interface InvitationEditorProps {
  eventId: string;
}

export const InvitationEditor = ({ eventId }: InvitationEditorProps) => {
  const [customMessage, setCustomMessage] = useState("");
  const [invitationId, setInvitationId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch event details
        const { data: eventData, error: eventError } = await supabase
          .from("events")
          .select("*")
          .eq("id", eventId)
          .single();

        if (eventError) throw eventError;
        setEvent(eventData);

        // Fetch invitation
        const { data, error } = await supabase
          .from("invitations")
          .select("*")
          .eq("event_id", eventId)
          .maybeSingle();

        if (error && error.code !== "PGRST116") throw error;

        if (data) {
          setCustomMessage(data.custom_message || "");
          setInvitationId(data.id);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [eventId]);

  const handleSave = async () => {
    setIsSaving(true);

    try {
      if (invitationId) {
        // Update existing invitation
        const { error } = await supabase
          .from("invitations")
          .update({ custom_message: customMessage })
          .eq("id", invitationId);

        if (error) throw error;
      } else {
        // Create new invitation
        const { data, error } = await supabase
          .from("invitations")
          .insert({
            event_id: eventId,
            custom_message: customMessage,
          })
          .select()
          .single();

        if (error) throw error;
        setInvitationId(data.id);
      }

      toast({
        title: "Success",
        description: "Invitation message saved successfully",
      });
    } catch (error) {
      console.error("Error saving invitation:", error);
      toast({
        title: "Error",
        description: "Failed to save invitation message",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return <div className="text-muted-foreground">Loading invitation editor...</div>;
  }

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="w-5 h-5 text-primary" />
          Invitation Message
        </CardTitle>
        <CardDescription>
          Customize the message that guests will see when they view their invitation
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="edit" className="space-y-4">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="edit" className="gap-2">
              <Edit className="w-4 h-4" />
              Edit
            </TabsTrigger>
            <TabsTrigger value="preview" className="gap-2">
              <Eye className="w-4 h-4" />
              Preview
            </TabsTrigger>
          </TabsList>

          <TabsContent value="edit" className="space-y-4">
            <Textarea
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="Enter your custom invitation message here..."
              className="min-h-[200px]"
            />
            <div className="flex justify-end">
              <Button onClick={handleSave} disabled={isSaving} className="gap-2">
                <Save className="w-4 h-4" />
                {isSaving ? "Saving..." : "Save Message"}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="preview">
            {event ? (
              <InvitationPreview
                eventName={event.name}
                eventDescription={event.description}
                eventDate={event.event_date}
                organizerName={event.organizer_name}
                customMessage={customMessage || undefined}
              />
            ) : (
              <div className="text-muted-foreground text-center py-8">
                Loading event details...
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
