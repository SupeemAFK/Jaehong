import { useDraggable } from '@dnd-kit/core'

interface Item {
  id: string
  name: string
  image: string
  description: string
  cost: number
}

const GAME_ITEMS: Item[] = [
  { id: 'apple', name: 'แอปเปิล', image: '/items/apple.png', description: 'แอปเปิลสีแดงสด', cost: 5 },
  { id: 'longkong', name: 'ลองกอง', image: '/items/longkong.png', description: 'ลองกองหวานๆ', cost: 3 },
  { id: 'pakchee', name: 'ผักชี', image: '/items/pakchee.png', description: 'ผักชีเขียวๆ', cost: 2 },
  { id: 'rawegg', name: 'ไข่เป็ด', image: '/items/rawegg.png', description: 'ไข่เป็ดสดๆ จากฟาร์ม', cost: 4 },
  { id: 'rawfish', name: 'ปลาสด', image: '/items/rawfish.png', description: 'ปลาสดสดๆ จากทะเล', cost: 3 },
  { id: 'rawshrimp', name: 'กุ้งสด', image: '/items/rawshrimp.png', description: 'กุ้งสดสดๆ จากทะเล', cost: 6 },
  { id: 'spinach', name: 'ผักบุ้ง', image: '/items/spinach.png', description: 'ผักบุ้งเขียวๆ', cost: 4 },
  { id: 'flowers', name: 'ช่อดอกไม้', image: '/items/flowers.png', description: 'ดอกไม้สวยๆ', cost: 8 }
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
          <div className='mb-5 flex items-center justify-center'>
            <div className="opacity-60 w-10 h-10">
              <img  src={item.image} alt={item.name} className="w-full object-cover" />
            </div>
          </div>
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
        <div className='mb-5 flex items-center justify-center'>
          <div className="opacity-60 w-10 h-10">
            <img  src={item.image} alt={item.name} className="w-full object-cover" />
          </div>
        </div>
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