import { query } from '@anthropic-ai/claude-agent-sdk';
import zodToJsonSchema from 'zod-to-json-schema';
import { ReviewReport, ReviewReportSchema } from './types/index.js';
import { codeQualityAnalyzer, testCoverageAnalyzer, refactoringSuggester } from './agents/index.js';
import { buildOrchestratorPrompt } from './prompts/index.js';
import { mcpServersConfig } from './config/mcp.config.js';
import { withRetry, withTimeout } from './utils/index.js';

export interface OrchestratorOptions {}

export class CodeReviewOrchestrator {
  constructor(options: OrchestratorOptions = {}) {}

  async reviewPullRequest(
    owner: string,
    repo: string,
    prNumber: number
  ): Promise<ReviewReport> {
    
    const model = process.env.ANTHROPIC_MODEL;
    if (!model) {
      throw new Error('ANTHROPIC_MODEL environment variable is required');
    }

    console.log(`Starting multi-agent review for ${owner}/${repo}#${prNumber}...`);

    // FIX 1: Cast to any to prevent deeply nested Zod instantiation errors
    const schema = zodToJsonSchema(ReviewReportSchema as any, {
      $refStrategy: 'root'
    });

    const prompt = buildOrchestratorPrompt(owner, repo, prNumber);

    // Wrap the query execution flow with retry and timeout mechanisms
    return await withRetry(async () => {
      return await withTimeout(async () => {
        const result = query({
          prompt,
          options: {
            agents: {
              'code-quality-analyzer': codeQualityAnalyzer,
              'test-coverage-analyzer': testCoverageAnalyzer,
              'refactoring-suggester': refactoringSuggester
            },
            model,
            maxTurns: 80, // <-- Bumped to 80 to handle real file reading
            allowedTools: [
              'Task',
              'mcp__github__get_pull_request',
              'mcp__github__get_pull_request_files',
              'mcp__github__get_file_contents',
              'mcp__eslint__lint'
            ],
            mcpServers: mcpServersConfig,
            outputFormat: {
              type: 'json_schema',
              schema: schema as Record<string, unknown>
            }
          }
        });

        for await (const message of result) {
          if (message.type === 'result') {
            // Log if it halts for a specific reason (like hitting the turn limit)
            if (message.subtype !== 'success') {
              console.error(`\n⚠️ Agent execution halted. Reason: ${message.subtype}`);
            }
            
            if (message.subtype === 'success' && message.structured_output) {
              const parsed = ReviewReportSchema.safeParse(message.structured_output);
              
              if (parsed.success) {
                console.log('Analysis completed successfully!');
                return parsed.data;
              } else {
                throw new Error(`Output validation failed: ${parsed.error.message}`);
              }
            }
          }
        }

        throw new Error('Analysis completed without generating a structured report.');
      }, 120000, 'Agent execution timed out after 2 minutes');
    });
  }
}
