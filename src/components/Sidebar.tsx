import { useDraggable } from '@dnd-kit/core'

interface Item {
  id: string
  name: string
  emoji: string
  description: string
}

const GAME_ITEMS: Item[] = [
  { id: 'rose', name: 'กุหลาบ', emoji: '🌹', description: 'กุหลาบแดงสวยงาม' },
  { id: 'chocolate', name: 'ช็อกโกแลต', emoji: '🍫', description: 'ช็อกโกแลตหวานๆ' },
  { id: 'coffee', name: 'กาแฟ', emoji: '☕', description: 'กาแฟร้อนๆ' },
  { id: 'book', name: 'หนังสือ', emoji: '📚', description: 'หนังสือน่าสนใจ' },
  { id: 'music', name: 'เพลง', emoji: '🎵', description: 'เสียงเพลงไพเราะ' },
  { id: 'cake', name: 'เค้ก', emoji: '🎂', description: 'เค้กอร่อยๆ' },
  { id: 'letter', name: 'จดหมายรัก', emoji: '💌', description: 'จดหมายจากใจจริง' },
  { id: 'gift', name: 'กล่องของขวัญ', emoji: '🎁', description: 'ของขวัญเซอร์ไพรส์' }
]

interface DraggableItemProps {
  item: Item
}

function DraggableItem({ item }: DraggableItemProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: item.id,
  })

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`
        p-3 m-2 bg-white/40 backdrop-blur-sm rounded-xl shadow-lg border border-white/50 
        cursor-grab active:cursor-grabbing hover:shadow-xl transition-all
        ${isDragging ? 'opacity-50 z-50' : 'hover:border-pink-300/70 hover:bg-white/60'}
      `}
    >
      <div className="text-center">
        <div className="text-3xl mb-2">{item.emoji}</div>
        <div className="font-semibold text-gray-800 text-sm">{item.name}</div>
        <div className="text-xs text-gray-700 mt-1">{item.description}</div>
      </div>
    </div>
  )
}

export default function Sidebar() {
  return (
    <div className="p-6 h-full overflow-y-auto">
      <h2 className="text-xl font-bold text-white mb-6 text-center drop-shadow-lg">
        💝 ของขวัญ
      </h2>
      <div className="space-y-2">
        {GAME_ITEMS.map((item) => (
          <DraggableItem key={item.id} item={item} />
        ))}
      </div>
    </div>
  )
} 