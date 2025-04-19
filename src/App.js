import React, { useState, useEffect } from "react";
import { ThemeProvider } from "./contexts/ThemeContext";
import MainLayout from "./components/Layout/MainLayout";
import LoadingScreen from "./components/Common/LoadingScreen";

// Context for codebase data
import { CodebaseProvider } from "./contexts/CodebaseContext";
import { ExecutionSimulatorProvider } from "./contexts/ExecutionSimulatorContext";

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState("Initializing...");

  // Simulate loading data on app start
  useEffect(() => {
    const loadData = async () => {
      // In a real app, these would be actual data loading steps

      // Simulate loading module structure
      setLoadingMessage("Loading module structure...");
      setLoadingProgress(10);
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Simulate parsing execution graph
      setLoadingMessage("Parsing execution graph...");
      setLoadingProgress(30);
      await new Promise((resolve) => setTimeout(resolve, 400));

      // Simulate loading code files
      setLoadingMessage("Loading codebase files...");
      setLoadingProgress(50);
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Simulate building execution flow
      setLoadingMessage("Building execution flow data...");
      setLoadingProgress(70);
      await new Promise((resolve) => setTimeout(resolve, 400));

      // Simulate loading relationship data
      setLoadingMessage("Analyzing code relationships...");
      setLoadingProgress(90);
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Complete loading
      setLoadingMessage("Ready to explore!");
      setLoadingProgress(100);

      // Show the main application
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
    };

    loadData();
  }, []);

  return (
    <ThemeProvider>
      <CodebaseProvider>
        <ExecutionSimulatorProvider>
          {isLoading ? (
            <LoadingScreen
              progress={loadingProgress}
              message={loadingMessage}
            />
          ) : (
            <MainLayout />
          )}
        </ExecutionSimulatorProvider>
      </CodebaseProvider>
    </ThemeProvider>
  );
}

export default App;
