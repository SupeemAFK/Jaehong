# 💕 Luna's Dating Simulator

A charming web-based dating simulator game where you can interact with Luna, a sweet and caring character. Build your relationship through conversations and thoughtful gifts!

## ✨ Features

- **Interactive Character**: Meet Luna, who responds intelligently to your messages and gifts
- **Drag & Drop Items**: Give Luna various gifts by dragging items from the sidebar to her
- **Real-time Conversations**: Chat with Luna and watch her personality shine through
- **Affection System**: Build your relationship with a dynamic affection scoring system
- **Emotional Responses**: Luna's emotions change based on your interactions
- **Beautiful UI**: Modern, responsive design with smooth animations
- **LLM Integration**: Smart AI responses powered by language models (OpenAI compatible)

## 🎮 How to Play

1. **Chat with Luna**: Type messages in the dialogue area at the bottom
2. **Give Gifts**: Drag items from the left sidebar to Luna in the center
3. **Build Relationship**: Watch your affection score increase on the right panel
4. **Unlock Milestones**: Achieve relationship milestones as you get closer
5. **Enjoy the Journey**: Experience Luna's changing emotions and responses

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- pnpm (or npm/yarn)

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd luna-dating-sim
```

2. Install dependencies
```bash
pnpm install
```

3. Start the development server
```bash
pnpm dev
```

4. Open your browser and navigate to `http://localhost:5173`

## 🤖 LLM Integration

The game includes smart AI responses through OpenRouter, giving you access to multiple AI models. You can:

### Use Mock Responses (Default)
The game works out of the box with pre-programmed responses that simulate intelligent conversations.

### Enable Real AI with OpenRouter (Recommended)
To enable real AI responses:

1. Sign up at [OpenRouter](https://openrouter.ai/) and get your API key
2. Open the `.env` file in your project root
3. Add your OpenRouter API key:
```env
VITE_OPENROUTER_API_KEY=your-openrouter-api-key-here
```
4. Optionally, choose your preferred model:
```env
VITE_MODEL_NAME=meta-llama/llama-3.3-70b-instruct
```
5. Restart your development server (`pnpm dev`)
6. The game will automatically use real AI responses!

### Available Models
- **meta-llama/llama-3.3-70b-instruct** (default - excellent and fast)
- **anthropic/claude-3.5-sonnet** (great for creative writing)
- **openai/gpt-4o** (excellent conversation)
- **openai/gpt-3.5-turbo** (fast and reliable)
- **meta-llama/llama-3.1-8b-instruct:free** (free tier)
- **google/gemini-pro** (Google's model)
- And many more on OpenRouter!

## 🎁 Available Items

- 🌹 **Rose** - A beautiful red rose (Luna loves flowers!)
- 🍫 **Chocolate** - Sweet chocolate treats
- ☕ **Coffee** - Warm, comforting coffee
- 📚 **Book** - Luna's favorite! She loves reading
- 🎵 **Music** - Beautiful melodies to share
- 🎂 **Cake** - Delicious cake for special moments
- 💌 **Love Letter** - Heartfelt written words
- 🎁 **Gift Box** - Mystery surprises

## 💖 Relationship System

- **Strangers** (0-14): Just getting to know each other
- **Acquaintances** (15-29): Becoming friendly
- **Friends** (30-44): Good friends who enjoy chatting
- **Good Friends** (45-59): Close friendship developing
- **Romantic** (60-74): Romance is in the air
- **In Love** (75-89): Deeply connected
- **Deeply in Love** (90-100): True love achieved!

## 🛠️ Technical Stack

- **React 19** with TypeScript
- **Tailwind CSS** for styling
- **@dnd-kit** for drag and drop functionality
- **Vite** for fast development and building
- **LLM Integration** for AI responses

## 🎨 Customization

You can easily customize Luna's:
- Personality traits in `llmService.ts`
- Available items in `Sidebar.tsx`
- Visual appearance in `Character.tsx`
- Relationship milestones in `AffectionPanel.tsx`

## 📱 Responsive Design

The game is fully responsive and works beautifully on:
- Desktop computers
- Tablets
- Mobile phones

## 🤝 Contributing

Feel free to contribute to make Luna even more amazing! Areas for improvement:
- Additional items and gifts
- More character emotions
- Sound effects and music
- Save/load game progress
- Multiple characters
- Enhanced animations

## 📄 License

This project is open source and available under the MIT License.

---

💝 **Enjoy your time with Luna!** 💝
