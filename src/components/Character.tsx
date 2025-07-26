import { useDroppable } from '@dnd-kit/core'

interface CharacterProps {
  emotion: 'neutral' | 'happy' | 'sad' | 'love' | 'angry'
  affectionScore: number
}

// Map emotions to available image filenames
const getCharacterImage = (emotion: string) => {
  // Map game emotions to available expressions
  const expressionMap: Record<string, string> = {
    'neutral': 'idle',
    'happy': 'idle', // Use idle for happy since it's the closest positive expression
    'sad': 'sad',
    'love': 'love',
    'angry': 'angry'
  }
  
  const expression = expressionMap[emotion] || 'idle'
  return `/expression/${expression}_hong.png`
}

export default function Character({ emotion, affectionScore }: CharacterProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: 'character',
  })

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
        
        {/* Drop zone indicator */}
        {isOver && (
          <div className="absolute inset-0 rounded-full bg-pink-300/40 animate-pulse scale-110 border-4 border-pink-400/60"></div>
        )}
        
        {/* Character Image */}
        <img
          src={getCharacterImage(emotion)}
          alt={`พี่สาวหงส์ - ${emotion}`}
          className={`
            w-96 h-96 object-contain transition-all duration-300 relative z-10
            ${emotion === 'love' ? 'animate-bounce' : emotion === 'happy' ? 'animate-pulse' : ''}
            ${isOver ? 'brightness-110' : ''}
          `}
          onError={(e) => {
            // Fallback to idle image if specific emotion image doesn't exist
            const target = e.target as HTMLImageElement
            if (!target.src.includes('idle_hong.png')) {
              target.src = '/expression/idle_hong.png'
            }
          }}
        />
      </div>
      
      {/* Character Name */}
      <div className="text-3xl font-bold text-white mt-4 drop-shadow-2xl">
        พี่สาวหงส์
      </div>
      
      {/* Interaction Hint */}
      <div className={`
        text-lg text-white/90 text-center transition-all duration-200 mt-2 font-medium drop-shadow-lg
        ${isOver ? 'opacity-100 scale-110 text-pink-200' : 'opacity-80'}
      `}>
        {isOver ? 'วางของขวัญที่นี่! 💕' : 'ลากของขวัญมาที่นี่หรือคุยด้านล่าง'}
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