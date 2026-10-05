import { Router, type IRouter } from "express";
import { eq, desc, avg, count, sql } from "drizzle-orm";
import { db, analysesTable, reportsTable } from "@workspace/db";
import {
  CreateAnalysisBody,
  GetAnalysisParams,
  DeleteAnalysisParams,
  GetAnalysisReportParams,
} from "@workspace/api-zod";
import { analyzeDataGap, parseCSV } from "../lib/ai-analyzer";

const router: IRouter = Router();

// List all analyses
router.get("/analyses", async (req, res): Promise<void> => {
  const analyses = await db
    .select({
      id: analysesTable.id,
      question: analysesTable.question,
      filename: analysesTable.filename,
      rowCount: analysesTable.rowCount,
      columnCount: analysesTable.columnCount,
      status: analysesTable.status,
      readinessScore: analysesTable.readinessScore,
      riskLevel: analysesTable.riskLevel,
      createdAt: analysesTable.createdAt,
    })
    .from(analysesTable)
    .orderBy(desc(analysesTable.createdAt));
  res.json(analyses);
});

// Create a new analysis
router.post("/analyses", async (req, res): Promise<void> => {
  const parsed = CreateAnalysisBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { question, filename, csvData } = parsed.data;

  // Parse CSV to get basic stats
  const { headers, rows } = parseCSV(csvData);

  // Insert analysis record
  const [analysis] = await db.insert(analysesTable).values({
    question,
    filename,
    csvData,
    rowCount: rows.length,
    columnCount: headers.length,
    status: "processing",
  }).returning();

  // Run AI analysis asynchronously and update
  analyzeDataGap(question, csvData).then(async (result) => {
    try {
      // Update analysis with score
      await db.update(analysesTable)
        .set({
          status: "complete",
          readinessScore: result.readinessScore,
          riskLevel: result.riskLevel,
        })
        .where(eq(analysesTable.id, analysis.id));

      // Save report
      await db.insert(reportsTable).values({
        analysisId: analysis.id,
        readinessScore: result.readinessScore,
        riskLevel: result.riskLevel,
        availableData: result.availableData,
        missingData: result.missingData,
        recommendations: result.recommendations,
        explanation: result.explanation,
        unansweredQuestions: result.unansweredQuestions,
        columnAnalysis: result.columnAnalysis,
      });
    } catch (err) {
      await db.update(analysesTable)
        .set({ status: "failed" })
        .where(eq(analysesTable.id, analysis.id));
    }
  }).catch(async () => {
    await db.update(analysesTable)
      .set({ status: "failed" })
      .where(eq(analysesTable.id, analysis.id));
  });

  res.status(201).json({
    id: analysis.id,
    question: analysis.question,
    filename: analysis.filename,
    rowCount: analysis.rowCount,
    columnCount: analysis.columnCount,
    status: analysis.status,
    readinessScore: analysis.readinessScore ?? null,
    riskLevel: analysis.riskLevel ?? null,
    createdAt: analysis.createdAt,
  });
});

// Get a single analysis
router.get("/analyses/:id", async (req, res): Promise<void> => {
  const params = GetAnalysisParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [analysis] = await db
    .select({
      id: analysesTable.id,
      question: analysesTable.question,
      filename: analysesTable.filename,
      rowCount: analysesTable.rowCount,
      columnCount: analysesTable.columnCount,
      status: analysesTable.status,
      readinessScore: analysesTable.readinessScore,
      riskLevel: analysesTable.riskLevel,
      createdAt: analysesTable.createdAt,
    })
    .from(analysesTable)
    .where(eq(analysesTable.id, params.data.id));

  if (!analysis) {
    res.status(404).json({ error: "Analysis not found" });
    return;
  }

  res.json({
    ...analysis,
    readinessScore: analysis.readinessScore ?? null,
    riskLevel: analysis.riskLevel ?? null,
  });
});

// Delete an analysis
router.delete("/analyses/:id", async (req, res): Promise<void> => {
  const params = DeleteAnalysisParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [deleted] = await db
    .delete(analysesTable)
    .where(eq(analysesTable.id, params.data.id))
    .returning({ id: analysesTable.id });

  if (!deleted) {
    res.status(404).json({ error: "Analysis not found" });
    return;
  }

  res.sendStatus(204);
});

// Get analysis report
router.get("/analyses/:id/report", async (req, res): Promise<void> => {
  const params = GetAnalysisReportParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  // Check analysis exists and is complete
  const [analysis] = await db
    .select()
    .from(analysesTable)
    .where(eq(analysesTable.id, params.data.id));

  if (!analysis) {
    res.status(404).json({ error: "Analysis not found" });
    return;
  }

  // If still processing, wait briefly and try again
  if (analysis.status === "processing") {
    // Try to get the report anyway (may have just been saved)
  }

  const [report] = await db
    .select()
    .from(reportsTable)
    .where(eq(reportsTable.analysisId, params.data.id));

  if (!report) {
    if (analysis.status === "processing") {
      res.status(202).json({ error: "Analysis is still processing. Please retry in a moment." });
    } else {
      res.status(404).json({ error: "Report not found" });
    }
    return;
  }

  res.json({
    id: report.id,
    analysisId: report.analysisId,
    readinessScore: report.readinessScore,
    riskLevel: report.riskLevel,
    availableData: report.availableData,
    missingData: report.missingData,
    recommendations: report.recommendations,
    explanation: report.explanation,
    unansweredQuestions: report.unansweredQuestions,
    columnAnalysis: report.columnAnalysis,
    createdAt: report.createdAt,
  });
});

export default router;
