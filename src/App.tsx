import { useState } from 'react'
import { DndContext, type DragEndEvent } from '@dnd-kit/core'
import Sidebar from './components/Sidebar'
import Character from './components/Character'
import DialogueArea from './components/DialogueArea'
import AffectionPanel from './components/AffectionPanel'
import { getLLMResponse } from './services/llmService'

interface GameState {
  affectionScore: number
  messages: Array<{ sender: 'user' | 'character', text: string }>
  characterEmotion: 'neutral' | 'happy' | 'sad' | 'love' | 'angry'
  isProcessing: boolean
}

function App() {
  const [gameState, setGameState] = useState<GameState>({
    affectionScore: 50,
    messages: [
      { sender: 'character', text: 'สวัสดีค่ะ! ยินดีที่ได้รู้จักนะคะ! ฉันชื่อพี่สาวหงส์ 💕' }
    ],
    characterEmotion: 'neutral',
    isProcessing: false
  })

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    
    if (over && over.id === 'character') {
      const itemId = active.id as string
      console.log(`Gave ${itemId} to character`)
      await handleItemGiven(itemId)
    }
  }

  const handleItemGiven = async (itemId: string) => {
    setGameState(prev => ({ ...prev, isProcessing: true }))
    
    try {
      const response = await getLLMResponse({
        itemGiven: itemId,
        currentAffection: gameState.affectionScore,
        recentMessages: gameState.messages.slice(-5),
        characterName: 'พี่สาวหงส์'
      })

      setGameState(prev => ({
        ...prev,
        affectionScore: Math.max(0, Math.min(100, prev.affectionScore + response.affectionChange)),
        messages: [...prev.messages, { sender: 'character', text: response.message }],
        characterEmotion: response.emotion,
        isProcessing: false
      }))
    } catch (error) {
      console.error('Error getting LLM response:', error)
      // Fallback response
      setGameState(prev => ({
        ...prev,
        messages: [...prev.messages, { sender: 'character', text: `ขอบคุณสำหรับ ${itemId} นะคะ! 😊` }],
        affectionScore: Math.max(0, Math.min(100, prev.affectionScore + 3)),
        isProcessing: false
      }))
    }
  }

  const handleSendMessage = async (message: string) => {
    // Add user message immediately
    setGameState(prev => ({
      ...prev,
      messages: [...prev.messages, { sender: 'user', text: message }],
      isProcessing: true
    }))

    try {
             const response = await getLLMResponse({
         playerMessage: message,
         currentAffection: gameState.affectionScore,
         recentMessages: [...gameState.messages, { sender: 'user' as const, text: message }].slice(-5),
         characterName: 'พี่สาวหงส์'
       })

      setGameState(prev => ({
        ...prev,
        affectionScore: Math.max(0, Math.min(100, prev.affectionScore + response.affectionChange)),
        messages: [...prev.messages, { sender: 'character', text: response.message }],
        characterEmotion: response.emotion,
        isProcessing: false
      }))
    } catch (error) {
      console.error('Error getting LLM response:', error)
      // Fallback response
      setGameState(prev => ({
        ...prev,
        messages: [...prev.messages, { sender: 'character', text: "น่าสนใจจังเลยค่ะ! เล่าให้ฟังอีกสิคะ! 💭" }],
        affectionScore: Math.max(0, Math.min(100, prev.affectionScore + 1)),
        isProcessing: false
      }))
    }
  }

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div 
        className="min-h-screen bg-cover bg-center bg-no-repeat bg-fixed relative"
        style={{ backgroundImage: 'url(/background.jpg)' }}
      >
        {/* Floating Sidebar */}
        <div className="absolute left-2 md:left-4 top-2 md:top-4 bottom-36 md:bottom-44 lg:bottom-48 w-48 md:w-64 bg-white/20 backdrop-blur-lg rounded-xl md:rounded-2xl shadow-2xl border border-white/30 z-10 overflow-hidden">
          <Sidebar />
        </div>

        {/* Main Game Area - Character */}
        <div className="flex-1 flex items-center justify-center relative min-h-screen">
          <Character 
            emotion={gameState.characterEmotion}
            affectionScore={gameState.affectionScore}
          />
          
          {/* Processing Indicator */}
          {gameState.isProcessing && (
            <div className="absolute top-8 right-8 bg-white/30 backdrop-blur-lg rounded-xl p-4 shadow-2xl border border-white/40">
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-pink-400"></div>
                <span className="text-sm text-white font-medium drop-shadow-lg">พี่สาวหงส์กำลังคิด...</span>
              </div>
            </div>
          )}
        </div>

        {/* Floating Dialogue Area - Full width between sidebars */}
        <div className="absolute left-52 right-52 md:left-72 md:right-72 bottom-2 sm:bottom-4 h-36 sm:h-40 md:h-44 lg:h-48 xl:h-52 bg-white/25 backdrop-blur-lg rounded-xl md:rounded-2xl shadow-2xl border border-white/30 z-20">
          <DialogueArea 
            messages={gameState.messages}
            onSendMessage={handleSendMessage}
          />
        </div>

        {/* Floating Affection Panel */}
        <div className="absolute right-2 md:right-4 top-2 md:top-4 bottom-36 md:bottom-44 lg:bottom-48 w-48 md:w-64 bg-white/20 backdrop-blur-lg rounded-xl md:rounded-2xl shadow-2xl border border-white/30 z-10 overflow-hidden">
          <AffectionPanel 
            affectionScore={gameState.affectionScore}
            characterName="พี่สาวหงส์"
          />
        </div>
      </div>
    </DndContext>
  )
}

export default App
