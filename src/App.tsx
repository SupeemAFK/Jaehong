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
  gameEnded: boolean
  endingType: 'good' | 'bad' | null
  showEndingChoice: boolean
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
    currentAudio: null,
    gameEnded: false,
    endingType: null,
    showEndingChoice: false
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

  // Function to handle ending choice
  const handleEndingChoice = async (acceptLove: boolean) => {
    if (acceptLove) {
      // Good ending - show good end image and play audio
      setGameState(prev => ({
        ...prev,
        gameEnded: true,
        endingType: 'good',
        showEndingChoice: false
      }))
      
      // Play the good ending song
      try {
        const audio = new Audio('/ending/goodendSong.mp3')
        audio.play()
        setGameState(prev => ({ ...prev, currentAudio: audio, isPlayingAudio: true }))
        
        audio.onended = () => {
          setGameState(prev => ({ 
            ...prev, 
            isPlayingAudio: false, 
            currentAudio: null 
          }))
        }
      } catch (error) {
        console.error('Error playing ending audio:', error)
      }
    } else {
      // Bad ending - show bad end image and play audio
      setGameState(prev => ({
        ...prev,
        gameEnded: true,
        endingType: 'bad',
        showEndingChoice: false
      }))
      
      // Play the bad ending song
      try {
        const audio = new Audio('/ending/badendSong.mp3')
        audio.play()
        setGameState(prev => ({ ...prev, currentAudio: audio, isPlayingAudio: true }))
        
        audio.onended = () => {
          setGameState(prev => ({ 
            ...prev, 
            isPlayingAudio: false, 
            currentAudio: null 
          }))
        }
      } catch (error) {
        console.error('Error playing bad ending audio:', error)
      }
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

      const newAffectionScore = Math.max(0, Math.min(100, gameState.affectionScore + response.affectionChange))

      setGameState(prev => ({
        ...prev,
        affectionScore: newAffectionScore,
        messages: [...prev.messages, { sender: 'character', text: response.message }],
        characterEmotion: response.emotion,
        isProcessing: false,
        ownedItems: prev.ownedItems.filter(item => item !== itemId), // Remove used item
        showEndingChoice: newAffectionScore >= 100 && !prev.gameEnded
      }))

      // Play TTS for character response
      await playTTS(response.message)
    } catch (error) {
      console.error('Error getting LLM response:', error)
      // Fallback response
      const fallbackMessage = `ขอบคุณสำหรับ ${itemId} นะคะ! 😊`
      const newAffectionScore = Math.max(0, Math.min(100, gameState.affectionScore + 3))
      
      setGameState(prev => ({
        ...prev,
        messages: [...prev.messages, { sender: 'character', text: fallbackMessage }],
        affectionScore: newAffectionScore,
        isProcessing: false,
        ownedItems: prev.ownedItems.filter(item => item !== itemId), // Remove used item
        showEndingChoice: newAffectionScore >= 100 && !prev.gameEnded
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
      const newAffectionScore = Math.max(0, Math.min(100, gameState.affectionScore + response.affectionChange))

      setGameState(prev => ({
        ...prev,
        affectionScore: newAffectionScore,
        points: prev.points + pointsEarned,
        messages: [...prev.messages, { sender: 'character', text: response.message }],
        characterEmotion: response.emotion,
        isProcessing: false,
        showEndingChoice: newAffectionScore >= 100 && !prev.gameEnded
      }))

      // Play TTS for character response
      await playTTS(response.message)
    } catch (error) {
      console.error('Error getting LLM response:', error)
      // Fallback response - still award 1 point for conversation
      const fallbackMessage = "น่าสนใจจังเลยค่ะ! เล่าให้ฟังอีกสิคะ! 💭"
      const newAffectionScore = Math.max(0, Math.min(100, gameState.affectionScore + 1))
      
      setGameState(prev => ({
        ...prev,
        messages: [...prev.messages, { sender: 'character', text: fallbackMessage }],
        affectionScore: newAffectionScore,
        points: prev.points + 1,
        isProcessing: false,
        showEndingChoice: newAffectionScore >= 100 && !prev.gameEnded
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
        {/* Game Ending Overlay */}
        {gameState.gameEnded && (
          <div className="fixed inset-0 bg-black z-50 flex items-center justify-center animate-fade-in">
            {/* Fullscreen Ending Image */}
            <div className="absolute inset-0">
              <img 
                src={gameState.endingType === 'bad' ? '/ending/badend.png' : '/ending/goodend.png'}
                alt={gameState.endingType === 'bad' ? 'Bad Ending' : 'Good Ending'}
                className="w-full h-full object-cover animate-slow-fade-in"
              />
            </div>
            
            {/* Overlay Content */}
            <div className="relative z-10 bg-black/60 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20 max-w-2xl mx-4 text-center animate-slide-up-delayed">
              <div className="text-3xl font-bold text-white mb-4 drop-shadow-lg">
                {gameState.endingType === 'bad' ? '💔 จบแบบเศร้า' : '✨ จบแบบดี'}
              </div>
              <div className="text-xl text-white/90 mb-8 drop-shadow-lg">
                {gameState.endingType === 'bad' 
                  ? 'บางครั้งความรักก็ไม่ได้จบลงด้วยดี...' 
                  : 'ความรักที่แท้จริงได้เริ่มต้นขึ้นแล้ว!'
                }
              </div>
              <button
                onClick={() => window.location.reload()}
                className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold py-4 px-10 rounded-full transition-all duration-300 transform hover:scale-105 shadow-2xl border border-white/20"
              >
                เล่นใหม่
              </button>
            </div>
          </div>
        )}

        {/* Ending Choice Modal */}
        {gameState.showEndingChoice && !gameState.gameEnded && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 flex items-center justify-center">
            <div className="bg-white/95 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/50 max-w-lg mx-4 text-center">
              <div className="text-6xl mb-4">💕</div>
              <div className="text-2xl font-bold text-gray-800 mb-4">
                พี่สาวหงส์สารภาพรัก!
              </div>
              <div className="text-lg text-gray-700 mb-8">
                "ฉันรักคุณจริงๆ นะคะ... คุณจะรับความรักของฉันไหม?"
              </div>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => handleEndingChoice(true)}
                  className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white font-bold py-3 px-6 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  💖 รับ
                </button>
                <button
                  onClick={() => handleEndingChoice(false)}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  🤝 เป็นเพื่อนดีกว่า
                </button>
              </div>
            </div>
          </div>
        )}

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

        {/* Dev Button to Set Affection to 100% (Development Only) */}
        {import.meta.env.DEV && (
          <div className="absolute bottom-8 right-8 z-30">
            <button
              onClick={() => {
                setGameState(prev => ({
                  ...prev,
                  affectionScore: 100,
                  showEndingChoice: !prev.gameEnded
                }))
              }}
              className="bg-red-500/80 hover:bg-red-600/80 text-white px-4 py-2 rounded-lg backdrop-blur-sm border border-white/20 text-sm font-medium shadow-lg transition-all"
              title="Set Affection to 100% for Testing"
            >
              💖 Max Love
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
