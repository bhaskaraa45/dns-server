import React, { useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import RecordsPage from "./pages/RecordsPage";
import CreateDomainPage from "./pages/CreateDomainPage";

const App = () => {
  const [user, setUser] = useState({ email: "", name: "", id: "" });

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={<LoginPage user={user} setUser={setUser} />}
        />
        <Route path="/dashboard" element={<DashboardPage user={user} setGUser={setUser} />} />
        <Route path="/new" element={<CreateDomainPage user={user} />} />
        <Route path="/domains/:domainId/records" element={<RecordsPage user={user} setGUser={setUser} />} />
      </Routes>
    </Router>
  );
};

export default App;