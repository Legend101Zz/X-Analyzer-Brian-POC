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
import ExecutionControls from "./ExecutionControls";
import TimelineSlider from "./TimelineSlider";

// Import our JSON data files (in a real app, these would be fetched)
import executionGraphData from "../../data/execution_graph.json";
import timelineData from "../../data/timeline.json";

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
  currentStep = 0,
  onStateChange = () => {},
}) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [timeline, setTimeline] = useState([]);
  const [isPlaying, setIsPlaying] = useState(playing);
  const [activeStep, setActiveStep] = useState(currentStep);
  const [activeNodeId, setActiveNodeId] = useState(null);
  const [zoomToFit, setZoomToFit] = useState(false);
  const flowRef = useRef(null);

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
        return next;
      });
    };

    currentTimeout = setTimeout(stepForward, 2000);

    return () => {
      if (currentTimeout) clearTimeout(currentTimeout);
    };
  }, [isPlaying, activeStep, timeline]);

  // Update active node based on timeline
  useEffect(() => {
    if (!timeline.length || activeStep >= timeline.length) return;

    const currentEvent = timeline[activeStep];
    const newActiveNodeId = currentEvent.node_id.toString();

    // Update state for parent component
    onStateChange({
      isPlaying,
      currentStep: activeStep,
    });

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
  }, [activeStep, timeline]);

  // Toggle play/pause
  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  // Step controls
  const handlePrevStep = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    }
  };

  const handleNextStep = () => {
    if (timeline.length && activeStep < timeline.length - 1) {
      setActiveStep(activeStep + 1);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <h2 className="font-medium text-neuron-text-light dark:text-neuron-text-dark">
          Execution Flow
        </h2>

        {!compact && (
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
        )}
      </div>

      <div className="flex-1 overflow-hidden">
        {nodes.length > 0 ? (
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
            {!compact && <MiniMap nodeBorderRadius={8} />}
          </ReactFlow>
        ) : (
          <div className="h-full flex items-center justify-center">
            <p className="text-neuron-text-muted-light dark:text-neuron-text-muted-dark">
              Loading execution graph...
            </p>
          </div>
        )}
      </div>

      {!compact && timeline.length > 0 && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <TimelineSlider
            events={timeline}
            currentStep={activeStep}
            onChange={setActiveStep}
          />
          <div className="mt-4">
            <ExecutionControls
              isPlaying={isPlaying}
              canGoBack={activeStep > 0}
              canGoForward={activeStep < timeline.length - 1}
              onPlayPause={togglePlay}
              onStepBack={handlePrevStep}
              onStepForward={handleNextStep}
            />
            {timeline[activeStep] && (
              <div className="mt-3 p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 shadow">
                <p className="text-sm">{timeline[activeStep].description}</p>
                <p className="text-xs text-neuron-text-muted-light dark:text-neuron-text-muted-dark mt-1">
                  Time: {timeline[activeStep].timestamp_ms}ms
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExecutionVisualizer;
