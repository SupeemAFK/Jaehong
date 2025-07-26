import { useDroppable } from '@dnd-kit/core'

interface CharacterProps {
  emotion: 'neutral' | 'happy' | 'sad' | 'love' | 'angry'
  affectionScore: number
}

const CHARACTER_EMOTIONS = {
  neutral: '😊',
  happy: '😄',
  sad: '😢',
  love: '🥰',
  angry: '😠'
}

const CHARACTER_COLORS = {
  neutral: 'from-blue-300 to-blue-500',
  happy: 'from-yellow-300 to-yellow-500',
  sad: 'from-gray-300 to-gray-500',
  love: 'from-pink-300 to-pink-500',
  angry: 'from-red-300 to-red-500'
}

export default function Character({ emotion, affectionScore }: CharacterProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: 'character',
  })

  return (
    <div 
      ref={setNodeRef}
      className={`
        relative flex flex-col items-center justify-center p-8 rounded-full
        transition-all duration-500 ease-in-out transform
        ${isOver ? 'scale-110 shadow-2xl ring-4 ring-pink-300 ring-opacity-50' : 'scale-100 shadow-xl hover:scale-105'}
        bg-gradient-to-br ${CHARACTER_COLORS[emotion]}
      `}
      style={{ width: '300px', height: '300px' }}
    >
      {/* Glow effect for high affection */}
      {affectionScore > 80 && (
        <div className="absolute inset-0 rounded-full bg-pink-400 opacity-20 animate-pulse"></div>
      )}
      
      {/* Character Face */}
      <div className={`
        text-8xl mb-4 transition-transform duration-300
        ${emotion === 'love' ? 'animate-bounce' : emotion === 'happy' ? 'animate-pulse' : ''}
      `}>
        {CHARACTER_EMOTIONS[emotion]}
      </div>
      
      {/* Character Name */}
      <div className="text-2xl font-bold text-white mb-2 drop-shadow-lg">
        Luna
      </div>
      
      {/* Interaction Hint */}
      <div className={`
        text-sm text-white/80 text-center transition-all duration-200
        ${isOver ? 'opacity-100 scale-110' : 'opacity-60'}
      `}>
        {isOver ? 'Drop item here! 💕' : 'Drag items here or chat below'}
      </div>
      
      {/* Floating Hearts Animation */}
      {affectionScore > 70 && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-4 left-4 text-red-500 animate-pulse text-2xl">💖</div>
          <div className="absolute top-8 right-6 text-pink-500 animate-bounce text-xl delay-300">💕</div>
          <div className="absolute bottom-12 left-8 text-red-400 animate-pulse text-lg delay-500">💗</div>
          {affectionScore > 90 && (
            <>
              <div className="absolute top-16 left-1/2 text-pink-400 animate-bounce text-sm delay-700">💖</div>
              <div className="absolute bottom-4 right-4 text-red-300 animate-pulse text-base delay-1000">💕</div>
            </>
          )}
        </div>
      )}
      
      {/* Sparkle effects for very high affection */}
      {affectionScore > 95 && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-2 left-2 text-yellow-300 animate-ping">✨</div>
          <div className="absolute top-6 right-2 text-yellow-400 animate-ping delay-200">⭐</div>
          <div className="absolute bottom-8 left-4 text-yellow-200 animate-ping delay-400">✨</div>
          <div className="absolute bottom-2 right-8 text-yellow-300 animate-ping delay-600">⭐</div>
        </div>
      )}
    </div>
  )
} 