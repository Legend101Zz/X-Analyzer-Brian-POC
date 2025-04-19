import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCodebase } from "../../contexts/CodebaseContext";

// File type icons based on extension
const FileIcon = ({ fileName, className = "w-5 h-5" }) => {
  const extension = fileName.split(".").pop().toLowerCase();

  // Choose icon based on file extension
  switch (extension) {
    case "py":
      return (
        <svg
          className={`${className} text-blue-500`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
      );
    case "md":
    case "txt":
      return (
        <svg
          className={`${className} text-gray-500`}
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
      );
    case "json":
      return (
        <svg
          className={`${className} text-yellow-500`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7c0-2-1-3-3-3H7c-2 0-3 1-3 3z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 17l-5-5 5-5m6 10l5-5-5-5"
          />
        </svg>
      );
    case "cpp":
    case "h":
      return (
        <svg
          className={`${className} text-green-500`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
          />
        </svg>
      );
    default:
      return (
        <svg
          className={`${className} text-gray-400`}
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
      );
  }
};

// Folder icon component
const FolderIcon = ({ isOpen, className = "w-5 h-5" }) => (
  <svg
    className={`${className} ${isOpen ? "text-yellow-500" : "text-yellow-400"}`}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    {isOpen ? (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z"
      />
    ) : (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
      />
    )}
  </svg>
);

// Tag component for module type
const ModuleTypeTag = ({ type }) => {
  const getTagStyles = () => {
    switch (type) {
      case "core":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:bg-opacity-30 dark:text-blue-300";
      case "extension":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:bg-opacity-30 dark:text-purple-300";
      case "utility":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:bg-opacity-30 dark:text-green-300";
      case "test":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:bg-opacity-30 dark:text-yellow-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  return (
    <span className={`text-xs px-1.5 py-0.5 rounded-sm ${getTagStyles()}`}>
      {type}
    </span>
  );
};

const ModuleTree = ({
  onSelectModule,
  compact = false,
  initialActiveModule = null,
  showFileTypes = true,
}) => {
  const { moduleStructure } = useCodebase();
  const [expandedModules, setExpandedModules] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredStructure, setFilteredStructure] = useState(null);
  const [activeModulePath, setActiveModulePath] = useState(initialActiveModule);
  const [activeTab, setActiveTab] = useState("files"); // files, types, recently
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [showFileInfo, setShowFileInfo] = useState(null);

  // Initialize expanded modules
  useEffect(() => {
    if (moduleStructure && !Object.keys(expandedModules).length) {
      // Auto-expand the first level by default
      const initialExpanded = {};
      moduleStructure.modules.forEach((module) => {
        initialExpanded[module.name] = true;
      });
      setExpandedModules(initialExpanded);
    }
  }, [moduleStructure, expandedModules]);

  // Filter modules based on search
  useEffect(() => {
    if (!moduleStructure) return;

    if (!searchQuery.trim()) {
      setFilteredStructure(moduleStructure);
      return;
    }

    const query = searchQuery.toLowerCase();

    // Helper function to check if a module or its children match the query
    const moduleMatches = (module) => {
      // Check if the module name matches
      if (module.name.toLowerCase().includes(query)) return true;

      // Check if any description matches
      if (module.description?.toLowerCase().includes(query)) return true;

      // Check if any files match
      if (
        module.key_files &&
        module.key_files.some((file) => file.toLowerCase().includes(query))
      ) {
        return true;
      }

      // Check if any child modules match
      if (module.modules && module.modules.some(moduleMatches)) {
        return true;
      }

      return false;
    };

    // Filter all modules
    const filteredModules = moduleStructure.modules.filter(moduleMatches);

    // Create a new structure with the filtered modules
    setFilteredStructure({
      ...moduleStructure,
      modules: filteredModules,
    });

    // Auto-expand all matching modules
    const newExpandedModules = { ...expandedModules };

    const expandMatchingModules = (module, path = "") => {
      const currentPath = path ? `${path}.${module.name}` : module.name;

      if (moduleMatches(module)) {
        newExpandedModules[currentPath] = true;
      }

      if (module.modules) {
        module.modules.forEach((subModule) => {
          expandMatchingModules(subModule, currentPath);
        });
      }
    };

    moduleStructure.modules.forEach((module) => {
      expandMatchingModules(module);
    });

    setExpandedModules(newExpandedModules);
  }, [searchQuery, moduleStructure, expandedModules]);

  // Handle module selection
  const handleModuleSelect = useCallback(
    (module, filePath = null) => {
      const modulePath = filePath || module.path || module.name;
      setActiveModulePath(modulePath);

      // Add to recently viewed
      setRecentlyViewed((prev) => {
        const newRecent = [
          {
            name: filePath ? `${module.name}/${filePath}` : module.name,
            path: modulePath,
            type: filePath ? "file" : "module",
            timestamp: new Date().toISOString(),
          },
          ...prev.filter((item) => item.path !== modulePath),
        ].slice(0, 10); // Keep only 10 most recent

        return newRecent;
      });

      // Call parent handler
      onSelectModule(module, filePath);
    },
    [onSelectModule],
  );

  // Toggle module expansion
  const toggleModule = (modulePath) => {
    setExpandedModules((prev) => ({
      ...prev,
      [modulePath]: !prev[modulePath],
    }));
  };

  // Handle file selection
  const handleFileSelect = (moduleName, fileName) => {
    const module = {
      path: `${moduleName}/${fileName}`,
      name: fileName,
    };
    handleModuleSelect(module);
  };

  // Handle showing file info
  const handleFileInfo = (event, module, fileName) => {
    event.stopPropagation();
    setShowFileInfo({
      name: fileName,
      module: module.name,
      path: `${module.name}/${fileName}`,
      type: fileName.split(".").pop(),
      description: `File in ${module.name} module`,
    });
  };

  // Close file info panel
  const closeFileInfo = () => {
    setShowFileInfo(null);
  };

  // Render a module
  const renderModule = (module, path = "", level = 0) => {
    const currentPath = path ? `${path}.${module.name}` : module.name;
    const isExpanded = expandedModules[currentPath];
    const isActive =
      activeModulePath === module.path || activeModulePath === module.name;

    return (
      <div key={currentPath} className={compact ? "ml-1" : "ml-2"}>
        <div
          className={`flex items-center py-1 px-1 rounded-md
            ${
              isActive
                ? "bg-neuron-primary bg-opacity-10 dark:bg-opacity-20 text-neuron-primary dark:text-neuron-secondary"
                : "hover:bg-gray-100 dark:hover:bg-gray-700"
            }
            cursor-pointer transition-colors duration-150 group`}
          onClick={() => {
            if (module.type === "package" || module.modules) {
              toggleModule(currentPath);
            } else {
              handleModuleSelect(module);
            }
          }}
        >
          <div className="mr-1 flex-shrink-0">
            {module.type === "package" || module.modules ? (
              <motion.div
                animate={{ rotate: isExpanded ? 90 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <svg
                  className="w-4 h-4 text-gray-500 dark:text-gray-400"
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
              </motion.div>
            ) : (
              <div className="w-4"></div>
            )}
          </div>

          <div className="mr-1.5 flex-shrink-0">
            {module.type === "package" || module.modules ? (
              <FolderIcon isOpen={isExpanded} className="w-5 h-5" />
            ) : (
              <FileIcon fileName={module.name} className="w-5 h-5" />
            )}
          </div>

          <div className="flex-grow truncate">
            <span className={`${isActive ? "font-medium" : ""}`}>
              {module.name}
            </span>

            {/* Module type tag - show in non-compact mode */}
            {!compact && showFileTypes && module.type && (
              <span className="ml-2">
                <ModuleTypeTag type={module.type} />
              </span>
            )}
          </div>

          {/* Action buttons on hover */}
          <div className="flex-shrink-0 ml-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {!module.modules && (
              <button
                onClick={(e) => handleFileInfo(e, module, module.name)}
                className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"
                title="Show file info"
              >
                <svg
                  className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>

        <AnimatePresence>
          {isExpanded && (module.modules || module.key_files) && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className={`overflow-hidden ml-4 ${compact ? "border-l border-gray-200 dark:border-gray-700 pl-1" : "border-l border-gray-200 dark:border-gray-700 pl-2"}`}
            >
              {/* Sub-modules */}
              {module.modules &&
                module.modules.map((subModule) =>
                  renderModule(subModule, currentPath, level + 1),
                )}

              {/* Key files */}
              {module.key_files &&
                module.key_files.map((file) => (
                  <div
                    key={file}
                    className={`flex items-center py-1 px-1 rounded-md
                    ${
                      activeModulePath === `${module.name}/${file}`
                        ? "bg-neuron-primary bg-opacity-10 dark:bg-opacity-20 text-neuron-primary dark:text-neuron-secondary"
                        : "hover:bg-gray-100 dark:hover:bg-gray-700"
                    }
                    cursor-pointer text-sm group`}
                    onClick={() => handleFileSelect(module.name, file)}
                  >
                    <div className="w-4 mr-1"></div>{" "}
                    {/* Spacer for alignment */}
                    <FileIcon fileName={file} className="w-4 h-4 mr-1.5" />
                    <span className="truncate flex-grow">{file}</span>
                    {/* Action buttons */}
                    <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => handleFileInfo(e, module, file)}
                        className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"
                        title="Show file info"
                      >
                        <svg
                          className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  // Render recently viewed items
  const renderRecentlyViewed = () => {
    if (recentlyViewed.length === 0) {
      return (
        <div className="p-4 text-center text-neuron-text-muted-light dark:text-neuron-text-muted-dark">
          No recently viewed files
        </div>
      );
    }

    return (
      <div className="space-y-1 p-2">
        {recentlyViewed.map((item, index) => (
          <div
            key={index}
            className={`flex items-center py-1.5 px-2 rounded-md
              ${
                activeModulePath === item.path
                  ? "bg-neuron-primary bg-opacity-10 dark:bg-opacity-20 text-neuron-primary dark:text-neuron-secondary"
                  : "hover:bg-gray-100 dark:hover:bg-gray-700"
              }
              cursor-pointer text-sm`}
            onClick={() =>
              handleModuleSelect({ name: item.name, path: item.path })
            }
          >
            {item.type === "file" ? (
              <FileIcon fileName={item.name} className="w-4 h-4 mr-1.5" />
            ) : (
              <FolderIcon isOpen={false} className="w-4 h-4 mr-1.5" />
            )}

            <div className="flex-grow truncate">
              <div className="truncate">{item.name}</div>
              <div className="text-xs text-neuron-text-muted-light dark:text-neuron-text-muted-dark">
                {new Date(item.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Render file types grouping
  const renderFileTypes = () => {
    if (!moduleStructure) return null;

    // Extract and count all file types
    const fileTypes = {};

    const countFileTypes = (module) => {
      if (module.key_files) {
        module.key_files.forEach((file) => {
          const extension = file.split(".").pop();
          fileTypes[extension] = (fileTypes[extension] || 0) + 1;
        });
      }

      if (module.modules) {
        module.modules.forEach(countFileTypes);
      }
    };

    moduleStructure.modules.forEach(countFileTypes);

    // Sort by count (descending)
    const sortedTypes = Object.entries(fileTypes)
      .sort((a, b) => b[1] - a[1])
      .map(([type, count]) => ({ type, count }));

    if (sortedTypes.length === 0) {
      return (
        <div className="p-4 text-center text-neuron-text-muted-light dark:text-neuron-text-muted-dark">
          No file types found
        </div>
      );
    }

    return (
      <div className="space-y-2 p-3">
        {sortedTypes.map(({ type, count }) => (
          <div
            key={type}
            className="flex items-center justify-between p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
            onClick={() => setSearchQuery(`.${type}`)}
          >
            <div className="flex items-center">
              <FileIcon fileName={`file.${type}`} className="w-5 h-5 mr-2" />
              <span className="font-medium">.{type}</span>
            </div>
            <div className="bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full text-xs">
              {count}
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (!filteredStructure) {
    return (
      <div className="p-4 flex justify-center items-center h-full">
        <div className="flex flex-col items-center">
          <div className="w-8 h-8 border-t-2 border-b-2 border-neuron-primary dark:border-neuron-secondary rounded-full animate-spin"></div>
          <span className="mt-2 text-neuron-text-muted-light dark:text-neuron-text-muted-dark">
            Loading modules...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="relative">
          <input
            type="text"
            placeholder="Search modules..."
            className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:outline-none focus:ring-1 focus:ring-neuron-primary"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <svg
            className="absolute left-3 top-2.5 w-5 h-5 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>

          {searchQuery && (
            <button
              className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              onClick={() => setSearchQuery("")}
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>

        {!compact && (
          <div className="flex mt-3 border-b border-gray-200 dark:border-gray-700">
            {["files", "types", "recently"].map((tab) => (
              <button
                key={tab}
                className={`px-3 py-1.5 text-sm font-medium relative ${
                  activeTab === tab
                    ? "text-neuron-primary dark:text-neuron-secondary"
                    : "text-neuron-text-muted-light dark:text-neuron-text-muted-dark"
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                {activeTab === tab && (
                  <motion.div
                    layoutId="tabIndicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-neuron-primary dark:bg-neuron-secondary"
                  />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      <div
        className={
          compact ? "overflow-auto flex-1 p-1" : "overflow-auto flex-1 p-2"
        }
      >
        {activeTab === "files" &&
          filteredStructure.modules.map((module) => renderModule(module))}
        {activeTab === "types" && renderFileTypes()}
        {activeTab === "recently" && renderRecentlyViewed()}
      </div>

      {!compact && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <h3 className="text-sm font-medium text-neuron-text-muted-light dark:text-neuron-text-muted-dark">
            Module Info
          </h3>
          {showFileInfo ? (
            <div className="mt-2 relative">
              <button
                onClick={closeFileInfo}
                className="absolute right-0 top-0 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
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

              <div className="text-sm font-medium">{showFileInfo.name}</div>
              <div className="text-xs text-neuron-text-muted-light dark:text-neuron-text-muted-dark mt-1">
                {showFileInfo.path}
              </div>

              <div className="mt-2 flex">
                <div className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded-md text-xs">
                  Type: .{showFileInfo.type}
                </div>
              </div>

              <div className="mt-2 text-xs">{showFileInfo.description}</div>

              <div className="mt-3 flex space-x-2">
                <button
                  onClick={() =>
                    handleFileSelect(showFileInfo.module, showFileInfo.name)
                  }
                  className="px-2 py-1 bg-neuron-primary text-white text-xs rounded-md hover:bg-neuron-accent"
                >
                  Open File
                </button>
                <button className="px-2 py-1 border border-gray-300 dark:border-gray-600 text-xs rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
                  Add to Favorites
                </button>
              </div>
            </div>
          ) : (
            <p className="text-xs mt-1 text-neuron-text-muted-light dark:text-neuron-text-muted-dark">
              Select a module or file to see details
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default ModuleTree;
