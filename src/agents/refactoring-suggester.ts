import { AgentDefinition } from '@anthropic-ai/claude-agent-sdk';
import { refactoringSuggesterPrompt } from '../prompts/index.js';

export const refactoringSuggester: AgentDefinition = {
  description: 'Finds refactoring opportunities and invokes architecture or TypeScript skills when useful.',
  model: 'inherit',
  tools: ['Read', 'Skill'],
  prompt: refactoringSuggesterPrompt
};
