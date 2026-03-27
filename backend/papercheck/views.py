from django.shortcuts import render
import json
from dotenv import load_dotenv
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser
from django.conf import settings
from .models import QuestionPaper, AnswerSheet
from django.contrib.auth.models import User
import cv2
import pytesseract
import re
import google.generativeai as genai
import os
import numpy as np

genai.configure(api_key=settings.GEMINI_API_KEY)
model = genai.GenerativeModel("gemini-2.5-flash")


def extract_text_from_image(image_path):
    try:
        img = cv2.imread(image_path)
        if img is None:
            raise ValueError("Could not read image")

        img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

        denoised = cv2.medianBlur(gray, 3)

        _, thresh1 = cv2.threshold(denoised, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)

        thresh2 = cv2.adaptiveThreshold(
            denoised, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2
        )


        text1 = pytesseract.image_to_string(thresh1, lang='eng', config='--psm 6')
        text2 = pytesseract.image_to_string(thresh2, lang='eng', config='--psm 6')


        if len(text1.strip()) > len(text2.strip()):
            final_text = text1
        else:
            final_text = text2

        print(f"Extracted text length: {len(final_text)}")
        return final_text.strip()

    except Exception as e:
        print(f"OCR Error: {str(e)}")
        return ""


def split_questions(text):
    """Split text into individual questions"""

    patterns = [
        r'Q\d+[:.)\s-]',
        r'Question\s*\d+[:.)\s-]',
        r'\d+[:.)]\s',
        r'\(\d+\)\s',
    ]

    for pattern in patterns:
        questions = re.split(pattern, text)
        if len(questions) > 1:
            questions = [q.strip() for q in questions if q.strip()]

            if questions and not re.search(r'^\d', questions[0]):
                questions = questions[1:]
            return questions


    return [text] if text.strip() else []



def evaluate_with_gemini(question_text, student_answer):
    # Clean the inputs
    question_text = question_text.strip()
    student_answer = student_answer.strip()

    if not student_answer:
        return {"marks": 0, "feedback": "No answer provided"}

    prompt = f"""
You are a teacher evaluating student answers. Be fair and constructive.

QUESTION: {question_text}
STUDENT'S ANSWER: {student_answer}

Evaluate the answer and provide:
1. Marks out of 5 (be reasonable)
2. Brief constructive feedback

Return ONLY valid JSON format:
{{"marks": <number>, "feedback": "<brief feedback>"}}

Guidelines:
- If answer is completely wrong: 0-1 marks
- If answer shows some understanding: 2-3 marks  
- If answer is mostly correct: 4 marks
- If answer is perfect: 5 marks
- Feedback should be 1-2 sentences maximum
"""

    try:
        response = model.generate_content(prompt)
        output = response.text.strip()


        if '```json' in output:
            output = output.split('```json')[1].split('```')[0]
        elif '```' in output:
            output = output.split('```')[1].split('```')[0]

        result = json.loads(output)

        if not isinstance(result, dict) or 'marks' not in result or 'feedback' not in result:
            raise ValueError("Invalid response format")


        result['marks'] = max(0, min(5, int(result['marks'])))

        return result

    except Exception as e:
        print(f"Gemini evaluation error: {str(e)}")
        print(f"Raw response: {response.text if 'response' in locals() else 'No response'}")
        return {"marks": 0, "feedback": "Evaluation failed - " + str(e)}


class UploadAndCheck(APIView):
    def post(self, request):
        question_paper_id = request.data.get('question_paper_id')
        student_name = request.data.get('student_name')
        grade = request.data.get('grade')
        file = request.FILES.get('answer_sheet')

        # Validation
        required_fields = {
            'question_paper_id': question_paper_id,
            'student_name': student_name,
            'grade': grade,
            'file': file
        }

        missing_fields = [field for field, value in required_fields.items() if not value]
        if missing_fields:
            return Response(
                {"error": f"Missing fields: {', '.join(missing_fields)}"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            question_paper = QuestionPaper.objects.get(id=question_paper_id)
        except QuestionPaper.DoesNotExist:
            return Response({"error": "Invalid question paper ID"}, status=status.HTTP_404_NOT_FOUND)

        try:
            # Save the uploaded student answer sheet
            answer_sheet = AnswerSheet.objects.create(
                question_paper=question_paper,
                student_name=student_name,
                grade=grade,
                file=file
            )


            print("Extracting question paper text...")
            question_text_full = extract_text_from_image(question_paper.file.path)
            print(f"Question text extracted: {len(question_text_full)} characters")

            print("Extracting answer sheet text...")
            student_text_full = extract_text_from_image(answer_sheet.file.path)
            print(f"Answer text extracted: {len(student_text_full)} characters")

            if not question_text_full or not student_text_full:
                return Response(
                    {"error": "Could not extract text from images. Please ensure clear images."},
                    status=status.HTTP_400_BAD_REQUEST
                )


            questions = split_questions(question_text_full)
            student_answers = split_questions(student_text_full)

            print(f"Found {len(questions)} questions and {len(student_answers)} answers")

            total_marks = 0
            feedback_list = []
            evaluation_details = []


            for i, q_text in enumerate(questions):
                if i >= len(student_answers):
                    student_answer = ""
                    print(f"Warning: No answer found for Q{i + 1}")
                else:
                    student_answer = student_answers[i]

                print(f"Evaluating Q{i + 1}...")
                print(f"Question: {q_text[:100]}...")
                print(f"Answer: {student_answer[:100]}...")

                evaluation = evaluate_with_gemini(q_text, student_answer)
                marks = evaluation.get("marks", 0)
                feedback = evaluation.get("feedback", "No feedback")

                total_marks += marks
                feedback_list.append(f"Q{i + 1}: {feedback} (Marks: {marks}/5)")
                evaluation_details.append({
                    "question_number": i + 1,
                    "question_preview": q_text[:100] + "...",
                    "answer_preview": student_answer[:100] + "...",
                    "marks": marks,
                    "feedback": feedback
                })


            answer_sheet.extracted_text = student_text_full
            answer_sheet.marks_obtained = total_marks
            answer_sheet.feedback = "\n".join(feedback_list)
            answer_sheet.save()

            return Response({
                "message": "Paper checked successfully!",
                "student": student_name,
                "grade": grade,
                "total_marks": total_marks,
                "max_possible_marks": len(questions) * 5,
                "feedback": feedback_list,
                "evaluation_details": evaluation_details,
                "questions_count": len(questions),
                "answers_count": len(student_answers)
            }, status=status.HTTP_200_OK)

        except Exception as e:
            print(f"Error in paper evaluation: {str(e)}")
            return Response(
                {"error": f"Evaluation failed: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class questionPaper(APIView):
    def post(self,request):
        title = request.data.get('title')
        file = request.FILES.get('paper')

        if not file:
            return Response({"error": "No file uploaded"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            teacher = User.objects.first()
            paper = QuestionPaper.objects.create(
                teacher=teacher,
                title=title,
                file=file
            )
            return Response({
                "message": "Paper uploaded successfully!",
                "paper_id": paper.id,
                "title": paper.title
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class GetPaperHistory(APIView):
    def get(self, request):
        try:

            all_sheets = AnswerSheet.objects.all().order_by('-checked_at')

            if not all_sheets.exists():
                return Response(
                    {"message": "No checked answer sheets found"},
                    status=status.HTTP_200_OK
                )

            result_data = []

            for sheet in all_sheets:
                result_data.append({
                    "answer_sheet_id": sheet.id,
                    "student_name": sheet.student_name,
                    "grade": sheet.grade,
                    "marks_obtained": sheet.marks_obtained,
                    "checked_at": (
                        sheet.checked_at.strftime("%Y-%m-%d %H:%M:%S")
                        if sheet.checked_at else "Not available"
                    ),
                    "question_paper_id": sheet.question_paper.id if sheet.question_paper else None,
                    "question_paper_title": sheet.question_paper.title if sheet.question_paper else "Unknown",
                    "uploaded_by": (
                        sheet.question_paper.teacher.username
                        if sheet.question_paper and sheet.question_paper.teacher
                        else "Unknown"
                    ),
                    "answer_sheet_url": sheet.file.url if sheet.file else None,
                    "extracted_text_preview": (
                        sheet.extracted_text[:200] + "..."
                        if sheet.extracted_text else "No text extracted"
                    )
                })

            return Response({
                "message": "All checked answer sheets retrieved successfully",
                "data": result_data
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {"error": f"Failed to retrieve checked answer sheets: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
