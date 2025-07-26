interface TTSResponse {
  fileUrl: string
}

export class TTSService {
  private static readonly TTS_API_URL = 'https://api.celestiai.co/api/v1/tts-turbo/tts-hutao'
  private static readonly TTS_TOKEN = import.meta.env.VITE_TTS_TOKEN || ''

  // Alternative Web Audio API approach
  static async playAudioWithWebAPI(audioUrl: string): Promise<void> {
    try {
      console.log('Using Web Audio API fallback')
      
      const response = await fetch(audioUrl)
      if (!response.ok) {
        throw new Error(`Failed to fetch audio: ${response.status} ${response.statusText}`)
      }
      
      const arrayBuffer = await response.arrayBuffer()
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
      
      const source = audioContext.createBufferSource()
      source.buffer = audioBuffer
      source.connect(audioContext.destination)
      source.start(0)
      
      // Return a promise that resolves when audio ends
      return new Promise((resolve) => {
        source.onended = () => {
          audioContext.close()
          resolve()
        }
      })
    } catch (error) {
      console.error('Web Audio API playback failed:', error)
      throw error
    }
  }

  static async generateSpeech(text: string): Promise<string> {
    if (!this.TTS_TOKEN) {
      throw new Error('TTS_TOKEN is required. Please add VITE_TTS_TOKEN to your .env file.')
    }

    try {
      const response = await fetch(this.TTS_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.TTS_TOKEN}`
        },
        body: JSON.stringify({
          text: text,
          emotionVoice: "Cheerful_Female",
          language: "th",
          speed: 1,
          volume: 1,
          pitch: 1
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`TTS API error: ${response.status} ${response.statusText} - ${errorText}`)
      }

      const data: TTSResponse = await response.json()
      
      if (!data.fileUrl) {
        throw new Error('Invalid response from TTS API: missing fileUrl')
      }

      return data.fileUrl
    } catch (error) {
      console.error('TTS Service error:', error)
      throw error
    }
  }

  static async playAudio(audioUrl: string): Promise<HTMLAudioElement> {
    try {
      console.log('Attempting to play audio from URL:', audioUrl)
      
      // First try to fetch the audio as blob to handle CORS issues
      const response = await fetch(audioUrl)
      if (!response.ok) {
        throw new Error(`Failed to fetch audio: ${response.status} ${response.statusText}`)
      }
      
      const audioBlob = await response.blob()
      const blobUrl = URL.createObjectURL(audioBlob)
      
      return new Promise((resolve, reject) => {
        let audio: HTMLAudioElement
        
        try {
          audio = new Audio()
        } catch (constructorError) {
          console.error('Failed to create Audio element:', constructorError)
          // Fallback: create audio element via DOM
          audio = document.createElement('audio') as HTMLAudioElement
        }
        
        audio.preload = 'auto'
        
        // Add timeout to prevent hanging
        const timeout = setTimeout(() => {
          URL.revokeObjectURL(blobUrl)
          reject(new Error('Audio loading timeout'))
        }, 10000) // 10 second timeout
        
        // Set up event listeners before setting src
        audio.oncanplaythrough = () => {
          clearTimeout(timeout)
          console.log('Audio can play through, starting playback')
          audio.play()
            .then(() => {
              console.log('Audio playback started successfully')
              resolve(audio)
            })
            .catch((playError) => {
              console.error('Audio play error:', playError)
              URL.revokeObjectURL(blobUrl)
              reject(new Error(`Failed to play audio: ${playError.message}`))
            })
        }
        
        audio.onerror = (error) => {
          clearTimeout(timeout)
          console.error('Audio loading error:', error)
          console.error('Audio error details:', {
            error: audio.error,
            networkState: audio.networkState,
            readyState: audio.readyState
          })
          URL.revokeObjectURL(blobUrl)
          reject(new Error(`Failed to load audio`))
        }
        
        audio.onended = () => {
          console.log('Audio playback ended')
          URL.revokeObjectURL(blobUrl)
          // Clean up the audio element when playback ends
          audio.remove()
        }
        
        // Set the source last
        audio.src = blobUrl
      })
      
    } catch (error) {
      console.error('Failed to fetch audio blob:', error)
      console.log('Trying Web Audio API fallback...')
      
      try {
        await this.playAudioWithWebAPI(audioUrl)
        // Create a dummy audio element for compatibility with existing code
        const dummyAudio = document.createElement('audio') as HTMLAudioElement
        return dummyAudio
      } catch (webAudioError) {
        console.error('Web Audio API fallback also failed:', webAudioError)
        throw new Error(`All audio playback methods failed. Original error: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }
  }
} 