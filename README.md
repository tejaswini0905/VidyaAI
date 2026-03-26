

# 🎓 VidyaAI — Your AI Teaching Ally for Every Classroom

<div align="center">

![VidyaAI](https://img.shields.io/badge/VidyaAI-AI%20Teaching%20Assistant-blue?style=for-the-badge)
![Python](https://img.shields.io/badge/Python-3.12-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Django](https://img.shields.io/badge/Django-REST%20Framework-092E20?style=for-the-badge&logo=django&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)

**An intelligent, multilingual AI assistant designed for rural and multi-grade classrooms.**

*Empowering teachers — not replacing them.*

</div>

---

## 📖 Table of Contents

- [About the Project](#-about-the-project)
- [Problem Statement](#-problem-statement)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [API Endpoints](#-api-endpoints)
- [Screenshots](#-screenshots)
- [Future Scope](#-future-scope)
- [Team](#-team)
- [License](#-license)

---

## 🧠 About the Project

**VidyaAI** is an AI-powered teaching assistant built to support educators in rural and multi-grade classrooms where a single teacher often manages multiple grade levels with limited resources.

Using voice or text input, VidyaAI can instantly:
- Generate localized, grade-specific lesson plans
- Create blackboard-friendly visual aids
- Suggest low-cost classroom activities
- Answer student queries in regional Indian languages
- Auto-check answer sheets and generate worksheets
- Plan weekly teaching schedules

VidyaAI follows a **teacher-first approach** — reducing workload, supporting multiple languages, and working effectively even in low-resource or offline-capable environments. It aligns with India's **National Education Policy (NEP) 2020**, promoting multilingual and technology-driven learning.

---

## 🚨 Problem Statement

In many rural and semi-urban schools across India:
- A **single teacher** manages multiple grades simultaneously
- Resources are scarce and most content is in English or Hindi, creating **language barriers**
- Teachers spend excessive time on **lesson preparation and assessment**, leaving less time for direct teaching
- Most EdTech solutions are **student-focused** and require high-end devices or stable internet

VidyaAI addresses this by providing a **unified, teacher-centric, multilingual AI assistant** that works in low-resource environments.

---

## ✨ Key Features

| Feature | Description |
|---|---|
| 🤖 **AI Chat Bot** | Real-time query answering for teachers and students |
| 📚 **Instant Knowledge Mode** | Instant topic-based content generation by grade level |
| 🖼️ **Visual Aid Generator** | Blackboard-ready diagrams and visuals |
| 📝 **Worksheet Generator** | Auto-generate subject-wise worksheets |
| 📅 **Weekly Planner** | AI-assisted weekly lesson scheduling |
| ✅ **Paper Checking** | Upload answer sheets for AI-based evaluation |
| 🌐 **Multilingual Support** | Content in regional Indian languages via Google Translate |
| 🎙️ **Voice Input** | Voice-to-text input for hands-free interaction |
| 🔐 **Authentication** | Teacher login, signup, and profile management |
| 🛠️ **Admin Dashboard** | Admin panel for user management |

---

## 🛠 Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 19 | UI Framework |
| Vite 7 | Build Tool |
| Tailwind CSS 4 | Styling |
| React Router DOM 7 | Client-side Routing |
| Framer Motion | Animations |
| Mermaid.js | Diagram Rendering |
| jsPDF + html2canvas | PDF Export |
| Lucide React | Icons |

### Backend
| Technology | Purpose |
|---|---|
| Django 5 | Web Framework |
| Django REST Framework | API Layer |
| Google Gemini / Vertex AI | AI Content Generation |
| PostgreSQL / SQLite | Database |
| Gunicorn | Production WSGI Server |
| python-decouple | Environment Config |
| CORS Headers | Cross-Origin Support |

---

## 📁 Project Structure

```
VidyaAI/
├── VidyaAI-frontend/               # React + Vite Frontend
│   ├── public/
│   │   └── vidyaAIlogo.png
│   ├── src/
│   │   ├── components/
│   │   │   ├── Admin/              # Admin Dashboard
│   │   │   ├── InstantKnowledgeMode/  # Instant KB Mode
│   │   │   ├── Landing/            # Landing Page
│   │   │   ├── Login/              # Login Page
│   │   │   ├── PaperChecking/      # Answer Sheet Checker
│   │   │   ├── ShowProfile/        # Teacher Profile
│   │   │   ├── Signup/             # Registration
│   │   │   ├── Teacher/            # Teacher Dashboard & Activities
│   │   │   ├── VisualAid/          # Visual Aid Generator
│   │   │   ├── WeaklyPlanner/      # Weekly Lesson Planner
│   │   │   ├── Worksheets/         # Worksheet Generator
│   │   │   ├── GoogleTranslate.jsx # Translation Widget
│   │   │   └── VoiceInput.jsx      # Voice Input Component
│   │   ├── AppRouter.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
└── VidyaAI_Backend/                # Django REST API Backend
    ├── VidyaAI_Backend/            # Django Project Config
    │   ├── settings.py
    │   └── urls.py
    ├── user_authentication/        # Auth Module (Login/Signup)
    ├── vidyaAI_Bot/                # AI Chat Bot Module
    ├── vidyaAI_instantKB/          # Instant Knowledge Base Module
    ├── visual_aid/                 # Visual Aid Generator Module
    ├── worksheets/                 # Worksheet Generator Module
    ├── weaklyPlanner/              # Weekly Planner Module
    ├── papercheck/                 # Paper Checking Module
    ├── manage.py
    ├── Procfile
    └── requirements.txt
```

---

## 🚀 Getting Started

### Prerequisites

- Python 3.12+
- Node.js 18+
- npm or yarn
- Git

---

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/VidyaAI.git
   cd VidyaAI/VidyaAI_Backend
   ```

2. **Create and activate a virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate        # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables**

   Create a `.env` file in the backend root:
   ```env
   SECRET_KEY=your_django_secret_key
   DEBUG=True
   DATABASE_URL=your_database_url
   GEMINI_API_KEY=your_google_gemini_api_key
   ALLOWED_HOSTS=localhost,127.0.0.1
   ```

5. **Run migrations**
   ```bash
   python manage.py migrate
   ```

6. **Create a superuser (optional)**
   ```bash
   python manage.py createsuperuser
   ```

7. **Start the development server**
   ```bash
   python manage.py runserver
   ```

   The backend will be running at `http://localhost:8000`

---

### Frontend Setup

1. **Navigate to the frontend directory**
   ```bash
   cd VidyaAI/VidyaAI-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure the API base URL**

   Create a `.env` file:
   ```env
   VITE_API_BASE_URL=http://localhost:8000/api/v1
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

   The frontend will be running at `http://localhost:5173`

5. **Build for production**
   ```bash
   npm run build
   ```

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/v1/auth/register/` | Teacher registration |
| POST | `/api/v1/auth/login/` | Teacher login |
| GET | `/api/v1/auth/profile/` | Get teacher profile |
| POST | `/api/v1/chat/` | AI chat bot query |
| POST | `/api/v1/kbmode/` | Instant knowledge mode |
| POST | `/api/v1/visual/generate/` | Generate visual aids |
| POST | `/api/v1/worksheet/generate/` | Generate worksheets |
| POST | `/api/v1/planner/generate/` | Generate weekly plan |
| POST | `/api/v1/assessment/check/` | Upload & check answer sheet |

---

## 🔮 Future Scope

- 🌍 **More Regional Languages** — Expanding support to all Indian state languages
- 📊 **Student Performance Tracking** — AI-driven adaptive analytics
- 🏛️ **DIKSHA / SWAYAM Integration** — Link with national education portals
- 🎤 **Emotion & Voice Recognition** — Detect student engagement levels
- 👩‍🏫 **Teacher Community Platform** — Share AI-generated materials among educators
- 🎥 **Generative Multimedia** — Auto-generate animated lessons and voice-over content

---

## 👥 Team

**Team Elevate** — K. K. Wagh Institute of Engineering Education & Research, Nashik  
Department of Computer Engineering | A.Y. 2025–2026  
Project Guide: **Prof. Monali Mahajan**

| Name | Roll No. |
|---|---|
| Bhavesh Dipak Kale | 21 |
| Tejaswini Hemraj Narkhede | 35 |
| Akash Shyam Shankapal | 55 |
| Khetesh Samadhan Deore | 67 |
| Aryan Rajesh Jadhav | 68 |

---

## 📄 License

This project is developed as part of the **Project Based Learning (PBL)** course at K. K. Wagh Institute of Engineering Education & Research. All rights reserved by the respective authors.

---

<div align="center">
  <i>Built with ❤️ to empower every teacher, in every classroom.</i>
</div>
