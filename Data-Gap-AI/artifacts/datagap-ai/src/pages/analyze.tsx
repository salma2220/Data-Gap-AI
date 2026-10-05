import { useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useCreateAnalysis } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { UploadCloud, FileText, BrainCircuit, X } from "lucide-react";
import { parseCSVPreview } from "@/lib/csv";

export default function Analyze() {
  const [, setLocation] = useLocation();
  const [question, setQuestion] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState("");
  const [preview, setPreview] = useState<{headers: string[], rows: string[][]}>({ headers: [], rows: [] });
  const [isDragging, setIsDragging] = useState(false);

  const createAnalysis = useCreateAnalysis();

  const handleFileUpload = (uploadedFile: File) => {
    if (uploadedFile.type !== "text/csv" && !uploadedFile.name.endsWith(".csv")) {
      alert("Please upload a CSV file");
      return;
    }
    setFile(uploadedFile);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setCsvData(text);
      setPreview(parseCSVPreview(text, 3));
    };
    reader.readAsText(uploadedFile);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question || !csvData) return;

    createAnalysis.mutate(
      {
        data: {
          question,
          filename: file?.name || "pasted_data.csv",
          csvData
        }
      },
      {
        onSuccess: (data) => {
          // Immediately navigate to report page; it will show loading states based on status
          setLocation(`/report/${data.id}`);
        }
      }
    );
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="mb-8 space-y-2">
        <h1 className="text-3xl font-display font-bold">New Analysis</h1>
        <p className="text-muted-foreground text-sm">
          Define the business question you want to answer and upload the dataset you plan to use.
          DataGap AI will evaluate if the data supports the question.
        </p>
      </div>

      <AnimatePresence mode="wait">
        {createAnalysis.isPending ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="h-96 flex flex-col items-center justify-center border border-primary/20 bg-card rounded-xl shadow-2xl relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-grid-pattern opacity-10" />
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-20 h-20 rounded-full border border-primary/30 flex items-center justify-center mb-6 glow-primary relative">
                <BrainCircuit className="w-10 h-10 text-primary animate-pulse" />
                <svg className="absolute inset-0 w-full h-full animate-[spin_3s_linear_infinite]" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="48" fill="none" stroke="hsl(var(--primary))" strokeWidth="1" strokeDasharray="10 20" opacity="0.5" />
                </svg>
              </div>
              <h3 className="text-xl font-display font-semibold mb-2">Analyzing Schema</h3>
              <p className="text-muted-foreground text-sm text-center max-w-md">
                Cross-referencing available data columns against the business domain logic for:
                <br />
                <span className="text-foreground italic mt-2 block">"{question}"</span>
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            onSubmit={handleSubmit}
            className="space-y-8"
          >
            <div className="space-y-3">
              <label htmlFor="question" className="block text-sm font-semibold text-foreground">
                What question are you trying to answer?
              </label>
              <textarea
                id="question"
                rows={3}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="e.g., Why did sales decrease in the Northeast region last quarter?"
                className="w-full bg-input/50 border border-border rounded-lg p-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
                required
              />
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-semibold text-foreground">
                Provide sample data (CSV)
              </label>
              
              {!csvData ? (
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl p-12 text-center transition-all ${
                    isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-card/50"
                  }`}
                >
                  <UploadCloud className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
                  <p className="text-sm font-medium mb-1">Drag and drop your CSV file here</p>
                  <p className="text-xs text-muted-foreground mb-6">or click to browse</p>
                  <input
                    type="file"
                    id="file-upload"
                    accept=".csv"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                  />
                  <Button type="button" variant="secondary" onClick={() => document.getElementById("file-upload")?.click()}>
                    Browse Files
                  </Button>
                </div>
              ) : (
                <div className="rounded-xl border border-border bg-card overflow-hidden">
                  <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-sm font-medium">{file?.name || "pasted_data.csv"}</p>
                        <p className="text-xs text-muted-foreground">{preview.headers.length} columns detected</p>
                      </div>
                    </div>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon"
                      onClick={() => { setCsvData(""); setFile(null); setPreview({ headers: [], rows: [] }); }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="p-0 overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-muted/50 border-b border-border">
                        <tr>
                          {preview.headers.map((h, i) => (
                            <th key={i} className="px-4 py-3 font-medium text-muted-foreground whitespace-nowrap">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {preview.rows.map((row, i) => (
                          <tr key={i} className="border-b border-border/50 last:border-0 hover:bg-muted/20">
                            {row.map((cell, j) => (
                              <td key={j} className="px-4 py-2 whitespace-nowrap text-foreground/80 truncate max-w-[150px]">
                                {cell || <span className="text-muted-foreground/30 italic">null</span>}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-4">
              <Button 
                type="submit" 
                size="lg" 
                disabled={!question || !csvData || createAnalysis.isPending}
                className="w-full sm:w-auto"
              >
                Analyze Data Readiness
              </Button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
