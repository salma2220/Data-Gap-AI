import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowRight, Database, ShieldAlert, Sparkles, Activity, BrainCircuit } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <section className="relative flex-1 flex flex-col items-center justify-center px-4 py-24 md:py-32 overflow-hidden">
        {/* Background elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] opacity-20 pointer-events-none">
          <div className="absolute inset-0 bg-primary rounded-full blur-[120px] mix-blend-screen animate-pulse" />
          <div className="absolute inset-20 bg-secondary rounded-full blur-[100px] mix-blend-screen animate-pulse delay-700" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-4"
          >
            <Sparkles className="w-4 h-4" />
            <span>AI-Powered Data Readiness Analysis</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold tracking-tight text-balance leading-tight"
          >
            Discover the data you need <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
              before making decisions.
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto"
          >
            Stop launching projects with incomplete data. DataGap AI acts as your senior data scientist co-pilot, 
            analyzing your datasets against your business questions to score readiness and identify critical missing signals.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8"
          >
            <Link href="/analyze" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_15px_rgba(var(--primary),0.3)] hover:shadow-[0_0_25px_rgba(var(--primary),0.5)] h-12 px-8 w-full sm:w-auto gap-2 group text-base font-semibold">
                Start Analysis
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/demo" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-12 px-8 w-full sm:w-auto gap-2 text-base font-semibold border-primary/20 hover:border-primary/50 hover:bg-primary/5">
                Try Demo Scenario
            </Link>
          </motion.div>
        </div>

        {/* Floating abstract UI cards to show "what it looks like" */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="relative w-full max-w-5xl mx-auto mt-24 aspect-[2/1] md:aspect-[3/1] rounded-xl border border-white/10 bg-black/40 backdrop-blur-md overflow-hidden shadow-2xl flex items-center justify-center"
        >
          <div className="absolute inset-0 bg-grid-pattern opacity-30" />
          <div className="absolute top-0 w-full h-px bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
          
          <div className="flex gap-6 z-10 px-8 w-full items-center justify-center">
            {/* Fake Gauge */}
            <div className="flex flex-col items-center justify-center p-6 rounded-xl bg-background/60 border border-white/5 backdrop-blur-sm shadow-xl">
              <div className="relative w-32 h-32 flex items-center justify-center rounded-full border-4 border-primary/20 border-t-primary border-r-primary">
                <span className="text-3xl font-display font-bold text-primary">82<span className="text-lg">%</span></span>
              </div>
              <span className="mt-4 text-sm font-medium text-muted-foreground uppercase tracking-wider">Readiness Score</span>
            </div>

            {/* Fake Findings */}
            <div className="hidden md:flex flex-col gap-3 flex-1 max-w-md">
              <div className="p-4 rounded-lg bg-background/60 border border-white/5 backdrop-blur-sm flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-amber-500 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-foreground">Missing Customer Demographics</h4>
                  <p className="text-xs text-muted-foreground mt-1">High risk: Cannot correlate sales drop with age segments.</p>
                </div>
              </div>
              <div className="p-4 rounded-lg bg-background/60 border border-white/5 backdrop-blur-sm flex items-start gap-3">
                <Activity className="w-5 h-5 text-emerald-500 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-foreground">Transaction Timestamps Available</h4>
                  <p className="text-xs text-muted-foreground mt-1">Sufficient for daily/weekly trend analysis.</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>
      
      {/* Features/Explanation Section */}
      <section className="py-24 bg-card/50 border-t border-border/50">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Database className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold font-display">1. Upload Context</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Define your business question and provide a sample of your dataset. We parse the schema instantly.
            </p>
          </div>
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold font-display">2. AI Gap Analysis</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Our models map your schema against the required signals to answer your question accurately.
            </p>
          </div>
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold font-display">3. Risk Assessment</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Get a definitive Data Readiness Score, clear warnings on missing data, and actionable next steps.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
