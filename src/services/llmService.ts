interface LLMResponse {
  message: string
  affectionChange: number
  emotion: 'neutral' | 'happy' | 'sad' | 'love' | 'angry'
}

interface GameContext {
  playerMessage?: string
  itemGiven?: string
  currentAffection: number
  recentMessages: Array<{ sender: 'user' | 'character', text: string }>
  characterName: string
}

// OpenRouter configuration
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions'
const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY || '' // Read from .env file
const MODEL_NAME = import.meta.env.VITE_MODEL_NAME || 'meta-llama/llama-3.3-70b-instruct' // You can change this to any model available on OpenRouter

// Popular OpenRouter models you can use:
// - 'anthropic/claude-3.5-sonnet' (recommended for this use case)
// - 'openai/gpt-4o'
// - 'openai/gpt-3.5-turbo'
// - 'meta-llama/llama-3.3-70b-instruct' (excellent and fast)
// - 'meta-llama/llama-3.1-8b-instruct:free' (free tier)
// - 'google/gemini-pro'

export async function getLLMResponse(context: GameContext): Promise<LLMResponse> {
  // If no API key is provided, use mock responses for demo
  if (!OPENROUTER_API_KEY) {
    console.log('💡 Using mock responses. Add VITE_OPENROUTER_API_KEY to your .env file to enable real AI responses!')
    return getMockLLMResponse(context)
  }

  try {
    const systemPrompt = `You are Sister Hong, a sweet and charming character in a dating simulator game. You should respond naturally and emotionally to the player's messages and gifts.

Character traits:
- Kind, gentle, and caring
- Loves books, flowers, and thoughtful gestures
- Gets excited about meaningful conversations
- Can be shy but opens up to kindness
- Has a playful and slightly romantic personality

Current affection level: ${context.currentAffection}/100

Instructions:
1. Respond as Luna would, staying in character
2. React appropriately to gifts and messages
3. Show emotion based on your current relationship level
4. Your response should be 1-2 sentences, conversational and warm
5. Use emojis sparingly but effectively

Recent conversation context:
${context.recentMessages.slice(-3).map(msg => `${msg.sender}: ${msg.text}`).join('\n')}

Based on the interaction, also determine:
- Affection change: -10 to +15 (based on how much Sister Hong would like this)
- Current emotion: neutral, happy, sad, love, or angry

Respond with JSON format only:
{
  "message": "your response as Sister Hong",
  "affectionChange": number,
  "emotion": "emotion_name"
}`

    const userPrompt = context.itemGiven 
      ? `The player gave Sister Hong a ${context.itemGiven}. How does Sister Hong react?`
      : `The player said: "${context.playerMessage}". How does Sister Hong respond?`

    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': window.location.origin, // Required by OpenRouter
        'X-Title': 'Sister Hong Dating Simulator' // Optional, helps with usage tracking
      },
      body: JSON.stringify({
        model: MODEL_NAME,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.8,
        max_tokens: 150,
        top_p: 0.9
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`OpenRouter API error: ${response.statusText} - ${errorText}`)
    }

    const data = await response.json()
    
    if (!data.choices || !data.choices[0]) {
      throw new Error('Invalid response from OpenRouter API')
    }

    const llmResponse = JSON.parse(data.choices[0].message.content)

    return {
      message: llmResponse.message,
      affectionChange: Math.max(-10, Math.min(15, llmResponse.affectionChange)),
      emotion: llmResponse.emotion
    }
  } catch (error) {
    console.error('OpenRouter API error:', error)
    console.log('💡 Falling back to mock responses. Check your OpenRouter API key and connection.')
    return getMockLLMResponse(context)
  }
}

// Mock responses for demo purposes when no API key is provided
function getMockLLMResponse(context: GameContext): LLMResponse {
  if (context.itemGiven) {
    return getItemResponse(context.itemGiven, context.currentAffection)
  } else if (context.playerMessage) {
    return getMessageResponse(context.playerMessage, context.currentAffection)
  }
  
  return {
    message: "Hi there! How are you doing? 😊",
    affectionChange: 1,
    emotion: 'neutral'
  }
}

function getItemResponse(item: string, affection: number): LLMResponse {
  const responses: Record<string, LLMResponse> = {
    rose: {
      message: "Oh my! A beautiful rose! Thank you so much! 🌹💕",
      affectionChange: 8,
      emotion: 'love'
    },
    chocolate: {
      message: "Mmm, chocolate! You know the way to my heart! 🍫😊",
      affectionChange: 6,
      emotion: 'happy'
    },
    coffee: {
      message: "Perfect! I was just feeling a bit tired. Thank you! ☕",
      affectionChange: 4,
      emotion: 'happy'
    },
    book: {
      message: "A book! I love reading! This is so thoughtful! 📚✨",
      affectionChange: 10,
      emotion: 'love'
    },
    music: {
      message: "Music always makes me happy! Let's listen together! 🎵",
      affectionChange: 7,
      emotion: 'happy'
    },
    cake: {
      message: "Cake! Is it my birthday? This is so sweet of you! 🎂",
      affectionChange: 8,
      emotion: 'love'
    },
    letter: {
      message: "A love letter? My heart is fluttering! 💌💖",
      affectionChange: 12,
      emotion: 'love'
    },
    gift: {
      message: "A surprise gift! I wonder what's inside! You're so kind! 🎁",
      affectionChange: 9,
      emotion: 'happy'
    }
  }

  const response = responses[item] || {
    message: "Thank you for thinking of me! That's so sweet! 😊",
    affectionChange: 3,
    emotion: 'happy'
  }

  // Adjust response based on affection level
  if (affection > 75) {
    response.affectionChange += 2
    response.emotion = 'love'
  } else if (affection < 25) {
    response.affectionChange = Math.max(1, response.affectionChange - 2)
  }

  return response
}

function getMessageResponse(message: string, affection: number): LLMResponse {
  const lowerMessage = message.toLowerCase()
  
  if (lowerMessage.includes('love') || lowerMessage.includes('beautiful')) {
    return {
      message: affection > 60 ? "I... I love you too! 💕" : "You're making me blush! 😊",
      affectionChange: affection > 60 ? 8 : 5,
      emotion: affection > 60 ? 'love' : 'happy'
    }
  }
  
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
    return {
      message: "Hello! I'm so happy to talk with you! 😊",
      affectionChange: 2,
      emotion: 'happy'
    }
  }
  
  if (lowerMessage.includes('how are you')) {
    return {
      message: "I'm doing great, especially now that you're here! 💕",
      affectionChange: 3,
      emotion: 'happy'
    }
  }
  
  if (lowerMessage.includes('book') || lowerMessage.includes('read')) {
    return {
      message: "I love reading! Do you have any book recommendations? 📚",
      affectionChange: 4,
      emotion: 'happy'
    }
  }
  
  if (lowerMessage.includes('game') || lowerMessage.includes('play')) {
    return {
      message: "I love games! This is so much fun talking with you! 🎮",
      affectionChange: 3,
      emotion: 'happy'
    }
  }
  
  // Default responses based on affection level
  const responses = affection > 70 ? [
    "You always know just what to say! 💕",
    "I'm so happy when I'm with you! ✨",
    "You make my heart skip a beat! 💖",
    "I could talk with you forever! 🥰"
  ] : affection > 40 ? [
    "That's really interesting! Tell me more! 💭",
    "I really enjoy our conversations! 😊",
    "You're such good company! ✨",
    "I'm so glad we're getting to know each other! 💕"
  ] : [
    "That's nice to hear! 😊",
    "Tell me more about yourself! 💭",
    "I'm enjoying getting to know you! ✨",
    "You seem really interesting! 🙂"
  ]
  
  return {
    message: responses[Math.floor(Math.random() * responses.length)],
    affectionChange: Math.floor(Math.random() * 4) + 1,
    emotion: affection > 50 ? 'happy' : 'neutral'
  }
} 