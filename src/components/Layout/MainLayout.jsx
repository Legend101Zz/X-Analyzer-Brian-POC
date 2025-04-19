import React, { useState } from "react";
import { motion } from "framer-motion";
import ModuleExplorer from "../ModuleExplorer/ModuleTree";
import CodeEditor from "../CodeEditor/Editor";
import LearningPathNavigator from "../LearningPath/PathNavigator";
import ExecutionVisualizer from "../Visualizer/ExecutionVisualizer";
import Navbar from "./Navbar";
import { useTheme } from "../../contexts/ThemeContext";

// Layout modes
const LAYOUTS = {
  EXPLORER: "explorer", // Focus on code browsing
  LEARNING: "learning", // Focus on tutorials
  EXECUTION: "execution", // Focus on execution flow
};

const MainLayout = () => {
  const [activeLayout, setActiveLayout] = useState(LAYOUTS.EXPLORER);
  const [selectedModule, setSelectedModule] = useState(null);
  const [selectedPath, setSelectedPath] = useState(null);
  const [executionState, setExecutionState] = useState({
    isPlaying: false,
    currentStep: 0,
  });
  const { darkMode } = useTheme();

  // Layout configurations for different modes
  const layoutConfigs = {
    [LAYOUTS.EXPLORER]: {
      leftWidth: "w-1/4",
      centerWidth: "w-2/4",
      rightWidth: "w-1/4",
      leftComponent: <ModuleExplorer onSelectModule={setSelectedModule} />,
      centerComponent: <CodeEditor module={selectedModule} />,
      rightComponent: <ExecutionVisualizer compact={true} />,
    },
    [LAYOUTS.LEARNING]: {
      leftWidth: "w-1/5",
      centerWidth: "w-3/5",
      rightWidth: "w-1/5",
      leftComponent: <LearningPathNavigator onSelectPath={setSelectedPath} />,
      centerComponent: <CodeEditor readOnly={false} path={selectedPath} />,
      rightComponent: (
        <div className="p-4">
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
      ),
    },
    [LAYOUTS.EXECUTION]: {
      leftWidth: "w-1/5",
      centerWidth: "w-2/5",
      rightWidth: "w-2/5",
      leftComponent: (
        <ModuleExplorer compact={true} onSelectModule={setSelectedModule} />
      ),
      centerComponent: <CodeEditor readOnly={true} module={selectedModule} />,
      rightComponent: (
        <ExecutionVisualizer
          playing={executionState.isPlaying}
          currentStep={executionState.currentStep}
          onStateChange={setExecutionState}
        />
      ),
    },
  };

  const currentConfig = layoutConfigs[activeLayout];

  return (
    <div className="flex flex-col h-screen">
      <Navbar activeLayout={activeLayout} onLayoutChange={setActiveLayout} />

      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel - Adjustable width based on layout */}
        <motion.div
          layout
          className={`${currentConfig.leftWidth} h-full border-r border-gray-200 dark:border-gray-700 overflow-auto`}
        >
          {currentConfig.leftComponent}
        </motion.div>

        {/* Center Panel - Code Display */}
        <motion.div
          layout
          className={`${currentConfig.centerWidth} h-full overflow-auto`}
        >
          {currentConfig.centerComponent}
        </motion.div>

        {/* Right Panel - Visualization or Details */}
        <motion.div
          layout
          className={`${currentConfig.rightWidth} h-full border-l border-gray-200 dark:border-gray-700 overflow-auto`}
        >
          {currentConfig.rightComponent}
        </motion.div>
      </div>
    </div>
  );
};

export default MainLayout;
