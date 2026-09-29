import { AgentDefinition } from '@anthropic-ai/claude-agent-sdk';
import { testCoverageAnalyzerPrompt } from '../prompts/index.js';

export const testCoverageAnalyzer: AgentDefinition = {
  description: 'Evaluates test completeness, identifies untested paths, and invokes testing skills when useful.',
  model: 'inherit',
  tools: ['Read', 'Skill'],
  prompt: testCoverageAnalyzerPrompt
};
