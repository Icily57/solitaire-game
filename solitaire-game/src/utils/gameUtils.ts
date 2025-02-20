export interface Card {
    code: string;
    image: string;
    value: string;
    suit: string;
    isFaceUp: boolean;
  }
  
  export interface GameState {
    tableau: Card[][];
    stockpile: Card[];
    waste: Card[];
    foundations: { [key: string]: Card[] };
  }
  
  // Helper function to initialize game state
  export const initializeGameState = (cards: Card[]): GameState => {
    const tableau: Card[][] = [];
    let index = 0;
  
    // Distribute cards into 7 tableau columns
    for (let i = 0; i < 7; i++) {
      tableau.push(cards.slice(index, index + i + 1));
      tableau[i][i].isFaceUp = true; // Flip the last card in each column
      index += i + 1;
    }
  
    return {
      tableau,
      stockpile: cards.slice(index), // Remaining cards
      waste: [],
      foundations: { Hearts: [], Diamonds: [], Clubs: [], Spades: [] },
    };
  };
  