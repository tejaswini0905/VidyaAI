import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import VoiceInput from "../VoiceInput";
import GoogleTranslate from "../GoogleTranslate"; // Import the Google Translate component

const Tile = ({ color, title, subtitle, points, cta }) => (
  <div className="group bg-white text-gray-800 rounded-2xl border border-gray-100 shadow-xl p-6 md:p-7 transition-all duration-500 will-change-transform hover:-translate-y-1 hover:shadow-2xl hover:shadow-sky-200/60">
    <div className="flex items-center gap-3 mb-4">
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center ${color} text-white shadow-md transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110`}
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2a10 10 0 100 20 10 10 0 000-20z" />
        </svg>
      </div>
      <div>
        <div className="font-semibold text-gray-900">{title}</div>
        <div className="text-xs text-gray-600 -mt-0.5">{subtitle}</div>
      </div>
    </div>
    <ul className="space-y-2 text-sm text-gray-700 mb-6">
      {points.map((p, i) => (
        <li key={i} className="flex items-start gap-2">
          <span className="mt-1 w-1.5 h-1.5 rounded-full bg-sky-400/80 group-hover:bg-sky-300 transition-colors"></span>
          <span>{p}</span>
        </li>
      ))}
    </ul>
    <button className="w-full bg-white text-indigo-700 hover:bg-indigo-50 border border-indigo-200 rounded-lg py-2.5 text-sm font-medium transition-colors flex items-center justify-center gap-1.5">
      {cta} <span className="transition-transform group-hover:translate-x-0.5">→</span>
    </button>
  </div>
);

const ChatbotButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      text: "Hello! I'm your VidyaAI assistant. How can I help you today?",
      sender: "bot"
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [interimText, setInterimText] = useState("");
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Initialize or get session ID
  useEffect(() => {
    // Add a small delay to ensure DOM is fully rendered
    const timer = setTimeout(() => {
      const tiles = document.querySelectorAll(".teacher-reveal");
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              e.target.classList.add("opacity-100", "translate-y-0");
              e.target.classList.remove("opacity-0", "translate-y-6");
              io.unobserve(e.target);
            }
          });
        },
        { threshold: 0.15 }
      );

      tiles.forEach((t, i) => {
        // Check if element is already in view
        const rect = t.getBoundingClientRect();
        const isInView = (
          rect.top <= (window.innerHeight || document.documentElement.clientHeight) &&
          rect.bottom >= 0
        );
        
        if (isInView) {
          t.style.transitionDelay = `${i * 80}ms`;
          t.classList.add("opacity-100", "translate-y-0");
          t.classList.remove("opacity-0", "translate-y-6");
        } else {
          t.style.transitionDelay = `${i * 80}ms`;
          io.observe(t);
        }
      });
      
      return () => io.disconnect();
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const handleVoiceReply = (reply) => {
    console.log("Voice reply received in TeacherDashboard:", reply);
    setLoading(false);
    setMessages((prev) => [...prev, { text: reply, sender: "bot" }]);
  };

  const handleVoiceStart = () => {
    setIsListening(true);
    setLoading(true);
  };

  const handleVoiceEnd = () => {
    setIsListening(false);
  };

  const handleSendMessage = async () => {
    if (message.trim() === "") return;

    const userMessage = { text: message, sender: "user" };
    setMessages(prev => [...prev, userMessage]);
    setMessage("");
    setLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:8000/api/v1/chat/chatbot/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          message: message,
          session_id: sessionId
        })
      });

      if (!response.ok) throw new Error("Network response was not ok");

      const data = await response.json();
      
      if (data && data.reply) {
        let replyText = data.reply;
        
        if (typeof replyText === 'string' && replyText.includes('"response":')) {
          try {
            const jsonMatch = replyText.match(/"response":\s*"([^"]*)"/);
            if (jsonMatch && jsonMatch[1]) {
              replyText = jsonMatch[1];
            }
          } catch (e) {
            console.warn("Could not parse JSON from response:", e);
          }
        }
        
        const structuredText = Array.isArray(replyText)
          ? replyText.map((item, idx) => `• ${item}`).join("\n")
          : replyText;

        setMessages(prev => [...prev, { text: structuredText, sender: "bot" }]);
      } else {
        throw new Error("Invalid response format from server");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages(prev => [
        ...prev,
        { text: "Sorry, something went wrong. Please try again.", sender: "bot" }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  const resetConversation = () => {
    const newSessionId = 'session_' + Date.now();
    localStorage.setItem('chatbot_session_id', newSessionId);
    setSessionId(newSessionId);
    setMessages([
      {
        text: "Hello! I'm your VidyaAI assistant. How can I help you today?",
        sender: "bot"
      }
    ]);
  };

  return (
    <>
      {/* Chatbot Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-16 h-16 bg-indigo-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-indigo-700 transition-colors z-40"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      </button>

      {/* Chatbot Modal */}
      {isOpen && (
        <div className="fixed bottom-20 right-6 w-96 h-[500px] bg-white rounded-lg shadow-xl z-50 flex flex-col border border-gray-200">
          {/* Header */}
          <div className="bg-indigo-600 text-white p-4 rounded-t-lg flex justify-between items-center">
            <h3 className="font-semibold">VidyaAI Assistant</h3>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-gray-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-2">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`mb-1 ${msg.sender === "user" ? "text-right" : ""}`}
              >
                <div
                  className={`inline-block p-3 rounded-lg max-w-[80%] whitespace-pre-wrap ${
                    msg.sender === "user"
                      ? "bg-indigo-500 text-white"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce"></div>
                <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce delay-75"></div>
                <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce delay-150"></div>
                <span className="text-gray-500 text-sm">Typing...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          {/* Input */}
          <div className="p-3 border-t border-gray-200">
            {isListening && (
              <div className="mb-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-blue-700">Listening... Speak now!</span>
                </div>
                {interimText && (
                  <div className="mt-1 text-xs text-blue-600 italic">📝 {interimText}</div>
                )}
              </div>
            )}

            <div className="flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
              <button
                onClick={handleSendMessage}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Send
              </button>
            </div>

            <div className="mt-2 flex justify-center">
              <VoiceInput
                onReply={handleVoiceReply}
                onStart={handleVoiceStart}
                onEnd={handleVoiceEnd}
                onInterim={setInterimText}
                onUserMessage={(msg) => setMessages((prev) => [...prev, { text: msg, sender: "user" }])}
                sessionId={sessionId}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const TeacherDashboard = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // reveal tiles on view
  useEffect(() => {
    const tiles = document.querySelectorAll(".teacher-reveal");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("opacity-100", "translate-y-0");
            e.target.classList.remove("opacity-0", "translate-y-6");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    tiles.forEach((t, i) => {
      t.style.transitionDelay = `${i * 80}ms`;
      io.observe(t);
    });
    return () => io.disconnect();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-sky-100 to-white">
      {/* Navbar */}
      <nav
        className={`fixed w-full z-50 transition-all duration-300 ${
          scrolled ? "bg-white shadow-lg" : "bg-white/95 backdrop-blur-sm"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <h1 className="text-3xl md:text-4xl font-bold text-indigo-600">
                VidyaAI
              </h1>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-6">
              <a
                href="/teacher"
                className="text-gray-700 hover:text-indigo-600 text-sm font-medium"
              >
                Home
              </a>

              {/* Google Translate Component */}
              <div className="flex items-center">
                <GoogleTranslate />
              </div>

              {/* Profile dropdown */}
              <div className="relative">
                <button
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold hover:ring-2 hover:ring-indigo-300 transition"
                >
                  T
                </button>
                {profileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-lg shadow-lg py-2 z-50">
                    <a
                      href="/my-activities"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      Your Activities
                    </a>
                    <a
                      href="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      Profile
                    </a>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="text-gray-700 hover:text-indigo-600 focus:outline-none"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  {menuOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`md:hidden transition-all duration-300 ${
            menuOpen ? "max-h-64 opacity-100" : "max-h-0 opacity-0 overflow-hidden"
          }`}
        >
          <div className="px-4 pt-2 pb-3 space-y-2 bg-white shadow-lg">
            {/* Google Translate for Mobile */}
            <div className="py-2">
              <GoogleTranslate />
            </div>
            <a
              href="/my-activities"
              className="block text-gray-700 hover:text-indigo-600 text-base"
            >
              Your Activities
            </a>
            <a
              href="/profile"
              className="block text-gray-700 hover:text-indigo-600 text-base"
            >
              Profile
            </a>
            <a
              href="/admin"
              className="block text-gray-700 hover:text-indigo-600 text-base"
            >
              Admin
            </a>
            <button
              onClick={handleLogout}
              className="w-full text-left text-red-600 hover:text-red-700 text-base"
            >
              Logout
            </button>
            <button className="w-full text-left bg-indigo-600 text-white px-3 py-2 rounded-md text-base font-medium hover:bg-indigo-700">
              Create activity
            </button>
          </div>
        </div>
      </nav>

      {/* Main */}
      <main className="pt-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            Sahayak Teacher Dashboard
          </h2>
          <p className="text-gray-600 mt-2">
            Tools to engage, assess and support your classroom.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="teacher-reveal opacity-0 translate-y-6 transition-all duration-700">
            <Link to="/instantkb">
              <Tile
                color="bg-indigo-500"
                title="Instant Knowledge Base"
                subtitle="Ask and Learn Instantly"
                points={[
                  "Voice-to-Text questions",
                  "Simple explanations",
                  "Local language support",
                  "AI-powered answers"
                ]}
                cta="Open Knowledge Base"
              />
            </Link>
          </div>

          <div className="teacher-reveal opacity-0 translate-y-6 transition-all duration-700">
            <Link to="/visual-aid">
            <Tile
                  color="bg-green-500" 
                  title="Visual Aid Generator"
                  subtitle="Create diagrams and illustrations"
                  points={["Flowcharts", "Diagrams", "Charts", "Interactive visuals"]}
                  cta="Open Visual Aid Generator"
                />
            </Link>
          </div>

          <div className="teacher-reveal opacity-0 translate-y-6 transition-all duration-700">
             <Link to="/worksheet">
                <Tile
                  color="bg-sky-500"
                  title="Worksheet Generator"
                  subtitle="Create custom worksheets"
                  points={[
                    "MCQs & quizzes",
                    "Fill-in-the-blanks",
                    "Diagrams & labeling",
                    "Answer keys"
                  ]}
                  cta="Open Worksheet Generator"
                />
              </Link>
        </div>
          <div className="teacher-reveal opacity-0 translate-y-6 transition-all duration-700">
            <Link to="/planner">
              <Tile
                color="bg-emerald-500"
                title="Weekly Lesson Planner"
                subtitle="Plan your teaching week"
                points={[
                  "Select grade & subjects",
                  "Upload syllabus & topics",
                  "Distribute hours across subjects",
                  "Auto-generate weekly schedule"
                ]}
                cta="Open Weekly Planner"
              />
            </Link>
          </div>
          
          <div>

          <Link to="/evalute-paper">
          
              <Tile
                color="bg-blue-500"
                title="Paper Evaluation System"
                subtitle="Automated answer sheet checking"
                points={[
                  "Upload question papers",
                  "Submit student answer sheets",
                  "AI-powered evaluation",
                  "Instant marks & feedback"
                ]}
                cta="Evaluate Papers"
                icon="📝"
              />
            </Link>
        </div>
          
        </div>
      </main>

      <footer className="mt-16 py-8 text-center text-gray-500">
        <p>© 2025 VidyaAI Teacher</p>
      </footer>
      
      {/* Chatbot Button */}
      <ChatbotButton />
    </div>
  );
};

export default TeacherDashboard;