import { Router, type IRouter } from "express";
import { desc, avg, count, sql } from "drizzle-orm";
import { db, analysesTable } from "@workspace/db";

const router: IRouter = Router();

// Get summary statistics
router.get("/stats", async (_req, res): Promise<void> => {
  const [totals] = await db
    .select({
      total: count(analysesTable.id),
      avgScore: avg(analysesTable.readinessScore),
      highRisk: count(sql`CASE WHEN ${analysesTable.riskLevel} = 'high' THEN 1 END`),
      mediumRisk: count(sql`CASE WHEN ${analysesTable.riskLevel} = 'medium' THEN 1 END`),
      lowRisk: count(sql`CASE WHEN ${analysesTable.riskLevel} = 'low' THEN 1 END`),
    })
    .from(analysesTable);

  const recentAnalyses = await db
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
    .orderBy(desc(analysesTable.createdAt))
    .limit(5);

  res.json({
    totalAnalyses: Number(totals?.total ?? 0),
    avgReadinessScore: Number(totals?.avgScore ?? 0),
    highRiskCount: Number(totals?.highRisk ?? 0),
    mediumRiskCount: Number(totals?.mediumRisk ?? 0),
    lowRiskCount: Number(totals?.lowRisk ?? 0),
    recentAnalyses: recentAnalyses.map(a => ({
      ...a,
      readinessScore: a.readinessScore ?? null,
      riskLevel: a.riskLevel ?? null,
    })),
  });
});

export default router;
