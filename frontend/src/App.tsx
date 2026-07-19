import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { StudentDashboard } from './pages/StudentDashboard';
import { ResumeAnalyzer } from './pages/ResumeAnalyzer';
import { MockInterview } from './pages/MockInterview';
import { CodingAssessment } from './pages/CodingAssessment';
import { CareerRoadmap } from './pages/CareerRoadmap';
import { AdminDashboard } from './pages/AdminDashboard';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import { Chatbot } from './components/Chatbot';
import { Profile } from './pages/Profile';
import { RoleInterview } from './pages/RoleInterview';
import { LandingPage } from './pages/LandingPage';
import { ResumeBuilder } from './pages/ResumeBuilder';
import { CompanyPrep } from './pages/CompanyPrep';
import { ProjectReviewer } from './pages/ProjectReviewer';
import { PlacementPlanner } from './pages/PlacementPlanner';

export const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Private Student Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout>
                <StudentDashboard />
                <Chatbot />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/project-reviewer"
          element={
            <ProtectedRoute>
              <Layout>
                <ProjectReviewer />
                <Chatbot />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/placement-planner"
          element={
            <ProtectedRoute>
              <Layout>
                <PlacementPlanner />
                <Chatbot />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/resume-builder"
          element={
            <ProtectedRoute>
              <Layout>
                <ResumeBuilder />
                <Chatbot />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/company-prep"
          element={
            <ProtectedRoute>
              <Layout>
                <CompanyPrep />
                <Chatbot />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/resume"
          element={
            <ProtectedRoute>
              <Layout>
                <ResumeAnalyzer />
                <Chatbot />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/interview"
          element={
            <ProtectedRoute>
              <Layout>
                <MockInterview />
                <Chatbot />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/role-interview"
          element={
            <ProtectedRoute>
              <Layout>
                <RoleInterview />
                <Chatbot />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/coding"
          element={
            <ProtectedRoute>
              <Layout>
                <CodingAssessment />
                <Chatbot />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/pathfinder"
          element={
            <ProtectedRoute>
              <Layout>
                <CareerRoadmap />
                <Chatbot />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Layout>
                <Profile />
                <Chatbot />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Private Admin-Only Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
              <Layout>
                <AdminDashboard />
                <Chatbot />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Fallbacks */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
