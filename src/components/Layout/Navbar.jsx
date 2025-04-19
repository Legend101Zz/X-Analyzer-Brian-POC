import React from "react";
import { motion } from "framer-motion";
import { useTheme } from "../../contexts/ThemeContext";

const Navbar = ({ activeLayout, onLayoutChange }) => {
  const { darkMode, toggleTheme } = useTheme();

  const layouts = [
    { id: "explorer", name: "Explorer", icon: "📁" },
    { id: "learning", name: "Learning Paths", icon: "🧠" },
    { id: "execution", name: "Execution Flow", icon: "⚡" },
  ];

  return (
    <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-2 flex items-center justify-between">
      <div className="flex items-center">
        <div className="text-neuron-primary text-xl font-bold flex items-center">
          <svg
            className="w-7 h-7 mr-2"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              className="dark:stroke-neuron-secondary stroke-neuron-primary"
              d="M12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20C16.4183 20 20 16.4183 20 12"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              className="dark:stroke-neuron-pulse stroke-neuron-accent animate-pulse-slow"
              d="M20 4L20 12"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <circle
              className="dark:fill-neuron-secondary fill-neuron-primary"
              cx="12"
              cy="12"
              r="2"
              fill="currentColor"
            />
            <path
              className="dark:stroke-neuron-synaptic stroke-neuron-synaptic"
              d="M12 12L18 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray="1 3"
            />
          </svg>
          Brian<span className="text-neuron-synaptic">2</span> Explorer
        </div>
      </div>

      <div className="flex space-x-1">
        {layouts.map((layout) => (
          <button
            key={layout.id}
            onClick={() => onLayoutChange(layout.id)}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-all relative ${
              activeLayout === layout.id
                ? "text-neuron-primary dark:text-neuron-secondary"
                : "text-gray-600 dark:text-gray-300 hover:text-neuron-primary hover:dark:text-neuron-secondary"
            }`}
          >
            <span className="mr-1">{layout.icon}</span>
            {layout.name}
            {activeLayout === layout.id && (
              <motion.div
                layoutId="activeIndicator"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-neuron-primary dark:bg-neuron-secondary"
                initial={false}
              />
            )}
          </button>
        ))}

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="ml-4 p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          {darkMode ? (
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          ) : (
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
              />
            </svg>
          )}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
