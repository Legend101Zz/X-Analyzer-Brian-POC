import React, { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import MonacoEditor from "@monaco-editor/react";
import ExecutionControls from "../Visualizer/ExecutionControls";

// Import our JSON data files (in a real app, these would be fetched)
import executionGraphData from "../../data/execution_graph.json";
import mappingData from "../../data/mapping.json";

const Editor = ({ module, path, readOnly = true }) => {
  const editorRef = useRef(null);
  const [code, setCode] = useState("");
  const [highlightRange, setHighlightRange] = useState(null);
  const [fileName, setFileName] = useState("");
  const [currentLine, setCurrentLine] = useState(1);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionProgress, setExecutionProgress] = useState(0);

  // Find code snippet based on module or path
  useEffect(() => {
    let content = "";
    let name = "";

    if (module) {
      // Find snippet from execution_graph.json
      const node = executionGraphData.graph.nodes.find((n) =>
        n.file_path.includes(module.path),
      );

      if (node) {
        content = node.snippet;
        name = node.name;

        // Find range for highlighting
        const mapping = mappingData.mappings.find((m) => m.node_id === node.id);
        if (mapping) {
          setHighlightRange({
            startLineNumber: mapping.line_start,
            endLineNumber: mapping.line_end,
          });
        }
      }
    } else if (path) {
      // For learning paths, load from the path data
      content = path.code_snippet || "";
      name = path.title || "";
    } else {
      content = "# Select a module or learning path to view code";
    }

    setCode(content);
    setFileName(name);
  }, [module, path]);

  // Handle editor mount
  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;

    // Configure editor
    monaco.editor.defineTheme("neuronTheme", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "comment", foreground: "6b7280" },
        { token: "keyword", foreground: "818cf8" },
        { token: "string", foreground: "34d399" },
      ],
      colors: {
        "editor.foreground": "#f3f4f6",
        "editor.background": "#111827",
        "editor.lineHighlightBackground": "#4338ca30",
        "editorCursor.foreground": "#818cf8",
      },
    });

    // Apply highlighting if range exists
    if (highlightRange) {
      editor.revealLineInCenter(highlightRange.startLineNumber);
      setCurrentLine(highlightRange.startLineNumber);
    }
  };

  // Simulate execution
  const handleExecute = () => {
    if (!editorRef.current) return;

    setIsExecuting(true);
    setExecutionProgress(0);

    // Clear any existing decorations
    editorRef.current.deltaDecorations([], []);

    // Get total lines to execute
    const totalLines = editorRef.current.getModel().getLineCount();
    let currentLineNumber = 1;

    // Simulate execution with a timer
    const executeInterval = setInterval(() => {
      if (currentLineNumber > totalLines) {
        clearInterval(executeInterval);
        setIsExecuting(false);
        return;
      }

      // Highlight current line
      editorRef.current.deltaDecorations(
        [],
        [
          {
            range: {
              startLineNumber: currentLineNumber,
              endLineNumber: currentLineNumber,
              startColumn: 1,
              endColumn: 1000,
            },
            options: {
              isWholeLine: true,
              className: "bg-neuron-primary bg-opacity-20",
            },
          },
        ],
      );

      editorRef.current.revealLineInCenter(currentLineNumber);
      setCurrentLine(currentLineNumber);
      setExecutionProgress((currentLineNumber / totalLines) * 100);

      currentLineNumber++;
    }, 300); // Adjust speed as needed
  };

  return (
    <div className="h-full flex flex-col">
      <div className="border-b border-gray-200 dark:border-gray-700 p-3 flex justify-between items-center">
        <div>
          <h3 className="font-medium text-neuron-text-light dark:text-neuron-text-dark">
            {fileName || "Code Editor"}
          </h3>
          <p className="text-xs text-neuron-text-muted-light dark:text-neuron-text-muted-dark mt-1">
            {module?.path || path?.file_path || ""}
          </p>
        </div>

        {!readOnly && (
          <button
            onClick={handleExecute}
            disabled={isExecuting}
            className={`px-3 py-1.5 rounded-md text-sm font-medium ${
              isExecuting
                ? "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                : "bg-neuron-primary text-white hover:bg-neuron-accent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neuron-primary"
            }`}
          >
            {isExecuting ? "Executing..." : "Run Code"}
          </button>
        )}
      </div>

      <div className="flex-1 overflow-hidden">
        <MonacoEditor
          height="100%"
          language="python"
          theme="vs-dark"
          value={code}
          options={{
            readOnly: readOnly,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            fontSize: 14,
            lineNumbers: "on",
            wordWrap: "on",
            automaticLayout: true,
          }}
          onMount={handleEditorDidMount}
          onChange={(value) => setCode(value)}
        />
      </div>

      {isExecuting && (
        <div className="border-t border-gray-200 dark:border-gray-700 p-2">
          <div className="flex items-center">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-2">
              <motion.div
                className="bg-neuron-synaptic h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${executionProgress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <span className="text-xs text-neuron-text-muted-light dark:text-neuron-text-muted-dark">
              Line {currentLine}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Editor;
