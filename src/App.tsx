import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppLayout } from "@/components/AppLayout";

import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import Subjects from "./pages/Subjects";
import SubjectDetail from "./pages/SubjectDetail";
import Topics from "./pages/Topics";
import TopicDetail from "./pages/TopicDetail";
import Lesson from "./pages/Lesson";
import AITutor from "./pages/AITutor";
import Downloads from "./pages/Downloads";
import Profile from "./pages/Profile";
import Pricing from "./pages/Pricing";
import Achievements from "./pages/Achievements";
import Results from "./pages/Results";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/onboarding" element={
              <ProtectedRoute requireOnboarding={false}><Onboarding /></ProtectedRoute>
            } />
            <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/subjects" element={<Subjects />} />
              <Route path="/subjects/:subjectId" element={<SubjectDetail />} />
              <Route path="/topics" element={<Topics />} />
              <Route path="/topics/:topicId" element={<TopicDetail />} />
              <Route path="/lesson/:lessonId" element={<Lesson />} />
              <Route path="/ai-tutor" element={<AITutor />} />
              <Route path="/downloads" element={<Downloads />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/achievements" element={<Achievements />} />
              <Route path="/results" element={<Results />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
