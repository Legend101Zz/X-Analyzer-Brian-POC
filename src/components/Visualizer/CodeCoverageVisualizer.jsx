import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

// This component visualizes code coverage data across the codebase
const CodeCoverageVisualizer = ({
  coverageData = null,
  moduleFilter = null,
}) => {
  const [filteredData, setFilteredData] = useState([]);
  const [totalCoverage, setTotalCoverage] = useState(0);
  const [sortBy, setSortBy] = useState("coverage"); // coverage, name, size
  const [sortOrder, setSortOrder] = useState("desc"); // asc, desc
  const [expandedModules, setExpandedModules] = useState({});

  useEffect(() => {
    // In a real app, this would be fetched from an API
    // For demo, we'll create sample coverage data
    const sampleCoverageData = [
      {
        module: "brian2.core.magic",
        files: [
          {
            name: "magic.py",
            lines: 461,
            covered: 402,
            functions: [
              { name: "run", covered: true, lines: 59, coveredLines: 58 },
              {
                name: "MagicNetwork.run",
                covered: true,
                lines: 9,
                coveredLines: 9,
              },
            ],
          },
        ],
        totalLines: 461,
        coveredLines: 402,
        percentage: 87.2,
      },
      {
        module: "brian2.core.network",
        files: [
          {
            name: "network.py",
            lines: 1214,
            covered: 1005,
            functions: [
              {
                name: "Network.run",
                covered: true,
                lines: 152,
                coveredLines: 152,
              },
              {
                name: "Network.before_run",
                covered: true,
                lines: 101,
                coveredLines: 98,
              },
              {
                name: "Network._nextclocks",
                covered: true,
                lines: 14,
                coveredLines: 14,
              },
              {
                name: "Network.run_main_loop",
                covered: true,
                lines: 60,
                coveredLines: 58,
              },
              {
                name: "Network.after_run",
                covered: true,
                lines: 6,
                coveredLines: 6,
              },
            ],
          },
        ],
        totalLines: 1214,
        coveredLines: 1005,
        percentage: 82.8,
      },
      {
        module: "brian2.core.base",
        files: [
          {
            name: "base.py",
            lines: 852,
            covered: 712,
            functions: [
              {
                name: "BrianObject.before_run",
                covered: true,
                lines: 7,
                coveredLines: 7,
              },
              {
                name: "BrianObject.run",
                covered: true,
                lines: 3,
                coveredLines: 3,
              },
              {
                name: "BrianObject.after_run",
                covered: true,
                lines: 6,
                coveredLines: 6,
              },
            ],
          },
        ],
        totalLines: 852,
        coveredLines: 712,
        percentage: 83.6,
      },
      {
        module: "brian2.core.clocks",
        files: [
          {
            name: "clocks.py",
            lines: 320,
            covered: 256,
            functions: [
              {
                name: "Clock.set_interval",
                covered: true,
                lines: 24,
                coveredLines: 22,
              },
            ],
          },
        ],
        totalLines: 320,
        coveredLines: 256,
        percentage: 80.0,
      },
      {
        module: "brian2.groups.neurongroup",
        files: [
          {
            name: "neurongroup.py",
            lines: 1250,
            covered: 875,
            functions: [
              {
                name: "NeuronGroup.__init__",
                covered: true,
                lines: 305,
                coveredLines: 295,
              },
            ],
          },
        ],
        totalLines: 1250,
        coveredLines: 875,
        percentage: 70.0,
      },
      {
        module: "brian2.monitors.statemonitor",
        files: [
          {
            name: "statemonitor.py",
            lines: 425,
            covered: 320,
            functions: [
              {
                name: "StateMonitor.__init__",
                covered: true,
                lines: 120,
                coveredLines: 105,
              },
            ],
          },
        ],
        totalLines: 425,
        coveredLines: 320,
        percentage: 75.3,
      },
    ];

    // Use provided data or sample data
    const data = coverageData || sampleCoverageData;

    // Apply module filtering if any
    const filtered = moduleFilter
      ? data.filter((item) => item.module.includes(moduleFilter))
      : data;

    // Calculate total coverage
    const totalLines = filtered.reduce((sum, item) => sum + item.totalLines, 0);
    const totalCovered = filtered.reduce(
      (sum, item) => sum + item.coveredLines,
      0,
    );
    const overallPercentage =
      totalLines > 0 ? (totalCovered / totalLines) * 100 : 0;

    setTotalCoverage(overallPercentage);

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === "coverage") {
        return sortOrder === "asc"
          ? a.percentage - b.percentage
          : b.percentage - a.percentage;
      } else if (sortBy === "name") {
        return sortOrder === "asc"
          ? a.module.localeCompare(b.module)
          : b.module.localeCompare(a.module);
      } else if (sortBy === "size") {
        return sortOrder === "asc"
          ? a.totalLines - b.totalLines
          : b.totalLines - a.totalLines;
      }
      return 0;
    });

    setFilteredData(sorted);
  }, [coverageData, moduleFilter, sortBy, sortOrder]);

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  const toggleModuleExpanded = (module) => {
    setExpandedModules((prev) => ({
      ...prev,
      [module]: !prev[module],
    }));
  };

  const getCoverageColorClass = (percentage) => {
    if (percentage >= 80) return "bg-green-500";
    if (percentage >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex justify-between items-center">
        <div>
          <h3 className="text-sm font-medium">Code Coverage Analysis</h3>
          <p className="text-xs text-neuron-text-muted-light dark:text-neuron-text-muted-dark mt-1">
            Displaying coverage for execution path
          </p>
        </div>

        <div className="text-center">
          <div className="text-xl font-semibold">
            {totalCoverage.toFixed(1)}%
          </div>
          <div className="text-xs text-neuron-text-muted-light dark:text-neuron-text-muted-dark">
            Overall Coverage
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="p-1">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800 text-xs">
                <th
                  className="p-2 text-left cursor-pointer"
                  onClick={() => toggleSort("name")}
                >
                  <div className="flex items-center">
                    <span>Module</span>
                    {sortBy === "name" && (
                      <svg
                        className="w-3 h-3 ml-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        {sortOrder === "asc" ? (
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 15l7-7 7 7"
                          />
                        ) : (
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        )}
                      </svg>
                    )}
                  </div>
                </th>
                <th
                  className="p-2 text-right cursor-pointer"
                  onClick={() => toggleSort("size")}
                >
                  <div className="flex items-center justify-end">
                    <span>Lines</span>
                    {sortBy === "size" && (
                      <svg
                        className="w-3 h-3 ml-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        {sortOrder === "asc" ? (
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 15l7-7 7 7"
                          />
                        ) : (
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        )}
                      </svg>
                    )}
                  </div>
                </th>
                <th
                  className="p-2 text-right cursor-pointer"
                  onClick={() => toggleSort("coverage")}
                >
                  <div className="flex items-center justify-end">
                    <span>Coverage</span>
                    {sortBy === "coverage" && (
                      <svg
                        className="w-3 h-3 ml-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        {sortOrder === "asc" ? (
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 15l7-7 7 7"
                          />
                        ) : (
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        )}
                      </svg>
                    )}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((module, index) => (
                <React.Fragment key={module.module}>
                  <tr
                    className={`text-xs hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer ${
                      index % 2 === 0
                        ? "bg-white dark:bg-gray-900"
                        : "bg-gray-50 dark:bg-gray-800"
                    }`}
                    onClick={() => toggleModuleExpanded(module.module)}
                  >
                    <td className="p-2 font-medium">
                      <div className="flex items-center">
                        <svg
                          className={`w-3 h-3 mr-1 transition-transform ${
                            expandedModules[module.module]
                              ? "transform rotate-90"
                              : ""
                          }`}
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
                        {module.module}
                      </div>
                    </td>
                    <td className="p-2 text-right">
                      {module.coveredLines}/{module.totalLines}
                    </td>
                    <td className="p-2">
                      <div className="flex items-center justify-end">
                        <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full mr-2 overflow-hidden">
                          <div
                            className={`h-full ${getCoverageColorClass(module.percentage)}`}
                            style={{ width: `${module.percentage}%` }}
                          ></div>
                        </div>
                        <span>{module.percentage.toFixed(1)}%</span>
                      </div>
                    </td>
                  </tr>

                  {expandedModules[module.module] && (
                    <>
                      {module.files.map((file) => (
                        <tr
                          key={`${module.module}-${file.name}`}
                          className="text-xs bg-gray-100 dark:bg-gray-850"
                        >
                          <td className="pl-8 py-1 pr-2 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex items-center">
                              <svg
                                className="w-3.5 h-3.5 mr-1 text-blue-500"
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
                              {file.name}
                            </div>
                          </td>
                          <td className="py-1 px-2 text-right border-t border-gray-200 dark:border-gray-700">
                            {file.covered}/{file.lines}
                          </td>
                          <td className="py-1 px-2 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-end">
                              <div className="w-16 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full mr-2 overflow-hidden">
                                <div
                                  className={`h-full ${getCoverageColorClass((file.covered / file.lines) * 100)}`}
                                  style={{
                                    width: `${(file.covered / file.lines) * 100}%`,
                                  }}
                                ></div>
                              </div>
                              <span>
                                {((file.covered / file.lines) * 100).toFixed(1)}
                                %
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}

                      {/* Function level */}
                      {module.files.map((file) =>
                        file.functions.map((func) => (
                          <tr
                            key={`${module.module}-${file.name}-${func.name}`}
                            className="text-xs bg-gray-100 dark:bg-gray-850"
                          >
                            <td className="pl-12 py-1 pr-2 border-t border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400">
                              <div className="flex items-center">
                                <svg
                                  className="w-3 h-3 mr-1 text-purple-500"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                                  />
                                </svg>
                                {func.name}
                              </div>
                            </td>
                            <td className="py-1 px-2 text-right border-t border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400">
                              {func.coveredLines}/{func.lines}
                            </td>
                            <td className="py-1 px-2 border-t border-gray-200 dark:border-gray-700">
                              <div className="flex items-center justify-end">
                                <div className="w-16 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full mr-2 overflow-hidden">
                                  <div
                                    className={`h-full ${getCoverageColorClass((func.coveredLines / func.lines) * 100)}`}
                                    style={{
                                      width: `${(func.coveredLines / func.lines) * 100}%`,
                                    }}
                                  ></div>
                                </div>
                                <span className="text-gray-600 dark:text-gray-400">
                                  {(
                                    (func.coveredLines / func.lines) *
                                    100
                                  ).toFixed(1)}
                                  %
                                </span>
                              </div>
                            </td>
                          </tr>
                        )),
                      )}
                    </>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Coverage summary footer */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <div className="flex justify-between items-center">
          <div className="text-xs">
            <div className="mb-1 font-medium">Coverage Legend:</div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded bg-green-500 mr-1"></div>
                <span>≥80% (Good)</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded bg-yellow-500 mr-1"></div>
                <span>60-79% (Average)</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded bg-red-500 mr-1"></div>
                <span>&lt;60% (Poor)</span>
              </div>
            </div>
          </div>

          <div className="text-right text-xs">
            <div>
              Total lines:{" "}
              {filteredData.reduce((sum, module) => sum + module.totalLines, 0)}
            </div>
            <div>
              Covered lines:{" "}
              {filteredData.reduce(
                (sum, module) => sum + module.coveredLines,
                0,
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeCoverageVisualizer;
