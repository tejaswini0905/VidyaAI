import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./components/Landing/LandingPage";
import LoginPage from "./components/Login/login";  
import AdminDashboard from "./components/Admin/AdminDashboard";
import TeacherDashboard from "./components/Teacher/TeacherDashboard";
import SignupPage from "./components/Signup/SignupPage";
import ProtectedRoute from "./components/ProtectedRoute";
import InstantKBmode from "./components/InstantKnowledgeMode/InstantKBmode";
import ProfileDetails from "./components/ShowProfile/ProfileDetails";
import EduVisualAidGenerator from "./components/VisualAid/VisualAid";
import WorksheetGenerator from "./components/Worksheets/Worksheet";
import RuralTeacherPlanner from "./components/WeaklyPlanner/WeaklyPlanner";
import PaperEvaluationSystem from "./components/PaperChecking/PaperChecking";
import ActivitiesDashboard from "./components/Teacher/ActivitesDashboard";



const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/teacher" element={ <ProtectedRoute> <TeacherDashboard /></ProtectedRoute>}/>
        <Route path="/instantkb" element={ <ProtectedRoute> <InstantKBmode /></ProtectedRoute>}/>
        <Route path="/profile" element={ <ProtectedRoute> <ProfileDetails /></ProtectedRoute>}/>
        <Route path="/visual-aid" element={ <ProtectedRoute> <EduVisualAidGenerator /></ProtectedRoute>}/>
        <Route path="/worksheet" element={ <ProtectedRoute> <WorksheetGenerator /></ProtectedRoute>}/>
        <Route path="/planner" element={ <ProtectedRoute> <RuralTeacherPlanner /></ProtectedRoute>}/>
        <Route path="/evalute-paper" element={ <ProtectedRoute> <PaperEvaluationSystem /></ProtectedRoute>}/>
        <Route path="/my-activities" element={ <ProtectedRoute> <ActivitiesDashboard /></ProtectedRoute>}/>

      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
