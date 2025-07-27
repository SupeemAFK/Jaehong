import { useState } from 'react'
import { TTSService } from '../services/ttsService'

interface AudioDebugPanelProps {
  isVisible: boolean
  onClose: () => void
}

export default function AudioDebugPanel({ isVisible, onClose }: AudioDebugPanelProps) {
  const [testText, setTestText] = useState('สวัสดีค่ะ! ทดสอบเสียงนะคะ')
  const [audioUrl, setAudioUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [logs, setLogs] = useState<string[]>([])
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null)

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs(prev => [...prev, `[${timestamp}] ${message}`])
  }

  const clearLogs = () => {
    setLogs([])
  }

  const testTTSGeneration = async () => {
    if (!testText.trim()) return
    
    setIsLoading(true)
    addLog('Starting TTS generation...')
    
    try {
      const url = await TTSService.generateSpeech(testText)
      setAudioUrl(url)
      addLog(`TTS generation successful! URL: ${url}`)
    } catch (error) {
      addLog(`TTS generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }

  const testAudioPlayback = async () => {
    if (!audioUrl) {
      addLog('No audio URL available. Generate TTS first.')
      return
    }

    setIsLoading(true)
    addLog('Testing audio playback...')
    
    try {
      // Stop current audio if playing
      if (currentAudio) {
        currentAudio.pause()
        currentAudio.remove()
      }

      const audio = await TTSService.playAudio(audioUrl)
      setCurrentAudio(audio)
      addLog('Audio playback started successfully!')
      
      audio.onended = () => {
        addLog('Audio playback ended')
        setCurrentAudio(null)
      }
    } catch (error) {
      addLog(`Audio playback failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }

  const testDownload = async () => {
    if (!audioUrl) {
      addLog('No audio URL available. Generate TTS first.')
      return
    }

    addLog('Testing audio download...')
    
    try {
      await TTSService.downloadAudio(audioUrl, 'test-audio.wav')
      addLog('Audio download initiated successfully!')
    } catch (error) {
      addLog(`Audio download failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const stopAudio = () => {
    if (currentAudio) {
      currentAudio.pause()
      currentAudio.remove()
      setCurrentAudio(null)
      addLog('Audio playback stopped')
    }
  }

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">Audio Debug Panel</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 text-2xl font-bold"
          >
            ×
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          {/* Test Text Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Test Text (Thai):
            </label>
            <textarea
              value={testText}
              onChange={(e) => setTestText(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              rows={2}
              placeholder="Enter Thai text for TTS testing..."
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={testTTSGeneration}
              disabled={isLoading || !testText.trim()}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Generating...' : 'Generate TTS'}
            </button>
            
            <button
              onClick={testAudioPlayback}
              disabled={isLoading || !audioUrl}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Test Playback
            </button>
            
            <button
              onClick={stopAudio}
              disabled={!currentAudio}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Stop Audio
            </button>
            
            <button
              onClick={testDownload}
              disabled={isLoading || !audioUrl}
              className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Download Audio
            </button>
          </div>

          {/* Audio URL Display */}
          {audioUrl && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Generated Audio URL:
              </label>
              <div className="p-3 bg-gray-100 rounded-lg break-all text-sm">
                {audioUrl}
              </div>
            </div>
          )}

          {/* Debug Logs */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Debug Logs:
              </label>
              <button
                onClick={clearLogs}
                className="px-3 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Clear Logs
              </button>
            </div>
            <div className="bg-black text-green-400 p-3 rounded-lg h-48 overflow-y-auto font-mono text-xs">
              {logs.length === 0 ? (
                <div className="text-gray-500">No logs yet...</div>
              ) : (
                logs.map((log, index) => (
                  <div key={index} className="mb-1">
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Environment Info */}
          <div className="text-xs text-gray-500 p-3 bg-gray-50 rounded-lg">
            <strong>Environment:</strong> {import.meta.env.DEV ? 'Development' : 'Production'}<br/>
            <strong>TTS Token:</strong> {import.meta.env.VITE_TTS_TOKEN ? 'Configured' : 'Missing'}<br/>
            <strong>User Agent:</strong> {navigator.userAgent.slice(0, 100)}...
          </div>
        </div>
      </div>
    </div>
  )
} 