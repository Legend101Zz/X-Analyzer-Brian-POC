import React, { useState, useEffect, useRef } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
} from "reactflow";
import "reactflow/dist/style.css";
import { motion } from "framer-motion";
import TimelineSlider from "./TimelineSlider";

// Import our JSON data files (in a real app, these would be fetched or generated dynamically)
import executionGraphData from "../../data/execution_graph.json";
import timelineData from "../../data/timeline.json";
import dataFlowData from "../../data/data_flow.json";

// Custom node styling
const nodeTypes = {
  function: ({ data }) => (
    <div
      className={`p-3 rounded-lg shadow-lg border ${
        data.active
          ? "bg-neuron-primary border-neuron-accent text-white shadow-neuron"
          : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
      }`}
    >
      <div className="font-medium">{data.label}</div>
      <div className="text-xs opacity-80">{data.module}</div>
    </div>
  ),
  method: ({ data }) => (
    <div
      className={`p-3 rounded-lg shadow-lg border ${
        data.active
          ? "bg-neuron-secondary border-neuron-accent text-white shadow-neuron"
          : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
      }`}
    >
      <div className="font-medium">{data.label}</div>
      <div className="text-xs opacity-80">{data.module}</div>
    </div>
  ),
};

const ExecutionVisualizer = ({
  compact = false,
  playing = false,
  onStateChange = () => {},
}) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [timeline, setTimeline] = useState([]);
  const [isPlaying, setIsPlaying] = useState(playing);
  const [activeStep, setActiveStep] = useState(0);
  const [activeNodeId, setActiveNodeId] = useState(null);
  const [zoomToFit, setZoomToFit] = useState(false);
  const flowRef = useRef(null);

  // New states for enhanced debugging
  const [stackFrames, setStackFrames] = useState([]);
  const [currentVariables, setCurrentVariables] = useState({});
  const [memoryState, setMemoryState] = useState([]);
  const [breakpoints, setBreakpoints] = useState([]);
  const [executionSpeed, setExecutionSpeed] = useState(1);
  const [pausedAt, setPausedAt] = useState(null);
  const [viewMode, setViewMode] = useState("split"); // split, code, graph, memory
  const [currentFile, setCurrentFile] = useState(null);
  const [currentLine, setCurrentLine] = useState(null);

  // Initialize data from JSON
  useEffect(() => {
    if (!executionGraphData || !timelineData) return;

    // Create nodes from graph data
    const graphNodes = executionGraphData.graph.nodes.map((node) => ({
      id: node.id.toString(),
      type: node.type,
      position: { x: 0, y: 0 }, // We'll use reactflow layout algorithm
      data: {
        label: node.name,
        module: node.module,
        description: node.short_description,
        active: false,
        file_path: node.file_path,
        line_start: node.line_start,
        line_end: node.line_end,
      },
    }));

    // Create edges from graph data
    const graphEdges = executionGraphData.graph.edges.map((edge, index) => ({
      id: `e${index}`,
      source: edge.from.toString(),
      target: edge.to.toString(),
      animated: false,
      style: {
        stroke: "#818cf8",
        strokeWidth: 2,
      },
      type: "default",
    }));

    // Create timeline events
    setTimeline(timelineData.events);

    setNodes(graphNodes);
    setEdges(graphEdges);
    setZoomToFit(true);

    // Initialize with first execution step data
    if (timelineData.events.length > 0) {
      updateExecutionState(0);
    }
  }, []);

  // Handle zoom to fit
  useEffect(() => {
    if (zoomToFit && flowRef.current) {
      setTimeout(() => {
        flowRef.current.fitView({ padding: 0.2 });
        setZoomToFit(false);
      }, 100);
    }
  }, [zoomToFit, nodes, flowRef]);

  // Enhanced debugging execution state update
  const updateExecutionState = (stepIndex) => {
    if (!timeline.length || stepIndex >= timeline.length) return;

    const currentEvent = timeline[stepIndex];
    const newActiveNodeId = currentEvent.node_id.toString();

    // Find the node data
    const nodeData = executionGraphData.graph.nodes.find(
      (node) => node.id === currentEvent.node_id,
    );

    if (nodeData) {
      setCurrentFile(nodeData.file_path);
      setCurrentLine(nodeData.line_start);
    }

    // Update node highlighting
    setNodes((nodes) =>
      nodes.map((node) => ({
        ...node,
        data: {
          ...node.data,
          active: node.id === newActiveNodeId,
        },
      })),
    );

    // Update edge animation
    setEdges((edges) =>
      edges.map((edge) => ({
        ...edge,
        animated: edge.target === newActiveNodeId,
      })),
    );

    setActiveNodeId(newActiveNodeId);

    // Update call stack
    updateCallStack(stepIndex);

    // Update variables
    updateVariables(stepIndex);

    // Update memory state
    updateMemoryState(stepIndex);
  };

  // Simulate call stack updates based on timeline
  const updateCallStack = (stepIndex) => {
    // In a real implementation, this would be derived from actual execution data
    // For the demo, we'll build a simulated call stack based on our timeline

    const currentEvent = timeline[stepIndex];
    const newStack = [];

    // Start with the current function
    const currentNode = executionGraphData.graph.nodes.find(
      (node) => node.id === currentEvent.node_id,
    );

    if (currentNode) {
      newStack.push({
        function: currentNode.name,
        file: currentNode.file_path,
        line: currentNode.line_start,
        locals: {}, // Would contain local variables in a real debugger
      });

      // Add parent calls based on the graph structure
      // This is a simplified approach - a real debugger would have the actual call stack
      let parentId = null;
      executionGraphData.graph.edges.forEach((edge) => {
        if (edge.to === currentEvent.node_id) {
          parentId = edge.from;
          const parentNode = executionGraphData.graph.nodes.find(
            (node) => node.id === parentId,
          );

          if (parentNode) {
            newStack.push({
              function: parentNode.name,
              file: parentNode.file_path,
              line: parentNode.line_start,
              locals: {},
            });
          }
        }
      });
    }

    setStackFrames(newStack);
  };

  // Simulate variable state updates
  const updateVariables = (stepIndex) => {
    const currentEvent = timeline[stepIndex];

    // Get variables relevant to the current node
    const relevantVars = dataFlowData.data_flow.filter((variable) =>
      variable.flows.some((flow) => flow.node === currentEvent.node_id),
    );

    const variableState = {};

    relevantVars.forEach((variable) => {
      // Simulate variable values - in a real debugger these would be actual values
      const flow = variable.flows.find((f) => f.node === currentEvent.node_id);

      variableState[variable.name] = {
        type: variable.type,
        value: flow?.expr || `[${variable.type} value]`,
        description: variable.description,
      };
    });

    setCurrentVariables(variableState);
  };

  // Simulate memory state
  const updateMemoryState = (stepIndex) => {
    // In a real implementation, this would show actual memory allocation
    // For the demo, we'll create simulated memory objects

    const currentEvent = timeline[stepIndex];
    const memoryObjects = [];

    // Simulate some objects in memory
    memoryObjects.push({
      id: "mem1",
      type: "NeuronGroup",
      size: "2.4 MB",
      address: "0x7f8a4c2d1000",
      allocation: `Created at step ${Math.max(0, stepIndex - 2)}`,
      references: 2,
    });

    memoryObjects.push({
      id: "mem2",
      type: "StateMonitor",
      size: "1.2 MB",
      address: "0x7f8a4c2d3000",
      allocation: `Created at step ${Math.max(0, stepIndex - 1)}`,
      references: 1,
    });

    // Add more simulated objects based on the current node
    const currentNode = executionGraphData.graph.nodes.find(
      (node) => node.id === currentEvent.node_id,
    );

    if (currentNode && currentNode.name.includes("run")) {
      memoryObjects.push({
        id: "mem3",
        type: "Clock",
        size: "0.4 MB",
        address: "0x7f8a4c2d5000",
        allocation: `Created at step ${stepIndex}`,
        references: 3,
      });
    }

    setMemoryState(memoryObjects);
  };

  // Enhanced stepping controls
  const stepInto = () => {
    if (activeStep < timeline.length - 1) {
      const newStep = activeStep + 1;
      setActiveStep(newStep);
      updateExecutionState(newStep);
    }
  };

  const stepOver = () => {
    // In a real debugger, this would skip over function calls
    // For our demo, we'll simulate by advancing to the next function at the same level
    const currentDepth = stackFrames.length;
    let newStep = activeStep;

    for (let i = activeStep + 1; i < timeline.length; i++) {
      updateCallStack(i);
      if (stackFrames.length <= currentDepth) {
        newStep = i;
        break;
      }
    }

    setActiveStep(newStep);
    updateExecutionState(newStep);
  };

  const stepOut = () => {
    // In a real debugger, this would return from the current function
    // For our demo, we'll simulate by advancing to when the stack depth decreases
    const currentDepth = stackFrames.length;
    let newStep = activeStep;

    for (let i = activeStep + 1; i < timeline.length; i++) {
      updateCallStack(i);
      if (stackFrames.length < currentDepth) {
        newStep = i;
        break;
      }
    }

    setActiveStep(newStep);
    updateExecutionState(newStep);
  };

  const continueExecution = () => {
    // In a real debugger, this would run until the next breakpoint
    // For our demo, we'll simulate by advancing several steps
    const newStep = Math.min(activeStep + 5, timeline.length - 1);
    setActiveStep(newStep);
    updateExecutionState(newStep);
  };

  // Handle auto-playing animation
  useEffect(() => {
    if (!isPlaying || !timeline.length) return;

    const totalSteps = timeline.length;
    let currentTimeout;

    const stepForward = () => {
      setActiveStep((prev) => {
        const next = prev + 1;
        if (next >= totalSteps) {
          setIsPlaying(false);
          return prev;
        }
        updateExecutionState(next);
        return next;
      });
    };

    // Adjust interval based on execution speed
    const interval = 2000 / executionSpeed;
    currentTimeout = setTimeout(stepForward, interval);

    return () => {
      if (currentTimeout) clearTimeout(currentTimeout);
    };
  }, [isPlaying, activeStep, timeline, executionSpeed]);

  // Toggle play/pause
  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  // Step controls
  const handlePrevStep = () => {
    if (activeStep > 0) {
      const newStep = activeStep - 1;
      setActiveStep(newStep);
      updateExecutionState(newStep);
    }
  };

  const handleNextStep = () => {
    if (timeline.length && activeStep < timeline.length - 1) {
      const newStep = activeStep + 1;
      setActiveStep(newStep);
      updateExecutionState(newStep);
    }
  };

  // Set a breakpoint
  const handleSetBreakpoint = (file, line) => {
    const newBreakpoint = { file, line };
    setBreakpoints([...breakpoints, newBreakpoint]);
  };

  // Remove a breakpoint
  const handleRemoveBreakpoint = (file, line) => {
    setBreakpoints(
      breakpoints.filter((bp) => !(bp.file === file && bp.line === line)),
    );
  };

  // Adjust execution speed
  const handleSpeedChange = (newSpeed) => {
    setExecutionSpeed(newSpeed);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <h2 className="font-medium text-neuron-text-light dark:text-neuron-text-dark">
          Interactive Debugger
        </h2>

        <div className="flex items-center space-x-2">
          {/* View mode toggles */}
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-md p-1">
            <button
              onClick={() => setViewMode("split")}
              className={`px-2 py-1 text-xs rounded ${
                viewMode === "split"
                  ? "bg-white dark:bg-gray-600 shadow-sm"
                  : "text-gray-500 dark:text-gray-400"
              }`}
            >
              Split
            </button>
            <button
              onClick={() => setViewMode("code")}
              className={`px-2 py-1 text-xs rounded ${
                viewMode === "code"
                  ? "bg-white dark:bg-gray-600 shadow-sm"
                  : "text-gray-500 dark:text-gray-400"
              }`}
            >
              Code
            </button>
            <button
              onClick={() => setViewMode("graph")}
              className={`px-2 py-1 text-xs rounded ${
                viewMode === "graph"
                  ? "bg-white dark:bg-gray-600 shadow-sm"
                  : "text-gray-500 dark:text-gray-400"
              }`}
            >
              Graph
            </button>
            <button
              onClick={() => setViewMode("memory")}
              className={`px-2 py-1 text-xs rounded ${
                viewMode === "memory"
                  ? "bg-white dark:bg-gray-600 shadow-sm"
                  : "text-gray-500 dark:text-gray-400"
              }`}
            >
              Memory
            </button>
          </div>

          <button
            onClick={() => setZoomToFit(true)}
            className="p-1 text-neuron-text-muted-light dark:text-neuron-text-muted-dark hover:text-neuron-primary hover:dark:text-neuron-secondary rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
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
                d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Execution toolbar with enhanced debugging controls */}
      <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrevStep}
              disabled={activeStep === 0}
              className={`p-1 rounded ${
                activeStep === 0
                  ? "text-gray-400 dark:text-gray-600 cursor-not-allowed"
                  : "text-neuron-primary dark:text-neuron-secondary hover:bg-gray-200 dark:hover:bg-gray-700"
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
              onClick={togglePlay}
              className="p-1 rounded-full bg-neuron-primary dark:bg-neuron-secondary text-white hover:bg-neuron-accent dark:hover:bg-neuron-primary transition-colors shadow-sm"
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
              onClick={handleNextStep}
              disabled={!timeline.length || activeStep >= timeline.length - 1}
              className={`p-1 rounded ${
                !timeline.length || activeStep >= timeline.length - 1
                  ? "text-gray-400 dark:text-gray-600 cursor-not-allowed"
                  : "text-neuron-primary dark:text-neuron-secondary hover:bg-gray-200 dark:hover:bg-gray-700"
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

          {/* Enhanced debugging controls */}
          <div className="flex items-center space-x-2">
            <button
              onClick={stepInto}
              className="px-2 py-1 text-xs rounded bg-neuron-secondary bg-opacity-10 text-neuron-secondary hover:bg-opacity-20"
              title="Step Into"
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
                  d="M19 14l-7 7m0 0l-7-7m7 7V3"
                />
              </svg>
            </button>

            <button
              onClick={stepOver}
              className="px-2 py-1 text-xs rounded bg-neuron-secondary bg-opacity-10 text-neuron-secondary hover:bg-opacity-20"
              title="Step Over"
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
                  d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </button>

            <button
              onClick={stepOut}
              className="px-2 py-1 text-xs rounded bg-neuron-secondary bg-opacity-10 text-neuron-secondary hover:bg-opacity-20"
              title="Step Out"
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
                  d="M5 10l7-7m0 0l7 7m-7-7v18"
                />
              </svg>
            </button>

            <button
              onClick={continueExecution}
              className="px-2 py-1 text-xs rounded bg-neuron-secondary bg-opacity-10 text-neuron-secondary hover:bg-opacity-20"
              title="Continue"
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
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </button>

            <div className="ml-2 flex items-center">
              <span className="text-xs mr-2">Speed:</span>
              <input
                type="range"
                min="0.5"
                max="3"
                step="0.5"
                value={executionSpeed}
                onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
                className="w-20 h-1 bg-gray-200 dark:bg-gray-700 rounded-full appearance-none cursor-pointer"
              />
              <span className="text-xs ml-1">{executionSpeed}x</span>
            </div>
          </div>

          {/* Current execution point */}
          <div className="text-xs text-neuron-text-muted-light dark:text-neuron-text-muted-dark">
            {timeline[activeStep] && (
              <div className="flex items-center">
                <span className="font-medium mr-2">
                  Step {activeStep + 1}/{timeline.length}
                </span>
                <span>{timeline[activeStep].description}</span>
              </div>
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-200 dark:bg-gray-700 h-1 mt-2 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-neuron-primary dark:bg-neuron-secondary"
            style={{
              width: `${((activeStep + 1) / (timeline.length || 1)) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* Main content area with flexible layout based on viewMode */}
      <div className="flex-1 overflow-hidden">
        {viewMode === "split" && (
          <div className="flex h-full">
            {/* Left panel: Code view */}
            <div className="w-1/2 h-full border-r border-gray-200 dark:border-gray-700">
              <div className="h-3/5 border-b border-gray-200 dark:border-gray-700">
                {currentFile && (
                  <div className="h-full flex flex-col">
                    <div className="p-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs font-mono">
                      {currentFile}:{currentLine}
                    </div>
                    <div className="flex-1 overflow-auto">
                      {/* This would be your actual code editor component */}
                      <pre className="p-4 text-sm font-mono">
                        {/* Placeholder for actual code content */}
                        <div className="bg-yellow-100 dark:bg-yellow-900 px-2 py-1">
                          Current line of execution
                        </div>
                        <code>
                          # This would be the actual code content # with proper
                          syntax highlighting # and the current line highlighted
                        </code>
                      </pre>
                    </div>
                  </div>
                )}
              </div>

              {/* Call stack */}
              <div className="h-2/5 overflow-auto">
                <div className="p-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                  <h3 className="text-xs font-medium">Call Stack</h3>
                </div>
                <div className="p-2">
                  {stackFrames.map((frame, index) => (
                    <div
                      key={index}
                      className={`p-2 text-xs font-mono rounded mb-1 cursor-pointer ${
                        index === 0
                          ? "bg-neuron-primary bg-opacity-10 border border-neuron-primary border-opacity-20"
                          : "hover:bg-gray-100 dark:hover:bg-gray-700"
                      }`}
                    >
                      <div className="font-medium">{frame.function}</div>
                      <div className="text-neuron-text-muted-light dark:text-neuron-text-muted-dark">
                        {frame.file}:{frame.line}
                      </div>
                    </div>
                  ))}

                  {stackFrames.length === 0 && (
                    <div className="p-2 text-xs text-neuron-text-muted-light dark:text-neuron-text-muted-dark">
                      No active call stack
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right panel: Visualization and variables */}
            <div className="w-1/2 h-full">
              <div className="h-1/2 border-b border-gray-200 dark:border-gray-700">
                <ReactFlow
                  ref={flowRef}
                  nodes={nodes}
                  edges={edges}
                  onNodesChange={onNodesChange}
                  onEdgesChange={onEdgesChange}
                  nodeTypes={nodeTypes}
                  fitView
                  minZoom={0.2}
                  maxZoom={1.5}
                  defaultZoom={0.8}
                  nodesDraggable={false}
                >
                  <Background color="#a5b4fc" gap={16} size={1} />
                  <Controls showInteractive={false} />
                </ReactFlow>
              </div>

              <div className="h-1/2 flex flex-col">
                {/* Variables */}
                <div className="h-1/2 border-b border-gray-200 dark:border-gray-700 overflow-auto">
                  <div className="p-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                    <h3 className="text-xs font-medium">Variables</h3>
                  </div>
                  <div className="p-2">
                    {Object.entries(currentVariables).map(([name, info]) => (
                      <div key={name} className="mb-2">
                        <div className="flex justify-between items-start">
                          <span className="text-xs font-mono font-medium">
                            {name}
                          </span>
                          <span className="text-xs bg-gray-100 dark:bg-gray-700 px-1 rounded">
                            {info.type}
                          </span>
                        </div>
                        <div className="text-xs font-mono mt-1 bg-gray-50 dark:bg-gray-800 p-1 rounded">
                          {info.value}
                        </div>
                      </div>
                    ))}

                    {Object.keys(currentVariables).length === 0 && (
                      <div className="p-2 text-xs text-neuron-text-muted-light dark:text-neuron-text-muted-dark">
                        No variables in current scope
                      </div>
                    )}
                  </div>
                </div>

                {/* Memory */}
                <div className="flex-1 overflow-auto">
                  <div className="p-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                    <h3 className="text-xs font-medium">Memory</h3>
                  </div>
                  <div className="p-2">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-700">
                          <th className="text-left p-1">Object</th>
                          <th className="text-left p-1">Type</th>
                          <th className="text-right p-1">Size</th>
                          <th className="text-right p-1">Refs</th>
                        </tr>
                      </thead>
                      <tbody>
                        {memoryState.map((obj) => (
                          <tr
                            key={obj.id}
                            className="border-b border-gray-100 dark:border-gray-800"
                          >
                            <td className="p-1 font-mono">{obj.address}</td>
                            <td className="p-1">{obj.type}</td>
                            <td className="p-1 text-right">{obj.size}</td>
                            <td className="p-1 text-right">{obj.references}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {memoryState.length === 0 && (
                      <div className="p-2 text-xs text-neuron-text-muted-light dark:text-neuron-text-muted-dark">
                        No memory objects tracked
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {viewMode === "code" && (
          <div className="h-full flex flex-col">
            {/* Full code view with breakpoints */}
            <div className="flex-1 overflow-auto">
              {currentFile && (
                <div className="h-full flex flex-col">
                  <div className="p-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs font-mono">
                    {currentFile}:{currentLine}
                  </div>
                  <div className="flex-1 overflow-auto">
                    {/* This would be your actual code editor component */}
                    <pre className="p-4 text-sm font-mono relative">
                      {/* Placeholder for actual code content */}
                      <div className="absolute left-0 top-0 bottom-0 w-10 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
                        {/* Line numbers and breakpoint toggles would go here */}
                        {[...Array(20)].map((_, i) => (
                          <div key={i} className="flex items-center">
                            <button
                              className={`w-3 h-3 rounded-full mx-1 ${
                                breakpoints.some((bp) => bp.line === i + 1)
                                  ? "bg-red-500"
                                  : "bg-transparent hover:bg-gray-300 dark:hover:bg-gray-600"
                              }`}
                              onClick={() => {
                                if (
                                  breakpoints.some((bp) => bp.line === i + 1)
                                ) {
                                  handleRemoveBreakpoint(currentFile, i + 1);
                                } else {
                                  handleSetBreakpoint(currentFile, i + 1);
                                }
                              }}
                            />
                            <span className="text-xs text-gray-500">
                              {i + 1}
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="ml-10">
                        <div
                          className={`${currentLine === 1 ? "bg-yellow-100 dark:bg-yellow-900" : ""} px-2`}
                        >
                          def run(duration, report=None,
                          report_period=10*second, namespace=None, profile=None,
                          level=0):
                        </div>
                        <div
                          className={`${currentLine === 2 ? "bg-yellow-100 dark:bg-yellow-900" : ""} px-2`}
                        >
                          """Run a simulation with all 'visible' Brian objects
                          for the given duration."""
                        </div>
                        <div
                          className={`${currentLine === 3 ? "bg-yellow-100 dark:bg-yellow-900" : ""} px-2`}
                        >
                          return magic_network.run(
                        </div>
                        <div
                          className={`${currentLine === 4 ? "bg-yellow-100 dark:bg-yellow-900" : ""} px-2`}
                        >
                          duration,
                        </div>
                        <div
                          className={`${currentLine === 5 ? "bg-yellow-100 dark:bg-yellow-900" : ""} px-2`}
                        >
                          report=report,
                        </div>
                        <div
                          className={`${currentLine === 6 ? "bg-yellow-100 dark:bg-yellow-900" : ""} px-2`}
                        >
                          report_period=report_period,
                        </div>
                        <div
                          className={`${currentLine === 7 ? "bg-yellow-100 dark:bg-yellow-900" : ""} px-2`}
                        >
                          namespace=namespace,
                        </div>
                        <div
                          className={`${currentLine === 8 ? "bg-yellow-100 dark:bg-yellow-900" : ""} px-2`}
                        >
                          profile=profile,
                        </div>
                        <div
                          className={`${currentLine === 9 ? "bg-yellow-100 dark:bg-yellow-900" : ""} px-2`}
                        >
                          level=2 + level,
                        </div>
                        <div
                          className={`${currentLine === 10 ? "bg-yellow-100 dark:bg-yellow-900" : ""} px-2`}
                        >
                          )
                        </div>
                      </div>
                    </pre>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom panel with call stack and variables */}
            <div className="h-1/3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex h-full">
                <div className="w-1/2 border-r border-gray-200 dark:border-gray-700 overflow-auto">
                  <div className="p-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                    <h3 className="text-xs font-medium">Call Stack</h3>
                  </div>
                  <div className="p-2">
                    {stackFrames.map((frame, index) => (
                      <div
                        key={index}
                        className={`p-2 text-xs font-mono rounded mb-1 cursor-pointer ${
                          index === 0
                            ? "bg-neuron-primary bg-opacity-10 border border-neuron-primary border-opacity-20"
                            : "hover:bg-gray-100 dark:hover:bg-gray-700"
                        }`}
                      >
                        <div className="font-medium">{frame.function}</div>
                        <div className="text-neuron-text-muted-light dark:text-neuron-text-muted-dark">
                          {frame.file}:{frame.line}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="w-1/2 overflow-auto">
                  <div className="p-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                    <h3 className="text-xs font-medium">Variables</h3>
                  </div>
                  <div className="p-2">
                    {Object.entries(currentVariables).map(([name, info]) => (
                      <div key={name} className="mb-2">
                        <div className="flex justify-between items-start">
                          <span className="text-xs font-mono font-medium">
                            {name}
                          </span>
                          <span className="text-xs bg-gray-100 dark:bg-gray-700 px-1 rounded">
                            {info.type}
                          </span>
                        </div>
                        <div className="text-xs font-mono mt-1 bg-gray-50 dark:bg-gray-800 p-1 rounded">
                          {info.value}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {viewMode === "graph" && (
          <div className="h-full">
            <ReactFlow
              ref={flowRef}
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              nodeTypes={nodeTypes}
              fitView
              minZoom={0.2}
              maxZoom={1.5}
              defaultZoom={0.8}
              nodesDraggable={false}
            >
              <Background color="#a5b4fc" gap={16} size={1} />
              <Controls showInteractive={false} />
              <MiniMap nodeBorderRadius={8} />
            </ReactFlow>
          </div>
        )}

        {viewMode === "memory" && (
          <div className="h-full flex">
            <div className="w-1/2 border-r border-gray-200 dark:border-gray-700">
              <div className="p-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                <h3 className="text-sm font-medium">Memory Allocation</h3>
              </div>
              <div className="p-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                  <div className="text-sm font-medium mb-2">
                    Total Memory Usage
                  </div>
                  <div className="relative pt-1">
                    <div className="overflow-hidden h-4 mb-4 text-xs flex rounded bg-gray-200 dark:bg-gray-700">
                      <div
                        style={{ width: "30%" }}
                        className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-neuron-primary"
                      >
                        30% (3.6 MB / 12 MB)
                      </div>
                    </div>
                  </div>

                  <div className="text-sm font-medium mb-2">
                    Memory by Object Type
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span>NeuronGroup</span>
                      <span>2.4 MB</span>
                    </div>
                    <div className="relative pt-1">
                      <div className="overflow-hidden h-2 mb-2 text-xs flex rounded bg-gray-200 dark:bg-gray-700">
                        <div
                          style={{ width: "67%" }}
                          className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
                        ></div>
                      </div>
                    </div>

                    <div className="flex justify-between text-xs">
                      <span>StateMonitor</span>
                      <span>1.2 MB</span>
                    </div>
                    <div className="relative pt-1">
                      <div className="overflow-hidden h-2 mb-2 text-xs flex rounded bg-gray-200 dark:bg-gray-700">
                        <div
                          style={{ width: "33%" }}
                          className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500"
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                  <div className="text-sm font-medium mb-2">
                    Memory Allocation Timeline
                  </div>
                  <div className="h-32 bg-gray-100 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600">
                    {/* This would be replaced with an actual chart */}
                    <div className="flex items-end h-full p-2">
                      {[...Array(16)].map((_, i) => (
                        <div
                          key={i}
                          className="w-full bg-neuron-primary dark:bg-neuron-secondary mx-1 rounded-t"
                          style={{
                            height: `${Math.max(10, Math.min(90, 20 + i * (i < 8 ? 8 : -5)))}%`,
                            opacity: activeStep > i ? 1 : 0.3,
                          }}
                        ></div>
                      ))}
                    </div>
                  </div>
                  <div className="text-xs text-center mt-2 text-neuron-text-muted-light dark:text-neuron-text-muted-dark">
                    Execution Steps
                  </div>
                </div>
              </div>
            </div>

            <div className="w-1/2">
              <div className="p-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                <h3 className="text-sm font-medium">Memory Objects</h3>
              </div>
              <div className="p-4">
                <div className="flex mb-2">
                  <input
                    type="text"
                    placeholder="Filter objects..."
                    className="w-full px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-neuron-primary dark:bg-gray-700"
                  />
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Address
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Size
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Refs
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {memoryState.map((obj) => (
                        <tr
                          key={obj.id}
                          className="hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          <td className="px-4 py-2 text-xs font-mono">
                            {obj.address}
                          </td>
                          <td className="px-4 py-2 text-xs">{obj.type}</td>
                          <td className="px-4 py-2 text-xs">{obj.size}</td>
                          <td className="px-4 py-2 text-xs">
                            {obj.references}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Object details panel */}
                <div className="mt-4 bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                  <div className="text-sm font-medium mb-2">Object Details</div>
                  {memoryState.length > 0 && (
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="font-medium">Object Type:</span>
                        <span>{memoryState[0].type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Address:</span>
                        <span className="font-mono">
                          {memoryState[0].address}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Size:</span>
                        <span>{memoryState[0].size}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">References:</span>
                        <span>{memoryState[0].references}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Allocation:</span>
                        <span>{memoryState[0].allocation}</span>
                      </div>
                      <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                        <span className="font-medium">Referenced by:</span>
                        <ul className="mt-1 pl-4 list-disc">
                          <li>Network (0x7f8a4c2d0000)</li>
                          <li>MagicNetwork (0x7f8a4c2d0500)</li>
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Timeline slider - always visible at bottom */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <TimelineSlider
          events={timeline}
          currentStep={activeStep}
          onChange={(step) => {
            setActiveStep(step);
            updateExecutionState(step);
          }}
        />

        {timeline[activeStep] && (
          <div className="mt-2 p-2 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 shadow text-xs">
            <p>{timeline[activeStep].description}</p>
            <p className="text-neuron-text-muted-light dark:text-neuron-text-muted-dark mt-1">
              Time: {timeline[activeStep].timestamp_ms}ms
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExecutionVisualizer;
