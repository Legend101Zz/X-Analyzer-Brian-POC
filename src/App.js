import React, { useState, useEffect } from "react";
import MainLayout from "./components/Layout/MainLayout";
import { ThemeProvider } from "./contexts/ThemeContext";

function App() {
  return (
    <ThemeProvider>
      <MainLayout />
    </ThemeProvider>
  );
}

export default App;
