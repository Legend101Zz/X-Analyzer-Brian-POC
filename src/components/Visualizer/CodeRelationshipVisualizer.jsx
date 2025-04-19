import React, { useState, useEffect, useRef } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  BaseEdge,
  useReactFlow,
} from "reactflow";
import "reactflow/dist/style.css";
import { motion } from "framer-motion";

// Custom node types
const nodeTypes = {
  package: ({ data }) => (
    <div className="p-3 rounded-lg shadow-lg border bg-yellow-50 dark:bg-yellow-900 dark:bg-opacity-50 border-yellow-300 dark:border-yellow-700">
      <div className="font-medium">{data.label}</div>
      {data.description && (
        <div className="text-xs mt-1 text-neuron-text-muted-light dark:text-neuron-text-muted-dark">
          {data.description}
        </div>
      )}
      <div className="mt-2 text-xs bg-yellow-100 dark:bg-yellow-800 dark:bg-opacity-50 px-2 py-1 rounded-md">
        Package: {data.files?.length || 0} files
      </div>
    </div>
  ),
  module: ({ data }) => (
    <div className="p-3 rounded-lg shadow-lg border bg-blue-50 dark:bg-blue-900 dark:bg-opacity-50 border-blue-300 dark:border-blue-700">
      <div className="font-medium">{data.label}</div>
      {data.description && (
        <div className="text-xs mt-1 text-neuron-text-muted-light dark:text-neuron-text-muted-dark">
          {data.description}
        </div>
      )}
      <div className="mt-2 text-xs bg-blue-100 dark:bg-blue-800 dark:bg-opacity-50 px-2 py-1 rounded-md">
        Module: {data.path}
      </div>
    </div>
  ),
  class: ({ data }) => (
    <div className="p-3 rounded-lg shadow-lg border bg-green-50 dark:bg-green-900 dark:bg-opacity-50 border-green-300 dark:border-green-700">
      <div className="font-medium">{data.label}</div>
      {data.description && (
        <div className="text-xs mt-1 text-neuron-text-muted-light dark:text-neuron-text-muted-dark">
          {data.description}
        </div>
      )}
      <div className="mt-2 text-xs bg-green-100 dark:bg-green-800 dark:bg-opacity-50 px-2 py-1 rounded-md">
        Class in {data.module}
      </div>
    </div>
  ),
  function: ({ data }) => (
    <div className="p-3 rounded-lg shadow-lg border bg-purple-50 dark:bg-purple-900 dark:bg-opacity-50 border-purple-300 dark:border-purple-700">
      <div className="font-medium">{data.label}</div>
      {data.description && (
        <div className="text-xs mt-1 text-neuron-text-muted-light dark:text-neuron-text-muted-dark">
          {data.description}
        </div>
      )}
      <div className="mt-2 text-xs bg-purple-100 dark:bg-purple-800 dark:bg-opacity-50 px-2 py-1 rounded-md">
        Function in {data.module}
      </div>
    </div>
  ),
};

// Custom edge types
const edgeTypes = {
  imports: ({ id, source, target, animated, style }) => (
    <BaseEdge
      id={id}
      source={source}
      target={target}
      animated={animated}
      style={{ ...style, stroke: "#4f46e5" }}
      className="imports-edge"
      markerEnd="importMarker"
    />
  ),
  depends: ({ id, source, target, animated, style }) => (
    <BaseEdge
      id={id}
      source={source}
      target={target}
      animated={animated}
      style={{ ...style, stroke: "#16a34a", strokeDasharray: "5,5" }}
      className="depends-edge"
      markerEnd="dependsMarker"
    />
  ),
  extends: ({ id, source, target, animated, style }) => (
    <BaseEdge
      id={id}
      source={source}
      target={target}
      animated={animated}
      style={{ ...style, stroke: "#ea580c" }}
      className="extends-edge"
      markerEnd="extendsMarker"
    />
  ),
  calls: ({ id, source, target, animated, style }) => (
    <BaseEdge
      id={id}
      source={source}
      target={target}
      animated={animated}
      style={{ ...style, stroke: "#0284c7" }}
      className="calls-edge"
      markerEnd="callsMarker"
    />
  ),
};

const CodeRelationshipVisualizer = ({
  viewType = "modules", // modules, inheritance, dataflow, dependencies
  selectedFile = null,
  onNodeClick = () => {},
}) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [loading, setLoading] = useState(true);
  const [relationType, setRelationType] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredNodes, setFilteredNodes] = useState([]);
  const [filteredEdges, setFilteredEdges] = useState([]);
  const [localViewType, setViewType] = useState(viewType); /
  const flowRef = useRef(null);
  const [rfInstance, setRfInstance] = useState(null);


  // Function to fit view
  const fitView = useCallback(() => {
    if (rfInstance) {
      rfInstance.fitView({ padding: 0.2 });
    }
  }, [rfInstance]);

  // Load data based on viewType
  useEffect(() => {
    setLoading(true);

    // This would be fetched from API in a real app
    // Here we'll create sample data based on the uploaded file structure

    if (viewType === "modules") {
      // Create a module relationship graph from the uploaded structure
      const moduleNodes = [
        {
          id: "core",
          type: "package",
          position: { x: 0, y: 0 },
          data: {
            label: "core",
            description: "Core Brian objects and simulation infrastructure",
            files: ["magic.py", "network.py", "clocks.py", "base.py"],
          },
        },
        {
          id: "units",
          type: "package",
          position: { x: 250, y: -150 },
          data: {
            label: "units",
            description: "Unit handling system",
            files: ["fundamentalunits.py", "allunits.py"],
          },
        },
        {
          id: "groups",
          type: "package",
          position: { x: 250, y: 50 },
          data: {
            label: "groups",
            description: "Neuron and other groups",
            files: ["neurongroup.py", "group.py"],
          },
        },
        {
          id: "monitors",
          type: "package",
          position: { x: 250, y: 250 },
          data: {
            label: "monitors",
            description: "Tools for recording simulation results",
            files: ["spikemonitor.py", "statemonitor.py", "ratemonitor.py"],
          },
        },
        {
          id: "synapses",
          type: "package",
          position: { x: 500, y: 150 },
          data: {
            label: "synapses",
            description: "Synaptic connections between neurons",
            files: ["synapses.py"],
          },
        },
        {
          id: "devices",
          type: "package",
          position: { x: 500, y: -150 },
          data: {
            label: "devices",
            description: "Device interfaces for different backends",
            files: ["device.py"],
          },
        },
      ];

      const moduleEdges = [
        {
          id: "e1",
          source: "core",
          target: "units",
          animated: false,
          type: "imports",
          label: "imports",
        },
        {
          id: "e2",
          source: "groups",
          target: "core",
          animated: false,
          type: "imports",
          label: "imports",
        },
        {
          id: "e3",
          source: "monitors",
          target: "core",
          animated: false,
          type: "imports",
          label: "imports",
        },
        {
          id: "e4",
          source: "synapses",
          target: "groups",
          animated: false,
          type: "imports",
          label: "imports",
        },
        {
          id: "e5",
          source: "core",
          target: "devices",
          animated: false,
          type: "depends",
          label: "depends on",
        },
        {
          id: "e6",
          source: "monitors",
          target: "groups",
          animated: false,
          type: "depends",
          label: "depends on",
        },
        {
          id: "e7",
          source: "core",
          target: "units",
          animated: false,
          type: "depends",
          label: "depends on",
        },
      ];

      setNodes(moduleNodes);
      setEdges(moduleEdges);
      setFilteredNodes(moduleNodes);
      setFilteredEdges(moduleEdges);
    } else if (viewType === "inheritance") {
      // Create a class inheritance graph
      const classNodes = [
        {
          id: "brianobject",
          type: "class",
          position: { x: 0, y: 0 },
          data: {
            label: "BrianObject",
            description: "Base class for all Brian objects",
            module: "core.base",
          },
        },
        {
          id: "group",
          type: "class",
          position: { x: -200, y: 150 },
          data: {
            label: "Group",
            description: "Base class for groups of neurons or synapses",
            module: "groups.group",
          },
        },
        {
          id: "neurongroup",
          type: "class",
          position: { x: -200, y: 300 },
          data: {
            label: "NeuronGroup",
            description: "Group of neurons with similar properties",
            module: "groups.neurongroup",
          },
        },
        {
          id: "network",
          type: "class",
          position: { x: 200, y: 150 },
          data: {
            label: "Network",
            description: "Container for simulating multiple Brian objects",
            module: "core.network",
          },
        },
        {
          id: "magicnetwork",
          type: "class",
          position: { x: 200, y: 300 },
          data: {
            label: "MagicNetwork",
            description: "Automatically constructed Network of Brian objects",
            module: "core.magic",
          },
        },
        {
          id: "monitor",
          type: "class",
          position: { x: 0, y: 150 },
          data: {
            label: "Monitor",
            description: "Base class for all monitors",
            module: "monitors.base",
          },
        },
        {
          id: "spikemonitor",
          type: "class",
          position: { x: -100, y: 300 },
          data: {
            label: "SpikeMonitor",
            description: "Records spike times and indices",
            module: "monitors.spikemonitor",
          },
        },
        {
          id: "statemonitor",
          type: "class",
          position: { x: 100, y: 300 },
          data: {
            label: "StateMonitor",
            description: "Records state variables over time",
            module: "monitors.statemonitor",
          },
        },
      ];

      const classEdges = [
        {
          id: "e1",
          source: "group",
          target: "brianobject",
          animated: false,
          type: "extends",
          label: "extends",
        },
        {
          id: "e2",
          source: "neurongroup",
          target: "group",
          animated: false,
          type: "extends",
          label: "extends",
        },
        {
          id: "e3",
          source: "network",
          target: "brianobject",
          animated: false,
          type: "extends",
          label: "extends",
        },
        {
          id: "e4",
          source: "magicnetwork",
          target: "network",
          animated: false,
          type: "extends",
          label: "extends",
        },
        {
          id: "e5",
          source: "monitor",
          target: "brianobject",
          animated: false,
          type: "extends",
          label: "extends",
        },
        {
          id: "e6",
          source: "spikemonitor",
          target: "monitor",
          animated: false,
          type: "extends",
          label: "extends",
        },
        {
          id: "e7",
          source: "statemonitor",
          target: "monitor",
          animated: false,
          type: "extends",
          label: "extends",
        },
      ];

      setNodes(classNodes);
      setEdges(classEdges);
      setFilteredNodes(classNodes);
      setFilteredEdges(classEdges);
    } else if (viewType === "dataflow") {
      // Create a function call/data flow graph
      const functionNodes = [
        {
          id: "run",
          type: "function",
          position: { x: 0, y: 0 },
          data: {
            label: "run()",
            description: "Entry point for simulations",
            module: "core.magic",
          },
        },
        {
          id: "magicnetwork_run",
          type: "function",
          position: { x: 250, y: 0 },
          data: {
            label: "MagicNetwork.run()",
            description: "MagicNetwork automatic collection/execution",
            module: "core.magic",
          },
        },
        {
          id: "network_run",
          type: "function",
          position: { x: 500, y: 0 },
          data: {
            label: "Network.run()",
            description: "Main simulation driver",
            module: "core.network",
          },
        },
        {
          id: "network_before_run",
          type: "function",
          position: { x: 500, y: 150 },
          data: {
            label: "Network.before_run()",
            description: "Prepare objects for simulation",
            module: "core.network",
          },
        },
        {
          id: "brianobject_before_run",
          type: "function",
          position: { x: 750, y: 150 },
          data: {
            label: "BrianObject.before_run()",
            description: "Prepare objects before simulation",
            module: "core.base",
          },
        },
        {
          id: "network_run_main_loop",
          type: "function",
          position: { x: 500, y: 300 },
          data: {
            label: "Network.run_main_loop()",
            description: "Main simulation loop",
            module: "core.network",
          },
        },
        {
          id: "brianobject_run",
          type: "function",
          position: { x: 750, y: 300 },
          data: {
            label: "BrianObject.run()",
            description: "Execute one time step",
            module: "core.base",
          },
        },
        {
          id: "network_after_run",
          type: "function",
          position: { x: 500, y: 450 },
          data: {
            label: "Network.after_run()",
            description: "Clean up after simulation",
            module: "core.network",
          },
        },
        {
          id: "brianobject_after_run",
          type: "function",
          position: { x: 750, y: 450 },
          data: {
            label: "BrianObject.after_run()",
            description: "Clean up after simulation",
            module: "core.base",
          },
        },
      ];

      const functionEdges = [
        {
          id: "e1",
          source: "run",
          target: "magicnetwork_run",
          animated: false,
          type: "calls",
          label: "calls",
        },
        {
          id: "e2",
          source: "magicnetwork_run",
          target: "network_run",
          animated: false,
          type: "calls",
          label: "calls",
        },
        {
          id: "e3",
          source: "network_run",
          target: "network_before_run",
          animated: false,
          type: "calls",
          label: "calls",
        },
        {
          id: "e4",
          source: "network_before_run",
          target: "brianobject_before_run",
          animated: false,
          type: "calls",
          label: "calls multiple",
        },
        {
          id: "e5",
          source: "network_run",
          target: "network_run_main_loop",
          animated: false,
          type: "calls",
          label: "contains",
        },
        {
          id: "e6",
          source: "network_run_main_loop",
          target: "brianobject_run",
          animated: false,
          type: "calls",
          label: "calls multiple",
        },
        {
          id: "e7",
          source: "network_run",
          target: "network_after_run",
          animated: false,
          type: "calls",
          label: "calls",
        },
        {
          id: "e8",
          source: "network_after_run",
          target: "brianobject_after_run",
          animated: false,
          type: "calls",
          label: "calls multiple",
        },
      ];

      setNodes(functionNodes);
      setEdges(functionEdges);
      setFilteredNodes(functionNodes);
      setFilteredEdges(functionEdges);
    } else if (viewType === "dependencies") {
      // Create a simplified dependency graph focused on brian2.core.magic components
      const dependencyNodes = [
        {
          id: "magic",
          type: "module",
          position: { x: 0, y: 0 },
          data: {
            label: "brian2.core.magic",
            description: "Magic functions for automatic network construction",
            path: "brian2/core/magic.py",
          },
        },
        {
          id: "network",
          type: "module",
          position: { x: 250, y: -100 },
          data: {
            label: "brian2.core.network",
            description: "Network class for running simulations",
            path: "brian2/core/network.py",
          },
        },
        {
          id: "base",
          type: "module",
          position: { x: 250, y: 100 },
          data: {
            label: "brian2.core.base",
            description: "Base classes for Brian objects",
            path: "brian2/core/base.py",
          },
        },
        {
          id: "groups",
          type: "module",
          position: { x: 500, y: -150 },
          data: {
            label: "brian2.groups",
            description: "Neuron group implementations",
            path: "brian2/groups",
          },
        },
        {
          id: "equations",
          type: "module",
          position: { x: 500, y: 0 },
          data: {
            label: "brian2.equations",
            description: "Differential equation handling",
            path: "brian2/equations",
          },
        },
        {
          id: "units",
          type: "module",
          position: { x: 500, y: 150 },
          data: {
            label: "brian2.units",
            description: "Physical unit system",
            path: "brian2/units",
          },
        },
        {
          id: "monitors",
          type: "module",
          position: { x: 750, y: -100 },
          data: {
            label: "brian2.monitors",
            description: "Recording monitors for simulation results",
            path: "brian2/monitors",
          },
        },
        {
          id: "clocks",
          type: "module",
          position: { x: 250, y: 200 },
          data: {
            label: "brian2.core.clocks",
            description: "Clock implementations for time tracking",
            path: "brian2/core/clocks.py",
          },
        },
      ];

      const dependencyEdges = [
        {
          id: "e1",
          source: "magic",
          target: "network",
          animated: false,
          type: "imports",
          label: "imports",
        },
        {
          id: "e2",
          source: "magic",
          target: "base",
          animated: false,
          type: "imports",
          label: "imports",
        },
        {
          id: "e3",
          source: "network",
          target: "base",
          animated: false,
          type: "imports",
          label: "imports",
        },
        {
          id: "e4",
          source: "network",
          target: "clocks",
          animated: false,
          type: "imports",
          label: "imports",
        },
        {
          id: "e5",
          source: "groups",
          target: "base",
          animated: false,
          type: "imports",
          label: "imports",
        },
        {
          id: "e6",
          source: "groups",
          target: "equations",
          animated: false,
          type: "imports",
          label: "imports",
        },
        {
          id: "e7",
          source: "groups",
          target: "units",
          animated: false,
          type: "imports",
          label: "imports",
        },
        {
          id: "e8",
          source: "monitors",
          target: "groups",
          animated: false,
          type: "imports",
          label: "imports",
        },
        {
          id: "e9",
          source: "monitors",
          target: "units",
          animated: false,
          type: "imports",
          label: "imports",
        },
        {
          id: "e10",
          source: "magic",
          target: "groups",
          animated: false,
          type: "depends",
          label: "depends on",
        },
        {
          id: "e11",
          source: "magic",
          target: "monitors",
          animated: false,
          type: "depends",
          label: "depends on",
        },
      ];

      setNodes(dependencyNodes);
      setEdges(dependencyEdges);
      setFilteredNodes(dependencyNodes);
      setFilteredEdges(dependencyEdges);
    }

    setLoading(false);
  }, [viewType]);

  // Filter nodes and edges based on search query and relation type
  useEffect(() => {
    if (!nodes.length) return;

    let filtered = [...nodes];

    // Filter by search query
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (node) =>
          node.data.label.toLowerCase().includes(query) ||
          (node.data.description &&
            node.data.description.toLowerCase().includes(query)),
      );
    }

    setFilteredNodes(filtered);

    // Filter edges based on filtered nodes and relation type
    const nodeIds = new Set(filtered.map((node) => node.id));
    let filteredEdges = edges.filter(
      (edge) => nodeIds.has(edge.source) && nodeIds.has(edge.target),
    );

    // Filter by relation type
    if (relationType !== "all") {
      filteredEdges = filteredEdges.filter(
        (edge) => edge.type === relationType,
      );
    }

    setFilteredEdges(filteredEdges);
  }, [nodes, edges, searchQuery, relationType]);

  // Fit view after filtering
  useEffect(() => {
    if (flowRef.current && filteredNodes.length > 0) {
      setTimeout(() => {
        flowRef.current.fitView({ padding: 0.2 });
      }, 50);
    }
  }, [filteredNodes, filteredEdges]);

  // Zoom to fit when component mounts
  useEffect(() => {
    if (flowRef.current && nodes.length > 0 && !loading) {
      setTimeout(() => {
        flowRef.current.fitView({ padding: 0.2 });
      }, 100);
    }
  }, [loading]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <span className="text-neuron-text-muted-light dark:text-neuron-text-muted-dark">
          Loading code relationships...
        </span>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <div className="flex justify-between items-center">
          <div className="flex space-x-2">
            <select
              value={viewType}
              onChange={(e) => setViewType(e.target.value)}
              className="text-sm border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 bg-white dark:bg-gray-700 text-neuron-text-light dark:text-neuron-text-dark focus:outline-none focus:ring-1 focus:ring-neuron-primary"
            >
              <option value="modules">Module Structure</option>
              <option value="inheritance">Class Inheritance</option>
              <option value="dataflow">Function Calls</option>
              <option value="dependencies">Dependencies</option>
            </select>

            <select
              value={relationType}
              onChange={(e) => setRelationType(e.target.value)}
              className="text-sm border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 bg-white dark:bg-gray-700 text-neuron-text-light dark:text-neuron-text-dark focus:outline-none focus:ring-1 focus:ring-neuron-primary"
            >
              <option value="all">All Relationships</option>
              <option value="imports">Imports</option>
              <option value="extends">Inheritance</option>
              <option value="calls">Function Calls</option>
              <option value="depends">Dependencies</option>
            </select>
          </div>

          <div className="relative flex-1 max-w-xs ml-4">
            <input
              type="text"
              placeholder="Search nodes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-1 pl-8 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-neuron-text-light dark:text-neuron-text-dark focus:outline-none focus:ring-1 focus:ring-neuron-primary"
            />
            <svg
              className="absolute left-2.5 top-2 w-3.5 h-3.5 text-gray-400 dark:text-gray-500"
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
      </div>

      <div className="flex-1 relative">
        <ReactFlow
          ref={flowRef}
          nodes={filteredNodes}
          edges={filteredEdges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          onNodeClick={(_, node) => onNodeClick(node)}
          fitView
          minZoom={0.1}
          maxZoom={2}
          defaultZoom={0.8}
        >
          <Background color="#a5b4fc" gap={16} size={1} />
          <Controls />
          <MiniMap
            nodeStrokeColor={(n) => {
              if (n.type === "package") return "#eab308";
              if (n.type === "module") return "#3b82f6";
              if (n.type === "class") return "#22c55e";
              return "#8b5cf6";
            }}
            nodeColor={(n) => {
              if (n.type === "package") return "#fef3c7";
              if (n.type === "module") return "#dbeafe";
              if (n.type === "class") return "#dcfce7";
              return "#f3e8ff";
            }}
            nodeBorderRadius={2}
          />
        </ReactFlow>

        {filteredNodes.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70 dark:bg-gray-800 dark:bg-opacity-70">
            <div className="text-center p-4 rounded-lg shadow-lg bg-white dark:bg-gray-700">
              <div className="text-lg font-medium mb-2">No results found</div>
              <p className="text-sm text-neuron-text-muted-light dark:text-neuron-text-muted-dark">
                Try adjusting your search or filters
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="p-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex justify-center">
        <div className="flex items-center space-x-6 text-xs text-neuron-text-muted-light dark:text-neuron-text-muted-dark">
          <div className="flex items-center">
            <div className="w-3 h-0.5 bg-indigo-600 mr-1"></div>
            <span>Imports</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-0.5 bg-green-600 mr-1 border-dashed border-t border-green-600"></div>
            <span>Depends On</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-0.5 bg-orange-600 mr-1"></div>
            <span>Extends</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-0.5 bg-blue-600 mr-1"></div>
            <span>Calls</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeRelationshipVisualizer;
