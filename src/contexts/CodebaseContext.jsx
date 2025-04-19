import React, { createContext, useState, useContext, useEffect } from "react";

// Create a context for codebase data
const CodebaseContext = createContext();

export const CodebaseProvider = ({ children }) => {
  // State for module structure
  const [moduleStructure, setModuleStructure] = useState(null);

  // State for execution graph
  const [executionGraph, setExecutionGraph] = useState(null);

  // State for timeline data
  const [timelineData, setTimelineData] = useState(null);

  // State for code coverage
  const [coverageData, setCoverageData] = useState(null);

  // State for relationship data
  const [relationshipData, setRelationshipData] = useState({
    modules: null,
    inheritance: null,
    dataflow: null,
    dependencies: null,
  });

  // State for codebase metrics
  const [codebaseMetrics, setCodebaseMetrics] = useState(null);

  // State for loading files
  const [loadedFiles, setLoadedFiles] = useState({});

  // Load a file from the codebase
  const loadFile = async (filePath) => {
    // In a real app, this would fetch the file content
    // For this demo, we'll simulate loading

    // Check if already loaded
    if (loadedFiles[filePath]) {
      return loadedFiles[filePath];
    }

    // Simulated file content (in a real app, this would come from the server or filesystem)
    const simulatedContent = `# ${filePath}\n# This is a simulated file content\n\n`;

    // Create more detailed content based on file path
    let detailedContent = simulatedContent;

    if (filePath.includes("magic.py")) {
      detailedContent += `
@check_units(duration=second, report_period=second)
def run(duration, report=None, report_period=10*second, namespace=None, profile=None, level=0):
    """Run a simulation with all 'visible' Brian objects for the given duration."""
    return magic_network.run(
        duration,
        report=report,
        report_period=report_period,
        namespace=namespace,
        profile=profile,
        level=2 + level,
    )
      `;
    } else if (filePath.includes("network.py")) {
      detailedContent += `
@device_override("network_run")
@check_units(duration=second, report_period=second)
def run(self, duration, report=None, report_period=10*second, namespace=None, profile=None, level=0):
    # Get all objects, clocks, set up variables
    all_objects = self.sorted_objects
    self._clocks = {obj.clock for obj in all_objects}
    single_clock = len(self._clocks) == 1

    t_start = self.t
    t_end = self.t + duration

    # Set up clocks for the run
    if single_clock:
        clock = list(self._clocks)[0]
        clock.set_interval(self.t, t_end)
    else:
        # Get references to clock variables
        self._clock_variables = {c: (c.variables["timestep"].get_value(),
                             c.variables["t"].get_value(),
                             c.variables["dt"].get_value())
                        for c in self._clocks}
      `;
    } else if (filePath.includes("neurongroup.py")) {
      detailedContent += `
def __init__(self, N, model=None, threshold=None, reset=None, refractory=False,
           events=None, method=None, namespace=None, dtype=None, dt=None,
           clock=None, order=0, name='neurongroup*'):
    """Create a new neuron group."""
    self.codeobj_class = None
    Group.__init__(self, name=name)

    self.namespace = namespace

    self.N = N = int(N)  # Total number of neurons

    # Variables defined by the user
    self.user_variables = []

    # Setup the equations
    if isinstance(model, str):
        self.equations = Equations(model)
    else:
        self.equations = model
      `;
    }

    // Cache the loaded file
    setLoadedFiles((prev) => ({
      ...prev,
      [filePath]: detailedContent,
    }));

    return detailedContent;
  };

  // Function to get code coverage data
  const getCodeCoverage = (moduleFilter = null) => {
    // In a real app, this would calculate or fetch actual coverage data
    // For this demo, we'll return simulated data

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
      // Add more modules as needed
    ];

    // Apply module filtering if specified
    if (moduleFilter) {
      return sampleCoverageData.filter((module) =>
        module.module.includes(moduleFilter),
      );
    }

    return sampleCoverageData;
  };

  // Function to get execution debug state at a specific step
  const getExecutionStateAtStep = (stepIndex) => {
    // In a real app, this would return the actual execution state
    // For this demo, we'll return simulated data

    if (
      !timelineData ||
      !timelineData.events ||
      stepIndex >= timelineData.events.length
    ) {
      return null;
    }

    const event = timelineData.events[stepIndex];

    // Find the corresponding node in the execution graph
    const node = executionGraph?.graph.nodes.find(
      (n) => n.id === event.node_id,
    );

    if (!node) {
      return null;
    }

    // Simulate call stack based on execution graph edges
    const callStack = [];

    // Add the current function to the call stack
    callStack.push({
      function: node.name,
      file: node.file_path,
      line: node.line_start,
      locals: {
        // Simulated local variables
        duration:
          "1*second" + (node.name.includes("run") ? "" : " (inherited)"),
        t_start: "0*second",
        t_end: "1*second",
      },
    });

    // Add parent functions to the call stack if applicable
    if (executionGraph?.graph.edges) {
      // Find edges pointing to the current node (i.e., functions that called this one)
      const incomingEdges = executionGraph.graph.edges.filter(
        (e) => e.to === event.node_id,
      );

      // For each incoming edge, add the source node to the call stack
      incomingEdges.forEach((edge) => {
        const parentNode = executionGraph.graph.nodes.find(
          (n) => n.id === edge.from,
        );
        if (parentNode) {
          callStack.push({
            function: parentNode.name,
            file: parentNode.file_path,
            line: parentNode.line_start,
            locals: {
              // Simulated local variables for parent function
              duration: "1*second",
              report: "None",
              namespace: "None",
            },
          });
        }
      });
    }

    // Simulate memory objects based on execution step
    const memoryObjects = [
      {
        id: "mem1",
        type: "NeuronGroup",
        size: "2.4 MB",
        address: "0x7f8a4c2d1000",
        allocation: `Created at step ${Math.max(0, stepIndex - 2)}`,
        references: 2,
      },
      {
        id: "mem2",
        type: "StateMonitor",
        size: "1.2 MB",
        address: "0x7f8a4c2d3000",
        allocation: `Created at step ${Math.max(0, stepIndex - 1)}`,
        references: 1,
      },
    ];

    // Add more memory objects based on execution step
    if (stepIndex > 5) {
      memoryObjects.push({
        id: "mem3",
        type: "Clock",
        size: "0.4 MB",
        address: "0x7f8a4c2d5000",
        allocation: `Created at step ${stepIndex - 5}`,
        references: 3,
      });
    }

    // Simulate variables in scope based on current node and execution step
    const variablesInScope = {
      duration: {
        type: "Quantity",
        value: "1*second",
        description: "The time duration for simulation",
      },
      t_start: {
        type: "Quantity",
        value: "0*second",
        description: "Start time of simulation",
      },
      t_end: {
        type: "Quantity",
        value: "1*second",
        description: "End time of simulation",
      },
    };

    // Add more context-specific variables
    if (node.name.includes("Network")) {
      variablesInScope.all_objects = {
        type: "list",
        value: "[NeuronGroup(...), StateMonitor(...), ...]",
        description: "All objects in the network",
      };

      variablesInScope.single_clock = {
        type: "bool",
        value: "True",
        description: "Whether all objects share a clock",
      };
    }

    return {
      currentNode: node,
      event,
      callStack,
      memoryObjects,
      variablesInScope,
    };
  };

  // Load all the required data on context initialization
  useEffect(() => {
    const loadData = async () => {
      // In a real app, these would fetch actual data
      // For this demo, we'll use the data from our JSON files

      // Import the data from the JSON files
      const moduleStructureData = (
        await import("../data/module_structure.json")
      ).default;
      const executionGraphData = (await import("../data/execution_graph.json"))
        .default;
      const timelineData = (await import("../data/timeline.json")).default;
      const dataFlowData = (await import("../data/data_flow.json")).default;

      setModuleStructure(moduleStructureData);
      setExecutionGraph(executionGraphData);
      setTimelineData(timelineData);

      // Calculate coverage data
      setCoverageData(getCodeCoverage());

      // Generate basic codebase metrics
      setCodebaseMetrics({
        totalFiles: 235,
        totalLines: 52890,
        totalClasses: 87,
        totalFunctions: 624,
        // ... other metrics would be calculated here
      });
    };

    loadData();
  }, []);

  // Expose the context values
  const contextValue = {
    // Data
    moduleStructure,
    executionGraph,
    timelineData,
    coverageData,
    relationshipData,
    codebaseMetrics,

    // Functions
    loadFile,
    getCodeCoverage,
    getExecutionStateAtStep,
  };

  return (
    <CodebaseContext.Provider value={contextValue}>
      {children}
    </CodebaseContext.Provider>
  );
};

// Custom hook to use the codebase context
export const useCodebase = () => {
  const context = useContext(CodebaseContext);
  if (!context) {
    throw new Error("useCodebase must be used within a CodebaseProvider");
  }
  return context;
};
