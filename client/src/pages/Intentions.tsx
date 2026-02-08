import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { Navbar } from "@/components/Navbar";
import { useIntentions, useIncrementPrayer } from "@/hooks/use-intentions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Printer, Heart, Users, Calendar, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Intentions() {
  const { data: intentions, isLoading, error } = useIntentions();
  const { mutate: pray } = useIncrementPrayer();
  const [printing, setPrinting] = useState(false);

  const handlePrint = () => {
    setPrinting(true);
    setTimeout(() => {
      window.print();
      setPrinting(false);
    }, 100);
  };

  const handlePrayClick = (id: number, type: 'hailMary' | 'ourFather' | 'rosary') => {
    pray({ id, type });
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 no-print">
          <div>
            <h1 className="text-3xl font-serif font-bold mb-2">Community Intentions</h1>
            <p className="text-muted-foreground">Join in prayer for these requests.</p>
          </div>
          <Button variant="outline" onClick={handlePrint} className="gap-2">
            <Printer className="w-4 h-4" />
            Print List
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-64 rounded-xl bg-card/50 border border-muted animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-20 text-destructive">
            <p>Failed to load intentions. Please try again later.</p>
          </div>
        ) : intentions?.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <Heart className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>No intentions shared yet. Be the first to submit one.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 print:block">
            <AnimatePresence>
              {intentions?.map((intention) => (
                <motion.div
                  key={intention.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  layout
                  className="print-card"
                >
                  <Card className="h-full flex flex-col bg-card/50 border-muted hover:border-primary/20 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
                    <CardHeader className="pb-3 space-y-3">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Users className="w-3 h-3" />
                          <span className="font-medium text-foreground/80">
                            {intention.name || "Anonymous"}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3 h-3" />
                          {intention.createdAt && format(new Date(intention.createdAt), "MMM d, yyyy")}
                        </div>
                      </div>
                      {intention.prayerType && (
                        <div className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary w-fit">
                          {intention.prayerType} Requested
                        </div>
                      )}
                    </CardHeader>
                    
                    <CardContent className="flex-grow">
                      <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground/90 font-serif">
                        "{intention.content}"
                      </p>
                    </CardContent>

                    <CardFooter className="pt-4 border-t border-border/50 bg-muted/20 flex flex-col gap-3 no-print">
                      <div className="w-full flex justify-between gap-2 text-xs text-muted-foreground font-mono">
                        <div className="flex flex-col items-center">
                          <span className="text-foreground font-bold">{intention.hailMaryCount}</span>
                          <span>Hail Marys</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <span className="text-foreground font-bold">{intention.ourFatherCount}</span>
                          <span>Our Fathers</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <span className="text-foreground font-bold">{intention.rosaryCount}</span>
                          <span>Rosaries</span>
                        </div>
                      </div>
                      
                      <div className="w-full grid grid-cols-3 gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handlePrayClick(intention.id, 'hailMary')}
                          className="h-8 text-[10px] px-0 hover:bg-primary/10 hover:text-primary"
                        >
                          +1 Hail Mary
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handlePrayClick(intention.id, 'ourFather')}
                          className="h-8 text-[10px] px-0 hover:bg-primary/10 hover:text-primary"
                        >
                          +1 Our Father
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handlePrayClick(intention.id, 'rosary')}
                          className="h-8 text-[10px] px-0 hover:bg-primary/10 hover:text-primary"
                        >
                          +1 Rosary
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
