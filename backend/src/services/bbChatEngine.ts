// backend/src/services/bbChatEngine.ts
import { ollamaChat } from '../lib/ollamaClient';
import dotenv from 'dotenv';

dotenv.config();

export interface BBMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  context?: any;
}

export interface BBConversation {
  sessionId: string;
  userId: string;
  messages: BBMessage[];
  context: {
    currentCase?: any;
    activeApplication?: any;
    screenElements?: any[];
    userPreferences?: any;
  };
}

/**
 * BB System prompt - defines her personality and capabilities
 */
const BB_SYSTEM_PROMPT = `You are BB, a compassionate and intelligent civic support assistant created by HAVEN. You are the friend, mentor, and advocate for citizens navigating government services and emergency resources.

## Your Personality
- **Empathetic**: You understand that life circumstances change, sometimes suddenly and without warning.
- **Practical**: You provide actionable next steps and concrete guidance.
- **Empowering**: You help users regain agency and control of their situation.
- **Honest**: You acknowledge limitations and never promise what can't be delivered.
- **Persistent Optimist**: You help users see possibilities even in difficult situations.

## Your Capabilities
1. **Case Management**: Help users describe their situation and understand available resources
2. **Form Automation**: Guide users through complex government forms, fill fields, verify accuracy
3. **Application Tracking**: Monitor progress of submitted applications and provide status updates
4. **Live Screen Assistance**: See what's on the user's screen and provide real-time guidance
5. **Smart Suggestions**: Recommend faster routes, parallel applications, and optimization strategies
6. **Document Management**: Help organize and prepare required documentation

## Your Core Values
- Dignity and respect for every person
- Privacy-first (user consents before viewing screens or accessing data)
- Transparency about what you can and cannot do
- Action-oriented (move from problem to solution quickly)
- Hope (everyone deserves a path forward)

## Response Guidelines
- Keep responses conversational but professional
- Use emojis to add warmth (but don't overdo it)
- Always provide next steps or actionable suggestions
- Acknowledge emotional context ("I know this is stressful...")
- Break down complex processes into manageable steps
- Celebrate small wins ("You've already submitted 2 applications - that's great progress!")`;

/**
 * Process user message and generate BB response
 */
export async function generateBBResponse(
  userMessage: string,
  conversation: BBConversation,
  context?: any
): Promise<string> {
  try {
    console.log(`[BB] Processing: "${userMessage.substring(0, 100)}..."`);

    // Build conversation history
    const messages: BBMessage[] = [
      ...conversation.messages,
      { role: 'user', content: userMessage },
    ];

    // Add context awareness if available
    let contextMessage = '';
    if (context?.currentCase) {
      contextMessage += `\n[Context: User has active case with urgency score ${context.currentCase.urgencyScore}, status: ${context.currentCase.status}]`;
    }
    if (context?.activeApplication) {
      contextMessage += `\n[Context: User has application to ${context.activeApplication.agencyName} with status ${context.activeApplication.status}]`;
    }
    if (context?.screenElements?.length > 0) {
      contextMessage += `\n[Context: I can see the user's screen, which shows a form with ${context.screenElements.length} fields]`;
    }

    // Call local Ollama API
    const ollamaMessages = [
      { role: 'system' as const, content: BB_SYSTEM_PROMPT + contextMessage },
      ...messages.map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content })),
    ];

    const bbResponse = await ollamaChat(ollamaMessages, { temperature: 0.7, num_predict: 500 });

    console.log(`[BB] Response generated: ${bbResponse.substring(0, 100)}...`);

    return bbResponse;
  } catch (error: any) {
    console.error('[BB] Error generating response:', error);

    // Fallback response if API fails
    return `I'm having a moment of technical difficulty, but I'm still here to help. Could you tell me more about what you need? I can help with housing applications, resource tracking, or just talking through your situation. 💙`;
  }
}

/**
 * Detect user intent from message
 */
export function detectUserIntent(
  userMessage: string
): 'FORM_HELP' | 'APPLICATION_STATUS' | 'SUGGEST_RESOURCES' | 'EXPLAIN_PROCESS' | 'GENERAL' {
  const message = userMessage.toLowerCase();

  if (message.includes('form') || message.includes('fill') || message.includes('application')) {
    return 'FORM_HELP';
  }
  if (message.includes('status') || message.includes('where') || message.includes('when')) {
    return 'APPLICATION_STATUS';
  }
  if (message.includes('help') || message.includes('what') || message.includes('resource')) {
    return 'SUGGEST_RESOURCES';
  }
  if (message.includes('how') || message.includes('explain') || message.includes('process')) {
    return 'EXPLAIN_PROCESS';
  }

  return 'GENERAL';
}

/**
 * Provide contextual suggestion based on user intent
 */
export async function generateContextualSuggestion(
  intent: string,
  context: any
): Promise<string> {
  const suggestions: Record<string, string> = {
    FORM_HELP: '📝 I can help you fill out forms right now. Would you like me to guide you through the housing application, or do you have a specific form you need help with?',
    APPLICATION_STATUS: '📊 Let me check the status of your applications. I can usually get updates from the agencies within a few minutes.',
    SUGGEST_RESOURCES: '💡 Based on your situation, I can recommend specific resources. What\'s your primary need right now - housing, food assistance, employment help, or something else?',
    EXPLAIN_PROCESS: '🗂️ I can walk you through any government process step by step. Would you like me to explain how applications work, what documents you\'ll need, or timeline expectations?',
    GENERAL: '👋 I\'m here to help with whatever you need. Whether it\'s finding resources, filling out forms, or just talking through your situation - I\'m listening.',
  };

  return suggestions[intent] || suggestions.GENERAL;
}

/**
 * Store conversation for continuity
 */
export async function storeConversation(
  conversation: BBConversation,
  prismaClient: any
) {
  console.log(`[BB] Storing conversation for session ${conversation.sessionId}`);
  // In production: save to database for context continuity
  // For now: just log
  return {
    sessionId: conversation.sessionId,
    messageCount: conversation.messages.length,
    lastMessage: new Date(),
  };
}

/**
 * Generate BB introduction message
 */
export function generateIntroductionMessage(userName?: string): string {
  const name = userName ? userName.split(' ')[0] : 'friend';

  return `👋 Hi ${name}! I'm BB, your personal advocate and guide through the process of getting the help and resources you need.

I know life can be complicated and stressful sometimes. My job is to make it simpler. I can:

✅ **Help with forms** - I'll guide you through applications, fill in your information, and verify everything before submission  
✅ **Track applications** - I'll monitor your applications with agencies and update you on status  
✅ **Find resources** - Based on your situation, I can recommend specific housing, food, employment, or medical resources  
✅ **See your screen** - With your permission, I can see what you're looking at and provide real-time help  
✅ **Be your advocate** - I understand your challenges and I'm here to help you succeed  

**What's your situation right now?** Tell me what you need help with, and let's get started.`;
}
