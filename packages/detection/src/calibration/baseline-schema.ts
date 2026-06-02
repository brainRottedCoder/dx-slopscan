import { z } from 'zod';

export const baselineRepoEntrySchema = z.object({
  fullName: z.string().min(1),
  healthScore: z.number().min(0).max(100),
});

export const baselineScoresSchema = z.object({
  version: z.literal(1),
  generatedAt: z.string().datetime(),
  repos: z.array(baselineRepoEntrySchema).min(1),
  healthScoreDistribution: z.array(z.number().min(0).max(100)).min(10),
});

export type BaselineScoresFile = z.infer<typeof baselineScoresSchema>;
