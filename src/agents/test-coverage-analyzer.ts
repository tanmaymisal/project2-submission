import { AgentDefinition } from '@anthropic-ai/claude-agent-sdk';
import { testCoverageAnalyzerPrompt } from '../prompts/index.js';

export const testCoverageAnalyzer: AgentDefinition = {
  description: 'Evaluates test completeness, identifies functions without test coverage, and suggests specific test cases with meaningful assertions.',
  model: 'inherit',
  tools: ['Read'],
  prompt: testCoverageAnalyzerPrompt
};