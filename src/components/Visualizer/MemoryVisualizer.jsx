import React, { useState } from "react";
import { motion } from "framer-motion";

const MemoryVisualizer = ({ memoryState = [] }) => {
  const [selectedObject, setSelectedObject] = useState(null);
  const [viewMode, setViewMode] = useState("list"); // list, chart, heap

  if (memoryState.length === 0) {
    return (
      <div className="p-4 text-center text-neuron-text-muted-light dark:text-neuron-text-muted-dark">
        No memory data available
      </div>
    );
  }

  const totalMemory = memoryState.reduce(
    (sum, obj) => sum + parseFloat(obj.size.replace(" MB", "")),
    0,
  );

  // Calculate percentages for visualization
  const memoryWithPercentage = memoryState.map((obj) => {
    const sizeInMB = parseFloat(obj.size.replace(" MB", ""));
    const percentage = (sizeInMB / totalMemory) * 100;
    return { ...obj, percentage };
  });

  // Group by object type
  const groupedByType = memoryState.reduce((groups, obj) => {
    const { type } = obj;
    if (!groups[type]) {
      groups[type] = {
        count: 0,
        size: 0,
      };
    }
    groups[type].count += 1;
    groups[type].size += parseFloat(obj.size.replace(" MB", ""));
    return groups;
  }, {});

  return (
    <div className="h-full flex flex-col">
      <div className="p-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex justify-between items-center">
        <h3 className="text-xs font-medium">Memory Inspector</h3>

        <div className="flex bg-gray-100 dark:bg-gray-700 rounded-md p-0.5">
          <button
            onClick={() => setViewMode("list")}
            className={`px-2 py-0.5 text-xs rounded ${
              viewMode === "list"
                ? "bg-white dark:bg-gray-600 shadow-sm"
                : "text-gray-500 dark:text-gray-400"
            }`}
          >
            List
          </button>
          <button
            onClick={() => setViewMode("chart")}
            className={`px-2 py-0.5 text-xs rounded ${
              viewMode === "chart"
                ? "bg-white dark:bg-gray-600 shadow-sm"
                : "text-gray-500 dark:text-gray-400"
            }`}
          >
            Chart
          </button>
          <button
            onClick={() => setViewMode("heap")}
            className={`px-2 py-0.5 text-xs rounded ${
              viewMode === "heap"
                ? "bg-white dark:bg-gray-600 shadow-sm"
                : "text-gray-500 dark:text-gray-400"
            }`}
          >
            Heap
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {viewMode === "list" && (
          <div className="p-2">
            <div className="text-xs text-neuron-text-muted-light dark:text-neuron-text-muted-dark mb-2">
              Total memory usage: {totalMemory.toFixed(1)} MB
            </div>

            <div className="space-y-1">
              {memoryWithPercentage.map((obj) => (
                <motion.div
                  key={obj.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`p-2 rounded-md border ${
                    selectedObject === obj.id
                      ? "border-neuron-primary bg-neuron-primary bg-opacity-5"
                      : "border-gray-200 dark:border-gray-700 hover:border-neuron-primary"
                  } cursor-pointer`}
                  onClick={() =>
                    setSelectedObject(selectedObject === obj.id ? null : obj.id)
                  }
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center">
                        <span className="font-mono text-xs">{obj.address}</span>
                        <span className="ml-2 bg-neuron-secondary bg-opacity-10 text-neuron-secondary text-xs px-1.5 py-0.5 rounded">
                          {obj.type}
                        </span>
                      </div>

                      <div className="mt-1 text-xs text-neuron-text-muted-light dark:text-neuron-text-muted-dark">
                        {obj.allocation}
                      </div>
                    </div>

                    <div className="text-xs font-medium">{obj.size}</div>
                  </div>

                  <div className="mt-1 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                    <div
                      className="bg-neuron-primary dark:bg-neuron-secondary h-1.5 rounded-full"
                      style={{ width: `${obj.percentage}%` }}
                    ></div>
                  </div>

                  {selectedObject === obj.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700 text-xs"
                    >
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                        <div>
                          <span className="text-neuron-text-muted-light dark:text-neuron-text-muted-dark">
                            References:
                          </span>{" "}
                          <span className="font-medium">{obj.references}</span>
                        </div>
                        <div>
                          <span className="text-neuron-text-muted-light dark:text-neuron-text-muted-dark">
                            Size:
                          </span>{" "}
                          <span className="font-medium">{obj.size}</span>
                        </div>
                        <div className="col-span-2 mt-1">
                          <span className="text-neuron-text-muted-light dark:text-neuron-text-muted-dark">
                            Referenced by:
                          </span>
                          <div className="mt-1 bg-gray-50 dark:bg-gray-800 p-1 rounded">
                            <div className="font-mono">
                              Network (0x7f8a4c2d0000)
                            </div>
                            <div className="font-mono">
                              MagicNetwork (0x7f8a4c2d0500)
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {viewMode === "chart" && (
          <div className="p-3">
            <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
              <h4 className="text-xs font-medium mb-3">Memory Usage by Type</h4>

              {/* Donut chart */}
              <div className="relative w-full aspect-square max-w-xs mx-auto">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  {/* This would be a real chart in production */}
                  <circle cx="50" cy="50" r="40" fill="#f3f4f6" />

                  {/* Simulated pie chart segments */}
                  <path d="M50,50 L50,10 A40,40 0 0,1 85,65 Z" fill="#818cf8" />
                  <path d="M50,50 L85,65 A40,40 0 0,1 20,65 Z" fill="#34d399" />
                  <path d="M50,50 L20,65 A40,40 0 0,1 50,10 Z" fill="#fb923c" />

                  {/* Center hole for donut chart */}
                  <circle
                    cx="50"
                    cy="50"
                    r="25"
                    fill="white"
                    className="dark:fill-gray-800"
                  />
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <div className="text-xl font-bold">
                    {totalMemory.toFixed(1)}
                  </div>
                  <div className="text-xs text-neuron-text-muted-light dark:text-neuron-text-muted-dark">
                    MB Total
                  </div>
                </div>
              </div>

              {/* Legend */}
              <div className="mt-4 grid grid-cols-1 gap-2">
                {Object.entries(groupedByType).map(([type, data], index) => {
                  const colors = [
                    "#818cf8",
                    "#34d399",
                    "#fb923c",
                    "#f87171",
                    "#60a5fa",
                  ];
                  const color = colors[index % colors.length];

                  return (
                    <div
                      key={type}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center">
                        <div
                          className="w-3 h-3 rounded-sm mr-2"
                          style={{ backgroundColor: color }}
                        ></div>
                        <span className="text-xs">{type}</span>
                      </div>
                      <div className="text-xs font-medium">
                        {data.size.toFixed(1)} MB ({data.count} objects)
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-3 bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
              <h4 className="text-xs font-medium mb-2">
                Memory Allocation Timeline
              </h4>

              <div className="h-20 bg-gray-50 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600">
                {/* Simulated timeline chart */}
                <div className="relative w-full h-full">
                  {/* X-axis */}
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-200 dark:bg-gray-600"></div>

                  {/* Y-axis */}
                  <div className="absolute top-0 bottom-0 left-0 w-0.5 bg-gray-200 dark:bg-gray-600"></div>

                  {/* Data line */}
                  <svg
                    className="absolute inset-0"
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                  >
                    <polyline
                      points="0,100 10,90 20,85 30,70 40,60 50,55 60,40 70,35 80,30 90,25 100,20"
                      fill="none"
                      stroke="#818cf8"
                      strokeWidth="2"
                    />
                  </svg>

                  {/* Current position indicator */}
                  <div className="absolute bottom-0 left-1/2 w-0.5 h-full bg-red-500 bg-opacity-50"></div>
                </div>
              </div>

              <div className="mt-1 flex justify-between text-xs text-neuron-text-muted-light dark:text-neuron-text-muted-dark">
                <span>Start</span>
                <span>Execution Progress</span>
                <span>End</span>
              </div>
            </div>
          </div>
        )}

        {viewMode === "heap" && (
          <div className="p-2">
            <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
              <h4 className="text-xs font-medium mb-2">Heap Visualization</h4>

              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md relative h-64 overflow-hidden">
                {/* This would be a real force-directed graph in production */}
                {memoryState.map((obj, index) => {
                  // Position objects randomly for the demo
                  const left = 10 + ((index * 30) % 85);
                  const top = 10 + Math.floor((index * 30) / 85) * 30;
                  const size = parseFloat(obj.size.replace(" MB", "")) * 10;

                  return (
                    <div
                      key={obj.id}
                      className={`absolute rounded-full flex items-center justify-center border-2 ${
                        obj.type === "NeuronGroup"
                          ? "bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-700"
                          : obj.type === "StateMonitor"
                            ? "bg-green-100 dark:bg-green-900 border-green-300 dark:border-green-700"
                            : "bg-orange-100 dark:bg-orange-900 border-orange-300 dark:border-orange-700"
                      }`}
                      style={{
                        left: `${left}%`,
                        top: `${top}%`,
                        width: `${Math.max(30, size)}px`,
                        height: `${Math.max(30, size)}px`,
                      }}
                    >
                      <span className="text-xs font-medium truncate max-w-full px-1">
                        {obj.type}
                      </span>
                    </div>
                  );
                })}

                {/* Simplified reference lines */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  <line
                    x1="20%"
                    y1="20%"
                    x2="40%"
                    y2="20%"
                    stroke="#9ca3af"
                    strokeWidth="1"
                    strokeDasharray="4"
                  />
                  <line
                    x1="50%"
                    y1="20%"
                    x2="70%"
                    y2="50%"
                    stroke="#9ca3af"
                    strokeWidth="1"
                    strokeDasharray="4"
                  />
                  <line
                    x1="20%"
                    y1="50%"
                    x2="40%"
                    y2="50%"
                    stroke="#9ca3af"
                    strokeWidth="1"
                    strokeDasharray="4"
                  />
                </svg>
              </div>

              <div className="mt-3 text-xs space-y-1">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-blue-300 dark:bg-blue-700 mr-2"></div>
                  <span>NeuronGroup</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-green-300 dark:bg-green-700 mr-2"></div>
                  <span>StateMonitor</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-orange-300 dark:bg-orange-700 mr-2"></div>
                  <span>Clock</span>
                </div>
              </div>
            </div>

            <div className="mt-3 text-xs text-neuron-text-muted-light dark:text-neuron-text-muted-dark text-center p-2 bg-yellow-50 dark:bg-yellow-900 dark:bg-opacity-30 rounded-md">
              <p>
                The size of each node represents its memory footprint. Lines
                represent references between objects.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MemoryVisualizer;
