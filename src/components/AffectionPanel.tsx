interface AffectionPanelProps {
  affectionScore: number
  characterName: string
  points: number
}

const getAffectionLevel = (score: number) => {
  if (score >= 90) return { level: 'รักลึกซึ้ง', emoji: '💖', color: 'text-red-500' }
  if (score >= 75) return { level: 'ตกหลุมรัก', emoji: '🥰', color: 'text-pink-500' }
  if (score >= 60) return { level: 'โรแมนติก', emoji: '😍', color: 'text-pink-400' }
  if (score >= 45) return { level: 'เพื่อนสนิท', emoji: '😊', color: 'text-blue-500' }
  if (score >= 30) return { level: 'เพื่อน', emoji: '🙂', color: 'text-green-500' }
  if (score >= 15) return { level: 'คนรู้จัก', emoji: '😐', color: 'text-yellow-500' }
  return { level: 'คนแปลกหน้า', emoji: '😕', color: 'text-gray-500' }
}

export default function AffectionPanel({ affectionScore, characterName, points }: AffectionPanelProps) {
  const affectionLevel = getAffectionLevel(affectionScore)

  return (
    <div className="p-6 h-full overflow-y-auto">
      <h2 className="text-xl font-bold text-white mb-6 text-center drop-shadow-lg">
        💕 ความสัมพันธ์
      </h2>

      {/* Character Info */}
      <div className="bg-white/40 backdrop-blur-sm rounded-xl p-4 shadow-lg mb-4 border border-white/50">
        <div className="text-center mb-4">
          <div className="text-6xl mb-2">🌸</div>
          <div className="font-bold text-lg text-gray-800">{characterName}</div>
        </div>
      </div>

      {/* Affection Score */}
      <div className="bg-white/40 backdrop-blur-sm rounded-xl p-4 shadow-lg mb-4 border border-white/50">
        <div className="text-center mb-3">
          <div className={`text-3xl ${affectionLevel.color}`}>
            {affectionLevel.emoji}
          </div>
          <div className={`font-semibold ${affectionLevel.color}`}>
            {affectionLevel.level}
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-white/30 rounded-full h-4 mb-2 border border-white/40">
          <div
            className="bg-gradient-to-r from-pink-400 to-red-500 h-4 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${affectionScore}%` }}
          ></div>
        </div>
        
        <div className="text-center text-sm text-gray-700 font-medium">
          {affectionScore}/100
        </div>
      </div>

      {/* Relationship Tips */}
      <div className="bg-white/40 backdrop-blur-sm rounded-xl p-4 shadow-lg mb-4 border border-white/50">
        <h3 className="font-semibold mb-2 text-gray-800">💡 คำแนะนำ</h3>
        <div className="text-sm text-gray-700 space-y-2 font-medium">
          <p>• ให้ของที่เธอชอบ</p>
          <p>• คุยกันอย่างมีความหมาย</p>
          <p>• ใจดีและใส่ใจ</p>
          <p>• จำสิ่งที่เธอเล่าให้ฟัง</p>
        </div>
      </div>

      {/* Relationship Milestones */}
      <div className="bg-white/40 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-white/50">
        <h3 className="font-semibold mb-2 text-gray-800">🏆 เป้าหมาย</h3>
        <div className="space-y-1 text-sm">
          <div className={`flex items-center font-medium ${affectionScore >= 25 ? 'text-green-700' : 'text-gray-500'}`}>
            <span className="mr-2">{affectionScore >= 25 ? '✅' : '⭕'}</span>
            เพื่อนคนแรก (25)
          </div>
          <div className={`flex items-center font-medium ${affectionScore >= 50 ? 'text-green-700' : 'text-gray-500'}`}>
            <span className="mr-2">{affectionScore >= 50 ? '✅' : '⭕'}</span>
            เพื่อนสนิท (50)
          </div>
          <div className={`flex items-center font-medium ${affectionScore >= 75 ? 'text-green-700' : 'text-gray-500'}`}>
            <span className="mr-2">{affectionScore >= 75 ? '✅' : '⭕'}</span>
            ตกหลุมรัก (75)
          </div>
          <div className={`flex items-center font-medium ${affectionScore >= 95 ? 'text-green-700' : 'text-gray-500'}`}>
            <span className="mr-2">{affectionScore >= 95 ? '✅' : '⭕'}</span>
            คู่แท้ (95)
          </div>
        </div>
      </div>
    </div>
  )
} 