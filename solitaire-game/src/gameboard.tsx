import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const API_URL = "https://deckofcardsapi.com/api/deck";

// Fetch a new shuffled deck
const fetchDeck = async () => {
  const response = await axios.get(`${API_URL}/new/shuffle/?deck_count=1`);
  return response.data.deck_id;
};

// Fetch cards from a given deck
const fetchCards = async (deckId: string) => {
  if (!deckId) return []; // Ensure deckId is valid
  const response = await axios.get(`${API_URL}/${deckId}/draw/?count=7`);
  return response.data.cards;
};

const GameBoard: React.FC = () => {
  const [deckId, setDeckId] = useState<string | null>(null);

  // Fetch the deck and set the deckId once loaded
  const { isLoading: deckLoading } = useQuery({
    queryKey: ["deck"],
    queryFn: fetchDeck,
    onSuccess: (id) => setDeckId(id),
  });

  // Fetch cards only when deckId is available
  const { data: cards = [], isLoading: cardsLoading } = useQuery({
    queryKey: ["cards", deckId],
    queryFn: () => fetchCards(deckId!),
    enabled: !!deckId, // Ensures this query runs only when deckId is set
  });

  if (deckLoading || cardsLoading) return <p>Loading...</p>;

  return (
    <div className="flex flex-col items-center p-4">
      <h1 className="text-3xl font-bold mb-4">Solitaire Game</h1>
      <div className="flex gap-2">
        {cards.map((card: { image: string; code: string }) => (
          <img key={card.code} src={card.image} alt={card.code} className="w-20" />
        ))}
      </div>
    </div>
  );
};

export default GameBoard;
