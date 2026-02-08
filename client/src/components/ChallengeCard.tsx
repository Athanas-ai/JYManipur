import { motion } from "framer-motion";
import { useActiveChallenge, useIncrementChallenge } from "@/hooks/use-challenges";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Trophy, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export function ChallengeCard() {
  const { data: challenge, isLoading } = useActiveChallenge();
  const { mutate: increment, isPending } = useIncrementChallenge();
  const { toast } = useToast();

  if (isLoading) return <div className="h-48 rounded-2xl bg-muted/20 animate-pulse" />;
  if (!challenge) return null;

  const percentage = Math.min(100, Math.round((challenge.currentCount || 0) / challenge.totalTarget * 100));
  const isCompleted = (challenge.currentCount || 0) >= challenge.totalTarget;

  const handlePray = () => {
    increment(challenge.id, {
      onSuccess: () => {
        toast({
          title: "Prayer Recorded",
          description: "Thank you for joining the community prayer.",
        });
      },
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-b from-card to-card/50 p-6 sm:p-8 shadow-2xl shadow-primary/5"
    >
      <div className="absolute top-0 right-0 p-3 opacity-10">
        <Trophy className="w-32 h-32" />
      </div>

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary mb-3">
              Weekly Challenge
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight mb-2">
              {challenge.title}
            </h2>
            <p className="text-muted-foreground max-w-md">
              Join us in praying <span className="text-foreground font-medium">{challenge.prayerType}</span>. 
              Together we can reach our goal.
            </p>
          </div>
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-3xl font-bold font-mono text-primary">{percentage}%</span>
            <span className="text-sm text-muted-foreground">Complete</span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between text-sm mb-1.5">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-mono tabular-nums">
              {challenge.currentCount} / {challenge.totalTarget}
            </span>
          </div>
          
          <Progress value={percentage} className="h-3 bg-muted/50" indicatorClassName="bg-primary/80" />

          <div className="pt-4 flex items-center gap-4">
            <Button
              onClick={handlePray}
              disabled={isPending || isCompleted}
              size="lg"
              className={cn(
                "font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all duration-300",
                isCompleted 
                  ? "bg-green-600 hover:bg-green-700" 
                  : "bg-primary hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98]"
              )}
            >
              {isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : isCompleted ? (
                <CheckCircle2 className="mr-2 h-4 w-4" />
              ) : (
                <div className="mr-2 h-2 w-2 rounded-full bg-current" />
              )}
              {isCompleted ? "Goal Reached!" : "I Prayed One"}
            </Button>
            
            {isCompleted && (
              <p className="text-sm text-green-500 font-medium animate-in fade-in slide-in-from-left-2">
                Challenge completed! Thank you!
              </p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
