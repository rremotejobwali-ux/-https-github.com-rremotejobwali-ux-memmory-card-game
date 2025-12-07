export interface Card {
  id: string;
  content: string; // Emoji or text
  isFlipped: boolean;
  isMatched: boolean;
}

export enum GameStatus {
  IDLE = 'IDLE',
  PLAYING = 'PLAYING',
  WON = 'WON',
}

export interface ThemeResponse {
  items: string[];
}
