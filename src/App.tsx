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
      { sender: 'character', text: 'Hello! Nice to meet you! I\'m Luna 💕' }
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
        characterName: 'Luna'
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
        messages: [...prev.messages, { sender: 'character', text: `Thank you for the ${itemId}! 😊` }],
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
         characterName: 'Luna'
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
        messages: [...prev.messages, { sender: 'character', text: "That's interesting! Tell me more! 💭" }],
        affectionScore: Math.max(0, Math.min(100, prev.affectionScore + 1)),
        isProcessing: false
      }))
    }
  }

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="min-h-screen bg-gradient-to-br from-pink-100 to-purple-200 flex">
        {/* Sidebar */}
        <div className="w-64 bg-white/80 backdrop-blur-sm shadow-lg">
          <Sidebar />
        </div>

        {/* Main Game Area */}
        <div className="flex-1 flex flex-col">
          {/* Character Area */}
          <div className="flex-1 flex items-center justify-center relative">
            <Character 
              emotion={gameState.characterEmotion}
              affectionScore={gameState.affectionScore}
            />
            
            {/* Processing Indicator */}
            {gameState.isProcessing && (
              <div className="absolute top-4 right-4 bg-white/90 rounded-lg p-3 shadow-lg">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-pink-500"></div>
                  <span className="text-sm text-gray-600">Luna is thinking...</span>
                </div>
              </div>
            )}
          </div>

          {/* Dialogue Area */}
          <div className="h-64 bg-white/90 backdrop-blur-sm border-t">
            <DialogueArea 
              messages={gameState.messages}
              onSendMessage={handleSendMessage}
            />
          </div>
        </div>

        {/* Affection Panel */}
        <div className="w-64 bg-white/80 backdrop-blur-sm shadow-lg">
          <AffectionPanel 
            affectionScore={gameState.affectionScore}
            characterName="Luna"
          />
        </div>
      </div>
    </DndContext>
  )
}

export default App
