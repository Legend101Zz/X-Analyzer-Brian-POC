import React from "react";
import { motion } from "framer-motion";

const CallStackVisualizer = ({ frames = [] }) => {
  if (frames.length === 0) {
    return (
      <div className="p-4 text-center text-neuron-text-muted-light dark:text-neuron-text-muted-dark">
        No active call stack
      </div>
    );
  }

  return (
    <div className="p-2">
      <div className="relative">
        {/* Vertical line connecting frames */}
        <div className="absolute left-4 top-6 bottom-6 w-0.5 bg-gray-200 dark:bg-gray-700" />

        {frames.map((frame, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className={`relative p-3 mb-3 rounded-md border shadow-sm ${
              index === 0
                ? "bg-neuron-primary bg-opacity-5 border-neuron-primary border-opacity-20"
                : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
            }`}
          >
            {/* Connect to vertical line */}
            <div
              className={`absolute left-0 top-1/2 w-4 h-0.5 ${
                index === 0
                  ? "bg-neuron-primary dark:bg-neuron-secondary"
                  : "bg-gray-200 dark:bg-gray-700"
              }`}
            />

            {/* Frame circle indicator */}
            <div
              className={`absolute left-4 top-1/2 w-3 h-3 rounded-full transform -translate-x-1.5 -translate-y-1.5 ${
                index === 0
                  ? "bg-neuron-primary dark:bg-neuron-secondary"
                  : "border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
              }`}
            />

            <div className="ml-6">
              <div className="flex justify-between items-start">
                <div
                  className={`font-medium ${
                    index === 0
                      ? "text-neuron-primary dark:text-neuron-secondary"
                      : "text-neuron-text-light dark:text-neuron-text-dark"
                  }`}
                >
                  {frame.function}
                </div>
                {index === 0 && (
                  <span className="text-xs bg-neuron-primary bg-opacity-10 text-neuron-primary dark:text-neuron-secondary px-2 py-0.5 rounded">
                    Active
                  </span>
                )}
              </div>

              <div className="text-xs text-neuron-text-muted-light dark:text-neuron-text-muted-dark mt-1 flex justify-between">
                <span className="font-mono">
                  {frame.file}:{frame.line}
                </span>
                {Object.keys(frame.locals).length > 0 && (
                  <button className="text-neuron-primary dark:text-neuron-secondary hover:underline focus:outline-none">
                    View Locals
                  </button>
                )}
              </div>

              {/* Collapsible locals section */}
              {index === 0 && Object.keys(frame.locals).length > 0 && (
                <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(frame.locals).map(([name, value]) => (
                      <div key={name} className="text-xs">
                        <span className="font-mono font-medium">{name}</span>
                        <div className="mt-0.5 bg-white dark:bg-gray-700 p-1 rounded font-mono">
                          {value}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default CallStackVisualizer;
