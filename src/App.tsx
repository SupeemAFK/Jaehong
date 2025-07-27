import { useState } from 'react'
import { DndContext, type DragEndEvent } from '@dnd-kit/core'
import Sidebar from './components/Sidebar'
import Character from './components/Character'
import DialogueArea from './components/DialogueArea'
import AffectionPanel from './components/AffectionPanel'
import AudioDebugPanel from './components/AudioDebugPanel'
import { getLLMResponse } from './services/llmService'
import { TTSService } from './services/ttsService'

interface GameState {
  affectionScore: number
  points: number
  messages: Array<{ sender: 'user' | 'character', text: string }>
  characterEmotion: 'neutral' | 'happy' | 'sad' | 'love' | 'angry'
  isProcessing: boolean
  ownedItems: string[]
  isPlayingAudio: boolean
  currentAudio: HTMLAudioElement | null
}

function App() {
  const [gameState, setGameState] = useState<GameState>({
    affectionScore: 0,
    points: 10,
    messages: [
      { sender: 'character', text: 'สวัสดีค่ะ! ยินดีที่ได้รู้จักนะคะ! ฉันชื่อพี่สาวหงส์ 💕' }
    ],
    characterEmotion: 'neutral',
    isProcessing: false,
    ownedItems: [],
    isPlayingAudio: false,
    currentAudio: null
  })

  const [showDebugPanel, setShowDebugPanel] = useState(false)

  // Function to handle TTS playback
  const playTTS = async (text: string) => {
    try {
      // Stop current audio if playing
      if (gameState.currentAudio) {
        gameState.currentAudio.pause()
        gameState.currentAudio.remove()
      }

      setGameState(prev => ({ ...prev, isPlayingAudio: true }))
      
      const audioUrl = await TTSService.generateSpeech(text)
      const audio = await TTSService.playAudio(audioUrl)
      
      setGameState(prev => ({ ...prev, currentAudio: audio }))
      
      // Handle audio end
      audio.onended = () => {
        setGameState(prev => ({ 
          ...prev, 
          isPlayingAudio: false, 
          currentAudio: null 
        }))
      }
      
    } catch (error) {
      console.error('TTS Error:', error)
      setGameState(prev => ({ ...prev, isPlayingAudio: false }))
    }
  }

  // Function to stop current audio
  const stopAudio = () => {
    if (gameState.currentAudio) {
      gameState.currentAudio.pause()
      gameState.currentAudio.remove()
      setGameState(prev => ({ 
        ...prev, 
        isPlayingAudio: false, 
        currentAudio: null 
      }))
    }
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    
    if (over && over.id === 'character') {
      const itemId = active.id as string
      console.log(`Gave ${itemId} to character`)
      await handleItemGiven(itemId)
    }
  }

  const handleItemGiven = async (itemId: string) => {
    // Check if player owns the item
    if (!gameState.ownedItems.includes(itemId)) {
      setGameState(prev => ({
        ...prev,
        messages: [...prev.messages, { sender: 'character', text: 'เอ๋? คุณไม่มีของชิ้นนี้นะคะ! ต้องซื้อก่อนนะ 😅' }]
      }))
      return
    }

    setGameState(prev => ({ ...prev, isProcessing: true }))
    
    try {
      const response = await getLLMResponse({
        itemGiven: itemId,
        currentAffection: gameState.affectionScore,
        recentMessages: gameState.messages.slice(-6), // Send last 6 messages for better context
        characterName: 'พี่สาวหงส์'
      })

      setGameState(prev => ({
        ...prev,
        affectionScore: Math.max(0, Math.min(100, prev.affectionScore + response.affectionChange)),
        messages: [...prev.messages, { sender: 'character', text: response.message }],
        characterEmotion: response.emotion,
        isProcessing: false,
        ownedItems: prev.ownedItems.filter(item => item !== itemId) // Remove used item
      }))

      // Play TTS for character response
      await playTTS(response.message)
    } catch (error) {
      console.error('Error getting LLM response:', error)
      // Fallback response
              const fallbackMessage = `ขอบคุณสำหรับ ${itemId} นะคะ! 😊`
        setGameState(prev => ({
          ...prev,
          messages: [...prev.messages, { sender: 'character', text: fallbackMessage }],
          affectionScore: Math.max(0, Math.min(100, prev.affectionScore + 3)),
          isProcessing: false,
          ownedItems: prev.ownedItems.filter(item => item !== itemId) // Remove used item
        }))

        // Play TTS for fallback response
        await playTTS(fallbackMessage)
    }
  }

  const handleSendMessage = async (message: string) => {
    // Add user message immediately
    const updatedMessages = [...gameState.messages, { sender: 'user' as const, text: message }]
    setGameState(prev => ({
      ...prev,
      messages: updatedMessages,
      isProcessing: true
    }))

    try {
      const response = await getLLMResponse({
        playerMessage: message,
        currentAffection: gameState.affectionScore,
        recentMessages: updatedMessages.slice(-6), // Send last 6 messages for better context
        characterName: 'พี่สาวหงส์'
      })

      // Award points for conversation (1-3 points based on affection change)
      const pointsEarned = Math.max(1, Math.abs(response.affectionChange))

      setGameState(prev => ({
        ...prev,
        affectionScore: Math.max(0, Math.min(100, prev.affectionScore + response.affectionChange)),
        points: prev.points + pointsEarned,
        messages: [...prev.messages, { sender: 'character', text: response.message }],
        characterEmotion: response.emotion,
        isProcessing: false
      }))

      // Play TTS for character response
      await playTTS(response.message)
    } catch (error) {
      console.error('Error getting LLM response:', error)
      // Fallback response - still award 1 point for conversation
      const fallbackMessage = "น่าสนใจจังเลยค่ะ! เล่าให้ฟังอีกสิคะ! 💭"
      setGameState(prev => ({
        ...prev,
        messages: [...prev.messages, { sender: 'character', text: fallbackMessage }],
        affectionScore: Math.max(0, Math.min(100, prev.affectionScore + 1)),
        points: prev.points + 1,
        isProcessing: false
      }))

      // Play TTS for fallback response
      await playTTS(fallbackMessage)
    }
  }

  const handlePurchaseItem = (itemId: string, cost: number) => {
    if (gameState.points >= cost) {
      setGameState(prev => ({
        ...prev,
        points: prev.points - cost,
        ownedItems: [...prev.ownedItems, itemId],
        messages: [...prev.messages, { sender: 'character', text: `ได้แล้วค่ะ! คุณซื้อของชิ้นนี้แล้ว ลองเอามาให้ฉันดูสิ! 😊` }]
      }))
    } else {
      setGameState(prev => ({
        ...prev,
        messages: [...prev.messages, { sender: 'character', text: `อ๋อ... คุณมีแต้มไม่พอนะคะ คุยกับฉันเพิ่มเติมแล้วจะได้แต้มมากขึ้นค่ะ! 💕` }]
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
          <Sidebar 
            points={gameState.points}
            ownedItems={gameState.ownedItems}
            onPurchaseItem={handlePurchaseItem}
          />
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

          {/* Debug Panel Toggle Button (Development Only) */}
          {import.meta.env.DEV && (
            <div className="absolute top-8 left-8">
              <button
                onClick={() => setShowDebugPanel(true)}
                className="bg-purple-500/80 hover:bg-purple-600/80 text-white px-4 py-2 rounded-lg backdrop-blur-sm border border-white/20 text-sm font-medium shadow-lg transition-all"
                title="Open Audio Debug Panel"
              >
                🔧 Debug Audio
              </button>
            </div>
          )}
        </div>

        {/* Floating Dialogue Area - Full width between sidebars */}
        <div className="absolute left-52 right-52 md:left-72 md:right-72 bottom-2 sm:bottom-4 h-36 sm:h-40 md:h-44 lg:h-48 xl:h-52 bg-white/25 backdrop-blur-lg rounded-xl md:rounded-2xl shadow-2xl border border-white/30 z-20">
          <DialogueArea 
            messages={gameState.messages}
            onSendMessage={handleSendMessage}
            isPlayingAudio={gameState.isPlayingAudio}
            onPlayTTS={playTTS}
            onStopAudio={stopAudio}
          />
        </div>

        {/* Floating Affection Panel */}
        <div className="absolute right-2 md:right-4 top-2 md:top-4 bottom-36 md:bottom-44 lg:bottom-48 w-48 md:w-64 bg-white/20 backdrop-blur-lg rounded-xl md:rounded-2xl shadow-2xl border border-white/30 z-10 overflow-hidden">
          <AffectionPanel 
            affectionScore={gameState.affectionScore}
            characterName="พี่สาวหงส์"
            points={gameState.points}
          />
        </div>

        {/* Audio Debug Panel */}
        <AudioDebugPanel 
          isVisible={showDebugPanel}
          onClose={() => setShowDebugPanel(false)}
        />
      </div>
    </DndContext>
  )
}

export default App
