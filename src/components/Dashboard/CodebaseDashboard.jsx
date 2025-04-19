import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

// Chart components would be imported from a library like recharts in a real implementation

const CodebaseDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview"); // overview, activity, insights
  const [codeMetrics, setCodeMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, this would be fetched from an API
    // For this demo, we'll use sample data
    const sampleMetrics = {
      totalFiles: 235,
      totalLines: 52890,
      totalClasses: 87,
      totalFunctions: 624,
      linesPerModule: [
        { name: "core", value: 14560 },
        { name: "units", value: 7890 },
        { name: "groups", value: 9450 },
        { name: "monitors", value: 5670 },
        { name: "synapses", value: 6320 },
        { name: "codegen", value: 5680 },
        { name: "other", value: 3320 },
      ],
      moduleActivity: [
        { name: "core.magic", changes: 58 },
        { name: "core.network", changes: 124 },
        { name: "groups.neurongroup", changes: 87 },
        { name: "synapses.synapses", changes: 96 },
        { name: "monitors.statemonitor", changes: 45 },
      ],
      complexity: {
        simple: 412,
        moderate: 156,
        complex: 56,
      },
      dependencies: [
        { module: "core", inbound: 85, outbound: 12 },
        { module: "units", inbound: 56, outbound: 3 },
        { module: "groups", inbound: 34, outbound: 18 },
        { module: "monitors", inbound: 12, outbound: 24 },
        { module: "synapses", inbound: 18, outbound: 22 },
      ],
      executionPatterns: [
        { path: "core.magic → core.network → core.base", frequency: 78 },
        { path: "core.network → core.clocks", frequency: 56 },
        { path: "core.network → groups.neurongroup", frequency: 42 },
        { path: "groups.neurongroup → units", frequency: 38 },
      ],
    };

    // Simulate loading delay
    setTimeout(() => {
      setCodeMetrics(sampleMetrics);
      setLoading(false);
    }, 500);
  }, []);

  if (loading) {
    return (
      <div className="h-full flex justify-center items-center">
        <div className="text-center">
          <div className="w-10 h-10 border-t-2 border-b-2 border-neuron-primary animate-spin rounded-full mx-auto"></div>
          <div className="mt-2 text-neuron-text-muted-light dark:text-neuron-text-muted-dark">
            Loading codebase metrics...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="border-b border-gray-200 dark:border-gray-700">
        <div className="flex">
          {["overview", "activity", "insights"].map((tab) => (
            <button
              key={tab}
              className={`px-4 py-3 text-sm font-medium relative ${
                activeTab === tab
                  ? "text-neuron-primary dark:text-neuron-secondary"
                  : "text-neuron-text-muted-light dark:text-neuron-text-muted-dark hover:text-neuron-text-light dark:hover:text-neuron-text-dark"
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {activeTab === tab && (
                <motion.div
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-neuron-primary dark:bg-neuron-secondary"
                  layoutId="dashboardTabIndicator"
                />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4">
        {activeTab === "overview" && (
          <div className="space-y-4">
            {/* Summary Cards */}
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
                <div className="text-xs text-neuron-text-muted-light dark:text-neuron-text-muted-dark">
                  Total Files
                </div>
                <div className="text-2xl font-semibold mt-1">
                  {codeMetrics.totalFiles}
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
                <div className="text-xs text-neuron-text-muted-light dark:text-neuron-text-muted-dark">
                  Total Lines
                </div>
                <div className="text-2xl font-semibold mt-1">
                  {codeMetrics.totalLines.toLocaleString()}
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
                <div className="text-xs text-neuron-text-muted-light dark:text-neuron-text-muted-dark">
                  Classes
                </div>
                <div className="text-2xl font-semibold mt-1">
                  {codeMetrics.totalClasses}
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
                <div className="text-xs text-neuron-text-muted-light dark:text-neuron-text-muted-dark">
                  Functions
                </div>
                <div className="text-2xl font-semibold mt-1">
                  {codeMetrics.totalFunctions}
                </div>
              </div>
            </div>

            {/* Lines per module visualization */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-medium mb-3">
                Code Distribution by Module
              </h3>
              <div className="h-60">
                {/* This would be a real chart in production - using a placeholder for demo */}
                <div className="w-full h-full flex items-end space-x-2">
                  {codeMetrics.linesPerModule.map((module) => {
                    const maxValue = Math.max(
                      ...codeMetrics.linesPerModule.map((m) => m.value),
                    );
                    const heightPercentage = (module.value / maxValue) * 100;

                    return (
                      <div
                        key={module.name}
                        className="flex-1 flex flex-col items-center"
                      >
                        <div className="w-full bg-neuron-primary bg-opacity-20 dark:bg-opacity-40 rounded-t hover:bg-opacity-30 dark:hover:bg-opacity-50 transition-colors relative group">
                          <div
                            className="bg-neuron-primary dark:bg-neuron-secondary w-full absolute bottom-0 rounded-t"
                            style={{ height: `${heightPercentage}%` }}
                          ></div>
                          <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded px-2 py-1 pointer-events-none transition-opacity whitespace-nowrap">
                            {module.value.toLocaleString()} lines
                          </div>
                        </div>
                        <div className="text-xs mt-2 text-center">
                          {module.name}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Complexity distribution */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-medium mb-3">
                Code Complexity Distribution
              </h3>
              <div className="flex justify-center items-center h-40">
                {/* This would be a real pie chart in production */}
                <div className="relative w-40 h-40">
                  <svg
                    viewBox="0 0 100 100"
                    className="w-full h-full transform -rotate-90"
                  >
                    {/* This is a simplified pie chart representation */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                      stroke="#10B981"
                      strokeWidth="20"
                      strokeDasharray="175 251"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                      stroke="#F59E0B"
                      strokeWidth="20"
                      strokeDasharray="49 251"
                      strokeDashoffset="-175"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                      stroke="#EF4444"
                      strokeWidth="20"
                      strokeDasharray="27 251"
                      strokeDashoffset="-224"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="text-sm font-medium">
                      {codeMetrics.totalFunctions}
                    </div>
                    <div className="text-xs text-neuron-text-muted-light dark:text-neuron-text-muted-dark">
                      Total
                    </div>
                  </div>
                </div>

                <div className="ml-8 space-y-2">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-sm mr-2"></div>
                    <div className="text-xs">
                      <span className="font-medium">
                        {codeMetrics.complexity.simple}
                      </span>{" "}
                      Simple Functions
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-yellow-500 rounded-sm mr-2"></div>
                    <div className="text-xs">
                      <span className="font-medium">
                        {codeMetrics.complexity.moderate}
                      </span>{" "}
                      Moderate Complexity
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-red-500 rounded-sm mr-2"></div>
                    <div className="text-xs">
                      <span className="font-medium">
                        {codeMetrics.complexity.complex}
                      </span>{" "}
                      Complex Functions
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Module dependency visualization */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-medium mb-3">Module Dependencies</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full text-xs">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-800">
                      <th className="p-2 text-left">Module</th>
                      <th className="p-2 text-right">Inbound</th>
                      <th className="p-2 text-right">Outbound</th>
                      <th className="p-2 text-left">Dependency Ratio</th>
                    </tr>
                  </thead>
                  <tbody>
                    {codeMetrics.dependencies.map((dep, index) => (
                      <tr
                        key={dep.module}
                        className={
                          index % 2 === 0
                            ? "bg-white dark:bg-gray-900"
                            : "bg-gray-50 dark:bg-gray-800"
                        }
                      >
                        <td className="p-2 font-medium">{dep.module}</td>
                        <td className="p-2 text-right">{dep.inbound}</td>
                        <td className="p-2 text-right">{dep.outbound}</td>
                        <td className="p-2">
                          <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-neuron-primary"
                              style={{
                                width: `${(dep.inbound / (dep.inbound + dep.outbound)) * 100}%`,
                              }}
                            ></div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === "activity" && (
          <div className="space-y-4">
            {/* Module activity */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-medium mb-3">
                Recent Module Changes
              </h3>
              <div className="h-60">
                {/* This would be a real chart in production */}
                <div className="w-full h-full flex items-end space-x-4">
                  {codeMetrics.moduleActivity.map((module) => {
                    const maxValue = Math.max(
                      ...codeMetrics.moduleActivity.map((m) => m.changes),
                    );
                    const heightPercentage = (module.changes / maxValue) * 100;

                    return (
                      <div
                        key={module.name}
                        className="flex-1 flex flex-col items-center"
                      >
                        <div className="w-full bg-neuron-secondary bg-opacity-20 dark:bg-opacity-40 rounded-t hover:bg-opacity-30 dark:hover:bg-opacity-50 transition-colors relative group">
                          <div
                            className="bg-neuron-secondary dark:bg-neuron-primary w-full absolute bottom-0 rounded-t"
                            style={{ height: `${heightPercentage}%` }}
                          ></div>
                          <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded px-2 py-1 pointer-events-none transition-opacity whitespace-nowrap">
                            {module.changes} changes
                          </div>
                        </div>
                        <div
                          className="text-xs mt-2 text-center truncate max-w-full"
                          style={{ width: "100%" }}
                        >
                          {module.name}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Common execution patterns */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-medium mb-3">
                Common Execution Patterns
              </h3>
              <div className="space-y-3">
                {codeMetrics.executionPatterns.map((pattern, index) => {
                  const maxFrequency = Math.max(
                    ...codeMetrics.executionPatterns.map((p) => p.frequency),
                  );
                  const widthPercentage =
                    (pattern.frequency / maxFrequency) * 100;

                  return (
                    <div key={index} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <div className="font-medium">{pattern.path}</div>
                        <div>{pattern.frequency}x</div>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-neuron-synaptic dark:bg-neuron-synaptic"
                          style={{ width: `${widthPercentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === "insights" && (
          <div className="space-y-4">
            {/* Code insights cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-medium flex items-center">
                  <svg
                    className="w-4 h-4 mr-1 text-green-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                  Entry Points
                </h3>
                <div className="mt-3 space-y-2 text-xs">
                  <div className="p-2 bg-green-50 dark:bg-green-900 dark:bg-opacity-20 rounded border border-green-100 dark:border-green-800">
                    <div className="font-medium">brian2.core.magic.run()</div>
                    <div className="text-neuron-text-muted-light dark:text-neuron-text-muted-dark mt-1">
                      Primary entry point for running simulations
                    </div>
                  </div>
                  <div className="p-2 bg-green-50 dark:bg-green-900 dark:bg-opacity-20 rounded border border-green-100 dark:border-green-800">
                    <div className="font-medium">brian2.Network.run()</div>
                    <div className="text-neuron-text-muted-light dark:text-neuron-text-muted-dark mt-1">
                      Direct network execution without magic context
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-medium flex items-center">
                  <svg
                    className="w-4 h-4 mr-1 text-blue-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  Core Components
                </h3>
                <div className="mt-3 space-y-2 text-xs">
                  <div className="p-2 bg-blue-50 dark:bg-blue-900 dark:bg-opacity-20 rounded border border-blue-100 dark:border-blue-800">
                    <div className="font-medium">brian2.NeuronGroup</div>
                    <div className="text-neuron-text-muted-light dark:text-neuron-text-muted-dark mt-1">
                      Primary class for neuron populations (87 references)
                    </div>
                  </div>
                  <div className="p-2 bg-blue-50 dark:bg-blue-900 dark:bg-opacity-20 rounded border border-blue-100 dark:border-blue-800">
                    <div className="font-medium">brian2.Network</div>
                    <div className="text-neuron-text-muted-light dark:text-neuron-text-muted-dark mt-1">
                      Coordinates simulation objects (62 references)
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-medium flex items-center">
                  <svg
                    className="w-4 h-4 mr-1 text-yellow-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Potential Issues
                </h3>
                <div className="mt-3 space-y-2 text-xs">
                  <div className="p-2 bg-yellow-50 dark:bg-yellow-900 dark:bg-opacity-20 rounded border border-yellow-100 dark:border-yellow-800">
                    <div className="font-medium">Circular Dependencies</div>
                    <div className="text-neuron-text-muted-light dark:text-neuron-text-muted-dark mt-1">
                      2 circular dependencies found between core and devices
                      modules
                    </div>
                  </div>
                  <div className="p-2 bg-yellow-50 dark:bg-yellow-900 dark:bg-opacity-20 rounded border border-yellow-100 dark:border-yellow-800">
                    <div className="font-medium">High Complexity</div>
                    <div className="text-neuron-text-muted-light dark:text-neuron-text-muted-dark mt-1">
                      Network.run_main_loop has high cyclomatic complexity (15)
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-medium flex items-center">
                  <svg
                    className="w-4 h-4 mr-1 text-purple-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
                    />
                  </svg>
                  Extension Points
                </h3>
                <div className="mt-3 space-y-2 text-xs">
                  <div className="p-2 bg-purple-50 dark:bg-purple-900 dark:bg-opacity-20 rounded border border-purple-100 dark:border-purple-800">
                    <div className="font-medium">Custom Code Generation</div>
                    <div className="text-neuron-text-muted-light dark:text-neuron-text-muted-dark mt-1">
                      Through brian2.codegen.targets extension mechanisms
                    </div>
                  </div>
                  <div className="p-2 bg-purple-50 dark:bg-purple-900 dark:bg-opacity-20 rounded border border-purple-100 dark:border-purple-800">
                    <div className="font-medium">Custom Devices</div>
                    <div className="text-neuron-text-muted-light dark:text-neuron-text-muted-dark mt-1">
                      Via brian2.devices extension API
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Documentation completeness */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-medium mb-3">
                Documentation Coverage
              </h3>
              <div className="flex items-center">
                <div className="w-full bg-gray-200 dark:bg-gray-700 h-3 rounded-full overflow-hidden mr-4">
                  <div
                    className="h-full bg-blue-500"
                    style={{ width: "76%" }}
                  ></div>
                </div>
                <div className="text-sm font-medium whitespace-nowrap">76%</div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3 text-xs">
                <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded">
                  <div className="font-medium mb-1">Well Documented</div>
                  <div className="space-y-1">
                    <div>core.network</div>
                    <div>groups.neurongroup</div>
                    <div>units</div>
                  </div>
                </div>
                <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded">
                  <div className="font-medium mb-1">Partially Documented</div>
                  <div className="space-y-1">
                    <div>monitors</div>
                    <div>codegen</div>
                    <div>equations</div>
                  </div>
                </div>
                <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded">
                  <div className="font-medium mb-1">Needs Documentation</div>
                  <div className="space-y-1">
                    <div>devices.cpp_standalone</div>
                    <div>parsing</div>
                    <div>utils</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CodebaseDashboard;
