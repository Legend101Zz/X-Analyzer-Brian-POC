import React, { useState } from "react";
import { motion } from "framer-motion";
import ModuleExplorer from "../ModuleExplorer/ModuleTree";
import CodeEditor from "../CodeEditor/Editor";
import LearningPathNavigator from "../LearningPath/PathNavigator";
import ExecutionVisualizer from "../Visualizer/ExecutionVisualizer";
import CodeCoverageVisualizer from "../Visualizer/CodeCoverageVisualizer";
import MemoryVisualizer from "../Visualizer/MemoryVisualizer";
import CallStackVisualizer from "../Visualizer/CallStackVisualizer";
import CodeRelationshipVisualizer from "../Visualizer/CodeRelationshipVisualizer";
import CodebaseDashboard from "../Dashboard/CodebaseDashboard";
import Navbar from "./Navbar";
import { useTheme } from "../../contexts/ThemeContext";

// Layout modes
const LAYOUTS = {
  DASHBOARD: "dashboard", // Overview of codebase
  EXPLORER: "explorer", // Focus on code browsing
  LEARNING: "learning", // Focus on tutorials
  EXECUTION: "execution", // Focus on execution flow
  RELATIONSHIPS: "relationships", // Code relationships
};

const MainLayout = () => {
  const [activeLayout, setActiveLayout] = useState(LAYOUTS.DASHBOARD);
  const [selectedModule, setSelectedModule] = useState(null);
  const [selectedPath, setSelectedPath] = useState(null);
  const [executionState, setExecutionState] = useState({
    isPlaying: false,
    currentStep: 0,
  });
  const [secondaryView, setSecondaryView] = useState("memory"); // memory, coverage, callstack
  const { darkMode } = useTheme();

  // Layout configurations for different modes
  const layoutConfigs = {
    [LAYOUTS.DASHBOARD]: {
      leftWidth: "w-1/5",
      centerWidth: "w-4/5",
      rightWidth: "w-0",
      leftComponent: (
        <ModuleExplorer compact={true} onSelectModule={setSelectedModule} />
      ),
      centerComponent: <CodebaseDashboard />,
      rightComponent: null,
    },
    [LAYOUTS.EXPLORER]: {
      leftWidth: "w-1/4",
      centerWidth: "w-2/4",
      rightWidth: "w-1/4",
      leftComponent: <ModuleExplorer onSelectModule={setSelectedModule} />,
      centerComponent: <CodeEditor module={selectedModule} />,
      rightComponent: (
        <CodeRelationshipVisualizer
          viewType="modules"
          selectedFile={selectedModule?.path}
        />
      ),
    },
    [LAYOUTS.LEARNING]: {
      leftWidth: "w-1/5",
      centerWidth: "w-3/5",
      rightWidth: "w-1/5",
      leftComponent: <LearningPathNavigator onSelectPath={setSelectedPath} />,
      centerComponent: <CodeEditor readOnly={false} path={selectedPath} />,
      rightComponent: (
        <div className="h-full flex flex-col">
          <div className="p-4 flex-none">
            <h3 className="text-lg font-semibold mb-2">Path Details</h3>
            {selectedPath && (
              <div className="rounded-lg bg-white dark:bg-gray-800 p-4 shadow-lg">
                <h4 className="font-medium">{selectedPath.title}</h4>
                <p className="text-sm text-neuron-text-muted-light dark:text-neuron-text-muted-dark mt-2">
                  {selectedPath.explanation}
                </p>
              </div>
            )}
          </div>
          <div className="flex-1 overflow-hidden border-t border-gray-200 dark:border-gray-700">
            <CodeRelationshipVisualizer viewType="inheritance" />
          </div>
        </div>
      ),
    },
    [LAYOUTS.EXECUTION]: {
      leftWidth: "w-0",
      centerWidth: "w-full",
      rightWidth: "w-0",
      leftComponent: null,
      centerComponent: (
        <ExecutionVisualizer
          playing={executionState.isPlaying}
          onStateChange={setExecutionState}
        />
      ),
      rightComponent: null,
    },
    [LAYOUTS.RELATIONSHIPS]: {
      leftWidth: "w-1/5",
      centerWidth: "w-4/5",
      rightWidth: "w-0",
      leftComponent: (
        <div className="h-full flex flex-col">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-medium">Visualization Types</h3>
            <div className="mt-3 space-y-2">
              {["modules", "inheritance", "dataflow", "dependencies"].map(
                (type) => (
                  <button
                    key={type}
                    className="w-full text-left px-3 py-2 text-sm rounded-md transition-colors bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ),
              )}
            </div>
          </div>
          <div className="flex-1 overflow-auto p-4">
            <h3 className="font-medium mb-2">Filter Options</h3>
            <div className="space-y-2">
              <div>
                <label className="text-xs text-neuron-text-muted-light dark:text-neuron-text-muted-dark">
                  Module
                </label>
                <select className="mt-1 w-full text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-2 py-1">
                  <option>All Modules</option>
                  <option>core</option>
                  <option>units</option>
                  <option>groups</option>
                  <option>monitors</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-neuron-text-muted-light dark:text-neuron-text-muted-dark">
                  Relationship Type
                </label>
                <select className="mt-1 w-full text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-2 py-1">
                  <option>All Relationships</option>
                  <option>Imports</option>
                  <option>Extends</option>
                  <option>Calls</option>
                  <option>Depends On</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      ),
      centerComponent: <CodeRelationshipVisualizer viewType="dataflow" />,
      rightComponent: null,
    },
  };

  const currentConfig = layoutConfigs[activeLayout];

  const handleSecondaryViewChange = (view) => {
    setSecondaryView(view);
  };

  return (
    <div className="flex flex-col h-screen">
      <Navbar
        activeLayout={activeLayout}
        onLayoutChange={setActiveLayout}
        onSecondaryViewChange={handleSecondaryViewChange}
        secondaryView={secondaryView}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel - Adjustable width based on layout */}
        {currentConfig.leftWidth !== "w-0" && (
          <motion.div
            layout
            className={`${currentConfig.leftWidth} h-full border-r border-gray-200 dark:border-gray-700 overflow-auto`}
          >
            {currentConfig.leftComponent}
          </motion.div>
        )}

        {/* Center Panel - Code Display or Visualizer */}
        <motion.div
          layout
          className={`${currentConfig.centerWidth} h-full overflow-hidden ${
            activeLayout === LAYOUTS.EXECUTION ? "" : "overflow-auto"
          }`}
        >
          {currentConfig.centerComponent}
        </motion.div>

        {/* Right Panel - Visualization or Details */}
        {currentConfig.rightWidth !== "w-0" && (
          <motion.div
            layout
            className={`${currentConfig.rightWidth} h-full border-l border-gray-200 dark:border-gray-700 overflow-auto`}
          >
            {currentConfig.rightComponent}
          </motion.div>
        )}
      </div>

      {/* Floating action buttons */}
      {activeLayout === LAYOUTS.EXECUTION && (
        <div className="fixed bottom-4 right-4 flex flex-col space-y-2">
          <button
            onClick={() => handleSecondaryViewChange("coverage")}
            className={`p-2 rounded-full shadow-lg ${
              secondaryView === "coverage"
                ? "bg-neuron-primary text-white"
                : "bg-white dark:bg-gray-800 text-neuron-text-light dark:text-neuron-text-dark"
            }`}
            title="Code Coverage"
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
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </button>

          <button
            onClick={() => handleSecondaryViewChange("memory")}
            className={`p-2 rounded-full shadow-lg ${
              secondaryView === "memory"
                ? "bg-neuron-primary text-white"
                : "bg-white dark:bg-gray-800 text-neuron-text-light dark:text-neuron-text-dark"
            }`}
            title="Memory Inspector"
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
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
          </button>

          <button
            onClick={() => handleSecondaryViewChange("callstack")}
            className={`p-2 rounded-full shadow-lg ${
              secondaryView === "callstack"
                ? "bg-neuron-primary text-white"
                : "bg-white dark:bg-gray-800 text-neuron-text-light dark:text-neuron-text-dark"
            }`}
            title="Call Stack"
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
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
        </div>
      )}

      {/* Secondary panel for execution mode */}
      {activeLayout === LAYOUTS.EXECUTION && secondaryView && (
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: "0%" }}
          exit={{ y: "100%" }}
          transition={{ duration: 0.3 }}
          className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg rounded-t-lg overflow-hidden"
          style={{ height: "30%" }}
        >
          <div className="flex justify-between items-center p-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            <h3 className="font-medium text-sm">
              {secondaryView === "coverage" && "Code Coverage Analysis"}
              {secondaryView === "memory" && "Memory Inspector"}
              {secondaryView === "callstack" && "Call Stack"}
            </h3>
            <button
              onClick={() => handleSecondaryViewChange(null)}
              className="p-1 text-neuron-text-muted-light dark:text-neuron-text-muted-dark hover:text-neuron-text-light dark:hover:text-neuron-text-dark rounded"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="h-full overflow-auto p-2">
            {secondaryView === "coverage" && <CodeCoverageVisualizer />}
            {secondaryView === "memory" && <MemoryVisualizer />}
            {secondaryView === "callstack" && <CallStackVisualizer />}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default MainLayout;
