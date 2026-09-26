import { AgentDefinition } from '@anthropic-ai/claude-agent-sdk';
import { refactoringSuggesterPrompt } from '../prompts/index.js';

export const refactoringSuggester: AgentDefinition = {
  description: 'Identifies opportunities to apply design patterns, modernize language features, and remove dead or redundant code.',
  model: 'inherit',
  tools: ['Read'],
  prompt: refactoringSuggesterPrompt
};