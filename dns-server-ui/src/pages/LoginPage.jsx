import React, { useState } from "react";
import AuthForm from "../components/AuthForm";
import {
  Container,
  Paper,
  Typography,
  Box,
  Alert,
  Snackbar,
} from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const LoginPage = ({ user, setUser }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState("");

  // Form state managed in the parent
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [otp, setOtp] = useState("");

  const [snackbar, setSnackbar] = useState(false);

  const navigate = useNavigate();

  const handleAuth = async (formData) => {
    setError("");

    if (isLogin) {
      try {
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/login`,
          { email: formData.email, password: formData.password },
          { withCredentials: true }
        );
        setUser(response.data.user);
        window.location.href = "/dashboard";
      } catch (err) {
        setError("Login failed. Please check your credentials.");
        console.error("Login error:", err);
      }
      return;
    }

    if (!otpSent) {
      // Step 1: Validate details and request OTP
      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match.");
        return;
      }
      if (formData.password.length < 6) {
        setError("Password must be at least 6 characters long.");
        return;
      }
      console.log("Requesting OTP for:", formData.email);

      try {
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/send-otp`,
          { email: formData.email, name: formData.name },
          { withCredentials: true }
        );

        setSnackbar({
          open: true,
          message: `OTP sent successfully to ${formData.email}`,
          severity: "success",
        });
        setOtpSent(true);
      } catch (error) {
        setSnackbar({
          open: true,
          message: `Failed to send OTP`,
          severity: "error",
        });
      }
    } else {
      try {
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/signup`,
          {
            email: formData.email,
            password: formData.password,
            name: formData.name,
            otp: formData.otp,
          },
          { withCredentials: true }
        );
        setUser(response.data.user);
        navigate('/dashboard', {replace: true})
      } catch (err) {
        const message = err.response.data.message;
        setError(message || "Sign up failed. The OTP may be incorrect or expired.");
        console.error("Sign up error:", message);
      }
    }
  };

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setName("");
    setOtp("");
    setError("");
    setOtpSent(false);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        minWidth: "100vw",
        backgroundColor: "grey.50",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 4,
      }}
    >
      <Container maxWidth="xs">
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Typography variant="h5" component="h1" gutterBottom>
            DNS Manager
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            align="center"
            sx={{ mb: 4 }}
          >
            {isLogin ? "Log in to your account" : "Create a new account"}
          </Typography>

          {error && (
            <Alert severity="error" sx={{ width: "100%", mb: 2 }}>
              {error}
            </Alert>
          )}

          <AuthForm
            isLogin={isLogin}
            otpSent={otpSent}
            onAuth={handleAuth}
            onToggleLogin={() => {
              setIsLogin(!isLogin);
              resetForm();
            }}
            // Pass state and setters to the form
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            confirmPassword={confirmPassword}
            setConfirmPassword={setConfirmPassword}
            name={name}
            setName={setName}
            otp={otp}
            setOtp={setOtp}
            snackbar={snackbar}
            setSnackbar={setSnackbar}
          />
        </Paper>
      </Container>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
          sx={{ borderRadius: 2 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default LoginPage;
