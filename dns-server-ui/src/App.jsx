import React, { useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import RecordsPage from "./pages/RecordsPage";

const App = () => {
  const [user, setUser] = useState({ email: "", isLoggedIn: false });

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={<LoginPage user={user} setUser={setUser} />}
        />
        <Route path="/dashboard" element={<DashboardPage user={user} />} />
        <Route path="/records" element={<RecordsPage user={user} />} />
      </Routes>
    </Router>
  );
};

export default App;