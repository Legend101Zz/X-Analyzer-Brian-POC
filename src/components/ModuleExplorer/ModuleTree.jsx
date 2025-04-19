import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import moduleStructureData from "../../data/module_structure.json";

const ModuleTree = ({ onSelectModule, compact = false }) => {
  const [moduleStructure, setModuleStructure] = useState(null);
  const [expandedModules, setExpandedModules] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredStructure, setFilteredStructure] = useState(null);

  useEffect(() => {
    // In a real app, we might fetch this:
    setModuleStructure(moduleStructureData);
    setFilteredStructure(moduleStructureData);
  }, []);

  useEffect(() => {
    if (!moduleStructure || !searchQuery.trim()) {
      setFilteredStructure(moduleStructure);
      return;
    }

    const lowerQuery = searchQuery.toLowerCase();

    // Simple filtering logic - could be more sophisticated
    const filterModule = (module) => {
      const nameMatch = module.name.toLowerCase().includes(lowerQuery);
      const descMatch = module.description?.toLowerCase().includes(lowerQuery);

      if (nameMatch || descMatch) return true;

      // Check files
      if (
        module.key_files?.some((file) =>
          file.toLowerCase().includes(lowerQuery),
        )
      ) {
        return true;
      }

      // Check sub-modules if this is a package
      if (module.modules) {
        const filteredModules = module.modules.filter(filterModule);
        if (filteredModules.length > 0) {
          return true;
        }
      }

      return false;
    };

    // Create a filtered copy
    if (moduleStructure) {
      const filtered = {
        ...moduleStructure,
        modules: moduleStructure.modules.filter(filterModule),
      };
      setFilteredStructure(filtered);
    }
  }, [searchQuery, moduleStructure]);

  const toggleModule = (modulePath) => {
    setExpandedModules((prev) => ({
      ...prev,
      [modulePath]: !prev[modulePath],
    }));
  };

  const handleFileSelect = (moduleName, fileName) => {
    const fullPath = `${moduleName}/${fileName}`;
    onSelectModule({ path: fullPath, name: fileName });
  };

  const renderModule = (module, path = "", level = 0) => {
    const currentPath = path ? `${path}.${module.name}` : module.name;
    const isExpanded = expandedModules[currentPath];

    return (
      <div key={currentPath} className="ml-2">
        <div
          className={`flex items-center ${module.type === "package" ? "font-medium" : ""} py-1 px-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer`}
          onClick={() =>
            module.type === "package"
              ? toggleModule(currentPath)
              : onSelectModule(module)
          }
        >
          {module.type === "package" && (
            <svg
              className={`w-4 h-4 mr-1 transition-transform ${isExpanded ? "transform rotate-90" : ""}`}
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
          )}

          {module.type === "package" ? (
            <svg
              className="w-5 h-5 mr-1.5 text-yellow-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
              />
            </svg>
          ) : (
            <svg
              className="w-5 h-5 mr-1.5 text-blue-500"
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
          )}

          <span className="truncate">{module.name}</span>
        </div>

        {isExpanded && module.modules && (
          <div className="ml-4 border-l border-gray-200 dark:border-gray-700 pl-2">
            {module.modules.map((subModule) =>
              renderModule(subModule, currentPath, level + 1),
            )}
          </div>
        )}

        {isExpanded && module.key_files && (
          <div className="ml-4 border-l border-gray-200 dark:border-gray-700 pl-2">
            {module.key_files.map((file) => (
              <div
                key={file}
                className="flex items-center py-1 px-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-sm"
                onClick={() => handleFileSelect(module.name, file)}
              >
                <svg
                  className="w-4 h-4 mr-1.5 text-neuron-accent"
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
                <span className="truncate">{file}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  if (!filteredStructure) {
    return (
      <div className="p-4 flex justify-center items-center h-full">
        Loading...
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
        </div>
      </div>

      <div className={`overflow-auto flex-1 p-2 ${compact ? "text-sm" : ""}`}>
        {filteredStructure.modules.map((module) => renderModule(module))}
      </div>

      {!compact && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <h3 className="text-sm font-medium text-neuron-text-muted-light dark:text-neuron-text-muted-dark">
            Module Info
          </h3>
          <p className="text-xs mt-1 text-neuron-text-muted-light dark:text-neuron-text-muted-dark">
            Select a module to see details
          </p>
        </div>
      )}
    </div>
  );
};

export default ModuleTree;
