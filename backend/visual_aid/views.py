import os
from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import VisualAid
import google.generativeai as genai
from django.conf import settings
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
import json


genai.configure(api_key = settings.GEMINI_API_KEY)
model = genai.GenerativeModel("gemini-2.5-flash")


class Visual_aid(APIView):
    parser_classes = (MultiPartParser, FormParser, JSONParser)
    def post(self,request):
        try :
            question = request.data.get("question")
            image = request.FILES.get("image")

            if not question :
                return Response(
                    {'error' :'Question is required.'},
                    status = status.HTTP_400_BAD_REQUEST
                )

            prompt = f"""
            You are a helpful assistant that converts teacher descriptions into clear, simple diagrams for classroom teaching.
            - Output: Mermaid.js flowchart code (graph TD). Do not include explanations or extra text.
            - Style: Minimal, blackboard-friendly, easy to read.
            - Constraints: 
              - If the description requests a specific process or system (like "water cycle" or "photosynthesis"), break it down into its key sequential components
              - If the description asks to "explain" a concept, create a conceptual flowchart showing main components and relationships
              - Use short, clear node names (2-3 words max)
              - Show direction of process with arrows
              - Include only essential elements mentioned or implied by the concept
              - For broad concepts, focus on 4-8 key components to keep it simple

            Example Input 1: "Draw the water cycle with sun, evaporation, clouds, rain, and lake."
            Example Output 1:
            graph TD
              Sun --> Evaporation
              Evaporation --> Clouds
              Clouds --> Rain
              Rain --> Lake
              Lake --> Evaporation

            Example Input 2: "Explain the water cycle"
            Example Output 2:
            graph TD
              Sun[Sun Energy] --> Evaporation
              Evaporation --> Condensation[Cloud Formation]
              Condensation --> Precipitation[Rain/Snow]
              Precipitation --> Collection[Rivers/Oceans]
              Collection --> Evaporation

            Example Input 3: "Show how photosynthesis works"
            Example Output 3:
            graph TD
              Sunlight --> Chlorophyll
              Water --> Chlorophyll
              CO2[Carbon Dioxide] --> Chlorophyll
              Chlorophyll --> Glucose
              Chlorophyll --> Oxygen

            Now convert this description into a Mermaid.js flowchart:

            Description: "{question}"
            """

            inputs = [prompt]
            if image:
                inputs.append(
                    {
                        "mime_type": image.content_type,
                        "data": image.read()
                    }
                )

            # Call Gemini
            response = model.generate_content(inputs)
            mermaid_code = response.text.strip()

            if mermaid_code.startswith("```") and mermaid_code.endswith("```"):
                mermaid_code = mermaid_code.strip("`").split("\n", 1)[-1]

            # visual_aid = VisualAid.objects.create(
            #     user=request.user,
            #     question=question,
            #     mermaid_code=mermaid_code
            # )

            return Response({
                "question": question,
                "mermaid_code": mermaid_code
            }, status=status.HTTP_201_CREATED)


        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class SaveDiagram(APIView):
    def post(self, request):
        try:
            image = request.FILES.get("image")
            if not image:
                return Response({"error": "No image file received"}, status=400)

            user = request.user if request.user.is_authenticated else None
            visual = VisualAid.objects.create(user=user, image=image)
            return Response({
                "message": "Diagram saved successfully",
                "id": visual.id,
                "image_url": visual.image.url,
            })
        except Exception as e:
            return Response({"error": f"Failed to save diagram: {str(e)}"}, status=500)


class GetDiagram(APIView):
    def get(self, request):
        try:
            diagrams = VisualAid.objects.all()
            data = []
            for diagram in diagrams:
                data.append({
                    "id": diagram.id,
                    "image_url": request.build_absolute_uri(diagram.image.url),
                    "uploaded_by": diagram.user.username if diagram.user else "Anonymous"
                })

            return Response({
                "message": "All diagrams retrieved successfully",
                "data": data
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({
                "error": f"Failed to fetch diagrams: {str(e)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)





