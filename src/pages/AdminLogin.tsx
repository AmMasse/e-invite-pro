import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";
import { ArrowLeft, Shield } from "lucide-react";

const AdminLogin = () => {
  const [masterId, setMasterId] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // TODO: Implement admin authentication
    console.log("Admin login:", { masterId, password });
    
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-primary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="border-primary/20 shadow-[var(--shadow-card)]">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-accent" />
            </div>
            <div>
              <CardTitle className="text-2xl">Master Admin</CardTitle>
              <CardDescription>
                Enter your Master ID and password for admin access
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="masterId">Master ID</Label>
                <Input
                  id="masterId"
                  type="text"
                  placeholder="Enter your Master ID"
                  value={masterId}
                  onChange={(e) => setMasterId(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" 
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Admin Access"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Button asChild variant="ghost" size="sm">
                <Link to="/" className="inline-flex items-center gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Back to Home
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminLogin;