import React, { useState } from "react";
import { TextField, Button, Stack, Link, Box } from "@mui/material";

// Ensure the component name is "AuthForm"
const AuthForm = ({ isLogin, otpSent, onAuth, onToggleLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    onAuth(email, password, otp);
  };

  const title = isLogin ? "Log In" : "Sign Up";
  const buttonText = !isLogin && !otpSent ? "Send OTP" : title;

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ width: "100%" }}>
      <Stack spacing={2}>
        <TextField
          label="Email Address"
          type="email"
          variant="outlined"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          fullWidth
        />
        {isLogin || !otpSent ? (
          <TextField
            label="Password"
            type="password"
            variant="outlined"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            fullWidth
          />
        ) : null}
        {!isLogin && otpSent && (
          <TextField
            label="OTP Code"
            type="text"
            variant="outlined"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
            fullWidth
          />
        )}
        <Button type="submit" variant="contained" size="large" fullWidth>
          {buttonText}
        </Button>
        <Link
          component="button"
          variant="body2"
          onClick={onToggleLogin}
          sx={{ textAlign: "center", mt: 2 }}
        >
          {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Log In"}
        </Link>
      </Stack>
    </Box>
  );
};

// Ensure you are exporting it as the default
export default AuthForm;