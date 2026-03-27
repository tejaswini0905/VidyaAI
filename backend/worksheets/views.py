git push -u origin mainimport json
from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import google.generativeai as genai
from django.conf import settings
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from PIL import Image
import pytesseract

pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

genai.configure(api_key = settings.GEMINI_API_KEY)
model = genai.GenerativeModel("gemini-2.5-flash")

def extract_text_from_image(image_file):
    """
    Extract text from uploaded image using Tesseract OCR.
    :param image_file: Django InMemoryUploadedFile
    :return: extracted text as string
    """
    # Reset file pointer
    image_file.seek(0)

    # Open with PIL
    image = Image.open(image_file)
    image = image.convert("RGB")  # ensure compatible format

    # Run OCR
    text = pytesseract.image_to_string(image, lang='eng')  # change lang if needed
    return text.strip()


def build_worksheet_prompt(diff, type, total_marks, lang, textbook_text):
    print("Inside the build worksheet prompt....!!")

    # Define question formats for different types
    question_formats = {
        'mcq': """
        For Multiple Choice Questions:
        - Provide exactly 4 options (a, b, c, d)
        - Format: 
          1. [Question text?]
             a) Option A
             b) Option B  
             c) Option C
             d) Option D
             [Marks: X]
        """,

        'quiz': """
        For Quick Quiz:
        - Short, direct questions
        - Can be one-word answers or short phrases
        - Format:
          1. [Question text?]
             [Marks: X]
        """,

        'descriptive': """
        For Descriptive Questions:
        - Require detailed, paragraph-length answers
        - Questions should prompt explanation/analysis
        - Format:
          1. [Question requiring detailed explanation?]
             [Marks: X]
        """,

        'short': """
        For Short Answer Questions:
        - Require brief answers (2-3 sentences)
        - Questions should be specific and focused
        - Format:
          1. [Specific question?]
             [Marks: X]
        """,

        'fillinblanks': """
        For Fill in the Blanks:
        - Provide sentences with blanks
        - Indicate blank with underscore: _____
        - Format:
          1. The capital of France is ______.
             [Marks: X]
        """,

        'truefalse': """
        For True/False Questions:
        - Provide clear statements
        - Format:
          1. [Statement that is either true or false]
             [Marks: X]
        """
    }

    # Get the specific format for the requested type
    question_format = question_formats.get(type.lower(), question_formats['mcq'])

    # Define answer formats for different types
    answer_formats = {
        'mcq': "a), b), c), or d)",
        'quiz': "brief answer",
        'descriptive': "detailed explanation",
        'short': "short answer",
        'fillinblanks': "word or phrase for the blank",
        'truefalse': "True or False"
    }

    answer_format = answer_formats.get(type.lower(), "appropriate answer")

    prompt = f"""
        You are an expert educator and worksheet generator.
        Generate a worksheet in {lang} language based on the provided source content.

        📌 REQUIREMENTS:
        - Source Content: {textbook_text}
        - Difficulty Level: {diff}
        - Total Marks: {total_marks}
        - Question Type: {type.upper()}
        - Language: {lang}

        📝 SPECIFIC FORMAT FOR {type.upper()}:

        {question_format}

        📋 OUTPUT STRUCTURE - FOLLOW EXACTLY:

        WORKSHEET TITLE: [Creative title reflecting {diff} difficulty and topic]

        INSTRUCTIONS: [Clear instructions for students in {lang}]

        QUESTIONS:
        [List all questions here following the {type.upper()} format above]
        [Ensure the total marks add up to exactly {total_marks}]

        ANSWER KEY:
        [Provide correct answers corresponding to each question number]
        [For question type '{type}', provide {answer_format}]

        🔒 CRITICAL FORMATTING RULES:
        1. Always start with "WORKSHEET TITLE:"
        2. Then "INSTRUCTIONS:" 
        3. Then "QUESTIONS:" section with numbered questions
        4. Then "ANSWER KEY:" section with numbered answers
        5. Use clear numbering (1., 2., 3., etc.)
        6. Ensure total marks = {total_marks}
        7. Maintain {diff} difficulty level
        8. Use {lang} language throughout
        9. Base all content on: {textbook_text}

        ⚠️ IMPORTANT: 
        - Do not mix question types - use ONLY {type}
        - Make answers clear and unambiguous
        - Ensure question numbers in ANSWER KEY match QUESTIONS section exactly
        - Distribute marks appropriately across questions
        """

    return prompt


class Worksheet_generator(APIView):
    print("inside teh worksheet_generateror..!!!")
    parser_classes = (MultiPartParser, FormParser, JSONParser)

    def post(self,request):
        print("Inside the post request")
        try:
            image  = request.FILES.get("image")
            type = request.data.get("type")
            total_marks = request.data.get("total_marks")
            lang = request.data.get("lang")

            if not all ([image,type,total_marks,lang]):
                return Response({'error':'required all the feilds'} , status = status.HTTP_400_BAD_REQUEST)

            textbook_text = extract_text_from_image(image)
            print(textbook_text)

            difficulties = ['easy' , 'medium' , 'hard']
            worksheets = {}

            for diff in difficulties:
                prompt = build_worksheet_prompt(diff,type,total_marks,lang,textbook_text)
                response = model.generate_content([prompt])
                worksheets[diff] = response.text

            return Response({'worksheets':worksheets}, status = status.HTTP_201_CREATED)


        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)






