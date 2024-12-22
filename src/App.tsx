import { Route, Routes, useRoutes } from "react-router-dom";
import Home from "@/components/home";
import routes from "tempo-routes";

function App() {
  return (
    <div className="min-h-screen bg-background">
      {/* Tempo routes for development */}
      {import.meta.env.VITE_TEMPO && useRoutes(routes)}

      <Routes>
        <Route path="/" element={<Home />} />
        {/* Add this before any catchall routes */}
        {import.meta.env.VITE_TEMPO && <Route path="/tempobook/*" />}
      </Routes>
    </div>
  );
}

export default App;
