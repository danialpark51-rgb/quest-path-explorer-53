import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { UserProvider, useUser } from "@/context/UserContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { ThemeProvider } from "@/context/ThemeContext";
import LoginPage from "./pages/LoginPage";
import GoalSelectionPage from "./pages/GoalSelectionPage";
import HomePage from "./pages/HomePage";
import GoalDetailPage from "./pages/GoalDetailPage";
import SkillsPage from "./pages/SkillsPage";
import SkillDetailPage from "./pages/SkillDetailPage";
import QuizListPage, { QuizPlayPage } from "./pages/QuizPage";
import StoriesPage from "./pages/StoriesPage";
import NewsPage from "./pages/NewsPage";
import TasksPage from "./pages/TasksPage";
import AIAssistantPage from "./pages/AIAssistantPage";
import GamesPage, { GamePlayPage } from "./pages/GamesPage";
import ObservationPage from "./pages/ObservationPage";
import ProfilePage from "./pages/ProfilePage";
import LeaderboardPage from "./pages/LeaderboardPage";
import ProjectsPage from "./pages/ProjectsPage";
import ProblemFinderPage from "./pages/ProblemFinderPage";
import ThinkingPage from "./pages/ThinkingPage";
import VideosPage from "./pages/VideosPage";
import StudyPlannerPage from "./pages/StudyPlannerPage";
import DiscoverGoalPage from "./pages/DiscoverGoalPage";
import ScholarshipsPage from "./pages/ScholarshipsPage";
import InternshipsPage from "./pages/InternshipsPage";
import FeedbackPage from "./pages/FeedbackPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isLoggedIn } = useUser();
  if (!isLoggedIn) return <Navigate to="/" replace />;
  return <>{children}</>;
};

const AppRoutes = () => {
  const { isLoggedIn, user } = useUser();

  // Determine where to send a logged-in user landing on "/"
  const homeRedirect = () => {
    if (!user) return "/";
    if (!user.hasCompletedOnboarding) return "/discover-goal?onboarding=true";
    if (!user.selectedGoal) return "/goals";
    return "/home";
  };

  return (
    <Routes>
      <Route
        path="/"
        element={
          isLoggedIn
            ? <Navigate to={homeRedirect()} replace />
            : <LoginPage />
        }
      />
      <Route path="/goals" element={<ProtectedRoute><GoalSelectionPage /></ProtectedRoute>} />
      <Route path="/home" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
      <Route path="/goal/:goalId" element={<ProtectedRoute><GoalDetailPage /></ProtectedRoute>} />
      <Route path="/skills" element={<ProtectedRoute><SkillsPage /></ProtectedRoute>} />
      <Route path="/skill/:skillId" element={<ProtectedRoute><SkillDetailPage /></ProtectedRoute>} />
      <Route path="/quiz" element={<ProtectedRoute><QuizListPage /></ProtectedRoute>} />
      <Route path="/quiz/:quizId" element={<ProtectedRoute><QuizPlayPage /></ProtectedRoute>} />
      <Route path="/stories" element={<ProtectedRoute><StoriesPage /></ProtectedRoute>} />
      <Route path="/news" element={<ProtectedRoute><NewsPage /></ProtectedRoute>} />
      <Route path="/tasks" element={<ProtectedRoute><TasksPage /></ProtectedRoute>} />
      <Route path="/ai-assistant" element={<ProtectedRoute><AIAssistantPage /></ProtectedRoute>} />
      <Route path="/games" element={<ProtectedRoute><GamesPage /></ProtectedRoute>} />
      <Route path="/game/:gameId" element={<ProtectedRoute><GamePlayPage /></ProtectedRoute>} />
      <Route path="/observation" element={<ProtectedRoute><ObservationPage /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      <Route path="/leaderboard" element={<ProtectedRoute><LeaderboardPage /></ProtectedRoute>} />
      <Route path="/projects" element={<ProtectedRoute><ProjectsPage /></ProtectedRoute>} />
      <Route path="/problem-finder" element={<ProtectedRoute><ProblemFinderPage /></ProtectedRoute>} />
      <Route path="/thinking" element={<ProtectedRoute><ThinkingPage /></ProtectedRoute>} />
      <Route path="/videos" element={<ProtectedRoute><VideosPage /></ProtectedRoute>} />
      <Route path="/study-planner" element={<ProtectedRoute><StudyPlannerPage /></ProtectedRoute>} />
      <Route path="/discover-goal" element={<ProtectedRoute><DiscoverGoalPage /></ProtectedRoute>} />
      <Route path="/scholarships" element={<ProtectedRoute><ScholarshipsPage /></ProtectedRoute>} />
      <Route path="/internships" element={<ProtectedRoute><InternshipsPage /></ProtectedRoute>} />
      <Route path="/feedback" element={<ProtectedRoute><FeedbackPage /></ProtectedRoute>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ThemeProvider>
          <LanguageProvider>
            <UserProvider>
              <AppRoutes />
            </UserProvider>
          </LanguageProvider>
        </ThemeProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
