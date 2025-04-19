import React, { useState } from "react";
import { motion } from "framer-motion";
import { useTheme } from "../../contexts/ThemeContext";

const Navbar = ({
  activeLayout,
  onLayoutChange,
  onSecondaryViewChange,
  secondaryView,
}) => {
  const { darkMode, toggleTheme } = useTheme();
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const layouts = [
    { id: "dashboard", name: "Dashboard", icon: "📊" },
    { id: "explorer", name: "Explorer", icon: "📁" },
    { id: "learning", name: "Learning Paths", icon: "🧠" },
    { id: "execution", name: "Execution Flow", icon: "⚡" },
    { id: "relationships", name: "Code Relations", icon: "🔄" },
  ];

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    // Mock search results - in a real app, this would search the actual codebase
    if (query.trim().length > 2) {
      // Simulate search results
      const mockResults = [
        {
          type: "function",
          name: "run",
          file: "brian2/core/magic.py",
          line: 403,
        },
        {
          type: "class",
          name: "Network",
          file: "brian2/core/network.py",
          line: 120,
        },
        {
          type: "method",
          name: "Network.run",
          file: "brian2/core/network.py",
          line: 1062,
        },
        {
          type: "function",
          name: "run_magic",
          file: "brian2/core/magic.py",
          line: 300,
        },
      ].filter(
        (result) =>
          result.name.toLowerCase().includes(query.toLowerCase()) ||
          result.file.toLowerCase().includes(query.toLowerCase()),
      );

      setSearchResults(mockResults);
    } else {
      setSearchResults([]);
    }
  };

  const toggleSearch = () => {
    setShowSearch(!showSearch);
    if (showSearch) {
      setSearchQuery("");
      setSearchResults([]);
    }
  };

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

      <div className="flex items-center space-x-1">
        {/* Main navigation */}
        <div className="hidden md:flex space-x-1">
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
        </div>

        {/* Mobile navigation */}
        <div className="md:hidden">
          <select
            value={activeLayout}
            onChange={(e) => onLayoutChange(e.target.value)}
            className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 text-sm"
          >
            {layouts.map((layout) => (
              <option key={layout.id} value={layout.id}>
                {layout.icon} {layout.name}
              </option>
            ))}
          </select>
        </div>

        {/* Search button */}
        <button
          onClick={toggleSearch}
          className="ml-2 p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 relative"
        >
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
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>

          {/* Search panel */}
          {showSearch && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-800 shadow-lg rounded-md border border-gray-200 dark:border-gray-700 z-50"
            >
              <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                <input
                  type="text"
                  placeholder="Search codebase..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-neuron-text-light dark:text-neuron-text-dark focus:outline-none focus:ring-1 focus:ring-neuron-primary"
                  autoFocus
                />
              </div>

              <div className="max-h-80 overflow-y-auto">
                {searchQuery.trim().length > 0 &&
                  searchResults.length === 0 && (
                    <div className="p-4 text-center text-neuron-text-muted-light dark:text-neuron-text-muted-dark">
                      No results found for "{searchQuery}"
                    </div>
                  )}

                {searchResults.map((result, index) => (
                  <div
                    key={index}
                    className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-200 dark:border-gray-700 last:border-0"
                  >
                    <div className="flex items-start">
                      <div
                        className={`
                        px-1.5 py-0.5 text-xs rounded mr-2
                        ${result.type === "function" ? "bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-300" : ""}
                        ${result.type === "class" ? "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300" : ""}
                        ${result.type === "method" ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300" : ""}
                      `}
                      >
                        {result.type}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{result.name}</div>
                        <div className="text-xs text-neuron-text-muted-light dark:text-neuron-text-muted-dark mt-1">
                          {result.file}:{result.line}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {searchResults.length > 0 && (
                <div className="p-2 border-t border-gray-200 dark:border-gray-700 text-xs text-neuron-text-muted-light dark:text-neuron-text-muted-dark text-center">
                  Press Enter to see all {searchResults.length} results
                </div>
              )}
            </motion.div>
          )}
        </button>

        {/* Secondary view controls for execution mode */}
        {activeLayout === "execution" && (
          <div className="hidden md:flex ml-2 bg-gray-100 dark:bg-gray-700 rounded-md p-1 text-xs">
            <button
              onClick={() => onSecondaryViewChange("coverage")}
              className={`px-2 py-1 rounded ${
                secondaryView === "coverage"
                  ? "bg-white dark:bg-gray-600 shadow-sm text-neuron-primary dark:text-neuron-secondary"
                  : "text-gray-500 dark:text-gray-400"
              }`}
            >
              Coverage
            </button>
            <button
              onClick={() => onSecondaryViewChange("memory")}
              className={`px-2 py-1 rounded ${
                secondaryView === "memory"
                  ? "bg-white dark:bg-gray-600 shadow-sm text-neuron-primary dark:text-neuron-secondary"
                  : "text-gray-500 dark:text-gray-400"
              }`}
            >
              Memory
            </button>
            <button
              onClick={() => onSecondaryViewChange("callstack")}
              className={`px-2 py-1 rounded ${
                secondaryView === "callstack"
                  ? "bg-white dark:bg-gray-600 shadow-sm text-neuron-primary dark:text-neuron-secondary"
                  : "text-gray-500 dark:text-gray-400"
              }`}
            >
              Call Stack
            </button>
          </div>
        )}

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="ml-4 p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
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

        {/* User profile / settings */}
        <button className="ml-2 p-1 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600">
          <svg
            className="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
