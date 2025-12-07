import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card as CardComponent } from './components/Card';
import { generateThemeItems } from './services/geminiService';
import { Card, GameStatus } from './types';
import { Play, Sparkles, RefreshCw, Trophy, BrainCircuit } from 'lucide-react';

const DEFAULT_THEME = "Animals";
const DEFAULT_ITEMS = ["🦁", "🐯", "🐻", "🐨", "🐼", "🐸", "🐙", "🦄"];

const App: React.FC = () => {
  const [cards, setCards] = useState<Card[]>([]);
  const [moves, setMoves] = useState(0);
  const [gameStatus, setGameStatus] = useState<GameStatus>(GameStatus.IDLE);
  const [themeInput, setThemeInput] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Logic state
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const timerRef = useRef<number | null>(null); // For game timer (optional feature)
  
  // Initialize game
  const startGame = useCallback(async (customTheme?: string) => {
    setLoading(true);
    setGameStatus(GameStatus.IDLE);
    setMoves(0);
    setFlippedIndices([]);
    setIsProcessing(false);

    let items = DEFAULT_ITEMS;

    if (customTheme) {
      try {
        items = await generateThemeItems(customTheme);
      } catch (err) {
        console.error("Failed to generate theme, using default.");
      }
    }

    // Duplicate and shuffle
    const gameItems = [...items, ...items];
    const shuffled = gameItems
      .map((content, index) => ({
        id: `card-${index}-${Math.random()}`,
        content,
        isFlipped: false,
        isMatched: false,
      }))
      .sort(() => Math.random() - 0.5);

    setCards(shuffled);
    setLoading(false);
    setGameStatus(GameStatus.PLAYING);
  }, []);

  // Handle Card Click
  const handleCardClick = (id: string) => {
    if (gameStatus !== GameStatus.PLAYING || isProcessing) return;

    const clickedIndex = cards.findIndex(c => c.id === id);
    if (clickedIndex === -1 || cards[clickedIndex].isMatched || cards[clickedIndex].isFlipped) return;

    // Flip the card
    const newCards = [...cards];
    newCards[clickedIndex].isFlipped = true;
    setCards(newCards);

    const newFlippedIndices = [...flippedIndices, clickedIndex];
    setFlippedIndices(newFlippedIndices);

    // Check for match if 2 cards are flipped
    if (newFlippedIndices.length === 2) {
      setIsProcessing(true);
      setMoves(m => m + 1);

      const [firstIndex, secondIndex] = newFlippedIndices;
      const firstCard = newCards[firstIndex];
      const secondCard = newCards[secondIndex];

      if (firstCard.content === secondCard.content) {
        // Match found
        setTimeout(() => {
          setCards(prev => prev.map((c, i) => 
            i === firstIndex || i === secondIndex 
              ? { ...c, isMatched: true } 
              : c
          ));
          setFlippedIndices([]);
          setIsProcessing(false);
        }, 500);
      } else {
        // No match
        setTimeout(() => {
          setCards(prev => prev.map((c, i) => 
            i === firstIndex || i === secondIndex 
              ? { ...c, isFlipped: false } 
              : c
          ));
          setFlippedIndices([]);
          setIsProcessing(false);
        }, 1000);
      }
    }
  };

  // Check Win Condition
  useEffect(() => {
    if (gameStatus === GameStatus.PLAYING && cards.length > 0) {
      const allMatched = cards.every(c => c.isMatched);
      if (allMatched) {
        setGameStatus(GameStatus.WON);
      }
    }
  }, [cards, gameStatus]);

  // Initial Load
  useEffect(() => {
    startGame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col items-center p-4 md:p-8 font-sans">
      {/* Header */}
      <header className="w-full max-w-4xl flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-lg shadow-lg rotate-3">
            <BrainCircuit className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
            MindMatch AI
          </h1>
        </div>
        
        <div className="flex items-center gap-6 bg-white px-6 py-3 rounded-full shadow-sm border border-slate-200">
          <div className="text-center">
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Moves</p>
            <p className="text-xl font-bold text-slate-700">{moves}</p>
          </div>
          <div className="w-px h-8 bg-slate-200"></div>
          <div className="text-center">
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Pairs</p>
            <p className="text-xl font-bold text-slate-700">
              {cards.filter(c => c.isMatched).length / 2} / {cards.length / 2}
            </p>
          </div>
        </div>
      </header>

      {/* Main Game Area */}
      <main className="w-full max-w-2xl flex-1 flex flex-col items-center">
        
        {/* Controls */}
        <div className="w-full bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Enter a theme (e.g., 'Space', 'Pizza')"
                value={themeInput}
                onChange={(e) => setThemeInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !loading && startGame(themeInput || DEFAULT_THEME)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              />
              <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-400" />
            </div>
            <button
              onClick={() => startGame(themeInput || DEFAULT_THEME)}
              disabled={loading}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold rounded-xl transition-all active:scale-95 shadow-md shadow-indigo-200"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Play className="w-5 h-5" />
              )}
              <span>{loading ? 'Generating...' : 'New Game'}</span>
            </button>
          </div>
        </div>

        {/* Grid */}
        <div className="w-full grid grid-cols-4 gap-3 md:gap-4 auto-rows-fr">
          {cards.map((card) => (
            <CardComponent
              key={card.id}
              card={card}
              onClick={handleCardClick}
              disabled={loading || gameStatus === GameStatus.WON}
            />
          ))}
        </div>

        {/* Win State Overlay/Message */}
        {gameStatus === GameStatus.WON && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-sm w-full text-center transform scale-100 animate-in zoom-in duration-300 border-4 border-indigo-100">
              <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trophy className="w-10 h-10 text-yellow-500" />
              </div>
              <h2 className="text-3xl font-bold text-slate-800 mb-2">You Won!</h2>
              <p className="text-slate-500 mb-8">
                Great memory! You cleared the board in <strong className="text-indigo-600">{moves}</strong> moves.
              </p>
              <button
                onClick={() => startGame(themeInput || DEFAULT_THEME)}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-200"
              >
                <RefreshCw className="w-5 h-5" />
                Play Again
              </button>
            </div>
          </div>
        )}
      </main>

      <footer className="mt-8 text-slate-400 text-sm font-medium">
        Powered by Google Gemini 2.5 Flash
      </footer>
    </div>
  );
};

export default App;
