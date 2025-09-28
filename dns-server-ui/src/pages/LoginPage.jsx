import React, { useState } from "react";
import AuthForm from "../components/AuthForm"; // Ensure this import is correct
import { Container, Paper, Typography, Box } from "@mui/material";
import axios from "axios";

const LoginPage = ({ user, setUser }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [otpSent, setOtpSent] = useState(false);

  const handleAuth = async (email, password, otp) => {
    console.log("Auth attempt:", { email, password, otp });

    if (!isLogin && !otpSent) {
      console.log("Sending OTP...");
      setOtpSent(true);
    } else {
      try {
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/login`,
          { email, password, otp },
          { withCredentials: true }
        );
        console.log("Response:", response);
        setUser(response.data.user);
        window.location.href = "/dashboard";
      } catch (error) {
        console.error("Authentication error:", error);
      }
    }
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
            alignItems: "center", // This is the magic line for centering
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
            Manage your domains and DNS records
          </Typography>
          <AuthForm
            isLogin={isLogin}
            otpSent={otpSent}
            onAuth={handleAuth}
            onToggleLogin={() => {
              setIsLogin(!isLogin);
              setOtpSent(false);
            }}
          />
        </Paper>
      </Container>
    </Box>
  );
};

export default LoginPage;
