interface TTSResponse {
  fileUrl: string
}

export class TTSService {
  private static readonly TTS_API_URL = import.meta.env.DEV 
    ? '/api/tts' // Use Vite proxy in development
    : 'https://api.celestiai.co/api/v1/tts-turbo/tts-hutao' // Direct API in production
  private static readonly TTS_TOKEN = import.meta.env.VITE_TTS_TOKEN || ''

  // CORS proxy options for fallback
  private static readonly CORS_PROXIES = [
    'https://api.allorigins.win/raw?url=',
    'https://cors-anywhere.herokuapp.com/',
    'https://thingproxy.freeboard.io/fetch/'
  ]

  // Method to try fetching audio with CORS proxies
  static async fetchAudioWithProxy(audioUrl: string): Promise<Blob> {
    // In development, try Vite proxy first
    if (import.meta.env.DEV) {
      try {
        const proxyUrl = `/proxy-audio?url=${encodeURIComponent(audioUrl)}`
        const response = await fetch(proxyUrl, {
          method: 'GET',
          headers: {
            'Accept': 'audio/*,*/*',
          }
        })
        
        if (response.ok) {
          console.log('Successfully fetched audio via Vite proxy')
          return await response.blob()
        }
      } catch (error) {
        console.log('Vite proxy failed, trying other methods...', error)
      }
    }

    // Try direct fetch
    try {
      const response = await fetch(audioUrl, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Accept': 'audio/*,*/*',
        }
      })
      
      if (response.ok) {
        return await response.blob()
      }
    } catch (error) {
      console.log('Direct fetch failed, trying proxies...', error)
    }

    // Try each proxy
    for (const proxy of this.CORS_PROXIES) {
      try {
        console.log(`Trying proxy: ${proxy}`)
        const proxyUrl = proxy + encodeURIComponent(audioUrl)
        
        const response = await fetch(proxyUrl, {
          method: 'GET',
          headers: {
            'Accept': 'audio/*,*/*',
          }
        })
        
        if (response.ok) {
          const blob = await response.blob()
          console.log(`Successfully fetched audio via proxy: ${proxy}`)
          return blob
        }
      } catch (error) {
        console.log(`Proxy ${proxy} failed:`, error)
        continue
      }
    }

    throw new Error('All CORS proxy attempts failed')
  }

  // Alternative Web Audio API approach
  static async playAudioWithWebAPI(audioUrl: string): Promise<void> {
    try {
      console.log('Using Web Audio API fallback')
      
      const audioBlob = await this.fetchAudioWithProxy(audioUrl)
      const arrayBuffer = await audioBlob.arrayBuffer()
      
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
      
      // Try to fetch the audio with CORS proxy fallbacks
      const audioBlob = await this.fetchAudioWithProxy(audioUrl)
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
        audio.crossOrigin = 'anonymous' // Add crossOrigin attribute
        
        // Add timeout to prevent hanging
        const timeout = setTimeout(() => {
          URL.revokeObjectURL(blobUrl)
          reject(new Error('Audio loading timeout'))
        }, 15000) // Increased timeout to 15 seconds
        
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

  // Additional method to download audio file directly (for testing)
  static async downloadAudio(audioUrl: string, filename: string = 'audio.wav'): Promise<void> {
    try {
      const audioBlob = await this.fetchAudioWithProxy(audioUrl)
      
      // Create download link
      const downloadUrl = URL.createObjectURL(audioBlob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      // Clean up
      setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000)
      
      console.log('Audio file downloaded successfully')
    } catch (error) {
      console.error('Failed to download audio:', error)
      throw error
    }
  }
} 