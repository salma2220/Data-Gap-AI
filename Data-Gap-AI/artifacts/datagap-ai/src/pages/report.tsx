import { useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { useGetAnalysis, useGetAnalysisReport, getGetAnalysisQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { ReportView } from "@/components/report-view";
import { BrainCircuit, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function Report() {
  const [, params] = useRoute("/report/:id");
  const [, setLocation] = useLocation();
  const id = params?.id ? parseInt(params.id, 10) : null;
  const queryClient = useQueryClient();

  if (!id) {
    setLocation("/analyze");
    return null;
  }

  const { data: analysis, isLoading: isAnalysisLoading } = useGetAnalysis(id, { 
    query: { 
      enabled: !!id, 
      queryKey: getGetAnalysisQueryKey(id),
      refetchInterval: (query) => {
        // Poll every 2 seconds if not complete or failed
        const status = query.state.data?.status;
        if (status === "pending" || status === "processing") return 2000;
        return false;
      }
    } 
  });

  const isReady = analysis?.status === "complete";
  const hasFailed = analysis?.status === "failed";

  const { data: report, isLoading: isReportLoading } = useGetAnalysisReport(id, {
    query: {
      enabled: isReady,
      queryKey: ["report", id]
    }
  });

  if (isAnalysisLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (hasFailed) {
    return (
      <div className="max-w-2xl mx-auto mt-24 p-8 bg-destructive/10 border border-destructive/20 rounded-xl text-center">
        <h2 className="text-xl font-bold text-destructive mb-2">Analysis Failed</h2>
        <p className="text-muted-foreground">The AI engine encountered an error parsing your schema. Please try again with a valid CSV.</p>
      </div>
    );
  }

  if (!isReady || isReportLoading || !report || !analysis) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[calc(100vh-4rem)]">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-card border border-border p-8 rounded-xl shadow-2xl relative overflow-hidden flex flex-col items-center text-center"
        >
          <div className="absolute inset-0 bg-grid-pattern opacity-10" />
          <div className="w-20 h-20 rounded-full border border-primary/30 flex items-center justify-center mb-6 relative">
            <BrainCircuit className="w-10 h-10 text-primary animate-pulse" />
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
              className="absolute inset-0 rounded-full border-t-2 border-primary"
            />
          </div>
          <h2 className="text-xl font-display font-semibold mb-2">Compiling Report</h2>
          <p className="text-muted-foreground text-sm">
            Evaluating data coverage, checking historical depth, and calculating readiness scores...
          </p>
          <div className="mt-8 w-full h-1.5 bg-muted rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-primary"
              initial={{ width: "0%" }}
              animate={{ width: analysis?.status === "processing" ? "60%" : "30%" }}
              transition={{ duration: 1 }}
            />
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <ReportView analysis={analysis} report={report} />
    </motion.div>
  );
}
