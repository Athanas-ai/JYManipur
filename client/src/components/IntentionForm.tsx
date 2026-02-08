import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertIntentionSchema } from "@shared/schema";
import { useCreateIntention } from "@/hooks/use-intentions";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Send } from "lucide-react";
import type { InsertIntention } from "@shared/schema";
import { z } from "zod";

const formSchema = insertIntentionSchema;

export function IntentionForm() {
  const { mutate: createIntention, isPending } = useCreateIntention();
  const { toast } = useToast();

  const form = useForm<InsertIntention>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: "",
      name: "",
      prayerType: "",
    },
  });

  function onSubmit(data: InsertIntention) {
    createIntention(data, {
      onSuccess: () => {
        toast({
          title: "Intention Submitted",
          description: "Your prayer request has been shared with the community.",
        });
        form.reset();
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      },
    });
  }

  return (
    <Card className="border-muted bg-card/50 backdrop-blur-sm shadow-xl">
      <CardHeader>
        <CardTitle className="font-serif text-xl">Submit an Intention</CardTitle>
        <CardDescription>
          Share your prayer requests. You may remain anonymous if you wish.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Intention</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="I would like prayers for..."
                      className="min-h-[120px] resize-none bg-background/50 border-input/50 focus:border-primary/50 transition-colors"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Anonymous" 
                        {...field} 
                        value={field.value || ""}
                        className="bg-background/50 border-input/50"
                      />
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
                    <FormLabel>Preferred Prayer (Optional)</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                      <FormControl>
                        <SelectTrigger className="bg-background/50 border-input/50">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Any">Any Prayer</SelectItem>
                        <SelectItem value="Hail Mary">Hail Mary</SelectItem>
                        <SelectItem value="Our Father">Our Father</SelectItem>
                        <SelectItem value="Rosary">Rosary</SelectItem>
                        <SelectItem value="Novena">Novena</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button 
              type="submit" 
              disabled={isPending}
              className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Submit Request
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
