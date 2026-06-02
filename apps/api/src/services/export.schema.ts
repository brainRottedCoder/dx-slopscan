import { z } from 'zod';

const signalSchema = z.object({
  signal: z.string(),
  value: z.number(),
  weight: z.number(),
  explanation: z.string(),
});

const compositeScoreSchema = z.object({
  total: z.number(),
  grade: z.enum(['A', 'B', 'C', 'D', 'F']),
  signals: z.array(signalSchema),
  computedAt: z.string(),
  relativePercentile: z.number().optional(),
  relativeLabel: z.string().optional(),
});

export const exportableReportSchema = z.object({
  meta: z.object({
    repo: z.string(),
    scanId: z.string().min(1),
    generatedAt: z.string().min(1),
    scopeLimits: z.record(z.number()),
    note: z.string(),
  }),
  health: compositeScoreSchema,
  prPreviews: z.array(
    z.object({
      number: z.number(),
      title: z.string(),
      author: z.string(),
      state: z.string(),
    }),
  ),
  commitScores: z
    .object({
      score: compositeScoreSchema,
      sampleSize: z.number(),
      lookbackDays: z.number(),
    })
    .nullable(),
  docScores: z
    .object({
      entries: z.array(
        z.object({
          path: z.string(),
          preview: z.string(),
          score: z.number().nullable(),
        }),
      ),
      aggregateScore: compositeScoreSchema.nullable(),
    })
    .nullable(),
  contributors: z.array(
    z.object({
      login: z.string(),
      prCount: z.number(),
      commitCount: z.number(),
    }),
  ),
});
