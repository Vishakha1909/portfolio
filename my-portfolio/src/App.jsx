import React from "react";
import InteractiveBackground from "./components/InteractiveBackground";
import './index.css'
import PixelGrid from "./components/PixelGrid";

function App() {
  return (
    <>
      <PixelGrid />
      <main className="relative z-10 flex flex-col items-center justify-center h-screen text-center">
        <h1 className="text-4xl md:text-6xl font-pixel text-white mb-4">
          Hello, I'm Vishakha <span className="ml-2">✏️</span>
        </h1>
        {/* <p className="text-mint text-lg md:text-xl">
          Welcome to my pixel-perfect pastel portfolio.
        </p>
        <p className="text-lavender mt-4 text-sm">
          (And yes — the background *is alive* now 👾)
        </p> */}
      </main>
    </>
  );
}


export default App;