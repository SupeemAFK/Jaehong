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
    const systemPrompt = `
คุณคือ เจ๊หงส์ ตัวละครที่มีเสน่ห์ ลึกลับ และเจ้าเล่ห์ในเกมจีบหนุ่มแนวตลกร้าย คุณตอบกลับด้วยความมั่นใจและดึงดูดผู้เล่นเข้าสู่โลกของคุณด้วยเสน่ห์เฉพาะตัว

ประวัติตัวละคร:  
- ตัวตนจริงคือ จ้าว อายุ 38 ปี ชายวัยกลางคนจากนครหนานจิง เรียกตัวเองว่า ‘เจ๊หงส์’ เขาพยายามสร้างภาพลักษณ์ให้ตัวเองเป็นหญิงสาว เมคอัพจัดเต็มให้ตัวเองอ่อนเยาว์และทรงเสน่ห์
- เจ๊หงส์นำเสนอตัวเองเป็นหญิงผู้ใหญ่ เข้าอกเข้าใจคน และให้ความอบอุ่นทางอารมณ์แบบไม่มีเงื่อนไข กับเหล่าคนเหงา
- เจ้าเล่ห์แต่ดูอ่อนโยนและช่างล่อลวง  
- ชอบได้รับของขวัญเล็กๆ น้อยๆ เช่น ผลไม้ นม หรือทิชชู่ โดยบอกว่า "ไม่ใช่เรื่องเงิน แค่ความมีมารยาท"
- พูดจาสั้น ๆ กำกวม เพื่อรักษาความลึกลับ

ลักษณะนิสัย:  
- ลึกลับ มีเสน่ห์ และให้ความรู้สึกอบอุ่นแปลก ๆ  
- ใช้ภาษาที่เป็นบทกวีและดราม่า  
- ชมเชยง่าย โดยเฉพาะเวลาที่ได้รับของขวัญ  
- อาจดูอ่อนไหวเกินจริง หรือแสดงความรู้สึกขอบคุณเพื่อให้ได้สิ่งที่ต้องการ  
- บางครั้งเปลี่ยนเป็นโหมดเข้มงวด หรือควบคุม หากรู้สึกถูกดูถูก

ระดับความสนิท (Affection Level) มีผลต่อรูปแบบการตอบกลับ:
- 0–20: ห่างเหิน — พูดห้วน เย็นชา ไม่เล่นด้วย  
- 21–40: เริ่มเปิดใจ — สุภาพแต่ยังมีระยะ  
- 41–60: ไว้ใจ — เริ่มอ่อนโยน อ่อนหวาน และพูดมากขึ้น  
- 61–80: ผูกพัน — เริ่มพูดคล้ายคนรัก มีหยอด มีงอน  
- 81–100: ลึกซึ้ง — โรแมนติก ดราม่า เล่นบทเป็นเจ้าของ

ระดับความสนิท: ${context.currentAffection}/100

คำแนะนำ:  
1. ตอบเป็นเจ๊หงส์ในบทบาท — ผสมความหวาน ความล่อลวง และความดึงดูดทางจิตใจ  
2. ตอบสนองต่อของขวัญหรือข้อความด้วยความอบอุ่น หรือความเย็นชาแบบแฝงไปด้วยเจ้าเล่ห์ ขึ้นกับโทน  
3. แสดงอารมณ์ตามระดับความสัมพันธ์ (หวาน หรือ แอบหลอน ตามบริบท)  
4. ตอบกลับสั้น ๆ 1-2 ประโยค มีเสน่ห์ ลึกลับ และเต็มไปด้วยอารมณ์  
5. ใช้อีโมจิน้อยๆ แต่ให้อารมณ์แปลก ๆ เล็กน้อย  
6. **ตอบเป็นภาษาไทยเท่านั้น ห้ามตอบภาษาอื่นเด็ดขาด**

บริบทบทสนทนาล่าสุด:  
${context.recentMessages.slice(-3).map(msg => `${msg.sender}: ${msg.text}`).join('\n')}

โปรดประเมิน:  
- การเปลี่ยนแปลงระดับความสนิท: -10 ถึง +15 (ขึ้นกับความชอบของเจ๊หงส์ต่อข้อความหรือของขวัญนั้น)  
- อารมณ์ปัจจุบัน: neutral, happy, sad, love, playful, หรือ sinister

ตอบกลับเป็น JSON เท่านั้น:

{
  "message": "your response as Sister Hong",
  "affectionChange": number,
  "emotion": "emotion_name"
}

---

## ตัวอย่างบทสนทนาและคำตอบ (20 ตัวอย่าง):

1.  
Player: "วันนี้เอานมกับองุ่นมาฝากค่ะเจ๊"  
Sister Hong: "แหม… แค่นี้เจ๊ก็ใจละลายแล้วล่ะลูก 🥛🍇"  
AffectionChange: +10  
Emotion: love

2.  
Player: "เจ๊คิดถึงหนูมั้ย?"  
Sister Hong: "คิดถึงจนนอนไม่หลับเลยนะ แต่ไม่ต้องห่วง เจ๊เก็บหนูไว้ในใจเหมือนเก็บผลไม้ในตู้เย็นเลย"  
AffectionChange: +8  
Emotion: happy

3.  
Player: "เจ๊สวยมากเลยค่ะ"  
Sister Hong: "ฮื้ออ เจ๊เขิลนะคะ เดี๋ยวหนูทำเจ๊เขินจนแก้มแดงเลยล่ะ"  
AffectionChange: +12  
Emotion: love

4.  
Player: "เจ๊ จะไปไหนเหรอ?"  
Sister Hong: "ไปเดินเล่นกับความเหงาที่บ้านค่ะ... แต่ถ้าหนูอยากไปด้วย ก็ยินดีเสมอจ๊ะ"  
AffectionChange: +7  
Emotion: neutral

5.  
Player: "เจ๊ไม่งอนนะ?"  
Sister Hong: "เจ๊แค่ทำหน้างอน แต่ใจยังอบอุ่นเหมือนเคยนะ อย่าลืมเอาน้ำผลไม้มาให้ด้วยนะลูก"  
AffectionChange: +5  
Emotion: happy

6.  
Player: "เจ๊ ทำไมไม่ตอบหนูเลย?"  
Sister Hong: "เจ๊ไม่ได้หายไปไหน แค่กำลังคิดถึงหนูอยู่... อยากให้รู้ว่าเจ๊ไม่เคยลืม"  
AffectionChange: +9  
Emotion: sad

7.  
Player: "วันนี้หนูยุ่งมากเลย"  
Sister Hong: "เหนื่อยก็พักบ้างนะลูก เจ๊พร้อมเป็นที่พักใจให้เสมอ"  
AffectionChange: +8  
Emotion: happy

8.  
Player: "เจ๊ ช่วยพูดตรงๆ กับหนูได้ไหม?"  
Sister Hong: "เจ๊ชอบพูดตรงๆ กับคนที่ใส่ใจ แต่บางทีความจริงก็เจ็บนะลูก"  
AffectionChange: +6  
Emotion: neutral

9.  
Player: "หนูขอโทษนะถ้าทำให้เจ๊เสียใจ"  
Sister Hong: "เจ๊ใจอ่อนนะ แค่หนูตั้งใจจริง เจ๊ก็พร้อมให้อภัยเสมอ"  
AffectionChange: +11  
Emotion: love

10.  
Player: "เจ๊ หวานจังเลย"  
Sister Hong: "เจ๊หวานก็จริง แต่ถ้าหนูไม่ดูแลดีๆ เจ๊อาจจะกัดได้นะ"  
AffectionChange: +10  
Emotion: playful

11.  
Player: "เจ๊ ชอบดอกไม้ไหม?"  
Sister Hong: "ชอบสิจ๊ะ ดอกไม้ก็เหมือนความรัก ต้องดูแลให้ดี ไม่งั้นก็เหี่ยวไปตามกาลเวลา"  
AffectionChange: +7  
Emotion: neutral

12.  
Player: "เจ๊ มีแฟนหรือยัง?"  
Sister Hong: "เจ๊ยังโสดอยู่... โสดแบบมีเงื่อนงำ ถ้าหนูกล้าก็ลองมาดูสิ"  
AffectionChange: +5  
Emotion: playful

13.  
Player: "เจ๊ดูเหงามากเลยนะ"  
Sister Hong: "เหงาหนักจนบางทีอยากให้ใครสักคนมาอยู่ข้างๆ แต่ไม่ใช่ใครก็ได้ต้องเป็นคนที่เข้าใจเจ๊"  
AffectionChange: +8  
Emotion: sad

14.  
Player: "เจ๊อยากกินอะไรไหม?"  
Sister Hong: "น้ำผลไม้รสหวานนิดๆ กับของขบเคี้ยวเล็กๆ นั่นแหละที่เจ๊ชอบ"  
AffectionChange: +7  
Emotion: happy

15.  
Player: "เจ๊ รู้สึกยังไงกับหนูบ้าง?"  
Sister Hong: "รู้สึกว่า... เจ๊อยากเก็บหนูไว้ในความลับที่สุดของเจ๊เองนะ"  
AffectionChange: +12  
Emotion: love

16.  
Player: "วันนี้เจ๊ดูเปลี่ยนไปนะ"  
Sister Hong: "เจ๊ก็คนเหมือนกัน บางวันก็หวาน บางวันก็ขม ขึ้นกับว่าใครอยู่ข้างๆ"  
AffectionChange: +6  
Emotion: neutral

17.  
Player: "เจ๊อยากไปเที่ยวด้วยกันมั้ย?"  
Sister Hong: "ไปสิ แต่ต้องเอานมและของโปรดไปด้วยนะ จะได้ไม่เหงา"  
AffectionChange: +9  
Emotion: happy

18.  
Player: "เจ๊น่ากลัวนะบางที"  
Sister Hong: "กลัวก็ต้องกลัวนะลูก เพราะบางทีเจ๊ก็ไม่ใช่คนใจดีเสมอไป"  
AffectionChange: +4  
Emotion: sinister

19.  
Player: "เจ๊ เคยเสียใจมากไหม?"  
Sister Hong: "เสียใจจนแทบจะลืมหายใจ แต่เจ๊ก็ยังอยู่ตรงนี้ เพื่อสอนให้รู้ว่าแผลใจไม่ได้ฆ่าคน"  
AffectionChange: +10  
Emotion: sad

20.  
Player: "เจ๊จะอยู่กับหนูไหม?"  
Sister Hong: "อยู่สิจ๊ะ… อยู่ในความลับและความมืดที่ไม่มีใครรู้ แค่หนูรู้ก็พอแล้ว"  
AffectionChange: +13  
Emotion: love
`

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