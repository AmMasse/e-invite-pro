import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Trash2, UserPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AddGuestDialog } from "./AddGuestDialog";

interface Guest {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  rsvp_status: string;
  rsvp_at: string | null;
  unique_link: string;
}

interface GuestListProps {
  eventId: string;
}

export const GuestList = ({ eventId }: GuestListProps) => {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [filteredGuests, setFilteredGuests] = useState<Guest[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const { toast } = useToast();

  const fetchGuests = async () => {
    try {
      const { data, error } = await supabase
        .from("guests")
        .select("*")
        .eq("event_id", eventId)
        .order("name");

      if (error) throw error;
      setGuests(data || []);
      setFilteredGuests(data || []);
    } catch (error) {
      console.error("Error fetching guests:", error);
      toast({
        title: "Error",
        description: "Failed to load guest list",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuests();
  }, [eventId]);

  useEffect(() => {
    const filtered = guests.filter(
      (guest) =>
        guest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        guest.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        guest.phone?.includes(searchQuery)
    );
    setFilteredGuests(filtered);
  }, [searchQuery, guests]);

  const handleDeleteGuest = async (guestId: string) => {
    if (!confirm("Are you sure you want to remove this guest?")) return;

    try {
      const { error } = await supabase.from("guests").delete().eq("id", guestId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Guest removed successfully",
      });

      fetchGuests();
    } catch (error) {
      console.error("Error deleting guest:", error);
      toast({
        title: "Error",
        description: "Failed to remove guest",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "yes":
        return <Badge className="bg-success/10 text-success border-success/20">Confirmed</Badge>;
      case "no":
        return <Badge className="bg-destructive/10 text-destructive border-destructive/20">Declined</Badge>;
      case "maybe":
        return <Badge className="bg-accent/10 text-accent border-accent/20">Maybe</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  if (loading) {
    return <div className="text-muted-foreground">Loading guests...</div>;
  }

  return (
    <>
      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              Guest List ({filteredGuests.length})
            </CardTitle>
            <Button onClick={() => setShowAddDialog(true)} className="gap-2">
              <UserPlus className="w-4 h-4" />
              Add Guest
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search guests by name, email, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>RSVP Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredGuests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      No guests found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredGuests.map((guest) => (
                    <TableRow key={guest.id}>
                      <TableCell className="font-medium">{guest.name}</TableCell>
                      <TableCell>{guest.email || "-"}</TableCell>
                      <TableCell>{guest.phone || "-"}</TableCell>
                      <TableCell>{getStatusBadge(guest.rsvp_status)}</TableCell>
                      <TableCell>
                        {guest.rsvp_at
                          ? new Date(guest.rsvp_at).toLocaleDateString()
                          : "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteGuest(guest.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <AddGuestDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        eventId={eventId}
        onGuestAdded={fetchGuests}
      />
    </>
  );
};
