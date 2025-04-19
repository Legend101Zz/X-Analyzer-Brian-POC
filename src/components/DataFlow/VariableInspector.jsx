import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import dataFlowData from "../../data/data_flow.json";

const VariableInspector = ({ activeNodeId = null }) => {
  const [variables, setVariables] = useState([]);
  const [activeVariable, setActiveVariable] = useState(null);
  const [filteredVariables, setFilteredVariables] = useState([]);

  useEffect(() => {
    // In a real app, we might fetch this
    setVariables(dataFlowData.data_flow);
  }, []);

  // Filter variables based on active node
  useEffect(() => {
    if (!activeNodeId) {
      setFilteredVariables(variables);
      return;
    }

    const nodeIdNumber = parseInt(activeNodeId, 10);

    // Show variables that are defined in or used in this node
    const relevantVars = variables.filter(
      (variable) =>
        (variable.defined_in && variable.defined_in.node === nodeIdNumber) ||
        variable.flows.some((flow) => flow.node === nodeIdNumber),
    );

    setFilteredVariables(relevantVars);
  }, [activeNodeId, variables]);

  if (variables.length === 0) {
    return <div className="p-4">Loading variable data...</div>;
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-medium text-neuron-text-light dark:text-neuron-text-dark">
          Variable Inspector
        </h2>
        <p className="text-sm text-neuron-text-muted-light dark:text-neuron-text-muted-dark mt-1">
          {activeNodeId
            ? `Variables in Node #${activeNodeId}`
            : "All Variables"}
        </p>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="p-4 grid grid-cols-1 gap-3">
          {filteredVariables.map((variable) => (
            <motion.div
              key={variable.var_id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`border rounded-lg p-3 cursor-pointer transition-all ${
                activeVariable?.var_id === variable.var_id
                  ? "border-neuron-primary bg-neuron-primary bg-opacity-5 dark:bg-opacity-10 shadow-sm"
                  : "border-gray-200 dark:border-gray-700 hover:border-neuron-primary"
              }`}
              onClick={() =>
                setActiveVariable(
                  activeVariable?.var_id === variable.var_id ? null : variable,
                )
              }
            >
              <div className="flex justify-between items-start mb-1">
                <div className="font-medium">{variable.name}</div>
                <div className="text-xs px-2 py-1 bg-neuron-secondary bg-opacity-20 dark:bg-opacity-30 rounded text-neuron-secondary">
                  {variable.type}
                </div>
              </div>
              <div className="text-sm text-neuron-text-muted-light dark:text-neuron-text-muted-dark">
                {variable.description}
              </div>

              {activeVariable?.var_id === variable.var_id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  transition={{ duration: 0.3 }}
                  className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700"
                >
                  <div className="text-sm font-medium mb-2">Data Flow:</div>
                  <div className="space-y-2">
                    {variable.flows.map((flow, index) => (
                      <div
                        key={index}
                        className="text-xs p-2 rounded bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700"
                      >
                        <div className="flex justify-between">
                          <span className="text-neuron-text-muted-light dark:text-neuron-text-muted-dark">
                            Node #{flow.node}
                          </span>
                          <span className="font-medium">{flow.operation}</span>
                        </div>
                        {flow.expr && (
                          <div className="mt-1 font-mono p-1 rounded bg-gray-100 dark:bg-gray-700 text-neuron-text-light dark:text-neuron-text-dark">
                            {flow.expr}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}

          {filteredVariables.length === 0 && (
            <div className="p-4 text-center text-neuron-text-muted-light dark:text-neuron-text-muted-dark">
              No variables found for this node.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VariableInspector;
