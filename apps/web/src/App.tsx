

import React from "react";
import { BrowserRouter, Navigate, Route, Routes, useLocation, useParams } from "react-router-dom";
import HomePage from "./stores/HomePage";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import CollegeDetail from "./pages/CollegeDetail";
import { CityCourseLandingPage } from "./pages/CityCourseLandingPage";
import { GuidesPage } from "./pages/GuidesPage";
import { GuideDetailPage } from "./pages/GuideDetailPage";
import { SeoDiagnosticsPage } from "./pages/SeoDiagnosticsPage";
import { CounselorPopup } from "./components/CounselorPopup";
import { Footer } from "./components/Footer";
import { DesiredLocationPopup } from "./components/DesiredLocationPopup";

import { NotFoundPage } from "./pages/NotFoundPage";

function DashboardRoute() {
  const hasSession = Boolean(localStorage.getItem("nexteduwise.accessToken"));

  if (!hasSession) {
    return <Navigate to="/login" replace state={{ from: "/dashboard" }} />;
  }

  return <DashboardPage />;
}

const isAdminSession = () => Boolean(localStorage.getItem("nexteduwise.accessToken"));

/** Legacy / variant college detail URLs -> canonical detail route (/colleges/detail/:slug or /colleges/detail). */
function CollegeDetailRedirect() {
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  const target = slug
    ? `/colleges/detail/${slug}${location.search}`
    : `/colleges/detail${location.search}`;
  return <Navigate to={target} replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen flex-col justify-between">
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/colleges" element={<HomePage />} />

            {/* Category + City Clean Programmatic SEO Routes */}
            {/* Engineering & Technology */}
            <Route path="/engineering-colleges/:citySlug" element={<CityCourseLandingPage categoryOverride="Engineering" />} />
            <Route path="/btech-colleges/:citySlug" element={<CityCourseLandingPage categoryOverride="B.Tech" />} />
            <Route path="/mtech-colleges/:citySlug" element={<CityCourseLandingPage categoryOverride="M.Tech" />} />
            <Route path="/bca-colleges/:citySlug" element={<CityCourseLandingPage categoryOverride="BCA" />} />
            <Route path="/mca-colleges/:citySlug" element={<CityCourseLandingPage categoryOverride="MCA" />} />
            <Route path="/polytechnic-colleges/:citySlug" element={<CityCourseLandingPage categoryOverride="Polytechnic" />} />

            {/* Management & Business */}
            <Route path="/mba-colleges/:citySlug" element={<CityCourseLandingPage categoryOverride="MBA" />} />
            <Route path="/bba-colleges/:citySlug" element={<CityCourseLandingPage categoryOverride="BBA" />} />
            <Route path="/pgdm-colleges/:citySlug" element={<CityCourseLandingPage categoryOverride="PGDM" />} />

            {/* Medical, Healthcare & Sciences */}
            <Route path="/medical-colleges/:citySlug" element={<CityCourseLandingPage categoryOverride="Medical" />} />
            <Route path="/mbbs-colleges/:citySlug" element={<CityCourseLandingPage categoryOverride="MBBS" />} />
            <Route path="/bds-colleges/:citySlug" element={<CityCourseLandingPage categoryOverride="BDS" />} />
            <Route path="/nursing-colleges/:citySlug" element={<CityCourseLandingPage categoryOverride="Nursing" />} />
            <Route path="/pharmacy-colleges/:citySlug" element={<CityCourseLandingPage categoryOverride="Pharmacy" />} />
            <Route path="/bpharma-colleges/:citySlug" element={<CityCourseLandingPage categoryOverride="B.Pharma" />} />
            <Route path="/mpharma-colleges/:citySlug" element={<CityCourseLandingPage categoryOverride="M.Pharma" />} />
            <Route path="/bsc-colleges/:citySlug" element={<CityCourseLandingPage categoryOverride="B.Sc" />} />
            <Route path="/msc-colleges/:citySlug" element={<CityCourseLandingPage categoryOverride="M.Sc" />} />

            {/* Law */}
            <Route path="/law-colleges/:citySlug" element={<CityCourseLandingPage categoryOverride="Law" />} />
            <Route path="/llb-colleges/:citySlug" element={<CityCourseLandingPage categoryOverride="LLB" />} />
            <Route path="/ba-llb-colleges/:citySlug" element={<CityCourseLandingPage categoryOverride="BA LLB" />} />

            {/* Design, Arts & Mass Communication */}
            <Route path="/design-colleges/:citySlug" element={<CityCourseLandingPage categoryOverride="Design" />} />
            <Route path="/bdes-colleges/:citySlug" element={<CityCourseLandingPage categoryOverride="B.Des" />} />
            <Route path="/arts-colleges/:citySlug" element={<CityCourseLandingPage categoryOverride="Arts" />} />
            <Route path="/ba-colleges/:citySlug" element={<CityCourseLandingPage categoryOverride="BA" />} />
            <Route path="/ma-colleges/:citySlug" element={<CityCourseLandingPage categoryOverride="MA" />} />
            <Route path="/journalism-colleges/:citySlug" element={<CityCourseLandingPage categoryOverride="Journalism" />} />
            <Route path="/mass-communication-colleges/:citySlug" element={<CityCourseLandingPage categoryOverride="Mass Communication" />} />

            {/* Commerce & Finance */}
            <Route path="/commerce-colleges/:citySlug" element={<CityCourseLandingPage categoryOverride="Commerce" />} />
            <Route path="/bcom-colleges/:citySlug" element={<CityCourseLandingPage categoryOverride="B.Com" />} />
            <Route path="/mcom-colleges/:citySlug" element={<CityCourseLandingPage categoryOverride="M.Com" />} />

            {/* Architecture & Hotel Management */}
            <Route path="/architecture-colleges/:citySlug" element={<CityCourseLandingPage categoryOverride="Architecture" />} />
            <Route path="/barch-colleges/:citySlug" element={<CityCourseLandingPage categoryOverride="B.Arch" />} />
            <Route path="/hotel-management-colleges/:citySlug" element={<CityCourseLandingPage categoryOverride="Hotel Management" />} />
            <Route path="/hm-colleges/:citySlug" element={<CityCourseLandingPage categoryOverride="Hotel Management" />} />

            {/* Education & Agriculture */}
            <Route path="/bed-colleges/:citySlug" element={<CityCourseLandingPage categoryOverride="B.Ed" />} />
            <Route path="/med-colleges/:citySlug" element={<CityCourseLandingPage categoryOverride="M.Ed" />} />
            <Route path="/agriculture-colleges/:citySlug" element={<CityCourseLandingPage categoryOverride="Agriculture" />} />

            {/* Dynamic Wildcard Category Route for Any Stream */}
            <Route path="/:categorySlug-colleges/:citySlug" element={<CityCourseLandingPage />} />

            {/* Flexible Course & City SEO Routes */}
            <Route path="/colleges/:citySlug" element={<CityCourseLandingPage />} />
            <Route path="/courses/:courseSlug" element={<CityCourseLandingPage />} />
            <Route path="/courses/:courseSlug/:citySlug" element={<CityCourseLandingPage />} />

            {/* College Detail Routes — Canonical */}
            <Route path="/colleges/detail" element={<CollegeDetail />} />
            <Route path="/colleges/detail/:slug" element={<CollegeDetail />} />

            {/* College Detail Routes — Legacy & Variant Redirects */}
            <Route path="/college-detail" element={<CollegeDetailRedirect />} />
            <Route path="/college-detail/:slug" element={<CollegeDetailRedirect />} />
            <Route path="/college-details" element={<CollegeDetailRedirect />} />
            <Route path="/college-details/:slug" element={<CollegeDetailRedirect />} />
            <Route path="/college/:slug" element={<CollegeDetailRedirect />} />

            {/* Educational Content Hub & Guides */}
            <Route path="/guides" element={<GuidesPage />} />
            <Route path="/guides/:slug" element={<GuideDetailPage />} />

            {/* SEO Quality Gate & Diagnostics Tool */}
            <Route path="/seo-diagnostics" element={<SeoDiagnosticsPage />} />

            <Route path="/login" element={<LoginPage />} />
            <Route path="/dashboard" element={<DashboardRoute />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </div>
        <Footer />
        {!isAdminSession() && <DesiredLocationPopup />}
        {!isAdminSession() && <CounselorPopup />}
      </div>
    </BrowserRouter>
  );
}

