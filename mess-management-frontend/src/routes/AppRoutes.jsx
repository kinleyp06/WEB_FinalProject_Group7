import { Routes, Route } from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import Meals from "../pages/Meals";
import History from "../pages/History";
import Admin from "../pages/Admin";
import DashboardLayout from "../components/layout/DashboardLayout";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<DashboardLayout><Dashboard /></DashboardLayout>} />
      <Route path="/meals" element={<DashboardLayout><Meals /></DashboardLayout>} />
      <Route path="/history" element={<DashboardLayout><History /></DashboardLayout>} />
      <Route path="/admin" element={<DashboardLayout><Admin /></DashboardLayout>} />
    </Routes>
  );
}