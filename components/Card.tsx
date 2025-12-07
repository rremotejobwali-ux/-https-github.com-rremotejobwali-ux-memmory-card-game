import React from 'react';
import { Card as CardType } from '../types';

interface CardProps {
  card: CardType;
  onClick: (id: string) => void;
  disabled: boolean;
}

export const Card: React.FC<CardProps> = ({ card, onClick, disabled }) => {
  const handleClick = () => {
    if (!disabled && !card.isFlipped && !card.isMatched) {
      onClick(card.id);
    }
  };

  return (
    <div 
      className={`relative w-full aspect-square perspective-1000 cursor-pointer group`}
      onClick={handleClick}
    >
      <div
        className={`w-full h-full transition-all duration-500 transform-style-3d shadow-lg rounded-xl ${
          card.isFlipped || card.isMatched ? 'rotate-y-180' : ''
        }`}
      >
        {/* Card Back (Face Down) */}
        <div className="absolute w-full h-full backface-hidden bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center border-2 border-indigo-400/30">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="w-8 h-8 text-white/40"
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        {/* Card Front (Face Up) */}
        <div className={`absolute w-full h-full backface-hidden rotate-y-180 bg-white rounded-xl flex items-center justify-center border-2 ${card.isMatched ? 'border-green-400 bg-green-50' : 'border-indigo-200'}`}>
          <span className="text-4xl md:text-5xl select-none animate-in fade-in zoom-in duration-300">
            {card.content}
          </span>
          {card.isMatched && (
            <div className="absolute inset-0 flex items-center justify-center">
               <span className="absolute inset-0 bg-green-400/10 rounded-xl animate-pulse"></span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
