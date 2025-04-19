import React, { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import MonacoEditor from "@monaco-editor/react";
import { useCodebase } from "../../contexts/CodebaseContext";

const CodeView = ({
  filePath,
  highlightedLines = [],
  currentLine = null,
  readOnly = true,
  breakpoints = [],
  onBreakpointToggle = () => {},
  onChange = () => {},
  height = "100%",
  showLineNumbers = true,
  minimap = false,
  theme = "vs-dark",
}) => {
  const editorRef = useRef(null);
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [decorations, setDecorations] = useState([]);
  const { loadFile } = useCodebase();

  // Safe way to get file extension
  const getFileExtension = (path) => {
    if (!path) return "";
    const parts = path.split(".");
    return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : "";
  };

  // Safe way to get file name
  const getFileName = (path) => {
    if (!path) return "unknown";
    const parts = path.split("/");
    return parts[parts.length - 1];
  };

  // Load file content when filePath changes
  useEffect(() => {
    if (!filePath) {
      setCode("// Select a file to view its code");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const loadContent = async () => {
      try {
        const content = await loadFile(filePath);
        setCode(content);
      } catch (error) {
        console.error("Error loading file:", error);
        setCode(`// Error loading file: ${filePath}\n// ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    loadContent();
  }, [filePath, loadFile]);

  // Handle editor mount
  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;

    // Define custom theme
    monaco.editor.defineTheme("neuronTheme", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "comment", foreground: "6b7280" },
        { token: "keyword", foreground: "818cf8" },
        { token: "string", foreground: "34d399" },
        { token: "function", foreground: "f472b6" },
        { token: "number", foreground: "fb923c" },
        { token: "decorator", foreground: "f59e0b" },
        { token: "type", foreground: "60a5fa" },
      ],
      colors: {
        "editor.foreground": "#f3f4f6",
        "editor.background": "#111827",
        "editor.lineHighlightBackground": "#4338ca30",
        "editorCursor.foreground": "#818cf8",
        "editor.selectionBackground": "#818cf830",
        "editor.inactiveSelectionBackground": "#818cf815",
        "editorLineNumber.foreground": "#6b7280",
        "editorLineNumber.activeForeground": "#f3f4f6",
      },
    });

    // Apply the custom theme
    monaco.editor.setTheme("neuronTheme");

    // Apply highlighting for current line and highlighted lines
    updateDecorations(editor, monaco);
  };

  // Update decorations when highlighted lines or current line changes
  useEffect(() => {
    if (editorRef.current) {
      const monaco = window.monaco;
      if (monaco) {
        updateDecorations(editorRef.current, monaco);
      }
    }
  }, [highlightedLines, currentLine, breakpoints]);

  // Function to update decorations
  const updateDecorations = (editor, monaco) => {
    if (!editor || !monaco) return;

    const newDecorations = [];

    // Highlighted lines decoration
    if (highlightedLines && highlightedLines.length > 0) {
      highlightedLines.forEach((line) => {
        newDecorations.push({
          range: new monaco.Range(line, 1, line, 1),
          options: {
            isWholeLine: true,
            className: "bg-blue-500 bg-opacity-20",
            linesDecorationsClassName: "border-l-2 border-blue-500",
          },
        });
      });
    }

    // Current line decoration (execution pointer)
    if (currentLine) {
      newDecorations.push({
        range: new monaco.Range(currentLine, 1, currentLine, 1),
        options: {
          isWholeLine: true,
          className: "bg-yellow-500 bg-opacity-30",
          linesDecorationsClassName: "border-l-4 border-yellow-500",
          overviewRuler: {
            color: "#eab308",
            position: monaco.editor.OverviewRulerLane.Left,
          },
        },
      });

      // Ensure current line is visible
      editor.revealLineInCenter(currentLine);
    }

    // Breakpoint decorations
    if (breakpoints && breakpoints.length > 0) {
      breakpoints.forEach((line) => {
        newDecorations.push({
          range: new monaco.Range(line, 1, line, 1),
          options: {
            isWholeLine: false,
            linesDecorationsClassName: "bg-red-500 w-4 h-4 rounded-full -ml-2",
            overviewRuler: {
              color: "#ef4444",
              position: monaco.editor.OverviewRulerLane.Left,
            },
          },
        });
      });
    }

    // Update decorations in the editor
    if (newDecorations.length > 0) {
      const decorationIds = editor.deltaDecorations([], newDecorations);
      setDecorations(decorationIds);
    } else if (decorations.length > 0) {
      editor.deltaDecorations(decorations, []);
      setDecorations([]);
    }
  };

  // Handle line clicks for breakpoints
  const handleLineClick = (event) => {
    if (!editorRef.current || !window.monaco || !breakpoints) return;

    const position = editorRef.current.getPosition();
    if (position) {
      const lineNumber = position.lineNumber;
      const isBreakpoint = breakpoints.includes(lineNumber);

      if (isBreakpoint) {
        onBreakpointToggle(
          lineNumber,
          breakpoints.filter((line) => line !== lineNumber),
        );
      } else {
        onBreakpointToggle(lineNumber, [...breakpoints, lineNumber]);
      }
    }
  };

  // Determine language based on file extension
  const getLanguage = () => {
    const ext = getFileExtension(filePath);
    switch (ext) {
      case "py":
        return "python";
      case "js":
      case "jsx":
        return "javascript";
      case "ts":
      case "tsx":
        return "typescript";
      case "json":
        return "json";
      case "html":
        return "html";
      case "css":
        return "css";
      case "cpp":
      case "c":
      case "h":
        return "cpp";
      case "md":
        return "markdown";
      default:
        return "plaintext";
    }
  };

  return (
    <div className="h-full flex flex-col">
      {filePath && (
        <div className="p-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs">
          <div className="flex justify-between items-center">
            <span className="font-mono truncate">
              {filePath || "No file selected"}
            </span>
            {currentLine && (
              <span className="bg-yellow-100 dark:bg-yellow-900 px-2 py-0.5 rounded text-yellow-800 dark:text-yellow-200">
                Line {currentLine}
              </span>
            )}
          </div>
        </div>
      )}

      <div className="flex-1 relative">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 bg-opacity-75 dark:bg-opacity-75">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 border-t-2 border-b-2 border-neuron-primary dark:border-neuron-secondary rounded-full animate-spin"></div>
              <span className="mt-2 text-sm text-neuron-text-muted-light dark:text-neuron-text-muted-dark">
                Loading file...
              </span>
            </div>
          </div>
        ) : null}

        <MonacoEditor
          height={height}
          language={getLanguage()}
          theme={theme}
          value={code}
          options={{
            readOnly,
            minimap: { enabled: minimap },
            scrollBeyondLastLine: false,
            fontSize: 14,
            lineNumbers: showLineNumbers ? "on" : "off",
            wordWrap: "on",
            folding: true,
            foldingStrategy: "indentation",
            automaticLayout: true,
            fixedOverflowWidgets: true,
            scrollbar: {
              vertical: "visible",
              horizontal: "visible",
              verticalScrollbarSize: 12,
              horizontalScrollbarSize: 12,
            },
            lineDecorationsWidth: 10,
            lineNumbersMinChars: 3,
            glyphMargin: breakpoints !== undefined,
            contextmenu: true,
            renderLineHighlight: "all",
          }}
          onMount={handleEditorDidMount}
          onChange={(value) => {
            setCode(value || "");
            onChange(value || "");
          }}
          onLineChange={handleLineClick}
        />

        {/* Custom gutter for interaction */}
        {breakpoints !== undefined && (
          <div
            className="absolute top-0 bottom-0 left-0 w-8 z-10 cursor-pointer"
            onClick={handleLineClick}
          ></div>
        )}

        {/* Code actions menu (optional) */}
        {!readOnly && (
          <div className="absolute top-2 right-2 z-20">
            <div className="flex bg-white dark:bg-gray-800 rounded shadow-md p-1">
              <button
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                title="Format code"
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
                    d="M4 6h16M4 12h16m-7 6h7"
                  />
                </svg>
              </button>
              <button
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                title="Save changes"
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
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Current execution context (bottom panel) */}
      {currentLine && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 overflow-hidden"
        >
          <div className="p-2 flex items-center justify-between">
            <div className="flex items-center text-xs">
              <span className="font-medium mr-2">Current context:</span>
              <span className="bg-neuron-primary bg-opacity-10 dark:bg-opacity-20 text-neuron-primary dark:text-neuron-secondary px-2 py-0.5 rounded">
                {getFileName(filePath)}:{currentLine}
              </span>
            </div>

            <div className="flex space-x-1">
              <button
                className="text-xs px-2 py-1 bg-neuron-secondary bg-opacity-10 text-neuron-secondary rounded hover:bg-opacity-20"
                title="Step into"
              >
                Step Into
              </button>
              <button
                className="text-xs px-2 py-1 bg-neuron-secondary bg-opacity-10 text-neuron-secondary rounded hover:bg-opacity-20"
                title="Step over"
              >
                Step Over
              </button>
              <button
                className="text-xs px-2 py-1 bg-neuron-secondary bg-opacity-10 text-neuron-secondary rounded hover:bg-opacity-20"
                title="Continue"
              >
                Continue
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default CodeView;
