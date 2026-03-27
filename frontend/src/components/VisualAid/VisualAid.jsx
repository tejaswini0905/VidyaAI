import React, { useState, useRef, useEffect } from "react";
import mermaid from "mermaid";

const EduVisualAidGenerator = () => {
  // State management
  const [inputText, setInputText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [mermaidCode, setMermaidCode] = useState("");
  const [uploadedImage, setUploadedImage] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Refs
  const fileInputRef = useRef(null);
  const mermaidContainerRef = useRef(null);
  const recognitionRef = useRef(null);

  // Initialize mermaid
  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false, // Changed to false for manual control
      theme: "default",
      securityLevel: "loose",
      fontFamily: "Arial, sans-serif",
    });
  }, []);

  // Render mermaid diagram
  const renderMermaid = async (code) => {
    if (!code || !mermaidContainerRef.current) return;
    
    setError("");
    const container = mermaidContainerRef.current;
    container.innerHTML = '';

    try {
      // Validate if it's proper mermaid code
      if (!code.trim().startsWith('graph') && 
          !code.trim().startsWith('flowchart') &&
          !code.trim().startsWith('sequenceDiagram') &&
          !code.trim().startsWith('classDiagram') &&
          !code.trim().startsWith('stateDiagram') &&
          !code.trim().startsWith('pie') &&
          !code.trim().startsWith('gitGraph')) {
        throw new Error("Invalid Mermaid syntax. Code should start with graph, flowchart, sequenceDiagram, etc.");
      }

      const { svg } = await mermaid.render('mermaid-svg', code);
      container.innerHTML = svg;
    } catch (err) {
      console.error("Mermaid rendering error:", err);
      setError(err.message);
      container.innerHTML = `
        <div class="text-red-600 p-4 bg-red-50 rounded-lg">
          <div class="font-bold mb-2">Diagram Error:</div>
          <div class="text-sm">${err.message}</div>
          <div class="mt-3 text-xs text-gray-600">Raw Mermaid Code:</div>
          <pre class="bg-gray-100 p-2 mt-1 rounded text-xs overflow-x-auto">${code}</pre>
        </div>
      `;
    }
  };

  // Auto render when mermaidCode changes
  useEffect(() => {
    if (mermaidCode) {
      renderMermaid(mermaidCode);
    }
  }, [mermaidCode]);

  // Handle speech recognition
  useEffect(() => {
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map((result) => result[0])
          .map((result) => result.transcript)
          .join("");
        setInputText(transcript);
      };

      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error", event.error);
        setIsRecording(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // Toggle speech recognition
  const toggleSpeechRecognition = () => {
    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedImage(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Generate visual aid from backend
  const generateVisualAid = async () => {
    if (!inputText.trim()) return;
    setIsGenerating(true);
    setError("");
    setSaveSuccess(false);

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/v1/visual/visual-aid/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ question: inputText }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Check if backend returned valid mermaid code
      if (data.mermaid_code && typeof data.mermaid_code === 'string') {
        setMermaidCode(data.mermaid_code);
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      console.error("Error generating visual aid:", error);
      setError(`Failed to generate diagram: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // Save visual aid to backend
  const saveVisualAid = async () => {
    if (!mermaidCode || !mermaidContainerRef.current) {
      setError("No diagram to save");
      return;
    }

    setIsSaving(true);
    setError("");
    setSaveSuccess(false);

    try {
      // Get the SVG element
      const svgElement = mermaidContainerRef.current.querySelector('svg');
      if (!svgElement) {
        throw new Error("No SVG element found");
      }

      // Convert SVG to Blob
      const svgData = new XMLSerializer().serializeToString(svgElement);
      const blob = new Blob([svgData], { type: 'image/svg+xml' });

      // Create FormData to send the file
      const formData = new FormData();
      formData.append('image', blob, 'visual-aid.svg');

      // Send to backend
      const response = await fetch(
        "http://127.0.0.1:8000/api/v1/visual/save-visual-aid/",
        {
          method: "POST",
          body: formData,
          // Note: Don't set Content-Type header when using FormData
          // The browser will set it automatically with the correct boundary
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      const data = await response.json();
      setSaveSuccess(true);
      console.log("Visual aid saved successfully:", data);

    } catch (error) {
      console.error("Error saving visual aid:", error);
      setError(`Failed to save diagram: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Clear everything and start fresh
  const clearAndNew = () => {
    setInputText("");
    setMermaidCode("");
    setUploadedImage(null);
    setError("");
    setSaveSuccess(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    if (mermaidContainerRef.current) {
      mermaidContainerRef.current.innerHTML = '';
    }
  };

  // Download output
  const downloadOutput = (format) => {
    if (!mermaidCode) return;
    
    if (format === 'svg' && mermaidContainerRef.current) {
      const svgElement = mermaidContainerRef.current.querySelector('svg');
      if (svgElement) {
        const svgData = new XMLSerializer().serializeToString(svgElement);
        const blob = new Blob([svgData], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'diagram.svg';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        return;
      }
    }
    
    alert(`Downloading in ${format} format would be implemented here`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-6">
      <a
        href="/teacher"
        className="fixed top-4 right-4 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition shadow-md"
      >
        Home
      </a>
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-10">
          <h1 className="text-4xl font-bold text-blue-800 mb-2">EduVisuals</h1>
          <p className="text-blue-600">
            Generate educational visual aids from descriptions
          </p>
        </header>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {saveSuccess && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-6">
            <strong className="font-bold">Success: </strong>
            <span className="block sm:inline">Visual aid saved successfully!</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="bg-white rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl">
            <h2 className="text-2xl font-semibold text-blue-800 mb-4">
              Input Description
            </h2>

            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <label className="text-blue-700 font-medium">
                  Describe your visual aid:
                </label>
                <button
                  onClick={toggleSpeechRecognition}
                  className={`flex items-center px-3 py-1 rounded-full text-sm ${
                    isRecording
                      ? "bg-red-100 text-red-700"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  <i
                    className={`fas ${
                      isRecording ? "fa-microphone-slash" : "fa-microphone"
                    } mr-1`}
                  ></i>
                  {isRecording ? "Stop Recording" : "Speech Input"}
                </button>
              </div>

              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Describe the visual aid you want to create (e.g., 'a simple water cycle diagram with evaporation, condensation, and precipitation')"
                className="w-full h-40 p-4 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            <div className="mb-6">
              <label className="block text-blue-700 font-medium mb-2">
                Upload reference image (optional):
              </label>
              <div className="flex items-center">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current.click()}
                  className="flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                >
                  <i className="fas fa-upload mr-2"></i>
                  Choose File
                </button>
                {uploadedImage && (
                  <span className="ml-3 text-sm text-blue-600">
                    <i className="fas fa-check-circle text-green-500 mr-1"></i>
                    Image uploaded
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={generateVisualAid}
                disabled={isGenerating || !inputText.trim()}
                className={`py-3 rounded-lg font-medium transition-all ${
                  isGenerating || !inputText.trim()
                    ? "bg-blue-300 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
              >
                {isGenerating ? (
                  <span>
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Generating...
                  </span>
                ) : (
                  "Generate Visual Aid"
                )}
              </button>
              
              <button
                onClick={clearAndNew}
                className="py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                <i className="fas fa-plus-circle mr-2"></i>
                Clear & New
              </button>
            </div>
          </div>

          {/* Output Section */}
          <div className="bg-white rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl">
            <h2 className="text-2xl font-semibold text-blue-800 mb-4">
              Visual Output
            </h2>

            <div className="flex justify-between items-center mb-4">
              <span className="text-blue-700 font-medium">Preview:</span>
              <div className="flex space-x-2">
                <button
                  onClick={saveVisualAid}
                  disabled={!mermaidCode || isSaving}
                  className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                    !mermaidCode || isSaving
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-green-100 text-green-700 hover:bg-green-200"
                  }`}
                >
                  {isSaving ? (
                    <span>
                      <i className="fas fa-spinner fa-spin mr-1"></i>
                      Saving...
                    </span>
                  ) : (
                    <span>
                      <i className="fas fa-save mr-1"></i>
                      Save
                    </span>
                  )}
                </button>
                <button
                  onClick={() => downloadOutput("svg")}
                  disabled={!mermaidCode}
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <i className="fas fa-download mr-1"></i> SVG
                </button>
                <button
                  onClick={() => downloadOutput("png")}
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200 transition-colors"
                >
                  <i className="fas fa-download mr-1"></i> PNG
                </button>
                <button
                  onClick={() => downloadOutput("pdf")}
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200 transition-colors"
                >
                  <i className="fas fa-download mr-1"></i> PDF
                </button>
              </div>
            </div>

            <div className="border-2 border-dashed border-blue-200 rounded-lg p-4 min-h-[300px] flex items-center justify-center">
              <div ref={mermaidContainerRef} className="w-full h-full flex items-center justify-center">
                {!mermaidCode && (
                  <div className="text-center text-blue-400">
                    <i className="fas fa-image text-4xl mb-3"></i>
                    <p>Your visual aid will appear here</p>
                  </div>
                )}
              </div>
            </div>

            {mermaidCode && (
              <div className="mt-4">
                <label className="block text-blue-700 font-medium mb-2">
                  Mermaid.js Code:
                </label>
                <pre className="bg-gray-100 p-3 rounded-lg overflow-x-auto text-sm">
                  {mermaidCode}
                </pre>
              </div>
            )}
          </div>
        </div>

        {/* Example Section */}
        <div className="mt-12 bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-semibold text-blue-800 mb-4">
            Example Usage
          </h2>
          <p className="text-blue-700 mb-4">Try these example descriptions:</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => {
                clearAndNew();
                setTimeout(() => setInputText(
                  "Create a water cycle diagram showing evaporation, condensation, precipitation, and collection."
                ), 100);
              }}
              className="p-4 bg-blue-50 rounded-lg text-blue-700 hover:bg-blue-100 transition-colors text-left"
            >
              <i className="fas fa-tint text-blue-500 mr-2"></i>
              Water Cycle Diagram
            </button>
            <button
              onClick={() => {
                clearAndNew();
                setTimeout(() => setInputText(
                  "Draw a flowchart of photosynthesis with light, water, and CO2 as inputs and glucose and oxygen as outputs."
                ), 100);
              }}
              className="p-4 bg-blue-50 rounded-lg text-blue-700 hover:bg-blue-100 transition-colors text-left"
            >
              <i className="fas fa-leaf text-green-500 mr-2"></i>
              Photosynthesis Flowchart
            </button>
            <button
              onClick={() => {
                clearAndNew();
                setTimeout(() => setInputText(
                  "Create a bar chart comparing the average rainfall in different months for a temperate climate."
                ), 100);
              }}
              className="p-4 bg-blue-50 rounded-lg text-blue-700 hover:bg-blue-100 transition-colors text-left"
            >
              <i className="fas fa-chart-bar text-yellow-500 mr-2"></i>
              Rainfall Bar Chart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EduVisualAidGenerator;