/**
 * Chat Conversation Type Definitions
 * 
 * Extensible types for chat conversations
 * Can be reused across all chatbot implementations (restaurants, real estate, medical, etc.)
 */

// ============================================
// AI MODELS
// ============================================
export type AIModel = 
  | 'gpt-4'
  | 'gpt-4-turbo'
  | 'gpt-3.5-turbo'
  | 'claude-sonnet-4'
  | 'claude-opus-4'
  | 'claude-haiku-4';

// ============================================
// MESSAGE INTENT (for routing and analytics)
// ============================================
export type MessageIntent = 
  | 'greeting'
  | 'menu_inquiry'
  | 'reservation'
  | 'hours'
  | 'location'
  | 'parking'
  | 'dietary'
  | 'cancel_reservation'
  | 'modify_reservation'
  | 'other'
  | 'unknown';

// ============================================
// CHAT MESSAGE
// ============================================
export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
}

// ============================================
// CHAT CONVERSATION (Database Record)
// ============================================
export interface ChatConversation {
  id: string;
  restaurant_id: string;
  session_id: string | null;
  
  // Message Content
  user_message: string;
  bot_response: string;
  
  // AI Model Used
  model_used: AIModel | null;
  
  // Intent Classification
  intent: MessageIntent | null;
  
  // Metadata
  created_at: string;
}

// ============================================
// CHAT SESSION (for maintaining context)
// ============================================
export interface ChatSession {
  session_id: string;
  restaurant_id: string;
  messages: ChatMessage[];
  started_at: string;
  last_message_at: string;
}

// ============================================
// CHAT REQUEST (API input)
// ============================================
export interface ChatRequest {
  restaurant_id: string;
  message: string;
  session_id?: string;
  context?: {
    // Additional context for the chatbot
    guest_name?: string;
    guest_phone?: string;
    reservation_id?: string;
  };
}

// ============================================
// CHAT RESPONSE (API output)
// ============================================
export interface ChatResponse {
  message: string;
  session_id: string;
  intent?: MessageIntent;
  model_used?: AIModel;
  suggestions?: string[]; // Quick reply suggestions
  metadata?: {
    // Additional data based on intent
    menu_items?: any[];
    reservation?: any;
    availability?: any;
  };
}

// ============================================
// AI ROUTING DECISION
// ============================================
export interface AIRoutingDecision {
  model: AIModel;
  reason: 'simple' | 'complex' | 'fallback';
  confidence?: number;
}

// ============================================
// CHAT ANALYTICS
// ============================================
export interface ChatAnalytics {
  total_conversations: number;
  by_intent: Record<MessageIntent, number>;
  by_model: Record<AIModel, number>;
  average_response_time?: number;
  cost_estimate?: number;
}

// ============================================
// INTENT DETECTION RESULT
// ============================================
export interface IntentDetectionResult {
  intent: MessageIntent;
  confidence: number;
  entities?: Record<string, any>; // Extracted entities (date, time, party size, etc.)
}