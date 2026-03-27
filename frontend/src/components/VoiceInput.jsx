import React, { useEffect, useRef, useState } from "react";

export default function VoiceInput({ onReply, onStart, onEnd, onInterim, onUserMessage, sessionId }) {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSupported(false);
      return;
    }

    setSupported(true);
    const rec = new SpeechRecognition();
    rec.continuous = false;
    rec.interimResults = true;
    rec.lang = "en-US";

    rec.onstart = () => {
      setListening(true);
      if (onStart) onStart();
    };

    rec.onresult = async (event) => {
      let finalTranscript = "";
      let interimTranscript = "";

      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        } else {
          interimTranscript += result[0].transcript;
        }
      }

      if (onInterim) onInterim(interimTranscript);

      if (finalTranscript) {
        console.log("Voice input final transcript:", finalTranscript);
        setListening(false);
        rec.stop();
        if (onEnd) onEnd();

        if (onUserMessage) onUserMessage(finalTranscript.trim());

        try {
          const response = await fetch("http://127.0.0.1:8000/api/v1/chat/chatbot/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
              message: finalTranscript.trim(),
              session_id: sessionId || "default"
            }),
          });

          if (!response.ok) {
            throw new Error("Network response was not ok");
          }

          const data = await response.json();
          console.log("Voice input backend response:", data);
          
          // Process the response similar to the text input
          if (data && data.reply) {
            let replyText = data.reply;
            
            // If the reply contains JSON structure, extract the actual content
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
            
            // Structure the bot response
            const structuredText = Array.isArray(replyText)
              ? replyText.map((item, idx) => `• ${item}`).join("\n")
              : replyText;

            console.log("Voice input sending reply to chat:", structuredText);
            if (onReply) onReply(structuredText);
          } else {
            throw new Error("Invalid response format from server");
          }
        } catch (error) {
          console.error("Error sending transcript:", error);
          if (onReply) onReply("⚠️ Sorry, something went wrong. Please try again.");
        }
      }
    };

    rec.onerror = (error) => {
      console.error("Speech recognition error:", error);
      setListening(false);
      if (onEnd) onEnd();
      if (onReply) onReply("⚠️ Speech recognition error. Please try again.");
    };

    rec.onend = () => {
      setListening(false);
      if (onEnd) onEnd();
    };

    recognitionRef.current = rec;
  }, [onReply, onStart, onEnd, onInterim, onUserMessage]);

  const startListening = () => {
    if (!recognitionRef.current) return;
    try {
      recognitionRef.current.start();
    } catch (err) {
      console.warn("SpeechRecognition start() error:", err);
    }
  };

  return (
    <button
      onClick={startListening}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
        listening
          ? "bg-red-500 hover:bg-red-600 text-white"
          : "bg-green-500 hover:bg-green-600 text-white"
      }`}
    >
      {listening ? (
        <>
          <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
          Listening...
        </>
      ) : (
        <>🎤 Speak</>
      )}
    </button>
  );
}
