import { motion } from "framer-motion";
import { CheckCircle2, AlertTriangle, AlertCircle, ArrowRight, Table, Fingerprint, Type } from "lucide-react";
import type { Analysis, AnalysisReport, DataItem, Recommendation, ColumnInfo } from "@workspace/api-client-react";
import { Gauge } from "@/components/ui/gauge";

interface ReportViewProps {
  analysis: Analysis;
  report: AnalysisReport;
}

export function ReportView({ analysis, report }: ReportViewProps) {
  const isHighRisk = report.riskLevel === "high";
  const isMediumRisk = report.riskLevel === "medium";
  const isLowRisk = report.riskLevel === "low";

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 space-y-12">
      {/* Header Section */}
      <section className="flex flex-col md:flex-row gap-8 items-start justify-between">
        <div className="space-y-4 flex-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium uppercase tracking-wider">
            Report ID: {report.id}
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">
            Analysis Report
          </h1>
          <div className="p-4 rounded-lg bg-muted/30 border border-border">
            <p className="text-sm text-muted-foreground uppercase tracking-wider mb-1">Business Question</p>
            <p className="text-lg font-medium italic text-foreground/90">"{analysis.question}"</p>
          </div>
        </div>

        <div className="flex items-center gap-8 bg-card border border-border p-6 rounded-xl shadow-lg shrink-0">
          <Gauge value={report.readinessScore} size={140} strokeWidth={10} />
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground uppercase tracking-widest">Risk Level</div>
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-md font-bold text-sm uppercase tracking-wider ${
              isHighRisk ? "bg-destructive/10 text-destructive border border-destructive/20" :
              isMediumRisk ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" :
              "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
            }`}>
              {isHighRisk && <AlertCircle className="w-4 h-4" />}
              {isMediumRisk && <AlertTriangle className="w-4 h-4" />}
              {isLowRisk && <CheckCircle2 className="w-4 h-4" />}
              {report.riskLevel}
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              Based on {analysis.columnCount} columns
            </div>
          </div>
        </div>
      </section>

      {/* AI Explanation */}
      <section className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-card border border-border rounded-xl p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
            <h2 className="text-xl font-display font-bold flex items-center gap-2 mb-4">
              <Fingerprint className="w-5 h-5 text-primary" />
              AI Agent Verdict
            </h2>
            <div className="prose prose-invert max-w-none prose-p:leading-relaxed prose-p:text-muted-foreground prose-strong:text-foreground">
              <p>{report.explanation}</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="font-semibold text-emerald-500 flex items-center gap-2 mb-4">
                <CheckCircle2 className="w-5 h-5" />
                Available Signals
              </h3>
              <ul className="space-y-4">
                {report.availableData.map((item, i) => (
                  <li key={i} className="text-sm">
                    <div className="font-medium text-foreground">{item.name}</div>
                    <div className="text-muted-foreground text-xs mt-1">{item.description}</div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="font-semibold text-amber-500 flex items-center gap-2 mb-4">
                <AlertTriangle className="w-5 h-5" />
                Missing Signals
              </h3>
              <ul className="space-y-4">
                {report.missingData.length > 0 ? report.missingData.map((item, i) => (
                  <li key={i} className="text-sm">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-foreground">{item.name}</span>
                      <span className="text-[10px] uppercase px-2 py-0.5 rounded bg-muted text-muted-foreground">{item.importance}</span>
                    </div>
                    <div className="text-muted-foreground text-xs mt-1">{item.description}</div>
                  </li>
                )) : (
                  <li className="text-sm text-muted-foreground italic">No critical missing data identified.</li>
                )}
              </ul>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="text-lg font-display font-bold mb-4">Action Plan</h3>
            <div className="space-y-4">
              {report.recommendations.map((rec, i) => (
                <div key={i} className="p-3 bg-muted/30 rounded-lg border border-border/50 relative overflow-hidden">
                  <div className={`absolute left-0 top-0 w-1 h-full ${
                    rec.priority === "high" ? "bg-destructive" :
                    rec.priority === "medium" ? "bg-amber-500" : "bg-emerald-500"
                  }`} />
                  <p className="text-sm font-medium text-foreground">{rec.action}</p>
                  <p className="text-xs text-muted-foreground mt-1">{rec.impact}</p>
                  <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border/50">
                    <span className="text-[10px] uppercase text-muted-foreground">Effort: {rec.effort}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Unanswered Questions</h3>
            <ul className="space-y-2">
              {report.unansweredQuestions.map((q, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                  <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                  <span>{q}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Column Analysis Table */}
      <section className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="p-6 border-b border-border bg-muted/20">
          <h2 className="text-xl font-display font-bold flex items-center gap-2">
            <Table className="w-5 h-5 text-primary" />
            Column Relevance Analysis
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            How each provided column maps to the business question.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground uppercase text-xs tracking-wider">
              <tr>
                <th className="px-6 py-4 font-medium">Column</th>
                <th className="px-6 py-4 font-medium">Type</th>
                <th className="px-6 py-4 font-medium">Null %</th>
                <th className="px-6 py-4 font-medium">Relevance</th>
                <th className="px-6 py-4 font-medium">AI Reasoning</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {report.columnAnalysis.map((col, i) => (
                <tr key={i} className="hover:bg-muted/20 transition-colors">
                  <td className="px-6 py-4 font-medium text-foreground flex items-center gap-2">
                    <Type className="w-3 h-3 text-muted-foreground" />
                    {col.name}
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    <span className="px-2 py-1 rounded bg-muted/50 text-xs font-mono">{col.type}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={col.nullPercent > 20 ? "text-destructive" : "text-muted-foreground"}>
                      {col.nullPercent}%
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary" 
                          style={{ width: `${col.relevanceScore}%` }} 
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">{col.relevanceScore}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground text-xs max-w-xs truncate" title={col.relevanceReason}>
                    {col.relevanceReason}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
