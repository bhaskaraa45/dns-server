import React, { useState } from "react";
import { TextField, Button, Stack, Link, Box, Typography } from "@mui/material";

// Ensure the component name is "AuthForm"
const AuthForm = ({
  isLogin,
  otpSent,
  onAuth,
  onToggleLogin,
  email,
  setEmail,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  name,
  setName,
  otp,
  setOtp,
  snackbar,
  setSnackbar
}) => {
  const handleSubmit = (event) => {
    event.preventDefault();
    // Pass all form data in a single object
    onAuth({ email, password, confirmPassword, name, otp });
  };

  const title = isLogin ? "Log In" : "Sign Up";
  const buttonText = !isLogin && !otpSent ? "Get OTP" : title;

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ width: "100%" }}>
      <Stack spacing={2}>
        {/* Email Field (Always visible except when OTP is shown) */}
        {!otpSent && (
          <TextField
            label="Email Address"
            type="email"
            variant="outlined"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            fullWidth
          />
        )}

        {/* Name Field (Sign up only) */}
        {!isLogin && !otpSent && (
          <TextField
            label="Full Name"
            type="text"
            variant="outlined"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            fullWidth
          />
        )}

        {/* Password Fields (Login and Sign up) */}
        {(isLogin || !otpSent) && (
          <TextField
            label="Password"
            type="password"
            variant="outlined"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            fullWidth
          />
        )}
        {!isLogin && !otpSent && (
          <TextField
            label="Confirm Password"
            type="password"
            variant="outlined"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            fullWidth
          />
        )}

        {/* OTP Field (Sign up after getting OTP) */}
        {!isLogin && otpSent && (
          <>
            <Typography variant="body2" color="text.secondary">
              An OTP has been sent to <strong>{email}</strong>.
            </Typography>
            <TextField
              label="OTP Code"
              type="text"
              variant="outlined"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              fullWidth
            />
          </>
        )}

        <Button type="submit" variant="contained" size="large" fullWidth>
          {buttonText}
        </Button>
        <Link
          component="button"
          type="button" // Add type="button" to prevent form submission
          variant="body2"
          onClick={onToggleLogin}
          sx={{ textAlign: "center", mt: 2 }}
        >
          {isLogin
            ? "Don't have an account? Sign Up"
            : "Already have an account? Log In"}
        </Link>
      </Stack>
    </Box>
  );
};

// Ensure you are exporting it as the default
export default AuthForm;
