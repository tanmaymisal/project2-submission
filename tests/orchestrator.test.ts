import { describe, it, expect } from 'vitest';
import { ReviewReportSchema, CodeQualityResultSchema } from '../src/types/index.js';
import { RateLimiter } from '../src/utils/rate-limiter.js';
import { withTimeout } from '../src/utils/index.js';

describe('Schemas', () => {
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

  describe('CodeQualityResultSchema', () => {
    it('accepts valid code quality data', () => {
      const parsed = CodeQualityResultSchema.safeParse({
        file: 'src/main.ts',
        score: 90,
        issues: []
      });
      expect(parsed).toBeDefined();
    });

    it('rejects completely invalid data', () => {
      const parsed = CodeQualityResultSchema.safeParse({
        file: 123, 
        score: 'ninety' 
      });
      expect(parsed.success).toBe(false);
    });
  });
});

describe('Utilities', () => {
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

  describe('withTimeout', () => {
    it('resolves if the function completes before the timeout', async () => {
      const result = await withTimeout(async () => 'success', 1000, 'timeout error');
      expect(result).toBe('success');
    });

    it('rejects if the function takes too long', async () => {
      const slowFunction = async () => new Promise(resolve => setTimeout(resolve, 50));
      await expect(withTimeout(slowFunction, 10, 'timeout error')).rejects.toThrow('timeout error');
    });
  });
});

describe('CodeReviewOrchestrator Integration', () => {
  it.skip('should review a real small PR', async () => {
    // Skipped so live GitHub/Claude credentials are not required for normal CI runs
  });
});
