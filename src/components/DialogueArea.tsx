import { useState, useEffect, useRef } from 'react'

interface Message {
  sender: 'user' | 'character'
  text: string
}

interface DialogueAreaProps {
  messages: Message[]
  onSendMessage: (message: string) => void
  isPlayingAudio: boolean
  onPlayTTS: (text: string) => Promise<void>
  onStopAudio: () => void
}

export default function DialogueArea({ messages, onSendMessage, isPlayingAudio, onPlayTTS, onStopAudio }: DialogueAreaProps) {
  const [inputValue, setInputValue] = useState('')
  const [showHistory, setShowHistory] = useState(false)
  const [displayedText, setDisplayedText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const historyRef = useRef<HTMLDivElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (inputValue.trim()) {
      onSendMessage(inputValue.trim())
      setInputValue('')
    }
  }

  // Get the latest message from Luna
  const latestMessage = messages.length > 0 ? messages[messages.length - 1] : null
  const previousMessages = messages.slice(0, -1)

  // Typing effect for Luna's messages
  useEffect(() => {
    if (latestMessage && latestMessage.sender === 'character') {
      setIsTyping(true)
      setDisplayedText('')
      
      const text = latestMessage.text
      let currentIndex = 0
      
      const typingInterval = setInterval(() => {
        if (currentIndex < text.length) {
          setDisplayedText(text.slice(0, currentIndex + 1))
          currentIndex++
        } else {
          setIsTyping(false)
          clearInterval(typingInterval)
        }
      }, 50) // Adjust speed here (lower = faster)
      
      return () => clearInterval(typingInterval)
    } else if (latestMessage && latestMessage.sender === 'user') {
      setDisplayedText(latestMessage.text)
      setIsTyping(false)
    }
  }, [latestMessage])

  // Auto-scroll history to bottom when new messages are added
  useEffect(() => {
    if (historyRef.current) {
      historyRef.current.scrollTop = historyRef.current.scrollHeight
    }
  }, [previousMessages.length])

  return (
    <div className="h-full flex flex-col max-h-full">
      {/* Chat History Toggle */}
      {previousMessages.length > 0 && (
        <div className="flex justify-between items-center px-2 sm:px-3 py-1 flex-shrink-0 border-b border-white/20">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="text-xs sm:text-sm text-white/80 hover:text-white transition-colors flex items-center gap-1 font-medium"
          >
            <span className="text-xs">{showHistory ? '▼' : '▶'}</span>
            ประวัติการสนทนา ({previousMessages.length})
          </button>
          {showHistory && (
            <button
              onClick={() => setShowHistory(false)}
              className="text-xs text-white/60 hover:text-white/80 transition-colors"
            >
              ✕
            </button>
          )}
        </div>
      )}

      {/* Chat History (Collapsible) - Much larger and better organized */}
      {showHistory && previousMessages.length > 0 && (
        <div 
          ref={historyRef}
          className="flex-1 overflow-y-auto mx-2 sm:mx-3 my-2 bg-black/30 rounded-lg backdrop-blur-sm border border-white/20 max-h-32 sm:max-h-40 md:max-h-48"
        >
          <div className="p-2 sm:p-3 space-y-2">
            {previousMessages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`
                    max-w-[85%] sm:max-w-[80%] px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm
                    ${message.sender === 'user'
                      ? 'bg-blue-500/70 text-white border border-blue-400/50'
                      : 'bg-white/60 text-gray-800 border border-white/40'
                    }
                  `}
                >
                  {message.sender === 'character' && (
                    <div className="flex items-center mb-1">
                      <span className="text-xs mr-1">🌸</span>
                      <span className="text-pink-600 font-semibold text-xs">พี่สาวหงส์</span>
                    </div>
                  )}
                  <div className="leading-relaxed">
                    {message.text}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Current Dialogue Display - More compact and responsive */}
      <div className={`flex-1 flex flex-col justify-between p-2 sm:p-3 ${showHistory ? 'min-h-0' : ''}`}>
        {latestMessage && (
          <div className="mb-2 flex-1 flex flex-col justify-center">
            {latestMessage.sender === 'character' ? (
              // Luna's message - more compact dating sim style
              <div className="bg-white/85 backdrop-blur-lg rounded-lg p-2.5 sm:p-3 md:p-4 border border-white/60 shadow-lg">
                <div className="flex items-center justify-between mb-1 sm:mb-2">
                  <div className="flex items-center">
                    <span className="text-sm mr-2">🌸</span>
                    <span className="font-bold text-sm sm:text-base text-gray-800">พี่สาวหงส์</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {!isPlayingAudio ? (
                      <button
                        onClick={() => onPlayTTS(latestMessage.text)}
                        className="p-1 rounded-full bg-pink-100 hover:bg-pink-200 transition-colors"
                        title="เล่นเสียง"
                      >
                        <span className="text-pink-600">🔊</span>
                      </button>
                    ) : (
                      <button
                        onClick={onStopAudio}
                        className="p-1 rounded-full bg-red-100 hover:bg-red-200 transition-colors"
                        title="หยุดเสียง"
                      >
                        <span className="text-red-600">⏹️</span>
                      </button>
                    )}
                  </div>
                </div>
                <div className="text-black text-sm sm:text-base font-medium leading-relaxed">
                  {displayedText}
                  {isTyping && <span className="animate-pulse">|</span>}
                  {isPlayingAudio && !isTyping && (
                    <div className="flex items-center mt-2 text-xs text-pink-600">
                      <span className="animate-pulse mr-1">🎵</span>
                      <span>กำลังเล่นเสียง...</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              // User's message - smaller, right-aligned
              <div className="flex justify-end mb-2">
                <div className="bg-blue-500/80 backdrop-blur-sm rounded-lg p-2 sm:p-2.5 max-w-[80%] sm:max-w-xs md:max-w-md border border-blue-400/60">
                  <div className="text-white text-xs sm:text-sm font-medium leading-relaxed">
                    {displayedText}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Input Area - More compact */}
        <div className="flex-shrink-0">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="พิมพ์ข้อความถึงพี่สาวหงส์..."
              className="flex-1 px-2.5 sm:px-3 py-2 sm:py-2.5 bg-white/80 backdrop-blur-sm border border-white/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent text-black placeholder-gray-600 font-medium text-sm transition-all"
              disabled={isTyping}
            />
            <button
              type="submit"
              className="px-3 sm:px-4 py-2 sm:py-2.5 bg-pink-500/90 text-white rounded-lg hover:bg-pink-600/90 focus:outline-none focus:ring-2 focus:ring-pink-400 transition-all disabled:opacity-50 backdrop-blur-sm border border-pink-400/60 font-medium shadow-lg text-sm"
              disabled={!inputValue.trim() || isTyping}
            >
              <span className="hidden sm:inline">ส่ง 💕</span>
              <span className="sm:hidden">💕</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  )
} 