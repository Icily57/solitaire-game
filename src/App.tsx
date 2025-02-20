import React from "react";
import "./index.css";
import GameBoard from "./gameboard";

const App: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-blue-500 text-white text-3xl font-bold">
      Hello, Tailwind CSS!
      <GameBoard/>
    </div>
  );
};

export default App;
