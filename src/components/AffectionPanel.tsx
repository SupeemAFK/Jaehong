interface AffectionPanelProps {
  affectionScore: number
  characterName: string
}

const getAffectionLevel = (score: number) => {
  if (score >= 90) return { level: 'Deeply in Love', emoji: '💖', color: 'text-red-500' }
  if (score >= 75) return { level: 'In Love', emoji: '🥰', color: 'text-pink-500' }
  if (score >= 60) return { level: 'Romantic', emoji: '😍', color: 'text-pink-400' }
  if (score >= 45) return { level: 'Good Friends', emoji: '😊', color: 'text-blue-500' }
  if (score >= 30) return { level: 'Friends', emoji: '🙂', color: 'text-green-500' }
  if (score >= 15) return { level: 'Acquaintances', emoji: '😐', color: 'text-yellow-500' }
  return { level: 'Strangers', emoji: '😕', color: 'text-gray-500' }
}

export default function AffectionPanel({ affectionScore, characterName }: AffectionPanelProps) {
  const affectionLevel = getAffectionLevel(affectionScore)

  return (
    <div className="p-4 h-full">
      <h2 className="text-xl font-bold text-gray-800 mb-6 text-center">
        💕 Relationship
      </h2>

      {/* Character Info */}
      <div className="bg-white rounded-lg p-4 shadow-md mb-4">
        <div className="text-center mb-4">
          <div className="text-6xl mb-2">🌸</div>
          <div className="font-bold text-lg">{characterName}</div>
        </div>
      </div>

      {/* Affection Score */}
      <div className="bg-white rounded-lg p-4 shadow-md mb-4">
        <div className="text-center mb-3">
          <div className={`text-3xl ${affectionLevel.color}`}>
            {affectionLevel.emoji}
          </div>
          <div className={`font-semibold ${affectionLevel.color}`}>
            {affectionLevel.level}
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
          <div
            className="bg-gradient-to-r from-pink-400 to-red-500 h-4 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${affectionScore}%` }}
          ></div>
        </div>
        
        <div className="text-center text-sm text-gray-600">
          {affectionScore}/100
        </div>
      </div>

      {/* Relationship Tips */}
      <div className="bg-white rounded-lg p-4 shadow-md">
        <h3 className="font-semibold mb-2 text-gray-800">💡 Tips</h3>
        <div className="text-sm text-gray-600 space-y-2">
          <p>• Give her items she likes</p>
          <p>• Have meaningful conversations</p>
          <p>• Be kind and attentive</p>
          <p>• Remember what she tells you</p>
        </div>
      </div>

      {/* Relationship Milestones */}
      <div className="bg-white rounded-lg p-4 shadow-md mt-4">
        <h3 className="font-semibold mb-2 text-gray-800">🏆 Milestones</h3>
        <div className="space-y-1 text-sm">
          <div className={`flex items-center ${affectionScore >= 25 ? 'text-green-600' : 'text-gray-400'}`}>
            <span className="mr-2">{affectionScore >= 25 ? '✅' : '⭕'}</span>
            First Friend (25)
          </div>
          <div className={`flex items-center ${affectionScore >= 50 ? 'text-green-600' : 'text-gray-400'}`}>
            <span className="mr-2">{affectionScore >= 50 ? '✅' : '⭕'}</span>
            Close Friend (50)
          </div>
          <div className={`flex items-center ${affectionScore >= 75 ? 'text-green-600' : 'text-gray-400'}`}>
            <span className="mr-2">{affectionScore >= 75 ? '✅' : '⭕'}</span>
            In Love (75)
          </div>
          <div className={`flex items-center ${affectionScore >= 95 ? 'text-green-600' : 'text-gray-400'}`}>
            <span className="mr-2">{affectionScore >= 95 ? '✅' : '⭕'}</span>
            Soulmates (95)
          </div>
        </div>
      </div>
    </div>
  )
} 