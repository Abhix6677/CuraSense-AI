import { Suspense, lazy } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

const Index = lazy(() => import("./pages/Index.tsx"));
const NotFound = lazy(() => import("./pages/NotFound.tsx"));
const Login = lazy(() => import("./pages/Login.tsx"));
const Details = lazy(() => import("./pages/Details.tsx"));
const Dashboard = lazy(() => import("./pages/Dashboard.tsx"));
const NewData = lazy(() => import("./pages/NewData.tsx"));
const PreviousData = lazy(() => import("./pages/PreviousData.tsx"));
const PatientDetails = lazy(() => import("./pages/PatientDetails.tsx"));
const PatientDashboard = lazy(() => import("./pages/PatientDashboard.tsx"));
const Nurse = lazy(() => import("./pages/Nurse.tsx"));
const Lab = lazy(() => import("./pages/Lab.tsx"));
const DoctorMessages = lazy(() => import("./pages/DoctorMessages.tsx"));

const queryClient = new QueryClient();

const PageLoader = () => (
  <div className="grid min-h-screen place-items-center bg-gradient-soft px-6 text-center">
    <div className="space-y-4">
      <div className="mx-auto h-12 w-12 rounded-2xl bg-gradient-primary shadow-glow animate-pulse-soft" />
      <p className="text-sm font-medium text-muted-foreground">Loading CuraSense…</p>
    </div>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/details" element={<Details />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/new-data" element={<NewData />} />
            <Route path="/previous-data" element={<PreviousData />} />
            <Route path="/patient-details" element={<PatientDetails />} />
            <Route path="/patient-dashboard" element={<PatientDashboard />} />
            <Route path="/nurse" element={<Nurse />} />
            <Route path="/lab" element={<Lab />} />
            <Route path="/doctor-messages" element={<DoctorMessages />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
