import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CreateEventDialogProps {
  onEventCreated: () => void;
}

const CreateEventDialog = ({ onEventCreated }: CreateEventDialogProps) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [form, setForm] = useState({
    name: "",
    organizer_name: "",
    password: "",
    event_date: "",
    description: "",
    background_image: "",
  });

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!form.name || !form.organizer_name || !form.password) {
      toast({ title: "Error", description: "Name, organizer name, and password are required.", variant: "destructive" });
      return;
    }

    setIsCreating(true);
    try {
      const { error } = await supabase.from("events").insert({
        name: form.name,
        organizer_name: form.organizer_name,
        password: form.password,
        event_date: form.event_date || null,
        description: form.description || null,
        background_image: form.background_image || null,
      });

      if (error) throw error;

      toast({ title: "Success", description: "Event created successfully!" });
      setForm({ name: "", organizer_name: "", password: "", event_date: "", description: "", background_image: "" });
      setOpen(false);
      onEventCreated();
    } catch (error: any) {
      console.error("Error creating event:", error);
      toast({ title: "Error", description: error.message || "Failed to create event", variant: "destructive" });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Create Event
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Event</DialogTitle>
          <DialogDescription>Fill in the details to create a new event.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="name">Event Name *</Label>
            <Input id="name" value={form.name} onChange={(e) => handleChange("name", e.target.value)} placeholder="e.g. John & Jane's Wedding" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="organizer_name">Organizer Name *</Label>
            <Input id="organizer_name" value={form.organizer_name} onChange={(e) => handleChange("organizer_name", e.target.value)} placeholder="e.g. John Doe" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Organizer Password *</Label>
            <Input id="password" type="password" value={form.password} onChange={(e) => handleChange("password", e.target.value)} placeholder="Password for organizer login" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="event_date">Event Date</Label>
            <Input id="event_date" type="date" value={form.event_date} onChange={(e) => handleChange("event_date", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" value={form.description} onChange={(e) => handleChange("description", e.target.value)} placeholder="Brief description of the event" rows={3} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="background_image">Background Image URL</Label>
            <Input id="background_image" value={form.background_image} onChange={(e) => handleChange("background_image", e.target.value)} placeholder="https://..." />
          </div>
          <Button onClick={handleSubmit} disabled={isCreating} className="w-full">
            {isCreating ? "Creating..." : "Create Event"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateEventDialog;
