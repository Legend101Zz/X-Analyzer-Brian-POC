import React from "react";
import { motion } from "framer-motion";

const ExecutionControls = ({
  isPlaying,
  canGoBack,
  canGoForward,
  onPlayPause,
  onStepBack,
  onStepForward,
}) => {
  return (
    <div className="flex justify-center items-center space-x-3">
      <button
        onClick={onStepBack}
        disabled={!canGoBack}
        className={`p-2 rounded-full ${
          canGoBack
            ? "text-neuron-primary dark:text-neuron-secondary hover:bg-gray-100 dark:hover:bg-gray-700"
            : "text-gray-400 dark:text-gray-600 cursor-not-allowed"
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
        onClick={onPlayPause}
        className="p-2 rounded-full bg-neuron-primary dark:bg-neuron-secondary text-white hover:bg-neuron-accent dark:hover:bg-neuron-primary transition-colors shadow-neuron"
      >
        {isPlaying ? (
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
              d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"
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
              d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        )}
      </button>

      <button
        onClick={onStepForward}
        disabled={!canGoForward}
        className={`p-2 rounded-full ${
          canGoForward
            ? "text-neuron-primary dark:text-neuron-secondary hover:bg-gray-100 dark:hover:bg-gray-700"
            : "text-gray-400 dark:text-gray-600 cursor-not-allowed"
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
  );
};

export default ExecutionControls;
