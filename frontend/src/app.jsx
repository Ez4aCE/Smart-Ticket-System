import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";

// Student
import StudentDashboard from "./pages/student/Dashboard";
import CreateTicket from "./pages/student/CreateTicket";
import MyTickets from "./pages/student/MyTickets";
import StudentTicketDetails from "./pages/student/TicketDetails";

// Staff
import StaffDashboard from "./pages/staff/Dashboard";
import StaffTickets from "./pages/staff/Tickets";
import StaffTicketDetails from "./pages/staff/TicketDetails";

// Admin
import AdminDashboard from "./pages/admin/Dashboard";
import AdminTickets from "./pages/admin/Tickets";
import Departments from "./pages/admin/Departments";
import Staff from "./pages/admin/Staff";
import ManualTriage from "./pages/admin/ManualTriage";

function App() {
  return (
    <Routes>

      {/* Login */}
      <Route path="/login" element={<Login />} />

      {/* Student */}
      <Route
        path="/student/dashboard"
        element={<StudentDashboard />}
      />

      <Route
        path="/student/create-ticket"
        element={<CreateTicket />}
      />

      <Route
        path="/student/tickets"
        element={<MyTickets />}
      />

      <Route
        path="/student/tickets/:id"
        element={<StudentTicketDetails />}
      />

      {/* Staff */}
      <Route
        path="/staff/dashboard"
        element={<StaffDashboard />}
      />

      <Route
        path="/staff/tickets"
        element={<StaffTickets />}
      />

      <Route
        path="/staff/tickets/:id"
        element={<StaffTicketDetails />}
      />

      {/* Admin */}
      <Route
        path="/admin/dashboard"
        element={<AdminDashboard />}
      />

      <Route path="/admin/tickets" element={<AdminTickets />} />
      <Route
        path="/admin/tickets/:id"
        element={<StaffTicketDetails role="admin" />}
      />

      <Route
        path="/admin/departments"
        element={<Departments />}
      />

      <Route
        path="/admin/staff"
        element={<Staff />}
      />

      <Route
        path="/admin/triage"
        element={<ManualTriage />}
      />

      {/* Default */}
      <Route
        path="/"
        element={<Navigate to="/login" replace />}
      />

      {/* 404 */}
      <Route
        path="*"
        element={
          <div className="container mt-5 text-center">
            <h2>404</h2>
            <p>Page not found</p>
          </div>
        }
      />

    </Routes>
  );
}

export default App;
