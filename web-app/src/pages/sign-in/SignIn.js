import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import CssBaseline from "@mui/material/CssBaseline";
import FormControlLabel from "@mui/material/FormControlLabel";
import Divider from "@mui/material/Divider";
import FormLabel from "@mui/material/FormLabel";
import FormControl from "@mui/material/FormControl";
import Link from "@mui/material/Link";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import MuiCard from "@mui/material/Card";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { styled, alpha } from "@mui/material/styles";
import ForgotPassword from "./ForgotPassword";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#1976d2",
    },
    background: {
      default: "#f5f5f5",
      paper: "#ffffff",
    },
  },
});

const Card = styled(MuiCard)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignSelf: "center",
  width: "100%",
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  margin: "auto",
  backgroundColor: alpha(theme.palette.background.paper, 0.9),
  backdropFilter: 'blur(20px)',
  [theme.breakpoints.up("sm")]: {
    maxWidth: "450px",
  },
  boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.1)}`,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: `0 12px 48px ${alpha(theme.palette.primary.main, 0.2)}`,
    transform: 'translateY(-2px)',
  },
}));

const SignInContainer = styled(Stack)(({ theme }) => ({
  padding: 20,
  marginTop: "10vh",
  "&::before": {
    content: '""',
    display: "block",
    position: "absolute",
    zIndex: -1,
    inset: 0,
    backgroundImage: `radial-gradient(circle at 50% 50%, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.background.default, 0.8)})`,
    backgroundRepeat: "no-repeat",
  },
}));

export default function SignIn(props) {
  const [emailError, setEmailError] = React.useState(false);
  const [emailErrorMessage, setEmailErrorMessage] = React.useState("");
  const [passwordError, setPasswordError] = React.useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [snackBarOpen, setSnackBarOpen] = useState(false);
  const [snackSeverity, setSnackSeverity] = useState("info");
  const [snackBarMessage, setSnackBarMessage] = useState("");

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleCloseSnackBar = () => {
    setSnackBarOpen(false);
  };
  const handleClose = () => {
    setOpen(false);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    console.log({
      username: data.get("username"),
      password: data.get("password"),
    });
  };

  const validateInputs = () => {
    const username = document.getElementById("username"); // Đổi từ 'email' thành 'username'
    const password = document.getElementById("password");

    let isValid = true;

    if (!username.value || username.value.length < 3) {
      // Kiểm tra username
      setEmailError(true);
      setEmailErrorMessage("Please enter a valid username.");
      isValid = false;
    } else {
      setEmailError(false);
      setEmailErrorMessage("");
    }

    if (!password.value || password.value.length < 6) {
      setPasswordError(true);
      setPasswordErrorMessage("Password must be at least 6 characters long.");
      isValid = false;
    } else {
      setPasswordError(false);
      setPasswordErrorMessage("");
    }

    return isValid;
  };
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validateInputs()) {
      return;  // Nếu validate thất bại, dừng việc đăng nhập
    }
    
    setLoading(true);
    setError("");
  
    const params = new URLSearchParams();
    params.append("grant_type", "password");
    params.append("client_id", "skillhub_app");
    params.append("username", username);
    params.append("password", password);
    params.append("client_secret", "8Rv6ihvaurxRUAUPqC54NKRGyB7x2C08");
    params.append("scope", "openid");
  
    try {
      const response = await axios.post(
        "http://localhost:8180/realms/vmaudev/protocol/openid-connect/token",
        params
      );
      const { access_token, refresh_token } = response.data;
  
      localStorage.setItem("accessToken", access_token);
      localStorage.setItem("refreshToken", refresh_token);
      console.log("Access Token:", access_token);
      console.log("Refresh Token:", refresh_token);
      navigate("/");
      window.location.reload();

    } catch (error) {
      setSnackSeverity("error");
      console.error(error);
      setSnackBarMessage(
        error.response?.data?.message || "Đăng nhập thất bại do sai tài khoản hoặc mật khẩu"
      );
      setSnackBarOpen(true);
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline enableColorScheme />
      <SignInContainer direction="column" justifyContent="space-between">
        <Card variant="outlined">
          <img
            src="https://course-service-files.s3.ap-southeast-2.amazonaws.com/logobig.png"
            alt="Logo"
            width="156"
            height="100"
          />
          <Typography
            component="h1"
            variant="h4"
            sx={{ 
              width: "100%", 
              fontSize: "clamp(2rem, 10vw, 2.15rem)",
              background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textAlign: 'center',
              fontWeight: 600,
            }}
          >
            Đăng nhập
          </Typography>
          <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
            sx={{
              display: "flex",
              flexDirection: "column",
              width: "100%",
              gap: 2,
            }}
          >
            <FormControl>
              <FormLabel htmlFor="username" sx={{ color: "text.primary" }}>
                Tên đăng nhập
              </FormLabel>
              <TextField
                error={emailError}
                helperText={emailErrorMessage}
                id="username"
                type="text"
                name="username"
                placeholder="Nhập tên đăng nhập"
                autoComplete="username"
                autoFocus
                required
                onChange={(e) => setUsername(e.target.value)}
                fullWidth
                variant="outlined"
                color={emailError ? "error" : "primary"}
                sx={{
                  backgroundColor: alpha(theme.palette.background.paper, 0.5),
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.background.paper, 0.7),
                  },
                }}
              />
            </FormControl>
            
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <FormLabel htmlFor="password" sx={{ color: "text.primary" }}>
                Mật khẩu
              </FormLabel>
              <Link
                component="button"
                onClick={handleClickOpen}
                variant="body2"
                sx={{ 
                  alignSelf: "baseline", 
                  color: theme.palette.primary.light,
                  '&:hover': {
                    color: theme.palette.primary.main,
                  }
                }}
              >
                Quên mật khẩu?
              </Link>
            </Box>
            <TextField
              error={passwordError}
              helperText={passwordErrorMessage}
              name="password"
              placeholder="••••••"
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="current-password"
              required
              fullWidth
              onChange={(e) => setPassword(e.target.value)}
              variant="outlined"
              color={passwordError ? "error" : "primary"}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      onMouseDown={handleMouseDownPassword}
                      edge="end"
                      sx={{ color: theme.palette.text.secondary }}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                backgroundColor: alpha(theme.palette.background.paper, 0.5),
                '&:hover': {
                  backgroundColor: alpha(theme.palette.background.paper, 0.7),
                },
              }}
            />
            <FormControlLabel
              control={<Checkbox value="remember" color="primary" />}
              label="Ghi nhớ đăng nhập"
              sx={{ color: "text.primary" }}
            />
            <ForgotPassword open={open} handleClose={handleClose} />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              onClick={handleLogin}
              disabled={loading}
              sx={{ 
                background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
                color: 'white',
                py: 1.5,
                '&:hover': {
                  background: 'linear-gradient(45deg, #1976D2 30%, #21CBF3 90%)',
                  boxShadow: '0 5px 8px 2px rgba(33, 203, 243, .4)',
                },
                '&:disabled': {
                  background: alpha(theme.palette.primary.main, 0.5),
                }
              }}
            >
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </Button>
            <Typography sx={{ textAlign: "center", color: "text.primary" }}>
              Chưa có tài khoản?{" "}
              <Link
                href="/registration"
                variant="body2"
                sx={{ 
                  color: theme.palette.primary.main,
                  '&:hover': {
                    color: theme.palette.primary.dark,
                  }
                }}
              >
                Đăng ký ngay
              </Link>
            </Typography>
          </Box>
        </Card>
      </SignInContainer>
      <Snackbar
        open={snackBarOpen}
        onClose={handleCloseSnackBar}
        autoHideDuration={6000}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackBar}
          severity={snackSeverity}
          variant="filled"
        >
          {snackBarMessage}
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
}
