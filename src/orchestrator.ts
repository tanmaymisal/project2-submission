import { describe, it, expect } from 'vitest';
import { ReviewReportSchema } from '../src/types/index.js';
import { RateLimiter } from '../src/utils/rate-limiter.js';

describe('ReviewReportSchema', () => {
  it('accepts a valid report shape', () => {
    const parsed = ReviewReportSchema.safeParse({
      pullRequest: { owner: 'octocat', repo: 'Hello-World', number: 1 },
      fileReviews: [],
      summary: { totalFiles: 0, overallScore: 100, criticalIssues: 0, highPriorityTests: 0, refactoringOpportunities: 0 },
      recommendations: [],
      metadata: { analyzedAt: new Date().toISOString(), duration: 0, agentVersions: {} }
    });
    expect(parsed.success).toBe(true);
  });

  it('rejects an invalid PR number type', () => {
    const parsed = ReviewReportSchema.safeParse({ 
      pullRequest: { owner: 'x', repo: 'y', number: '1' } 
    });
    expect(parsed.success).toBe(false);
  });
});

describe('RateLimiter', () => {
  it('allows requests under configured limits', () => {
    const limiter = new RateLimiter({ 
      maxRequestsPerMinute: 2, 
      maxTokensPerMinute: 1000, 
      maxConcurrent: 1 
    });
    expect(limiter.canProceed(100)).toBe(true);
  });
});

describe('CodeReviewOrchestrator Integration', () => {
  it.skip('should review a real small PR', async () => {
    // Skipped so live GitHub/Claude credentials are not required for normal CI runs
  });
});
