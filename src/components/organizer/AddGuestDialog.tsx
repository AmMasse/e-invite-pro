import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AddGuestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventId: string;
  onGuestAdded: () => void;
}

export const AddGuestDialog = ({ open, onOpenChange, eventId, onGuestAdded }: AddGuestDialogProps) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: "Error",
        description: "Guest name is required",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const uniqueLink = crypto.randomUUID();

      const { error } = await supabase.from("guests").insert({
        event_id: eventId,
        name: name.trim(),
        email: email.trim() || null,
        phone: phone.trim() || null,
        unique_link: uniqueLink,
        rsvp_status: "pending",
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Guest added successfully",
      });

      setName("");
      setEmail("");
      setPhone("");
      onOpenChange(false);
      onGuestAdded();
    } catch (error) {
      console.error("Error adding guest:", error);
      toast({
        title: "Error",
        description: "Failed to add guest",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Guest</DialogTitle>
          <DialogDescription>
            Add a guest manually to your event. A unique invitation link will be generated.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Guest name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="guest@example.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Phone number"
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Guest"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
