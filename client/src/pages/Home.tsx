import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { ChallengeCard } from "@/components/ChallengeCard";
import { IntentionForm } from "@/components/IntentionForm";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground pb-12">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative py-16 sm:py-24 overflow-hidden">
        {/* Abstract background elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-primary/5 rounded-full blur-3xl -z-10" />
        
        <div className="container mx-auto px-4 text-center z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl sm:text-6xl font-serif font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary via-white to-primary/50">
              Prayer Unites Us
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              Submit your prayer intentions anonymously, or join us in our weekly community prayer challenge. 
              Together, our voices reach further.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4 space-y-12 sm:space-y-16">
        {/* Active Challenge */}
        <section>
          <ChallengeCard />
        </section>

        {/* Intention Form */}
        <section className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <IntentionForm />
          </motion.div>
        </section>
      </div>
    </div>
  );
}
