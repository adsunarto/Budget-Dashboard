// src/App.tsx
import { useEffect } from "react";
import Dashboard from "./components/Dashboard/Dashboard";

function App() {
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);
  return (
    <div className="h-screen w-screen flex flex-col bg-background text-foreground overflow-hidden">
      <Dashboard />
    </div>
  );
}

export default App;
