import React from "react";
import { motion } from "framer-motion";

const LoadingScreen = ({ progress = 0, message = "Loading..." }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white dark:bg-gray-900">
      <div className="w-full max-w-md px-4">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: "loop",
            }}
            className="text-4xl font-bold text-center text-neuron-primary dark:text-neuron-secondary flex items-center"
          >
            <svg
              className="w-12 h-12 mr-2"
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
          </motion.div>
        </div>

        {/* Loading animation - neural connections */}
        <div className="relative w-full h-40 mb-8">
          <svg className="w-full h-full" viewBox="0 0 100 100">
            {/* Central Node */}
            <motion.circle
              cx="50"
              cy="50"
              r="5"
              fill="#818cf8"
              animate={{
                r: [5, 6, 5],
                fillOpacity: [0.6, 1, 0.6],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: "loop",
              }}
            />

            {/* Connected Nodes and Connections */}
            {[
              { x: 20, y: 20 },
              { x: 80, y: 20 },
              { x: 20, y: 80 },
              { x: 80, y: 80 },
              { x: 35, y: 30 },
              { x: 65, y: 30 },
              { x: 35, y: 70 },
              { x: 65, y: 70 },
            ].map((node, index) => (
              <React.Fragment key={index}>
                <motion.line
                  x1="50"
                  y1="50"
                  x2={node.x}
                  y2={node.y}
                  stroke="#818cf8"
                  strokeWidth="1"
                  strokeDasharray="3 2"
                  animate={{
                    strokeOpacity: [0.2, 0.8, 0.2],
                  }}
                  transition={{
                    duration: 1.5,
                    delay: index * 0.2,
                    repeat: Infinity,
                    repeatType: "loop",
                  }}
                  className="neural-connection"
                />
                <motion.circle
                  cx={node.x}
                  cy={node.y}
                  r="3"
                  fill="#818cf8"
                  animate={{
                    r: [3, 4, 3],
                    fillOpacity: [0.4, 0.8, 0.4],
                  }}
                  transition={{
                    duration: 2,
                    delay: index * 0.2,
                    repeat: Infinity,
                    repeatType: "loop",
                  }}
                />
              </React.Fragment>
            ))}

            {/* Animated pulses along connections */}
            {[
              { x: 20, y: 20 },
              { x: 80, y: 20 },
              { x: 20, y: 80 },
              { x: 80, y: 80 },
            ].map((node, index) => (
              <motion.circle
                key={`pulse-${index}`}
                cx="50"
                cy="50"
                r="2"
                fill="#34d399"
                animate={{
                  cx: ["50", node.x],
                  cy: ["50", node.y],
                  opacity: [1, 0],
                  scale: [1, 1.5],
                }}
                transition={{
                  duration: 1.5,
                  delay: index * 0.5,
                  repeat: Infinity,
                  repeatType: "loop",
                }}
              />
            ))}
          </svg>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-4">
          <motion.div
            className="bg-neuron-primary dark:bg-neuron-secondary h-2.5 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>

        {/* Loading message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          key={message} // This forces re-animation when message changes
          transition={{ duration: 0.3 }}
          className="text-center text-neuron-text-light dark:text-neuron-text-dark"
        >
          {message}
        </motion.div>

        {/* Loading percentage */}
        <div className="text-center text-sm text-neuron-text-muted-light dark:text-neuron-text-muted-dark mt-2">
          {progress}% Complete
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
