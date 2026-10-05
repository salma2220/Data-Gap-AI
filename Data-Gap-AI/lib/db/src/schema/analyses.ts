import { pgTable, text, serial, timestamp, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const analysesTable = pgTable("analyses", {
  id: serial("id").primaryKey(),
  question: text("question").notNull(),
  filename: text("filename").notNull(),
  csvData: text("csv_data").notNull(),
  rowCount: integer("row_count").notNull().default(0),
  columnCount: integer("column_count").notNull().default(0),
  status: text("status").notNull().default("pending"),
  readinessScore: integer("readiness_score"),
  riskLevel: text("risk_level"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const reportsTable = pgTable("reports", {
  id: serial("id").primaryKey(),
  analysisId: integer("analysis_id").notNull().references(() => analysesTable.id, { onDelete: "cascade" }),
  readinessScore: integer("readiness_score").notNull(),
  riskLevel: text("risk_level").notNull(),
  availableData: jsonb("available_data").notNull().$type<Array<{ name: string; description: string; importance: string }>>(),
  missingData: jsonb("missing_data").notNull().$type<Array<{ name: string; description: string; importance: string }>>(),
  recommendations: jsonb("recommendations").notNull().$type<Array<{ priority: string; action: string; impact: string; effort: string }>>(),
  explanation: text("explanation").notNull(),
  unansweredQuestions: jsonb("unanswered_questions").notNull().$type<string[]>(),
  columnAnalysis: jsonb("column_analysis").notNull().$type<Array<{ name: string; type: string; sampleValues: string[]; nullPercent: number; relevanceScore: number; relevanceReason: string }>>(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertAnalysisSchema = createInsertSchema(analysesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertAnalysis = z.infer<typeof insertAnalysisSchema>;
export type Analysis = typeof analysesTable.$inferSelect;

export const insertReportSchema = createInsertSchema(reportsTable).omit({ id: true, createdAt: true });
export type InsertReport = z.infer<typeof insertReportSchema>;
export type Report = typeof reportsTable.$inferSelect;
