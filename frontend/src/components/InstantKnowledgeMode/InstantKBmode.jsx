import { useState, useRef } from 'react';
import { 
  BookOpen, 
  Brain, 
  Zap, 
  Mic, 
  MicOff, 
  Camera, 
  MessageSquare,
  Upload,
  X,
  Image as ImageIcon,
  Send,
  Sparkles,
  Lightbulb,
  Volume2,
  ThumbsUp,
  ThumbsDown,
  Copy
} from 'lucide-react';

// Button component implementation
const Button = ({ 
  variant = 'default', 
  size = 'default', 
  className = '', 
  children, 
  disabled = false,
  ...props 
}) => {
  const baseStyles = 'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background';
  
  const variants = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90',
    destructive: 'bg-red-600 text-white hover:bg-red-700',
    outline: 'border border-input hover:bg-accent hover:text-accent-foreground',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
    hero: 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:opacity-90'
  };
  
  const sizes = {
    default: 'h-10 py-2 px-4',
    sm: 'h-9 px-3 rounded-md',
    lg: 'h-11 px-8 rounded-md',
    xl: 'h-12 px-8 rounded-md text-base',
    icon: 'h-10 w-10'
  };
  
  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

// Textarea component implementation
const Textarea = ({ className = '', ...props }) => {
  return (
    <textarea 
      className={`flex min-h-[80px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    />
  );
};

// Card component implementation
const Card = ({ className = '', children, ...props }) => {
  return (
    <div 
      className={`rounded-xl border bg-white text-card-foreground shadow-sm ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

const InstantKBmode = () => {
  // Main state
  const [question, setQuestion] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [uploadedPhoto, setUploadedPhoto] = useState(null);
  const [explanation, setExplanation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeInput, setActiveInput] = useState('text');
  const [copied, setCopied] = useState(false);
  
  // Voice and photo state
  const [recognition, setRecognition] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);
  // Custom TTS (Text-to-Speech) helpers
    const speak = ({ text, rate = 0.9, pitch = 1.1 }) => {
    if (!window.speechSynthesis) {
        alert("Speech synthesis not supported in your browser");
        return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    utterance.pitch = pitch;
    window.speechSynthesis.speak(utterance);
    };

    const cancel = () => {
    if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
    }
    };

  // Voice Input Functions
  const startListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in your browser');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      if (finalTranscript) {
        setQuestion(prev => prev + ' ' + finalTranscript);
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
    };

    recognition.onend = () => {
      setRecognition(null);
      setIsListening(false);
    };

    recognition.start();
    setRecognition(recognition);
    setIsListening(true);
  };

  const stopListening = () => {
    if (recognition) {
      recognition.stop();
      setRecognition(null);
    }
    setIsListening(false);
  };

  const handleToggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  // Photo Upload Functions
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0] && files[0].type.startsWith('image/')) {
      handlePhotoUpload(files[0]);
    }
  };

  const handleFileInput = (e) => {
    const files = e.target.files;
    if (files && files[0] && files[0].type.startsWith('image/')) {
      handlePhotoUpload(files[0]);
    }
  };

  const handlePhotoUpload = (file) => {
    setUploadedPhoto(file);
    setActiveInput('photo');
    setQuestion('Please analyze this image and explain what you see in simple terms.');
  };

  const handleRemovePhoto = () => {
    setUploadedPhoto(null);
    if (activeInput === 'photo') {
      setQuestion('');
      setActiveInput('text');
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  // Question handling
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (question.trim()) {
        generateExplanation();
      }
    }
  };

  const generateExplanation = async () => {
  if (!question.trim()) return;

  setIsLoading(true);

  try {
    const formData = new FormData();
    formData.append("question", question);

    if (uploadedPhoto) {
      formData.append("photo", uploadedPhoto);
    }

    const response = await fetch("http://127.0.0.1:8000/api/v1/kbmode/instantkb/", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Failed to fetch explanation");
    }

    const data = await response.json();

    // ✅ Backend sends { response: "..." }
    setExplanation(data.response);
  } catch (error) {
    console.error(error);
    setExplanation("Something went wrong. Please try again.");
  } finally {
    setIsLoading(false);
  }
};



  // Explanation functions
  const handleCopy = async () => {
    await navigator.clipboard.writeText(explanation);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSpeak = () => {
    cancel();
    speak({ text: explanation, rate: 0.9, pitch: 1.1 });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
            <a
      href="/teacher"
      className="fixed top-4 right-4 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition shadow-md"
    >
      Home
    </a>
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-4">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Instant Knowledge</span>
            <br />
            <span className="text-gray-800">Base</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Get simple, clear explanations for any complex question. Ask with your voice, upload photos, or type away - we'll break it down with easy analogies!
          </p>
        </div>
        

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-xl p-6 border border-blue-200 shadow-md hover:shadow-lg transition-all duration-300">
            <div className="flex items-center space-x-3 mb-3">
              <Mic className="w-6 h-6 text-blue-600" />
              <h3 className="font-semibold text-lg">Voice Questions</h3>
            </div>
            <p className="text-gray-600">
              Just speak your question naturally - no typing needed!
            </p>
          </div>
          
          <div className="bg-white rounded-xl p-6 border border-blue-200 shadow-md hover:shadow-lg transition-all duration-300">
            <div className="flex items-center space-x-3 mb-3">
              <Camera className="w-6 h-6 text-blue-600" />
              <h3 className="font-semibold text-lg">Photo Analysis</h3>
            </div>
            <p className="text-gray-600">
              Upload images and get explanations about what you see.
            </p>
          </div>
          
          <div className="bg-white rounded-xl p-6 border border-blue-200 shadow-md hover:shadow-lg transition-all duration-300">
            <div className="flex items-center space-x-3 mb-3">
              <Zap className="w-6 h-6 text-blue-600" />
              <h3 className="font-semibold text-lg">Instant Analogies</h3>
            </div>
            <p className="text-gray-600">
              Complex concepts explained with simple, relatable comparisons.
            </p>
          </div>
        </div>

        {/* Input Methods */}
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Input Type Selector */}
          <div className="flex justify-center space-x-4">
            <Button
              variant={activeInput === 'text' ? 'default' : 'outline'}
              onClick={() => setActiveInput('text')}
              className="flex items-center space-x-2"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Type</span>
            </Button>
            <Button
              variant={activeInput === 'voice' ? 'default' : 'outline'}
              onClick={() => setActiveInput('voice')}
              className="flex items-center space-x-2"
            >
              <Mic className="w-4 h-4" />
              <span>Voice</span>
            </Button>
            <Button
              variant={activeInput === 'photo' ? 'default' : 'outline'}
              onClick={() => setActiveInput('photo')}
              className="flex items-center space-x-2"
            >
              <Camera className="w-4 h-4" />
              <span>Photo</span>
            </Button>
          </div>

          {/* Voice Input */}
          {activeInput === 'voice' && (
            <div className="flex flex-col items-center space-y-4">
              <Button
                variant={isListening ? "destructive" : "hero"}
                size="xl"
                onClick={handleToggleListening}
                className="relative group"
              >
                {isListening ? (
                  <>
                    <MicOff className="w-6 h-6 mr-3" />
                    Stop Listening
                  </>
                ) : (
                  <>
                    <Mic className="w-6 h-6 mr-3" />
                    Start Voice Input
                  </>
                )}
                {isListening && (
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur opacity-75 group-hover:opacity-100 transition-all duration-300 animate-pulse"></div>
                )}
              </Button>
              
              {isListening && (
                <div className="flex items-center space-x-2 text-blue-600">
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">Listening...</span>
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                </div>
              )}
            </div>
          )}

          {/* Photo Upload */}
          {activeInput === 'photo' && (
            <div className="w-full">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileInput}
                className="hidden"
              />
              
              {uploadedPhoto ? (
                <div className="relative bg-white rounded-xl p-6 border-2 border-blue-200 shadow-md">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <ImageIcon className="w-5 h-5 text-blue-600" />
                      <span className="text-sm font-medium text-gray-800">
                        {uploadedPhoto.name}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleRemovePhoto}
                      className="text-red-600 hover:bg-red-100"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-center bg-gray-100 rounded-lg p-4">
                    <img
                      src={URL.createObjectURL(uploadedPhoto)}
                      alt="Uploaded"
                      className="max-h-32 max-w-full object-contain rounded-md"
                    />
                  </div>
                </div>
              ) : (
                <div
                  className={`relative bg-white rounded-xl p-8 border-2 border-dashed transition-all duration-300 cursor-pointer group hover:shadow-md ${
                    dragActive 
                      ? 'border-blue-500 bg-blue-50 shadow-lg shadow-blue-500/30' 
                      : 'border-gray-300 hover:border-blue-300'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={openFileDialog}
                >
                  <div className="flex flex-col items-center space-y-4 text-center">
                    <div className="p-4 bg-blue-100 rounded-full group-hover:bg-blue-200 transition-all duration-300">
                      <Upload className="w-8 h-8 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">
                        Upload Photo
                      </h3>
                      <p className="text-gray-600 text-sm">
                        Drag and drop an image here, or click to browse
                      </p>
                      <p className="text-gray-500 text-xs mt-1">
                        Supports JPG, PNG, WEBP files
                      </p>
                    </div>
                    <Button variant="outline" size="sm" className="mt-4">
                      <Camera className="w-4 h-4 mr-2" />
                      Choose Photo
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Question Input */}
          <div className="w-full">
            <div className="relative bg-white rounded-xl border-2 border-blue-200 shadow-md overflow-hidden">
              <Textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything! I'll explain it in simple terms with easy analogies..."
                className="min-h-[120px] border-0 bg-transparent resize-none focus-visible:ring-0 text-base leading-relaxed"
              />
              <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-gray-50">
                <div className="flex items-center space-x-2 text-xs text-gray-500">
                  <Sparkles className="w-4 h-4" />
                  <span>AI-powered explanations with analogies</span>
                </div>
                <Button 
                  onClick={generateExplanation}
                  disabled={!question.trim() || isLoading}
                  variant="hero"
                  size="sm"
                  className="ml-4"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Thinking...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Explain
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Explanation Result */}
          {explanation && (
            <div className="animate-in slide-in-from-bottom-4 duration-500">
              <Card className="bg-white border-blue-200 shadow-lg">
                <div className="p-6 space-y-4">
                  {/* Question Header */}
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Lightbulb className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-gray-800 mb-1">
                        Your Question
                      </h3>
                      <p className="text-gray-600">
                        {question}
                      </p>
                    </div>
                  </div>

                  {/* Explanation */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-blue-600 flex items-center space-x-2">
                      <span>Simple Explanation</span>
                    </h4>
                    <div className="prose prose-blue max-w-none">
                      <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                        {explanation}
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm" onClick={handleSpeak}>
                        <Volume2 className="w-4 h-4 mr-2" />
                        Listen
                      </Button>
                      <Button variant="ghost" size="sm" onClick={handleCopy}>
                        <Copy className="w-4 h-4 mr-2" />
                        {copied ? 'Copied!' : 'Copy'}
                      </Button>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm" className="text-green-600 hover:bg-green-100">
                        <ThumbsUp className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-100">
                        <ThumbsDown className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>

        {/* Sample Questions */}
        <div className="max-w-3xl mx-auto mt-12">
          <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
            Try These Sample Questions
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              "Why is the sky blue?",
              "How do computers work?",
              "What is gravity?",
              "How does the internet work?",
              "Why do we dream?",
              "What causes earthquakes?"
            ].map((sampleQuestion, index) => (
              <Button
                key={index}
                variant="ghost"
                className="p-4 h-auto text-left justify-start hover:bg-blue-100 border border-blue-200"
                onClick={() => setQuestion(sampleQuestion)}
              >
                <BookOpen className="w-4 h-4 mr-3 text-blue-600 flex-shrink-0" />
                <span className="text-sm">{sampleQuestion}</span>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstantKBmode;