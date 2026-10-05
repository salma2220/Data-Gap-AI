import { Router, type IRouter } from "express";

const router: IRouter = Router();

// Get pre-built demo analysis (retail sales scenario)
router.get("/demo", async (_req, res): Promise<void> => {
  const demoAnalysis = {
    id: 0,
    question: "Why did sales decrease in Q3?",
    filename: "retail_sales_q3.csv",
    rowCount: 2847,
    columnCount: 6,
    status: "complete",
    readinessScore: 58,
    riskLevel: "medium",
    createdAt: new Date("2026-07-15T09:30:00Z").toISOString(),
  };

  const demoReport = {
    id: 0,
    analysisId: 0,
    readinessScore: 58,
    riskLevel: "medium",
    availableData: [
      {
        name: "Sales Transactions",
        description: "2,847 transactional records spanning the analysis period with revenue amounts and product codes",
        importance: "critical",
      },
      {
        name: "Product Catalog",
        description: "SKU-level product information including category and price point — enables category-level segmentation",
        importance: "high",
      },
      {
        name: "Date / Time Series",
        description: "Full date coverage allows temporal trend analysis, seasonality detection, and period-over-period comparison",
        importance: "critical",
      },
      {
        name: "Store / Region Identifiers",
        description: "Geographic segmentation reveals whether declines are localized or systemic across regions",
        importance: "high",
      },
    ],
    missingData: [
      {
        name: "Customer Satisfaction & Feedback",
        description: "NPS scores, reviews, and satisfaction data are absent — demand-side causes of the sales decline cannot be measured without this",
        importance: "critical",
      },
      {
        name: "Marketing Campaign Attribution",
        description: "No marketing channel or campaign data exists in the dataset — it is impossible to isolate whether reduced spend caused the decline",
        importance: "high",
      },
      {
        name: "Competitor Pricing Intelligence",
        description: "Without competitor pricing benchmarks, market-wide pricing pressure cannot be separated from company-specific issues",
        importance: "high",
      },
      {
        name: "Inventory & Stock-Out Events",
        description: "Supply chain disruptions and stock-outs may have driven customers to competitors — this signal is entirely absent",
        importance: "medium",
      },
    ],
    recommendations: [
      {
        priority: "high",
        action: "Integrate customer satisfaction and NPS survey data from your CRM",
        impact: "Reveals the demand-side driver of the decline — satisfaction data alone can explain 60-70% of B2C revenue changes",
        effort: "medium",
      },
      {
        priority: "high",
        action: "Pull marketing spend and campaign performance data from your advertising platforms",
        impact: "Enables attribution modeling to separate marketing-driven vs. organic demand changes",
        effort: "medium",
      },
      {
        priority: "medium",
        action: "Incorporate competitive pricing data via a market intelligence tool or manual benchmarking",
        impact: "Determines whether the decline is price-elasticity driven or company-specific",
        effort: "high",
      },
      {
        priority: "medium",
        action: "Add inventory and fulfillment event data to identify supply-side constraints",
        impact: "Stock-out events often cause 15-30% of unexplained revenue drops in retail",
        effort: "low",
      },
      {
        priority: "low",
        action: "Establish automated data quality monitoring across all five data sources",
        impact: "Prevents future analysis delays and ensures timely detection of data drift",
        effort: "medium",
      },
    ],
    explanation: `Based on analysis of your 2,847 retail sales records across 6 columns, I've assessed your data readiness at 58% for answering "Why did sales decrease in Q3?"

Your dataset provides solid transactional coverage — sales amounts, product identifiers, dates, and regional data are all present and give you the operational picture of what happened. The date dimension allows you to confirm the timing and magnitude of the Q3 decline with precision.

However, the analysis reveals three critical data gaps that prevent you from answering why the decline happened. Most importantly, customer satisfaction and feedback data is entirely absent. In retail, demand-side causes — price perception, product quality issues, service failures — are responsible for the majority of revenue changes, and without survey or review data, you cannot measure these signals at all.

The absence of marketing campaign data is equally problematic. If your marketing spend or channel mix changed in Q3, that change alone could explain the decline — but with no attribution data, this hypothesis cannot be tested or ruled out.

The MEDIUM risk designation reflects a dataset that is operationally strong but analytically incomplete. You can describe the decline in precise detail; you cannot yet explain its cause. Adding the three missing data sources would elevate readiness to approximately 85% and enable confident causal analysis.`,
    unansweredQuestions: [
      "Did customer satisfaction change before or after the sales decline began?",
      "Which marketing channels experienced the largest reduction in conversion during Q3?",
      "Did competitors change their pricing or promotions during the same period?",
      "Were stock-out events more frequent in regions showing the largest declines?",
      "Is the Q3 decline consistent with prior-year seasonality, or is it anomalous?",
    ],
    columnAnalysis: [
      { name: "date", type: "date", sampleValues: ["2026-07-01", "2026-07-02", "2026-07-03"], nullPercent: 0, relevanceScore: 92, relevanceReason: "Temporal data enables trend analysis and period-over-period comparison" },
      { name: "sales_amount", type: "number", sampleValues: ["149.99", "89.50", "234.00"], nullPercent: 2, relevanceScore: 98, relevanceReason: "Primary metric under investigation — directly measures the outcome being explained" },
      { name: "product_sku", type: "string", sampleValues: ["SKU-001", "SKU-042", "SKU-117"], nullPercent: 0, relevanceScore: 75, relevanceReason: "Enables product-level segmentation to identify which categories drove the decline" },
      { name: "category", type: "string", sampleValues: ["Electronics", "Apparel", "Home"], nullPercent: 4, relevanceScore: 82, relevanceReason: "Category-level analysis can reveal whether decline is concentrated or broad-based" },
      { name: "region", type: "string", sampleValues: ["Northeast", "Southeast", "West"], nullPercent: 1, relevanceScore: 78, relevanceReason: "Geographic segmentation identifies localized vs. systemic patterns" },
      { name: "transaction_id", type: "string", sampleValues: ["TXN-10001", "TXN-10002", "TXN-10003"], nullPercent: 0, relevanceScore: 25, relevanceReason: "Identifier column — useful for deduplication but not direct analysis" },
    ],
    createdAt: new Date("2026-07-15T09:30:00Z").toISOString(),
  };

  res.json({ analysis: demoAnalysis, report: demoReport });
});

export default router;
