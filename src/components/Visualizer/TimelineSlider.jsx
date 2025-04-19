import React from "react";
import { motion } from "framer-motion";

const TimelineSlider = ({
  events = [],
  currentStep = 0,
  onChange = () => {},
}) => {
  if (!events || events.length === 0) return null;

  const handleSliderChange = (e) => {
    const value = parseInt(e.target.value, 10);
    onChange(value);
  };

  return (
    <div className="w-full">
      <div className="flex justify-between text-xs text-neuron-text-muted-light dark:text-neuron-text-muted-dark mb-1">
        <span>Start</span>
        <span>End</span>
      </div>

      <div className="relative">
        <input
          type="range"
          min={0}
          max={events.length - 1}
          value={currentStep}
          onChange={handleSliderChange}
          className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full appearance-none cursor-pointer"
        />

        <div className="absolute top-0 left-0 right-0 pointer-events-none">
          <div className="relative w-full h-2">
            {events.map((event, index) => (
              <motion.div
                key={event.event_id || index}
                className={`absolute top-0 w-1.5 h-1.5 rounded-full transform -translate-x-1/2 -translate-y-1/4 ${
                  index <= currentStep
                    ? "bg-neuron-primary dark:bg-neuron-secondary"
                    : "bg-gray-400 dark:bg-gray-600"
                }`}
                style={{
                  left: `${(index / (events.length - 1)) * 100}%`,
                  scale: index === currentStep ? 1.5 : 1,
                }}
                animate={{
                  scale: index === currentStep ? 1.5 : 1,
                  backgroundColor:
                    index <= currentStep
                      ? "var(--tw-color-neuron-primary)"
                      : "var(--tw-color-gray-400)",
                }}
                transition={{ duration: 0.2 }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimelineSlider;
