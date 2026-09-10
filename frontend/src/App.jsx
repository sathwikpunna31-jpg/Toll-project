import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/DashboardLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import Vehicles from './pages/Vehicles';
import Plazas from './pages/Plazas';
import CalculatorPage from './pages/Calculator';
import Payment from './pages/Payment';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Reports from './pages/Reports';
import Profile from './pages/Profile';
import AiGating from './pages/AiGating';
import UnderDevelopment from './components/UnderDevelopment';

function App() {
  // Review 1 Mode: When VITE_REVIEW_PHASE=1_1, future modules show structured UnderDevelopment placeholders
  const isReviewOne = import.meta.env.VITE_REVIEW_PHASE === '1_1';

  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Main Dashboard Layout Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            {/* Review 1 Core Modules (Fully Live & Working) */}
            <Route index element={<Dashboard />} />
            <Route path="vehicles" element={<Vehicles />} />
            <Route path="plazas" element={<Plazas />} />
            <Route path="profile" element={<Profile />} />

            {/* Modules Reserved for Review 2 & Phase 2 (Turned into Professional Roadmap Placeholders if isReviewOne=true) */}
            <Route 
              path="calculator" 
              element={
                isReviewOne ? (
                  <UnderDevelopment 
                    moduleName="Toll Rate Calculation Engine"
                    scheduledPhase="Phase 1 - Review 2"
                    description="The mathematical toll estimation formulas based on distance, plaza category, and vehicle classification are designed. Live dynamic calculation will be demonstrated in Review 2."
                  />
                ) : (
                  <CalculatorPage />
                )
              } 
            />
            <Route 
              path="payment" 
              element={
                isReviewOne ? (
                  <UnderDevelopment 
                    moduleName="Toll Gating & Payment Simulator"
                    scheduledPhase="Phase 1 - Review 2"
                    description="The FASTag electronic wallet deduction engine and digital receipt generation workflow are mapped out and scheduled for demonstration in the next review."
                  />
                ) : (
                  <Payment />
                )
              } 
            />
            <Route 
              path="transactions" 
              element={
                isReviewOne ? (
                  <UnderDevelopment 
                    moduleName="Transaction Ledger & Crossing History"
                    scheduledPhase="Phase 1 - Review 2"
                    description="Real-time transaction logging and passage status tracking are scheduled for live execution in the next review."
                  />
                ) : (
                  <Transactions />
                )
              } 
            />
            <Route 
              path="reports" 
              element={
                isReviewOne ? (
                  <UnderDevelopment 
                    moduleName="Audit Reports & CSV Export Engine"
                    scheduledPhase="Phase 1 - Review 2"
                    description="System-wide aggregation reports, daily/monthly throughput summaries, and CSV export functionality are scheduled for Review 2."
                  />
                ) : (
                  <Reports />
                )
              } 
            />

            {/* AI Smart Gating (Phase 2) */}
            <Route path="ai-gating" element={<AiGating />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
