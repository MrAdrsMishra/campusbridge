import React from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import HomePage from "./stores/HomePage";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import CollegeDetail from "./pages/CollegeDetail";
import { CounselorPopup } from "./components/CounselorPopup";
import { Footer } from "./components/Footer";

function DashboardRoute() {
  const hasSession = Boolean(localStorage.getItem("campusbridge.accessToken"));

  if (!hasSession) {
    return <Navigate to="/login" replace state={{ from: "/dashboard" }} />;
  }

  return <DashboardPage />;
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen flex-col justify-between">
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/college-detail" element={<CollegeDetail />} />
            <Route path="/college-detail/:id" element={<CollegeDetail />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/dashboard" element={<DashboardRoute />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
        <Footer />
        <CounselorPopup />
      </div>
    </BrowserRouter>
  );
}
