import React from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import JobDetails from "./components/JobDetails";
import BookAppointment from "./components/BookAppointment";

function App() {
  return (
    <BrowserRouter>
      <nav style={{ padding: "15px", background: "#222" }}>
        <Link to="/" style={{ color: "#fff", marginRight: "15px" }}>
          Dashboard
        </Link>
        <Link to="/book-appointment" style={{ color: "#fff" }}>
          Book Appointment
        </Link>
      </nav>

      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/book-appointment" element={<BookAppointment />} />
        <Route path="/job/:id" element={<JobDetails />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;