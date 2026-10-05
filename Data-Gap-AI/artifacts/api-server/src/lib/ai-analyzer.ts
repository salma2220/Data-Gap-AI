/**
 * AI-powered data gap analyzer.
 * Attempts to use the Anthropic API if available, falls back to intelligent simulation.
 */

export interface ColumnInfo {
  name: string;
  type: string;
  sampleValues: string[];
  nullPercent: number;
  relevanceScore: number;
  relevanceReason: string;
}

export interface DataItem {
  name: string;
  description: string;
  importance: "critical" | "high" | "medium" | "low";
}

export interface Recommendation {
  priority: "high" | "medium" | "low";
  action: string;
  impact: string;
  effort: "low" | "medium" | "high";
}

export interface AnalysisResult {
  readinessScore: number;
  riskLevel: "low" | "medium" | "high";
  availableData: DataItem[];
  missingData: DataItem[];
  recommendations: Recommendation[];
  explanation: string;
  unansweredQuestions: string[];
  columnAnalysis: ColumnInfo[];
}

/** Parse raw CSV text into rows of string values */
export function parseCSV(csvText: string): { headers: string[]; rows: string[][] } {
  const lines = csvText.trim().split(/\r?\n/);
  if (lines.length === 0) return { headers: [], rows: [] };

  const parseRow = (line: string): string[] => {
    const result: string[] = [];
    let inQuote = false;
    let current = "";
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuote && line[i + 1] === '"') { current += '"'; i++; }
        else { inQuote = !inQuote; }
      } else if (ch === "," && !inQuote) {
        result.push(current.trim());
        current = "";
      } else {
        current += ch;
      }
    }
    result.push(current.trim());
    return result;
  };

  const headers = parseRow(lines[0]);
  const rows = lines.slice(1).map(parseRow);
  return { headers, rows };
}

/** Infer column type from sample values */
function inferType(values: string[]): string {
  const nonEmpty = values.filter(v => v !== "" && v !== null && v !== undefined);
  if (nonEmpty.length === 0) return "unknown";

  const isNumeric = nonEmpty.every(v => !isNaN(Number(v)));
  if (isNumeric) return "number";

  const datePattern = /^\d{4}-\d{2}-\d{2}|^\d{2}\/\d{2}\/\d{4}/;
  if (nonEmpty.some(v => datePattern.test(v))) return "date";

  const isBoolean = nonEmpty.every(v => ["true", "false", "yes", "no", "0", "1"].includes(v.toLowerCase()));
  if (isBoolean) return "boolean";

  return "string";
}

/** Analyze columns from parsed CSV */
export function analyzeColumns(headers: string[], rows: string[][]): ColumnInfo[] {
  return headers.map((header, colIdx) => {
    const values = rows.map(row => row[colIdx] ?? "");
    const nonEmpty = values.filter(v => v !== "");
    const nullPercent = values.length > 0 ? Math.round(((values.length - nonEmpty.length) / values.length) * 100) : 0;
    const sampleValues = [...new Set(nonEmpty)].slice(0, 5);
    const type = inferType(values);

    return {
      name: header,
      type,
      sampleValues,
      nullPercent,
      relevanceScore: 0,
      relevanceReason: "",
    };
  });
}

/** Smart simulation when AI API is unavailable */
function simulateAnalysis(question: string, columnAnalysis: ColumnInfo[]): AnalysisResult {
  const q = question.toLowerCase();
  const columnNames = columnAnalysis.map(c => c.name.toLowerCase());

  // Score columns based on question relevance
  const scoredColumns = columnAnalysis.map(col => {
    const name = col.name.toLowerCase();
    let score = 50; // baseline
    let reason = "Present in the dataset";

    // Boost for temporal/date columns — almost always relevant
    if (col.type === "date" || name.includes("date") || name.includes("time") || name.includes("period")) {
      score += 30;
      reason = "Temporal data enables trend and period-over-period analysis";
    }

    // Context-specific scoring based on question keywords
    if ((q.includes("sales") || q.includes("revenue")) && (name.includes("sales") || name.includes("revenue") || name.includes("amount") || name.includes("price") || name.includes("total"))) {
      score += 35;
      reason = "Directly measures the metric under investigation";
    }
    if ((q.includes("customer") || q.includes("churn")) && (name.includes("customer") || name.includes("user") || name.includes("client") || name.includes("segment"))) {
      score += 30;
      reason = "Identifies the subject population being analyzed";
    }
    if ((q.includes("product") || q.includes("category")) && (name.includes("product") || name.includes("category") || name.includes("sku") || name.includes("item"))) {
      score += 25;
      reason = "Enables product-level segmentation and analysis";
    }
    if (q.includes("region") || q.includes("location") || q.includes("geo")) {
      if (name.includes("region") || name.includes("location") || name.includes("city") || name.includes("country")) {
        score += 25;
        reason = "Supports geographic segmentation";
      }
    }
    if (name.includes("id") || name.includes("key")) {
      score = Math.max(30, score - 10);
      reason = "Identifier column — useful for joins but not direct analysis";
    }

    // Penalize high null percent
    score = Math.max(10, score - col.nullPercent * 0.5);
    if (col.nullPercent > 20) {
      reason += ` (${col.nullPercent}% missing values reduce reliability)`;
    }

    return { ...col, relevanceScore: Math.min(100, score), relevanceReason: reason };
  });

  // Build available data items from high-scoring columns
  const highRelevance = scoredColumns.filter(c => c.relevanceScore >= 60);
  const availableData: DataItem[] = highRelevance.map(col => ({
    name: col.name,
    description: `Column with ${col.type} data — ${col.relevanceReason.toLowerCase()}`,
    importance: col.relevanceScore >= 80 ? "critical" : col.relevanceScore >= 65 ? "high" : "medium",
  }));

  // Identify missing data based on question context
  const missingData: DataItem[] = [];

  if (q.includes("sales") || q.includes("revenue") || q.includes("decrease") || q.includes("decline")) {
    if (!columnNames.some(c => c.includes("feedback") || c.includes("satisfaction") || c.includes("review") || c.includes("nps"))) {
      missingData.push({ name: "Customer Satisfaction / Feedback", description: "Customer sentiment data (NPS, reviews, satisfaction scores) is essential to understand demand-side causes of sales changes", importance: "critical" });
    }
    if (!columnNames.some(c => c.includes("marketing") || c.includes("campaign") || c.includes("channel") || c.includes("ad"))) {
      missingData.push({ name: "Marketing Campaign Data", description: "Marketing spend, channel performance, and campaign attribution data is needed to isolate supply-side marketing effects on sales", importance: "high" });
    }
    if (!columnNames.some(c => c.includes("competitor") || c.includes("market_share") || c.includes("pricing"))) {
      missingData.push({ name: "Competitor & Market Intelligence", description: "Competitor pricing and market share data is needed to determine whether changes are industry-wide or company-specific", importance: "high" });
    }
    if (!columnNames.some(c => c.includes("inventory") || c.includes("stock") || c.includes("supply"))) {
      missingData.push({ name: "Inventory & Supply Chain Data", description: "Stock-out events and supply constraints may explain sales drops independent of demand", importance: "medium" });
    }
  }

  if (q.includes("customer") || q.includes("churn") || q.includes("retention")) {
    if (!columnNames.some(c => c.includes("behavior") || c.includes("session") || c.includes("activity") || c.includes("engagement"))) {
      missingData.push({ name: "Customer Behavioral Data", description: "Engagement, session, and activity logs are needed to identify early churn indicators", importance: "critical" });
    }
    if (!columnNames.some(c => c.includes("support") || c.includes("ticket") || c.includes("complaint"))) {
      missingData.push({ name: "Support & Complaint History", description: "Customer service interactions often reveal dissatisfaction before churn occurs", importance: "high" });
    }
  }

  if (q.includes("employee") || q.includes("hr") || q.includes("turnover") || q.includes("productivity")) {
    if (!columnNames.some(c => c.includes("survey") || c.includes("engagement") || c.includes("satisfaction"))) {
      missingData.push({ name: "Employee Engagement Data", description: "Survey and engagement metrics are required to measure morale and identify attrition risk factors", importance: "critical" });
    }
  }

  // Generic missing data for unknown question types
  if (missingData.length === 0) {
    missingData.push(
      { name: "Contextual Metadata", description: "Additional context about the business environment, external factors, or comparative benchmarks that would enrich the analysis", importance: "high" },
      { name: "Historical Baseline Data", description: "Historical data from comparable time periods is needed to establish trends and seasonality patterns", importance: "medium" },
    );
  }

  // Calculate readiness score
  const coverageRatio = highRelevance.length / Math.max(1, scoredColumns.length);
  const missingPenalty = missingData.filter(m => m.importance === "critical").length * 15
    + missingData.filter(m => m.importance === "high").length * 8;
  const avgNullPenalty = scoredColumns.reduce((s, c) => s + c.nullPercent, 0) / Math.max(1, scoredColumns.length) * 0.3;

  let readinessScore = Math.round(
    Math.max(15, Math.min(95,
      40 + coverageRatio * 35 - missingPenalty - avgNullPenalty
        + (scoredColumns.length >= 5 ? 10 : 0)
        + (scoredColumns.some(c => c.type === "date") ? 8 : 0)
    ))
  );

  const riskLevel: "low" | "medium" | "high" = readinessScore >= 70 ? "low" : readinessScore >= 45 ? "medium" : "high";

  // Build recommendations
  const recommendations: Recommendation[] = [];

  if (missingData.some(m => m.importance === "critical")) {
    recommendations.push({
      priority: "high",
      action: `Collect ${missingData.find(m => m.importance === "critical")!.name} immediately`,
      impact: "Critical missing data is blocking accurate analysis — without it, conclusions will be unreliable",
      effort: "high",
    });
  }

  const highNullCols = scoredColumns.filter(c => c.nullPercent > 15);
  if (highNullCols.length > 0) {
    recommendations.push({
      priority: "high",
      action: `Address missing values in ${highNullCols.map(c => c.name).join(", ")}`,
      impact: `${highNullCols.length} column(s) have significant null rates that may bias results`,
      effort: "medium",
    });
  }

  if (missingData.some(m => m.importance === "high")) {
    recommendations.push({
      priority: "medium",
      action: "Integrate high-priority missing data sources",
      impact: "Adding high-importance data will increase the readiness score significantly and enable richer analysis",
      effort: "high",
    });
  }

  recommendations.push({
    priority: "low",
    action: "Establish a data quality monitoring pipeline",
    impact: "Automated data quality checks will prevent future analysis delays caused by incomplete or corrupt data",
    effort: "medium",
  });

  // Build AI explanation
  const explanation = `Based on analysis of your ${scoredColumns.length} columns and your business question "${question}", I've assessed your data readiness at ${readinessScore}%.

${highRelevance.length > 0
    ? `Your dataset provides good coverage for ${highRelevance.slice(0, 3).map(c => c.name).join(", ")}${highRelevance.length > 3 ? `, and ${highRelevance.length - 3} other relevant columns` : ""}, which are directly relevant to answering your question.`
    : "Unfortunately, your current dataset has limited columns that directly address the question at hand."}

${missingData.length > 0
    ? `However, the analysis reveals ${missingData.length} significant data gaps. Most critically, ${missingData.filter(m => m.importance === "critical").length > 0 ? missingData.filter(m => m.importance === "critical").map(m => m.name).join(" and ") : missingData[0].name} is absent from your dataset. Without this information, any conclusions drawn will carry substantial uncertainty.`
    : "Your dataset appears reasonably complete for the stated question."}

The ${riskLevel.toUpperCase()} risk designation reflects ${riskLevel === "high" ? "significant gaps that could lead to incorrect or misleading conclusions" : riskLevel === "medium" ? "moderate gaps that may limit confidence in findings" : "a relatively complete dataset with minor gaps"}.`;

  // Unanswered questions
  const unansweredQuestions: string[] = [];
  if (missingData.some(m => m.importance === "critical")) {
    unansweredQuestions.push(`What is the causal relationship between ${missingData.filter(m => m.importance === "critical").map(m => m.name.toLowerCase()).join(", ")} and the observed outcome?`);
  }
  unansweredQuestions.push(`What external market factors may have influenced the results during this period?`);
  if (scoredColumns.filter(c => c.type === "date").length === 0) {
    unansweredQuestions.push(`How have trends evolved over time? (No date/time column detected)`);
  }
  if (highNullCols.length > 0) {
    unansweredQuestions.push(`Are the missing values in ${highNullCols.map(c => c.name).join(", ")} random or systematic?`);
  }

  return {
    readinessScore,
    riskLevel,
    availableData: availableData.length > 0 ? availableData : [{ name: "Dataset structure", description: "Basic tabular structure is present and parseable", importance: "low" }],
    missingData,
    recommendations,
    explanation,
    unansweredQuestions,
    columnAnalysis: scoredColumns,
  };
}

/** Main entry point: analyze the dataset for the given question */
export async function analyzeDataGap(question: string, csvText: string): Promise<AnalysisResult> {
  const { headers, rows } = parseCSV(csvText);
  const columnAnalysis = analyzeColumns(headers, rows);

  // Try Anthropic if available
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (apiKey) {
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-3-haiku-20240307",
          max_tokens: 2000,
          messages: [{
            role: "user",
            content: `You are a data readiness expert. Analyze whether the following dataset is sufficient to answer the business question.

Business Question: ${question}

Available Columns (with types and sample values):
${columnAnalysis.map(c => `- ${c.name} (${c.type}): samples=[${c.sampleValues.slice(0, 3).join(", ")}], nullPercent=${c.nullPercent}%`).join("\n")}

Total rows: ${rows.length}

Respond with ONLY a valid JSON object (no markdown, no explanation) matching this exact structure:
{
  "readinessScore": <integer 0-100>,
  "riskLevel": <"low"|"medium"|"high">,
  "availableData": [{"name": "...", "description": "...", "importance": <"critical"|"high"|"medium"|"low">}],
  "missingData": [{"name": "...", "description": "...", "importance": <"critical"|"high"|"medium"|"low">}],
  "recommendations": [{"priority": <"high"|"medium"|"low">, "action": "...", "impact": "...", "effort": <"low"|"medium"|"high">}],
  "explanation": "...",
  "unansweredQuestions": ["..."]
}`
          }]
        }),
        signal: AbortSignal.timeout(15000),
      });

      if (response.ok) {
        const data = await response.json() as { content: Array<{ text: string }> };
        const text = data.content[0]?.text ?? "";
        const parsed = JSON.parse(text) as Omit<AnalysisResult, "columnAnalysis">;
        return {
          ...parsed,
          columnAnalysis: columnAnalysis.map(c => ({
            ...c,
            relevanceScore: parsed.availableData.some(d => d.name.toLowerCase().includes(c.name.toLowerCase())) ? 80 : 40,
            relevanceReason: parsed.availableData.find(d => d.name.toLowerCase().includes(c.name.toLowerCase()))?.description ?? "Not directly relevant to the analysis question",
          })),
        };
      }
    } catch {
      // Fall through to simulation
    }
  }

  return simulateAnalysis(question, columnAnalysis);
}
