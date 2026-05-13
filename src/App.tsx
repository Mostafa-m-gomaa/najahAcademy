import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Courses from "./pages/Courses";
import CourseCategory from "./pages/CourseCategory";
import CourseDetail from "./pages/CourseDetail";
import Registration from "./pages/Registration";
import Terms from "./pages/Terms";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";
import CourseSubscribe from "./pages/CourseSubscribe";
import RequireAuth from "@/components/RequireAuth";
import RequireRole from "@/components/RequireRole";
import CoursesDashboard from "@/pages/app/CoursesDashboard";
import CourseLayout from "@/pages/app/CourseLayout";
import CourseOverview from "@/pages/app/CourseOverview";
import CourseTopics from "@/pages/app/CourseTopics";
import TopicDetail from "@/pages/app/TopicDetail";
import CourseEssayQuestions from "@/pages/app/CourseEssayQuestions";
import EssayQuestionDetail from "@/pages/app/EssayQuestionDetail";
import QuestionGroups from "@/pages/app/QuestionGroups";
import GroupExams from "@/pages/app/GroupExams";
import ExamTake from "@/pages/app/ExamTake";
import CourseDictionary from "@/pages/app/CourseDictionary";
import Notifications from "./pages/Notifications";
import EssayDashboard from "@/pages/app/admin/EssayDashboard";
import StudentStats from "@/pages/app/StudentStats";

const queryClient = new QueryClient();

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname]);

  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <LanguageProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ScrollToTop />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/courses" element={<Courses />} />
              <Route path="/courses/:category" element={<CourseCategory />} />
              <Route path="/course/:id" element={<CourseDetail />} />
              <Route path="/register" element={<Registration />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route element={<RequireAuth />}>
                <Route path="/profile" element={<Profile />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/course/:id/subscribe" element={<CourseSubscribe />} />
                <Route path="/app/courses" element={<CoursesDashboard />} />
                <Route path="/app/courses/:courseId" element={<CourseLayout />}>
                  <Route index element={<CourseOverview />} />
                  <Route path="topics" element={<CourseTopics />} />
                  <Route path="topics/:topicId" element={<TopicDetail />} />
                  <Route path="dictionary" element={<CourseDictionary />} />
                  <Route path="essay-questions" element={<CourseEssayQuestions />} />
                  <Route path="essay-questions/:questionId" element={<EssayQuestionDetail />} />
                  <Route path="question-groups" element={<QuestionGroups />} />
                  <Route path="question-groups/:groupId/exams" element={<GroupExams />} />
                  <Route path="exams/:examId/take" element={<ExamTake />} />
                </Route>
              </Route>

              <Route element={<RequireRole allowedRoles={["admin"]} />}>
                <Route path="/app/admin/essay-dashboard" element={<EssayDashboard />} />
              </Route>
              <Route element={<RequireRole allowedRoles={["student"]} />}>
                <Route path="/app/stats" element={<StudentStats />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </LanguageProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
