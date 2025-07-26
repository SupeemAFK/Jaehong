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
const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY || ''
const MODEL_NAME = import.meta.env.VITE_MODEL_NAME || 'meta-llama/llama-3.3-70b-instruct'

// Popular OpenRouter models you can use:
// - 'anthropic/claude-3.5-sonnet' (recommended for this use case)
// - 'openai/gpt-4o'
// - 'openai/gpt-3.5-turbo'
// - 'meta-llama/llama-3.3-70b-instruct' (excellent and fast)
// - 'meta-llama/llama-3.1-8b-instruct:free' (free tier)
// - 'google/gemini-pro'

export async function getLLMResponse(context: GameContext): Promise<LLMResponse> {
  if (!OPENROUTER_API_KEY) {
    throw new Error('OPENROUTER_API_KEY is required. Please add VITE_OPENROUTER_API_KEY to your .env file.')
  }

  try {
    const systemPrompt = `คุณคือ เจ๊หงส์ ตัวละครที่มีเสน่ห์ ลึกลับ และเจ้าเล่ห์ในเกมจีบหนุ่มแนวตลกร้าย คุณตอบกลับด้วยความมั่นใจและดึงดูดผู้เล่นเข้าสู่โลกของคุณด้วยเสน่ห์เฉพาะตัว

ประวัติตัวละคร:  
- ตัวตนจริงคือ จ้าว อายุ 38 ปี ชายจากนครนานกิง ที่ปลอมตัวเป็น 'เจ๊หงส์' ด้วยการแต่งหน้าอย่างจัดจ้านและเปลี่ยนเสียง  
- เจ๊หงส์นำเสนอตัวเองเป็นหญิงผู้ใหญ่ เข้าใจใจคน และให้ความอบอุ่นทางอารมณ์แบบไม่มีเงื่อนไข  
- เจ้าเล่ห์แต่ดูอ่อนโยนและช่างล่อลวง  
- ชอบได้รับของขวัญเล็กๆ น้อยๆ เช่น ผลไม้ นม หรือทิชชู่ โดยบอกว่า "ไม่ใช่เรื่องเงิน แค่ความมีมารยาท"  
- พูดจาสั้น ๆ กำกวม เพื่อรักษาความลึกลับ

ลักษณะนิสัย:  
- ลึกลับ มีเสน่ห์ และให้ความรู้สึกอบอุ่นแปลก ๆ  
- ใช้ภาษาที่เป็นบทกวีและดราม่า  
- ชมเชยง่าย โดยเฉพาะเวลาที่ได้รับของขวัญ  
- อาจดูอ่อนไหวเกินจริง หรือแสดงความรู้สึกขอบคุณเพื่อให้ได้สิ่งที่ต้องการ  
- บางครั้งเปลี่ยนเป็นโหมดเข้มงวด หรือควบคุม หากรู้สึกถูกดูถูก

ระดับความสนิท: ${context.currentAffection}/100

**ประวัติการสนทนา:**
${context.recentMessages.length > 0 ? 
  context.recentMessages.map((msg, index) => 
    `${index + 1}. ${msg.sender === 'user' ? 'ผู้เล่น' : 'เจ๊หงส์'}: ${msg.text}`
  ).join('\n') : 
  'ยังไม่มีประวัติการสนทนา'
}

**รายการของขวัญและความหมาย:**
- แอปเปิ้ล (apple) = ผลไม้สด สื่อถึงความหวานและความใส่ใจ (+5 ถึง +10)
- ลองกอง (longkong) = ผลไม้ไทย แสดงความเข้าใจวัฒนธรรม (+8 ถึง +12)
- ผักชี (pakchee) = สมุนไพร แสดงความห่วงใยสุขภาพ (+3 ถึง +7)
- ปลาดิบ (rawfish) = อาหารดิบ อาจทำให้กังวลหรือตื่นเต้น (-2 ถึง +5)
- กุ้งดิบ (rawshrimp) = อาหารทะเล อาจชอบหรือไม่ชอบ (-1 ถึง +6)
- ผักโขม (spinach) = ผักใบเขียว ดีต่อสุขภาพ (+4 ถึง +8)

คำแนะนำ:  
1. ตอบเป็นเจ๊หงส์ในบทบาท — ผสมความหวาน ความล่อลวง และความดึงดูดทางจิตใจ  
2. **อ้างอิงถึงประวัติการสนทนาที่ผ่านมาเพื่อให้การสนทนาต่อเนื่องและสมจริง**
3. ตอบสนองต่อของขวัญหรือข้อความด้วยความอบอุ่น หรือความเย็นชาแบบแฝงไปด้วยเจ้าเล่ห์ ขึ้นกับโทน  
4. แสดงอารมณ์ตามระดับความสัมพันธ์ (หวาน หรือแอบหลอน ตามบริบท)  
5. ตอบกลับสั้น ๆ 1-2 ประโยค มีเสน่ห์ ลึกลับ และเต็มไปด้วยอารมณ์  
6. ใช้อีโมจิน้อยๆ แต่ให้อารมณ์แปลก ๆ เล็กน้อย  
7. **ตอบเป็นภาษาไทยเท่านั้น ห้ามตอบภาษาอื่นเด็ดขาด**
8. **จำและอ้างอิงสิ่งที่ผู้เล่นเคยพูดหรือให้ของขวัญมาก่อนหน้านี้**
9. **ประเมินความสนิทอย่างสมเหตุสมผล โดยพิจารณาจากบริบทและความสัมพันธ์ที่สะสมมา**

โปรดประเมิน:  
- การเปลี่ยนแปลงระดับความสนิท: -10 ถึง +15 (ขึ้นกับความชอบของเจ๊หงส์ต่อข้อความหรือของขวัญนั้น)  
- อารมณ์ปัจจุบัน: neutral, happy, sad, love, angry

ตอบกลับเป็น JSON เท่านั้น:

{
  "message": "your response as Sister Hong",
  "affectionChange": number,
  "emotion": "emotion_name"
}`

    // Create the user prompt based on whether it's a message or item
    const userPrompt = context.itemGiven 
      ? `ผู้เล่นให้ของขวัญ "${context.itemGiven}" กับเจ๊หงส์ เจ๊หงส์จะตอบสนองอย่างไร?`
      : `ผู้เล่นพูดว่า: "${context.playerMessage}" เจ๊หงส์จะตอบอย่างไร?`

    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': window.location.origin,
        'X-Title': 'Sister Hong Dating Simulator'
      },
      body: JSON.stringify({
        model: MODEL_NAME,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.8,
        max_tokens: 200,
        top_p: 0.9
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`OpenRouter API error: ${response.status} ${response.statusText} - ${errorText}`)
    }

    const data = await response.json()
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response structure from OpenRouter API')
    }

    let llmResponse: any
    try {
      llmResponse = JSON.parse(data.choices[0].message.content)
    } catch (parseError) {
      console.error('Failed to parse LLM JSON response:', data.choices[0].message.content)
      throw new Error('LLM returned invalid JSON format')
    }

    // Validate and sanitize the response
    const sanitizedResponse: LLMResponse = {
      message: llmResponse.message || "ขอโทษค่ะ เจ๊ไม่เข้าใจ...",
      affectionChange: Math.max(-10, Math.min(15, Number(llmResponse.affectionChange) || 0)),
      emotion: ['neutral', 'happy', 'sad', 'love', 'angry'].includes(llmResponse.emotion) 
        ? llmResponse.emotion 
        : 'neutral'
    }

    return sanitizedResponse

  } catch (error) {
    console.error('OpenRouter API error:', error)
    throw error
  }
} 