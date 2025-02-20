import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useDrag, useDrop } from "react-dnd";

// Card & Game State Types
interface Card {
  code: string;
  image: string;
  value: string;
  suit: string;
  isFaceUp: boolean;
}

interface GameState {
  tableau: Card[][];
  stockpile: Card[];
  waste: Card[];
  foundations: { [key: string]: Card[] };
}

const API_URL = "https://deckofcardsapi.com/api/deck";

// Fetch new deck
const fetchDeck = async (): Promise<string> => {
  const response = await axios.get(`${API_URL}/new/shuffle/?deck_count=1`);
  return response.data.deck_id;
};

// Fetch cards from deck
const fetchCards = async (deckId: string) => {
  if (!deckId) return [];
  const response = await axios.get(`${API_URL}/${deckId}/draw/?count=52`);
  return response.data.cards.map((card: any) => ({
    ...card,
    isFaceUp: false, // Default all cards face-down
  }));
};

// Initialize game state
const initializeGameState = (cards: Card[]): GameState => {
  const tableau: Card[][] = [];
  let index = 0;

  for (let i = 0; i < 7; i++) {
    tableau.push(cards.slice(index, index + i + 1));
    tableau[i][i].isFaceUp = true; // Flip the last card in each column
    index += i + 1;
  }

  return {
    tableau,
    stockpile: cards.slice(index),
    waste: [],
    foundations: { Hearts: [], Diamonds: [], Clubs: [], Spades: [] },
  };
};

// Card component (Drag & Drop)
const CardComponent: React.FC<{ card: Card }> = ({ card }) => {
  const [, ref] = useDrag({
    type: "CARD",
    item: card,
  });

  return (
    <img
      ref={ref}
      src={card.isFaceUp ? card.image : "/back.png"}
      alt={card.code}
      className="w-16"
    />
  );
};

// Column component (Drop Target)
const Column: React.FC<{ cards: Card[]; colIndex: number; moveCard: (card: Card, colIndex: number) => void }> = ({
  cards,
  colIndex,
  moveCard,
}) => {
  const [, drop] = useDrop({
    accept: "CARD",
    drop: (item: Card) => moveCard(item, colIndex),
  });

  return (
    <div ref={drop} className="space-y-2">
      {cards.map((card) => (
        <CardComponent key={card.code} card={card} />
      ))}
    </div>
  );
};

// Main Game Component
const GameBoard: React.FC = () => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [deckId, setDeckId] = useState<string | null>(null);

  // Fetch deck
  const { data: deckData, isLoading: deckLoading } = useQuery({
    queryKey: ["deck"],
    queryFn: fetchDeck,
  });

  useEffect(() => {
    if (deckData) {
      setDeckId(deckData);
    }
  }, [deckData]);

  // Fetch cards
  const { data: cardsData, isLoading: cardsLoading } = useQuery({
    queryKey: ["cards", deckId],
    queryFn: () => fetchCards(deckId!),
    enabled: !!deckId,
  });

  useEffect(() => {
    if (cardsData) {
      setGameState(initializeGameState(cardsData));
    }
  }, [cardsData]);

  // Move card logic
  const moveCard = (card: Card, colIndex: number) => {
    setGameState((prevState) => {
      if (!prevState) return prevState;
      const newTableau = [...prevState.tableau];

      // Find and remove the card from its original column
      newTableau.forEach((column) => {
        const index = column.findIndex((c) => c.code === card.code);
        if (index !== -1) column.splice(index, 1);
      });

      // Add the card to the new column
      newTableau[colIndex].push(card);

      return { ...prevState, tableau: newTableau };
    });
  };

  // Check win condition
  useEffect(() => {
    if (
      gameState &&
      Object.values(gameState.foundations).every((foundation) => foundation.length === 13)
    ) {
      alert("Congratulations! You won!");
    }
  }, [gameState]);

  if (deckLoading || cardsLoading || !gameState) return <p>Loading...</p>;

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold text-center mb-4">Solitaire</h1>

      {/* Tableau Columns */}
      <div className="grid grid-cols-7 gap-4 mb-4">
        {gameState.tableau.map((column, colIndex) => (
          <Column key={colIndex} cards={column} colIndex={colIndex} moveCard={moveCard} />
        ))}
      </div>

      {/* Stockpile & Waste */}
      <div className="flex justify-center space-x-4">
        <button
          onClick={() => {
            if (gameState.stockpile.length > 0) {
              const newWaste = [...gameState.waste, gameState.stockpile[0]];
              setGameState({
                ...gameState,
                stockpile: gameState.stockpile.slice(1),
                waste: newWaste,
              });
            }
          }}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Draw Card
        </button>

        {gameState.waste.length > 0 && (
          <img
            src={gameState.waste[gameState.waste.length - 1].image}
            className="w-16"
          />
        )}
      </div>
    </div>
  );
};

export default GameBoard;
