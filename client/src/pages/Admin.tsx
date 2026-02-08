import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { 
  useAdminChallenges, 
  useCreateChallenge, 
  useUpdateChallenge, 
  useDeleteChallenge 
} from "@/hooks/use-challenges";
import { useIntentions, useMarkIntentionPrinted } from "@/hooks/use-intentions";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Edit2, Loader2, CheckCircle, XCircle, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertChallengeSchema, type InsertChallenge } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function AdminLoginPage({ onLogin }: { onLogin: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (login(password)) {
      onLogin();
    } else {
      setError("Invalid password");
      setPassword("");
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-3xl font-serif font-bold">Prayer Admin</CardTitle>
          <p className="text-sm text-muted-foreground">Enter the admin password to continue</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                autoFocus
              />
            </div>
            {error && <p className="text-sm text-red-500 font-medium">{error}</p>}
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function Admin() {
  const [, setLocation] = useLocation();
  const { user, isLoading: authLoading, isAuthenticated, logout } = useAuth();
  const [showLogin, setShowLogin] = useState(!isAuthenticated);
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading) {
      setShowLogin(!isAuthenticated);
    }
  }, [isAuthenticated, authLoading]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin w-8 h-8" />
      </div>
    );
  }

  if (showLogin) {
    return <AdminLoginPage onLogin={() => setShowLogin(false)} />;
  }

  const handleLogout = () => {
    logout();
    setShowLogin(true);
    toast({ title: "Logged out successfully" });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-serif font-bold">Admin Dashboard</h1>
          <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2">
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>

        <Tabs defaultValue="challenges" className="space-y-6">
          <TabsList className="bg-muted/30 p-1">
            <TabsTrigger value="challenges">Prayer Challenges</TabsTrigger>
            <TabsTrigger value="intentions">Intentions Management</TabsTrigger>
          </TabsList>

          <TabsContent value="challenges">
            <ChallengesManager />
          </TabsContent>

          <TabsContent value="intentions">
            <IntentionsManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}


function ChallengesManager() {
  const { data: challenges, isLoading } = useAdminChallenges();
  const { mutate: deleteChallenge } = useDeleteChallenge();
  const { mutate: updateChallenge } = useUpdateChallenge();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  if (isLoading) return <div>Loading challenges...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Weekly Challenges</h2>
        <CreateChallengeDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />
      </div>

      <div className="rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead>Active</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {challenges?.map((challenge) => (
              <TableRow key={challenge.id}>
                <TableCell className="font-medium">{challenge.title}</TableCell>
                <TableCell>{challenge.prayerType}</TableCell>
                <TableCell>{challenge.currentCount} / {challenge.totalTarget}</TableCell>
                <TableCell>
                  <Switch 
                    checked={challenge.isActive || false}
                    onCheckedChange={(checked) => updateChallenge({ id: challenge.id, isActive: checked })}
                  />
                </TableCell>
                <TableCell className="text-right">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                    onClick={() => deleteChallenge(challenge.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {challenges?.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No challenges found. Create one to get started.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function CreateChallengeDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { mutate: create, isPending } = useCreateChallenge();
  const { toast } = useToast();
  
  const form = useForm<InsertChallenge>({
    resolver: zodResolver(insertChallengeSchema),
    defaultValues: {
      title: "",
      prayerType: "Hail Mary",
      totalTarget: 100,
      isActive: true,
    },
  });

  function onSubmit(data: InsertChallenge) {
    create(data, {
      onSuccess: () => {
        toast({ title: "Challenge created" });
        onOpenChange(false);
        form.reset();
      },
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="w-4 h-4" /> New Challenge
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Prayer Challenge</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Weekly Rosary Goal" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="prayerType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prayer Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Hail Mary">Hail Mary</SelectItem>
                      <SelectItem value="Our Father">Our Father</SelectItem>
                      <SelectItem value="Rosary">Rosary</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="totalTarget"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target Count</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      {...field} 
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Active Immediately</FormLabel>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isPending} className="w-full">
              {isPending ? "Creating..." : "Create Challenge"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function IntentionsManager() {
  const { data: intentions, isLoading } = useIntentions();
  const { mutate: markPrinted } = useMarkIntentionPrinted();

  if (isLoading) return <div>Loading intentions...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Submitted Intentions</h2>
      </div>

      <div className="rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Content</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Printed</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {intentions?.map((intention) => (
              <TableRow key={intention.id}>
                <TableCell className="max-w-md truncate" title={intention.content}>
                  {intention.content}
                </TableCell>
                <TableCell>{intention.name || "Anonymous"}</TableCell>
                <TableCell>
                  {intention.isPrinted ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-muted-foreground" />
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {!intention.isPrinted && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => markPrinted(intention.id)}
                    >
                      Mark Printed
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
