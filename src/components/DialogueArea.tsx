import { useState, useRef, useEffect } from 'react'

interface Message {
  sender: 'user' | 'character'
  text: string
}

interface DialogueAreaProps {
  messages: Message[]
  onSendMessage: (message: string) => void
}

export default function DialogueArea({ messages, onSendMessage }: DialogueAreaProps) {
  const [inputValue, setInputValue] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (inputValue.trim()) {
      onSendMessage(inputValue.trim())
      setInputValue('')
    }
  }

  return (
    <div className="h-full flex flex-col p-4">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-3">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`
                max-w-xs lg:max-w-md px-4 py-2 rounded-lg shadow-md
                ${message.sender === 'user'
                  ? 'bg-blue-500 text-white rounded-br-none'
                  : 'bg-pink-200 text-gray-800 rounded-bl-none'
                }
              `}
            >
              {message.sender === 'character' && (
                <div className="flex items-center mb-1">
                  <span className="text-lg mr-2">🌸</span>
                  <span className="font-semibold text-sm">Luna</span>
                </div>
              )}
              <div className="text-sm">{message.text}</div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Type your message to Luna..."
          className="flex-1 px-4 py-2 border border-pink-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
        />
        <button
          type="submit"
          className="px-6 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
          disabled={!inputValue.trim()}
        >
          Send 💕
        </button>
      </form>
    </div>
  )
} 