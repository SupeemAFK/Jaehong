import { useDroppable } from '@dnd-kit/core'
import { useState, useEffect } from 'react'

interface CharacterProps {
  emotion: 'neutral' | 'happy' | 'sad' | 'love' | 'angry'
  affectionScore: number
}

// Map emotions to available image filenames
const getCharacterImage = (emotion: string, affectionScore: number) => {
  // Map game emotions to available expressions
  const expressionMap: Record<string, string> = {
    'neutral': affectionScore >= 50 ? 'idle' : 'mask', // Use mask when affection is low
    'happy': affectionScore >= 50 ? 'idle' : 'mask', // Use mask for low affection, idle for high
    'sad': 'sad',
    'love': 'love',
    'angry': 'angry'
  }
  
  const expression = expressionMap[emotion] || (affectionScore >= 50 ? 'idle' : 'mask')
  return `/expression/${expression}_hong.png`
}

export default function Character({ emotion, affectionScore }: CharacterProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: 'character',
  })

  // State for tracking relationship status changes
  const [previousAffection, setPreviousAffection] = useState(affectionScore)
  const [showStatusChange, setShowStatusChange] = useState(false)
  const [statusChangeType, setStatusChangeType] = useState<'unlock' | 'lock' | null>(null)
  const [imageTransition, setImageTransition] = useState(false)

  // Check for relationship status changes (crossing the 50% threshold)
  useEffect(() => {
    const wasUnlocked = previousAffection >= 50
    const isNowUnlocked = affectionScore >= 50
    
    if (wasUnlocked !== isNowUnlocked) {
      // Trigger image transition animation
      setImageTransition(true)
      setTimeout(() => setImageTransition(false), 600)
      
      // Show status change notification
      setStatusChangeType(isNowUnlocked ? 'unlock' : 'lock')
      setShowStatusChange(true)
      setTimeout(() => setShowStatusChange(false), 3000)
    }
    
    setPreviousAffection(affectionScore)
  }, [affectionScore, previousAffection])

  return (
    <div 
      ref={setNodeRef}
      className={`
        relative flex flex-col items-center justify-center transition-all duration-500 ease-in-out transform
        ${isOver ? 'scale-110' : 'scale-100 hover:scale-105'}
      `}
    >
      {/* Character Image Container */}
      <div className="relative">
        {/* Glow effect for high affection */}
        {affectionScore > 80 && (
          <div className="absolute inset-0 rounded-full bg-pink-400/30 blur-xl animate-pulse scale-110"></div>
        )}

        {/* Subtle indication for low affection (masked state) */}
        {affectionScore < 50 && !imageTransition && (
          <div className="absolute inset-0 rounded-full bg-gray-400/20 blur-lg animate-pulse scale-105 opacity-60"></div>
        )}
        
        {/* Drop zone indicator */}
        {isOver && (
          <div className="absolute inset-0 rounded-full bg-pink-300/40 animate-pulse scale-110 border-4 border-pink-400/60"></div>
        )}
        
        {/* Character Image */}
        <img
          src={getCharacterImage(emotion, affectionScore)}
          alt={`พี่สาวหงส์ - ${emotion}`}
          className={`
            w-96 h-96 object-contain relative z-10 transition-all duration-500 ease-in-out
            ${emotion === 'love' ? 'animate-bounce' : emotion === 'happy' ? 'animate-pulse' : ''}
            ${isOver ? 'brightness-110' : ''}
            ${imageTransition ? 'scale-110 brightness-125 animate-pulse' : 'scale-100'}
            ${affectionScore >= 50 ? 'drop-shadow-2xl' : 'grayscale-[0.3] drop-shadow-lg'}
          `}
          onError={(e) => {
            // Fallback to idle image if specific emotion image doesn't exist
            const target = e.target as HTMLImageElement
            if (!target.src.includes('idle_hong.png')) {
              target.src = '/expression/idle_hong.png'
            }
          }}
        />

        {/* Relationship Status Change Animation */}
        {imageTransition && (
          <div className="absolute inset-0 pointer-events-none">
            {/* Sparkle burst effect */}
            <div className="absolute top-1/4 left-1/4 text-yellow-300 animate-ping text-4xl">✨</div>
            <div className="absolute top-1/3 right-1/4 text-yellow-400 animate-ping delay-100 text-3xl">⭐</div>
            <div className="absolute bottom-1/3 left-1/3 text-yellow-200 animate-ping delay-200 text-3xl">✨</div>
            <div className="absolute bottom-1/4 right-1/3 text-yellow-300 animate-ping delay-300 text-4xl">⭐</div>
            
            {/* Expanding ring effect */}
            <div className="absolute inset-0 rounded-full border-4 border-pink-400/60 animate-ping scale-110"></div>
            <div className="absolute inset-0 rounded-full border-2 border-yellow-300/50 animate-ping scale-125 delay-150"></div>
          </div>
        )}
      </div>
      
      {/* Character Name */}
      <div className="text-3xl font-bold text-white mt-4 drop-shadow-2xl">
        พี่สาวหงส์
      </div>

      {/* Relationship Status Change Notification */}
      {showStatusChange && (
        <div className={`
          absolute -top-16 left-1/2 transform -translate-x-1/2 
          px-6 py-3 rounded-full text-white font-bold text-lg shadow-2xl
          animate-bounce backdrop-blur-lg border-2 z-20
          ${statusChangeType === 'unlock' 
            ? 'bg-gradient-to-r from-pink-500 to-red-500 border-pink-300' 
            : 'bg-gradient-to-r from-gray-500 to-gray-700 border-gray-300'
          }
        `}>
          {statusChangeType === 'unlock' ? (
            <div className="flex items-center space-x-2">
              <span>💕</span>
              <span>เธอเริ่มเปิดใจแล้ว!</span>
              <span>✨</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <span>😔</span>
              <span>เธอปิดใจลง...</span>
              <span>💔</span>
            </div>
          )}
        </div>
      )}
      
      {/* Interaction Hint */}
      <div className={`
        text-lg text-white/90 text-center transition-all duration-200 mt-2 font-medium drop-shadow-lg
        ${isOver ? 'opacity-100 scale-110 text-pink-200' : 'opacity-80'}
        ${affectionScore >= 50 ? 'text-pink-200' : 'text-gray-300'}
      `}>
        {isOver ? 'วางของขวัญที่นี่! 💕' : 
         affectionScore >= 50 ? 'ลากของขวัญมาที่นี่หรือคุยด้านล่าง 💕' : 
         'ลากของขวัญมาที่นี่หรือคุยด้านล่าง (เธอยังไม่เปิดใจเท่าไหร่)'}
      </div>
      
      {/* Floating Hearts Animation */}
      {affectionScore > 70 && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-4 -left-4 text-red-500 animate-pulse text-3xl">💖</div>
          <div className="absolute -top-2 -right-6 text-pink-500 animate-bounce text-2xl delay-300">💕</div>
          <div className="absolute bottom-12 -left-8 text-red-400 animate-pulse text-xl delay-500">💗</div>
          {affectionScore > 90 && (
            <>
              <div className="absolute top-16 left-1/2 text-pink-400 animate-bounce text-lg delay-700">💖</div>
              <div className="absolute bottom-4 -right-4 text-red-300 animate-pulse text-xl delay-1000">💕</div>
            </>
          )}
        </div>
      )}
      
      {/* Sparkle effects for very high affection */}
      {affectionScore > 95 && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-8 -left-8 text-yellow-300 animate-ping text-2xl">✨</div>
          <div className="absolute -top-4 -right-8 text-yellow-400 animate-ping delay-200 text-xl">⭐</div>
          <div className="absolute bottom-8 -left-12 text-yellow-200 animate-ping delay-400 text-lg">✨</div>
          <div className="absolute bottom-2 -right-12 text-yellow-300 animate-ping delay-600 text-xl">⭐</div>
        </div>
      )}
    </div>
  )
} 