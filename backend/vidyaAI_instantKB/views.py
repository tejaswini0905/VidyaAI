import os
import json
from dotenv import load_dotenv
import google.generativeai as genai
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser
from django.conf import settings

# Load API key from settings
genai.configure(api_key=settings.GEMINI_API_KEY)

model = genai.GenerativeModel("gemini-2.5-flash")


class KbMode(APIView):
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request, *args, **kwargs):
        try:
            question = request.data.get("question")
            photo = request.data.get("photo")

            if not question:
                return Response(
                    {"error": "Question is required"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Prompt for Gemini
            prompt = f"""
            You are VidyaAI, an intelligent Instant Knowledge Base assistant for students. 
            Your role is to explain complex questions in the simplest way possible, using the student's local language 
            (identify from the question or default to English if unclear). 

            ### Guidelines for response:
            1. Clarity → Explain the concept in short, simple sentences.
            2. Analogy → Always include a relatable analogy (daily life example).
            3. Brevity → Do not exceed 100 tokens.
            4. Format → Return ONLY valid JSON, without code fences, without extra text:
               {{
                 "response": "<your answer here>"
               }}

            ### Rules:
            - Do NOT add ```json or any Markdown.
            - Do NOT include explanations outside the JSON.
            - If the question is vague, provide the most likely useful answer.
            - Avoid overly technical terms unless necessary.

            Now, respond to:
            User message: "{question}"
            """

            # Prepare inputs
            inputs = [prompt]
            if photo:
                inputs.append(
                    {
                        "mime_type": photo.content_type,
                        "data": photo.read()
                    }
                )

            # Call Gemini
            response = model.generate_content(
                inputs,
                generation_config={
                    "temperature": 0.2,
                    "max_output_tokens": 500
                }
            )

            # Parse Gemini output
            answer_text = response.text.strip()

            # Clean unwanted Markdown fences
            if answer_text.startswith("```"):
                answer_text = answer_text.strip("`")  # remove backticks
                answer_text = answer_text.replace("json", "", 1).strip()

            # Ensure valid JSON
            try:
                explanation = json.loads(answer_text)
            except json.JSONDecodeError:
                explanation = {"response": answer_text}

            # ✅ RETURN final response
            return Response(explanation, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
