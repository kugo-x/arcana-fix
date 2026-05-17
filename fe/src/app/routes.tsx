import { createBrowserRouter, Navigate } from "react-router";
import { LandingPage } from "./components/LandingPage";
import { RegisterPage } from "./components/RegisterPage";
import { LoginPage } from "./components/LoginPage";
import { CandidateLayout } from "./components/CandidateLayout";
import { CandidateProfile } from "./components/CandidateProfile";
import { CandidateJobs } from "./components/CandidateJobs";
import { CandidateResults } from "./components/CandidateResults";
import { JobDetail } from "./components/JobDetail";
import { CompanyLayout } from "./components/CompanyLayout";
import { CompanyProfile } from "./components/CompanyProfile";
import { CompanyPostJob } from "./components/CompanyPostJob";
import { CompanyCandidates } from "./components/CompanyCandidates";
import { CompanyReport } from "./components/CompanyReport";
import { ComplianceTracker } from "./components/ComplianceTracker";
import { WageSimulator } from "./components/WageSimulator";
import { CompanyBadge } from "./components/CompanyBadge";
import { VerifiedEmployers } from "./components/VerifiedEmployers";

export const router = createBrowserRouter([
  { path: "/", Component: LandingPage },
  { path: "/register", Component: RegisterPage },
  { path: "/login", Component: LoginPage },
  { path: "/verified-employers", Component: VerifiedEmployers },
  {
    path: "/kandidat",
    Component: CandidateLayout,
    children: [
      { index: true, Component: () => Navigate({ to: "/kandidat/profile", replace: true }) },
      { path: "profile", Component: CandidateProfile },
      { path: "jobs", Component: CandidateJobs },
      { path: "jobs/:id", Component: JobDetail },
      { path: "hasil", Component: CandidateResults },
      { path: "simulator-upah", Component: WageSimulator },
    ],
  },
  {
    path: "/perusahaan",
    Component: CompanyLayout,
    children: [
      { index: true, Component: () => Navigate({ to: "/perusahaan/post-job", replace: true }) },
      { path: "profil", Component: CompanyProfile },
      { path: "post-job", Component: CompanyPostJob },
      { path: "kandidat", Component: CompanyCandidates },
      { path: "laporan/:id", Component: CompanyReport },
      { path: "compliance", Component: ComplianceTracker },
      { path: "badge", Component: CompanyBadge },
    ],
  },
]);
