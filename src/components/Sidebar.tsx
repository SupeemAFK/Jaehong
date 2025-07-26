import { useDraggable } from '@dnd-kit/core'

interface Item {
  id: string
  name: string
  emoji: string
  description: string
}

const GAME_ITEMS: Item[] = [
  { id: 'rose', name: 'Rose', emoji: '🌹', description: 'A beautiful red rose' },
  { id: 'chocolate', name: 'Chocolate', emoji: '🍫', description: 'Sweet chocolate' },
  { id: 'coffee', name: 'Coffee', emoji: '☕', description: 'Warm coffee' },
  { id: 'book', name: 'Book', emoji: '📚', description: 'An interesting book' },
  { id: 'music', name: 'Music', emoji: '🎵', description: 'Beautiful melody' },
  { id: 'cake', name: 'Cake', emoji: '🎂', description: 'Delicious cake' },
  { id: 'letter', name: 'Love Letter', emoji: '💌', description: 'A heartfelt letter' },
  { id: 'gift', name: 'Gift Box', emoji: '🎁', description: 'A surprise gift' }
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
        p-3 m-2 bg-white rounded-lg shadow-md border-2 border-pink-200 
        cursor-grab active:cursor-grabbing hover:shadow-lg transition-all
        ${isDragging ? 'opacity-50 z-50' : 'hover:border-pink-300'}
      `}
    >
      <div className="text-center">
        <div className="text-3xl mb-2">{item.emoji}</div>
        <div className="font-semibold text-gray-800 text-sm">{item.name}</div>
        <div className="text-xs text-gray-600 mt-1">{item.description}</div>
      </div>
    </div>
  )
}

export default function Sidebar() {
  return (
    <div className="p-4 h-full overflow-y-auto">
      <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">
        💝 Items
      </h2>
      <div className="space-y-2">
        {GAME_ITEMS.map((item) => (
          <DraggableItem key={item.id} item={item} />
        ))}
      </div>
    </div>
  )
} 