export interface AssistantCitation {
  sourceName: string;
  sourceUrl?: string;
  publication: string;
  evidenceGrade?: string;
}

export interface AssistantMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  citations?: AssistantCitation[];
  isEmergencyAlert?: boolean;
}

export interface SuggestedPrompt {
  id: string;
  label: string;
  category: 'diabetes' | 'cardiac' | 'medication' | 'lifestyle';
  prompt: string;
}
