import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import learningPathsData from "../../data/learning_paths.json";

const PathNavigator = ({ onSelectPath }) => {
  const [learningPaths, setLearningPaths] = useState([]);
  const [activePath, setActivePath] = useState(null);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    // In a real app, we might fetch this
    setLearningPaths(learningPathsData.paths);
  }, []);

  const handlePathSelect = (path) => {
    setActivePath(path);
    setActiveStep(0);
    if (path.steps && path.steps.length > 0) {
      onSelectPath(path.steps[0]);
    }
  };

  const handleStepChange = (stepIndex) => {
    if (!activePath || !activePath.steps) return;
    if (stepIndex >= 0 && stepIndex < activePath.steps.length) {
      setActiveStep(stepIndex);
      onSelectPath(activePath.steps[stepIndex]);
    }
  };

  if (learningPaths.length === 0) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-medium text-neuron-text-light dark:text-neuron-text-dark">
          Learning Paths
        </h2>
        <p className="text-sm text-neuron-text-muted-light dark:text-neuron-text-muted-dark mt-1">
          Follow guided steps to understand Brian2
        </p>
      </div>

      <div className="overflow-auto flex-1 p-4">
        {learningPaths.map((path) => (
          <div
            key={path.id}
            className={`mb-3 p-3 rounded-lg border cursor-pointer transition-all ${
              activePath?.id === path.id
                ? "border-neuron-primary bg-neuron-primary bg-opacity-5 dark:bg-opacity-10 shadow-sm"
                : "border-gray-200 dark:border-gray-700 hover:border-neuron-primary"
            }`}
            onClick={() => handlePathSelect(path)}
          >
            <h3 className="font-medium text-neuron-text-light dark:text-neuron-text-dark">
              {path.name}
            </h3>
            <p className="text-sm text-neuron-text-muted-light dark:text-neuron-text-muted-dark mt-1">
              {path.description}
            </p>
          </div>
        ))}
      </div>

      {activePath && activePath.steps && activePath.steps.length > 0 && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-neuron-text-light dark:text-neuron-text-dark">
              {activePath.name} - Step {activeStep + 1}/
              {activePath.steps.length}
            </h3>
            <div className="flex space-x-2">
              <button
                onClick={() => handleStepChange(activeStep - 1)}
                disabled={activeStep === 0}
                className={`p-1 rounded ${
                  activeStep === 0
                    ? "text-gray-400 dark:text-gray-600 cursor-not-allowed"
                    : "text-neuron-primary dark:text-neuron-secondary hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
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
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <button
                onClick={() => handleStepChange(activeStep + 1)}
                disabled={activeStep === activePath.steps.length - 1}
                className={`p-1 rounded ${
                  activeStep === activePath.steps.length - 1
                    ? "text-gray-400 dark:text-gray-600 cursor-not-allowed"
                    : "text-neuron-primary dark:text-neuron-secondary hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
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
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          </div>

          <div className="w-full bg-gray-200 dark:bg-gray-700 h-1 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-neuron-primary dark:bg-neuron-secondary"
              initial={{ width: 0 }}
              animate={{
                width: `${((activeStep + 1) / activePath.steps.length) * 100}%`,
              }}
              transition={{ duration: 0.3 }}
            />
          </div>

          <div className="mt-3">
            {activePath.steps.map((step, index) => (
              <div
                key={step.id}
                className={`py-2 px-3 mb-1 text-sm rounded cursor-pointer ${
                  index === activeStep
                    ? "bg-neuron-primary bg-opacity-10 text-neuron-primary dark:text-neuron-secondary"
                    : "hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
                onClick={() => handleStepChange(index)}
              >
                {step.title}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PathNavigator;
