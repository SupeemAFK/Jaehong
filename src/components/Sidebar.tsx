import { useDraggable } from '@dnd-kit/core'

interface Item {
  id: string
  name: string
  emoji: string
  description: string
  cost: number
}

const GAME_ITEMS: Item[] = [
  { id: 'rose', name: 'กุหลาบ', emoji: '🌹', description: 'กุหลาบแดงสวยงาม', cost: 5 },
  { id: 'chocolate', name: 'ช็อกโกแลต', emoji: '🍫', description: 'ช็อกโกแลตหวานๆ', cost: 3 },
  { id: 'coffee', name: 'กาแฟ', emoji: '☕', description: 'กาแฟร้อนๆ', cost: 2 },
  { id: 'book', name: 'หนังสือ', emoji: '📚', description: 'หนังสือน่าสนใจ', cost: 4 },
  { id: 'music', name: 'เพลง', emoji: '🎵', description: 'เสียงเพลงไพเราะ', cost: 3 },
  { id: 'cake', name: 'เค้ก', emoji: '🎂', description: 'เค้กอร่อยๆ', cost: 6 },
  { id: 'letter', name: 'จดหมายรัก', emoji: '💌', description: 'จดหมายจากใจจริง', cost: 4 },
  { id: 'gift', name: 'กล่องของขวัญ', emoji: '🎁', description: 'ของขวัญเซอร์ไพรส์', cost: 8 }
]

interface SidebarProps {
  points: number
  ownedItems: string[]
  onPurchaseItem: (itemId: string, cost: number) => void
}

interface DraggableItemProps {
  item: Item
  isOwned: boolean
  canAfford: boolean
  onPurchase: () => void
}

function DraggableItem({ item, isOwned, canAfford, onPurchase }: DraggableItemProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: item.id,
    disabled: !isOwned
  })

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined

  if (!isOwned) {
    // Shop item - not owned yet
    return (
      <div className="p-3 m-2 bg-white/40 backdrop-blur-sm rounded-xl shadow-lg border border-white/50">
        <div className="text-center">
          <div className="text-3xl mb-2 opacity-60">{item.emoji}</div>
          <div className="font-semibold text-gray-800 text-sm">{item.name}</div>
          <div className="text-xs text-gray-700 mt-1">{item.description}</div>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-xs font-bold text-yellow-600">💰 {item.cost}</span>
            <button
              onClick={onPurchase}
              disabled={!canAfford}
              className={`text-xs px-2 py-1 rounded-lg font-medium transition-all ${
                canAfford 
                  ? 'bg-green-500/80 text-white hover:bg-green-600/80 border border-green-400/60' 
                  : 'bg-gray-400/60 text-gray-600 cursor-not-allowed border border-gray-300/60'
              }`}
            >
              {canAfford ? 'ซื้อ' : 'ไม่พอ'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Owned item - can be dragged
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`
        p-3 m-2 bg-green-100/60 backdrop-blur-sm rounded-xl shadow-lg border-2 border-green-400/70 
        cursor-grab active:cursor-grabbing hover:shadow-xl transition-all
        ${isDragging ? 'opacity-50 z-50' : 'hover:border-green-500/80 hover:bg-green-200/60'}
      `}
    >
      <div className="text-center">
        <div className="text-3xl mb-2">{item.emoji}</div>
        <div className="font-semibold text-gray-800 text-sm">{item.name}</div>
        <div className="text-xs text-gray-700 mt-1">{item.description}</div>
        <div className="text-xs text-green-600 font-bold mt-1">✅ เป็นเจ้าของแล้ว</div>
      </div>
    </div>
  )
}

export default function Sidebar({ points, ownedItems, onPurchaseItem }: SidebarProps) {
  return (
    <div className="p-6 h-full overflow-y-auto">
      {/* Points Display */}
      <div className="bg-white/50 backdrop-blur-sm rounded-xl p-3 shadow-lg mb-4 border border-white/60">
        <div className="text-center">
          <div className="text-2xl mb-1">💰</div>
          <div className="font-bold text-lg text-gray-800">{points}</div>
          <div className="text-xs text-gray-600">แต้ม</div>
        </div>
      </div>

      <h2 className="text-xl font-bold text-white mb-6 text-center drop-shadow-lg">
        🛍️ ร้านค้า
      </h2>
      
      <div className="space-y-2">
        {GAME_ITEMS.map((item) => {
          const isOwned = ownedItems.includes(item.id)
          const canAfford = points >= item.cost
          
          return (
            <DraggableItem 
              key={item.id} 
              item={item} 
              isOwned={isOwned}
              canAfford={canAfford}
              onPurchase={() => onPurchaseItem(item.id, item.cost)}
            />
          )
        })}
      </div>
      
      {/* Instructions */}
      <div className="mt-4 bg-white/40 backdrop-blur-sm rounded-xl p-3 shadow-lg border border-white/50">
        <div className="text-xs text-gray-700 text-center space-y-1">
          <p>💬 คุยเพื่อได้แต้ม</p>
          <p>🛒 ซื้อของด้วยแต้ม</p>
          <p>🎁 ลากของให้พี่สาวหงส์</p>
        </div>
      </div>
    </div>
  )
} 