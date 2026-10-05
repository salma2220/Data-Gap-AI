import { useGetDemo, getGetDemoQueryKey } from "@workspace/api-client-react";
import { ReportView } from "@/components/report-view";
import { Loader2, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function Demo() {
  const { data, isLoading } = useGetDemo({ 
    query: { 
      queryKey: getGetDemoQueryKey() 
    } 
  });

  if (isLoading || !data) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="bg-primary/10 border-b border-primary/20 py-3">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-center gap-2 text-primary font-medium text-sm">
          <Sparkles className="w-4 h-4" />
          <span>Viewing Demo Scenario: Retail Sales Analysis</span>
        </div>
      </div>
      <ReportView analysis={data.analysis} report={data.report} />
    </motion.div>
  );
}
