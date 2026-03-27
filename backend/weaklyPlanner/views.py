from django.shortcuts import render
import json
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import google.generativeai as genai
from django.conf import settings
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from PIL import Image
import pytesseract

genai.configure(api_key = settings.GEMINI_API_KEY)
model = genai.GenerativeModel("gemini-2.5-flash")


class WeaklyPlanner(APIView):
    def create_prompt(self, grade, subjects):
        subjects_json = json.dumps(subjects, indent=2)

        prompt = f"""
        **CONTEXT:**
        You are an AI teaching assistant. The teacher provides a chapter name or broad topic, and you need to:
        1. BREAK DOWN the main topic into specific subtopics
        2. DISTRIBUTE all subtopics across Monday to Friday
        3. Ensure 100% coverage by end of week

        **TASK:**
        Analyze the provided topic and:
        - Identify all key subtopics that need to be taught
        - Create logical teaching sequence
        - Distribute evenly across 5 days
        - Ensure complete syllabus coverage

        **INPUT DATA:**
        {{
          "grade": "{grade}",
          "subjects": {subjects_json}
        }}

        **OUTPUT REQUIREMENTS:**
        Return ONLY valid JSON in this exact structure:
        {{
          "topic_breakdown": {{
            "Mathematics": ["Subtopic 1", "Subtopic 2", "Subtopic 3", ...],
            "Science": ["Subtopic A", "Subtopic B", "Subtopic C", ...]
          }},
          "weekly_plan": {{
            "monday": {{
              "subjects": [
                {{
                  "subject_name": "Mathematics",
                  "topics": ["Subtopic 1", "Subtopic 2"],
                  "coverage": "20%"
                }}
              ]
            }},
            "tuesday": {{
              "subjects": [
                {{
                  "subject_name": "Mathematics",
                  "topics": ["Subtopic 3", "Subtopic 4"],
                  "coverage": "40%"
                }}
              ]
            }},
            "wednesday": {{
              "subjects": [
                {{
                  "subject_name": "Mathematics",
                  "topics": ["Subtopic 5", "Subtopic 6"],
                  "coverage": "60%"
                }}
              ]
            }},
            "thursday": {{
              "subjects": [
                {{
                  "subject_name": "Mathematics",
                  "topics": ["Subtopic 7", "Subtopic 8"],
                  "coverage": "80%"
                }}
              ]
            }},
            "friday": {{
              "subjects": [
                {{
                  "subject_name": "Mathematics",
                  "topics": ["Subtopic 9", "Subtopic 10"],
                  "coverage": "100%"
                }}
              ]
            }}
          }},
          "rationale": "Explanation of topic breakdown and distribution"
        }}

        **RULES:**
        1. Automatically identify ALL necessary subtopics for the main topic
        2. Consider grade level for appropriate depth
        3. Follow logical teaching progression
        4. Ensure 100% topic coverage by Friday
        5. Balance daily workload
        6. Return ONLY JSON, no other text
        """

        return prompt

    def parse_gemini_response(self, response_text):
        try:
            # Extract JSON from response (Gemini might add extra text)
            start_index = response_text.find('{')
            end_index = response_text.rfind('}') + 1

            if start_index != -1 and end_index != -1:
                json_str = response_text[start_index:end_index]
                return json.loads(json_str)
            else:
                raise ValueError("No JSON found in response")

        except json.JSONDecodeError as e:
            # If JSON parsing fails, return error
            return {
                "error": "Failed to parse AI response",
                "raw_response": response_text
            }

    def post(self,request):
        try :
            grade = request.data.get('grade')
            subjects = request.data.get('subjects' ,{})

            if not grade or not subjects:
                return Response(
                    {"error": "Grade and subjects are required"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Create prompt
            prompt = self.create_prompt(grade, subjects)

            # Call Gemini AI
            response = model.generate_content(prompt)

            # Parse response
            weekly_plan = self.parse_gemini_response(response.text)

            return Response(weekly_plan, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {"error": f"Failed to generate plan: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
