import { AgentDefinition } from '@anthropic-ai/claude-agent-sdk';
import { codeQualityAnalyzerPrompt } from '../prompts/index.js';
export const codeQualityAnalyzer: AgentDefinition = {
  description: 'Analyzes code for security vulnerabilities, performance issues, and maintainability concerns. Can use Claude Skills for specialized code analysis.',
  model: 'inherit',
  tools: ['Read', 'Skill'],
  prompt: codeQualityAnalyzerPrompt
};