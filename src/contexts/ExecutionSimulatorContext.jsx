import React, { createContext, useState, useContext, useEffect } from "react";
import { useCodebase } from "./CodebaseContext";

// Create a context for execution simulation
const ExecutionSimulatorContext = createContext();

// Simulation states
const SIMULATION_STATES = {
  IDLE: "idle",
  RUNNING: "running",
  PAUSED: "paused",
  STEPPING: "stepping",
  COMPLETED: "completed",
  ERROR: "error",
};

// Execution modes
const EXECUTION_MODES = {
  CONTINUOUS: "continuous", // Run continuously until completion or breakpoint
  STEP_BY_STEP: "step-by-step", // Step through each execution point
  CUSTOM: "custom", // Custom execution with conditional breakpoints
};

// Execution Speed presets (in ms between steps)
const EXECUTION_SPEEDS = {
  SLOW: 2000,
  NORMAL: 1000,
  FAST: 500,
  VERY_FAST: 100,
};

export const ExecutionSimulatorProvider = ({ children }) => {
  const { timelineData, executionGraph, getExecutionStateAtStep } =
    useCodebase();

  // Simulation state
  const [simulationState, setSimulationState] = useState(
    SIMULATION_STATES.IDLE,
  );
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [executionMode, setExecutionMode] = useState(
    EXECUTION_MODES.STEP_BY_STEP,
  );
  const [executionSpeed, setExecutionSpeed] = useState(EXECUTION_SPEEDS.NORMAL);

  // Current execution context
  const [currentExecution, setCurrentExecution] = useState(null);

  // Breakpoints
  const [breakpoints, setBreakpoints] = useState([]);
  const [watchedVariables, setWatchedVariables] = useState([]);

  // Execution history
  const [executionHistory, setExecutionHistory] = useState([]);

  // Memory snapshots during execution
  const [memorySnapshots, setMemorySnapshots] = useState([]);

  // Variable changes during execution
  const [variableChanges, setVariableChanges] = useState([]);

  // Execution timer/interval reference
  const [executionTimer, setExecutionTimer] = useState(null);

  // Custom event logs
  const [eventLogs, setEventLogs] = useState([]);

  // Update current execution state based on step index
  useEffect(() => {
    if (simulationState === SIMULATION_STATES.IDLE) return;

    if (
      !timelineData ||
      !timelineData.events ||
      currentStepIndex >= timelineData.events.length
    ) {
      setSimulationState(SIMULATION_STATES.COMPLETED);
      return;
    }

    // Get execution state for current step
    const executionState = getExecutionStateAtStep(currentStepIndex);
    setCurrentExecution(executionState);

    // Check if we hit a breakpoint
    if (
      simulationState === SIMULATION_STATES.RUNNING &&
      isBreakpoint(executionState)
    ) {
      pauseExecution();

      // Add to event logs
      addEventLog({
        type: "breakpoint",
        message: `Execution paused at breakpoint: ${executionState.currentNode.file_path}:${executionState.currentNode.line_start}`,
        timestamp: new Date().toISOString(),
      });
    }

    // Save to execution history
    saveExecutionHistory(executionState);

    // Check for variable changes
    checkVariableChanges(executionState);

    // Take memory snapshot
    takeMemorySnapshot(executionState);
  }, [
    currentStepIndex,
    simulationState,
    timelineData,
    getExecutionStateAtStep,
  ]);

  // Check if current execution state hits a breakpoint
  const isBreakpoint = (executionState) => {
    if (!executionState || !breakpoints.length) return false;

    return breakpoints.some(
      (bp) =>
        bp.filePath === executionState.currentNode.file_path &&
        bp.line >= executionState.currentNode.line_start &&
        bp.line <= executionState.currentNode.line_end,
    );
  };

  // Save execution state to history
  const saveExecutionHistory = (executionState) => {
    if (!executionState) return;

    setExecutionHistory((prev) => {
      // Don't add duplicate entries for the same node
      if (
        prev.length > 0 &&
        prev[prev.length - 1].node.id === executionState.currentNode.id
      ) {
        return prev;
      }

      return [
        ...prev,
        {
          timestamp: new Date().toISOString(),
          node: executionState.currentNode,
          event: executionState.event,
          stepIndex: currentStepIndex,
        },
      ];
    });
  };

  // Check for variable changes
  const checkVariableChanges = (executionState) => {
    if (!executionState || !executionState.variablesInScope) return;

    // Compare with previous state to detect changes
    setVariableChanges((prev) => {
      const newChanges = [...prev];

      Object.entries(executionState.variablesInScope).forEach(
        ([name, info]) => {
          const prevVariable =
            executionHistory.length > 0 &&
            executionHistory[executionHistory.length - 1].variables &&
            executionHistory[executionHistory.length - 1].variables[name];

          if (prevVariable && prevVariable.value !== info.value) {
            newChanges.push({
              name,
              oldValue: prevVariable.value,
              newValue: info.value,
              type: info.type,
              timestamp: new Date().toISOString(),
              nodeId: executionState.currentNode.id,
              stepIndex: currentStepIndex,
            });

            // Add to event logs if it's a watched variable
            if (watchedVariables.includes(name)) {
              addEventLog({
                type: "variable-change",
                message: `Variable "${name}" changed from "${prevVariable.value}" to "${info.value}"`,
                timestamp: new Date().toISOString(),
                details: {
                  name,
                  oldValue: prevVariable.value,
                  newValue: info.value,
                },
              });
            }
          }
        },
      );

      return newChanges;
    });
  };

  // Take memory snapshot
  const takeMemorySnapshot = (executionState) => {
    if (!executionState || !executionState.memoryObjects) return;

    setMemorySnapshots((prev) => [
      ...prev,
      {
        timestamp: new Date().toISOString(),
        objects: executionState.memoryObjects,
        nodeId: executionState.currentNode.id,
        stepIndex: currentStepIndex,
      },
    ]);
  };

  // Add log entry
  const addEventLog = (logEntry) => {
    setEventLogs((prev) => [...prev, logEntry]);
  };

  // Start execution simulation
  const startExecution = (
    mode = EXECUTION_MODES.STEP_BY_STEP,
    speed = EXECUTION_SPEEDS.NORMAL,
  ) => {
    // Reset if completed
    if (simulationState === SIMULATION_STATES.COMPLETED) {
      resetExecution();
    }

    setExecutionMode(mode);
    setExecutionSpeed(speed);
    setSimulationState(SIMULATION_STATES.RUNNING);

    addEventLog({
      type: "execution-start",
      message: `Execution started in ${mode} mode`,
      timestamp: new Date().toISOString(),
    });

    // If continuous mode, start the timer
    if (mode === EXECUTION_MODES.CONTINUOUS) {
      const timer = setInterval(() => {
        setCurrentStepIndex((prev) => {
          if (prev >= (timelineData?.events?.length || 0) - 1) {
            clearInterval(timer);
            setSimulationState(SIMULATION_STATES.COMPLETED);

            addEventLog({
              type: "execution-complete",
              message: "Execution completed",
              timestamp: new Date().toISOString(),
            });

            return prev;
          }
          return prev + 1;
        });
      }, speed);

      setExecutionTimer(timer);
    }
  };

  // Pause execution
  const pauseExecution = () => {
    if (executionTimer) {
      clearInterval(executionTimer);
      setExecutionTimer(null);
    }

    setSimulationState(SIMULATION_STATES.PAUSED);

    addEventLog({
      type: "execution-pause",
      message: "Execution paused",
      timestamp: new Date().toISOString(),
    });
  };

  // Resume execution
  const resumeExecution = () => {
    setSimulationState(SIMULATION_STATES.RUNNING);

    addEventLog({
      type: "execution-resume",
      message: "Execution resumed",
      timestamp: new Date().toISOString(),
    });

    // If continuous mode, restart the timer
    if (executionMode === EXECUTION_MODES.CONTINUOUS) {
      const timer = setInterval(() => {
        setCurrentStepIndex((prev) => {
          if (prev >= (timelineData?.events?.length || 0) - 1) {
            clearInterval(timer);
            setSimulationState(SIMULATION_STATES.COMPLETED);

            addEventLog({
              type: "execution-complete",
              message: "Execution completed",
              timestamp: new Date().toISOString(),
            });

            return prev;
          }
          return prev + 1;
        });
      }, executionSpeed);

      setExecutionTimer(timer);
    }
  };

  // Step to next execution point
  const stepNext = () => {
    setSimulationState(SIMULATION_STATES.STEPPING);

    if (currentStepIndex < (timelineData?.events?.length || 0) - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      setSimulationState(SIMULATION_STATES.COMPLETED);

      addEventLog({
        type: "execution-complete",
        message: "Execution completed",
        timestamp: new Date().toISOString(),
      });
    }
  };

  // Step to previous execution point
  const stepBack = () => {
    setSimulationState(SIMULATION_STATES.STEPPING);

    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  // Step into a function call (if applicable)
  const stepInto = () => {
    // In our simulation, stepping into means just moving to the next step
    // since we already have the pre-recorded execution path
    stepNext();

    addEventLog({
      type: "step-into",
      message: "Stepping into function",
      timestamp: new Date().toISOString(),
    });
  };

  // Step over a function call (if applicable)
  const stepOver = () => {
    if (!currentExecution) {
      stepNext();
      return;
    }

    // In a real debugger, we'd skip over function calls
    // For our simulation, we'll skip to the next node at the same or lower call stack depth
    const currentStackDepth = currentExecution.callStack.length;

    setSimulationState(SIMULATION_STATES.STEPPING);

    // Look for the next step with equal or lower stack depth
    let targetStep = currentStepIndex + 1;
    let foundTarget = false;

    while (targetStep < (timelineData?.events?.length || 0)) {
      const state = getExecutionStateAtStep(targetStep);
      if (state && state.callStack.length <= currentStackDepth) {
        foundTarget = true;
        break;
      }
      targetStep++;
    }

    if (foundTarget) {
      setCurrentStepIndex(targetStep);

      addEventLog({
        type: "step-over",
        message: "Stepped over function call",
        timestamp: new Date().toISOString(),
      });
    } else {
      // If no suitable step found, just move to next step
      stepNext();
    }
  };

  // Step out of the current function
  const stepOut = () => {
    if (!currentExecution) {
      stepNext();
      return;
    }

    // In a real debugger, we'd return from the current function
    // For our simulation, we'll skip to the next node with lower call stack depth
    const currentStackDepth = currentExecution.callStack.length;

    setSimulationState(SIMULATION_STATES.STEPPING);

    // Look for the next step with lower stack depth
    let targetStep = currentStepIndex + 1;
    let foundTarget = false;

    while (targetStep < (timelineData?.events?.length || 0)) {
      const state = getExecutionStateAtStep(targetStep);
      if (state && state.callStack.length < currentStackDepth) {
        foundTarget = true;
        break;
      }
      targetStep++;
    }

    if (foundTarget) {
      setCurrentStepIndex(targetStep);

      addEventLog({
        type: "step-out",
        message: "Stepped out of function",
        timestamp: new Date().toISOString(),
      });
    } else {
      // If no suitable step found, just move to next step
      stepNext();
    }
  };

  // Reset execution state
  const resetExecution = () => {
    if (executionTimer) {
      clearInterval(executionTimer);
      setExecutionTimer(null);
    }

    setCurrentStepIndex(0);
    setSimulationState(SIMULATION_STATES.IDLE);
    setExecutionHistory([]);
    setMemorySnapshots([]);
    setVariableChanges([]);
    setEventLogs([]);
    setCurrentExecution(null);

    addEventLog({
      type: "execution-reset",
      message: "Execution reset",
      timestamp: new Date().toISOString(),
    });
  };

  // Add a breakpoint
  const addBreakpoint = (filePath, line) => {
    setBreakpoints((prev) => {
      // Don't add duplicate breakpoints
      if (prev.some((bp) => bp.filePath === filePath && bp.line === line)) {
        return prev;
      }

      const newBp = { filePath, line };

      addEventLog({
        type: "breakpoint-add",
        message: `Breakpoint added at ${filePath}:${line}`,
        timestamp: new Date().toISOString(),
        details: newBp,
      });

      return [...prev, newBp];
    });
  };

  // Remove a breakpoint
  const removeBreakpoint = (filePath, line) => {
    setBreakpoints((prev) => {
      const filtered = prev.filter(
        (bp) => !(bp.filePath === filePath && bp.line === line),
      );

      if (filtered.length !== prev.length) {
        addEventLog({
          type: "breakpoint-remove",
          message: `Breakpoint removed from ${filePath}:${line}`,
          timestamp: new Date().toISOString(),
        });
      }

      return filtered;
    });
  };

  // Add a variable to watch list
  const addWatchedVariable = (variableName) => {
    setWatchedVariables((prev) => {
      if (prev.includes(variableName)) {
        return prev;
      }

      addEventLog({
        type: "watch-add",
        message: `Added "${variableName}" to watch list`,
        timestamp: new Date().toISOString(),
      });

      return [...prev, variableName];
    });
  };

  // Remove a variable from watch list
  const removeWatchedVariable = (variableName) => {
    setWatchedVariables((prev) => {
      const filtered = prev.filter((name) => name !== variableName);

      if (filtered.length !== prev.length) {
        addEventLog({
          type: "watch-remove",
          message: `Removed "${variableName}" from watch list`,
          timestamp: new Date().toISOString(),
        });
      }

      return filtered;
    });
  };

  // Jump to specific step
  const jumpToStep = (stepIndex) => {
    if (stepIndex < 0 || stepIndex >= (timelineData?.events?.length || 0)) {
      return;
    }

    // If running, pause first
    if (simulationState === SIMULATION_STATES.RUNNING) {
      pauseExecution();
    }

    setCurrentStepIndex(stepIndex);

    addEventLog({
      type: "jump-to-step",
      message: `Jumped to step ${stepIndex}`,
      timestamp: new Date().toISOString(),
    });
  };

  // Change execution speed
  const changeExecutionSpeed = (speed) => {
    setExecutionSpeed(speed);

    // If running, restart timer with new speed
    if (simulationState === SIMULATION_STATES.RUNNING && executionTimer) {
      clearInterval(executionTimer);

      const timer = setInterval(() => {
        setCurrentStepIndex((prev) => {
          if (prev >= (timelineData?.events?.length || 0) - 1) {
            clearInterval(timer);
            setSimulationState(SIMULATION_STATES.COMPLETED);
            return prev;
          }
          return prev + 1;
        });
      }, speed);

      setExecutionTimer(timer);
    }

    addEventLog({
      type: "speed-change",
      message: `Execution speed changed to ${speed}ms`,
      timestamp: new Date().toISOString(),
    });
  };

  // Compute progress percentage
  const getProgressPercentage = () => {
    if (
      !timelineData ||
      !timelineData.events ||
      timelineData.events.length === 0
    ) {
      return 0;
    }

    return (currentStepIndex / (timelineData.events.length - 1)) * 100;
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (executionTimer) {
        clearInterval(executionTimer);
      }
    };
  }, [executionTimer]);

  // Context value to expose
  const contextValue = {
    // State
    simulationState,
    currentStepIndex,
    executionMode,
    executionSpeed,
    currentExecution,
    breakpoints,
    watchedVariables,
    executionHistory,
    memorySnapshots,
    variableChanges,
    eventLogs,
    progress: getProgressPercentage(),

    // Constants
    SIMULATION_STATES,
    EXECUTION_MODES,
    EXECUTION_SPEEDS,

    // Methods
    startExecution,
    pauseExecution,
    resumeExecution,
    stepNext,
    stepBack,
    stepInto,
    stepOver,
    stepOut,
    resetExecution,
    addBreakpoint,
    removeBreakpoint,
    addWatchedVariable,
    removeWatchedVariable,
    jumpToStep,
    changeExecutionSpeed,
  };

  return (
    <ExecutionSimulatorContext.Provider value={contextValue}>
      {children}
    </ExecutionSimulatorContext.Provider>
  );
};

// Custom hook to use the execution simulator
export const useExecutionSimulator = () => {
  const context = useContext(ExecutionSimulatorContext);
  if (!context) {
    throw new Error(
      "useExecutionSimulator must be used within an ExecutionSimulatorProvider",
    );
  }
  return context;
};
