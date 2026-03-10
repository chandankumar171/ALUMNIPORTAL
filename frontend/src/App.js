import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import Welcome from "./pages/Welcome";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import PostJob from "./pages/PostJob";
import Branches from "./pages/Branches";
import Batches from "./pages/Batches";
import Profiles from "./pages/Profiles";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminPanel from "./pages/AdminPanel";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));

  useEffect(() => {
    const handleStorageChange = () => {
      setIsLoggedIn(!!localStorage.getItem("token"));
    };

    // Listen for storage changes
    window.addEventListener("storage", handleStorageChange);

    // Also check on page visibility (user might have logged in another tab)
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        setIsLoggedIn(!!localStorage.getItem("token"));
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return (
    <BrowserRouter>
      {isLoggedIn && <Navbar />}

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={isLoggedIn ? <ProtectedRoute><Home /></ProtectedRoute> : <Welcome />} />
        <Route path="/login" element={<Login onLogin={() => setIsLoggedIn(true)} />} />
        <Route path="/signup" element={<Signup onSignup={() => setIsLoggedIn(true)} />} />

        {/* Protected Routes */}
        <Route path="/post-job" element={
          <ProtectedRoute><PostJob /></ProtectedRoute>
        } />

        <Route path="/branches" element={
          <ProtectedRoute><Branches /></ProtectedRoute>
        } />

        <Route path="/branches/:branch" element={
          <ProtectedRoute><Batches /></ProtectedRoute>
        } />

        <Route path="/branches/:branch/:batch" element={
          <ProtectedRoute><Profiles /></ProtectedRoute>
        } />

        <Route path="/profile/:id" element={
          <ProtectedRoute><Profile /></ProtectedRoute>
        } />

        <Route path="/edit-profile" element={
          <ProtectedRoute><EditProfile /></ProtectedRoute>
        } />

        {/* Admin Route */}
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
    </BrowserRouter>
  );
}