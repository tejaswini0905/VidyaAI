import os
from dotenv import load_dotenv
import google.generativeai as genai
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# Store chat sessions
chat_sessions = {}

class Chatbot(APIView):
    def post(self, request):
        user_message = request.data.get("message")
        session_id = request.data.get("session_id", "default")

        if not user_message:
            return Response({"error": "Message is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            if session_id not in chat_sessions:
                model = genai.GenerativeModel("gemini-2.5-flash")
                chat_sessions[session_id] = model.start_chat(history=[])

            prompt = f"""
            You are VidyaAI, an intelligent teaching assistant chatbot. 
            Respond concisely and precisely to the user's message. 
            Do not exceed 500 tokens. Provide the response in JSON format with the following structure:

            {{
              "response": "<your concise and informative answer here>"
            }}

            The answer should be easy to display in a chat interface. 
            Do not add unnecessary explanations or greetings unless the user explicitly asks. 

            User message: "{user_message}"
            """

            response = chat_sessions[session_id].send_message(
                prompt,
                generation_config={
                    "temperature": 0.2,
                    "max_output_tokens": 500
                }
            )

            return Response({
                "reply": response.text,
                "session_id": session_id
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )