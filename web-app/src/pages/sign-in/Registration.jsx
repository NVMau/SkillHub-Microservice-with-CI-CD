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
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import { styled } from "@mui/material/styles";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { useState } from "react";
import axios from "axios";
import { register } from "../../services/userService";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import { useNavigate } from "react-router-dom";
import { alpha } from "@mui/material/styles";

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

const SignUpContainer = styled(Stack)(({ theme }) => ({
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

export default function SignUp(props) {
  const [usernameError, setUsernameError] = useState(false);
  const [usernameErrorMessage, setUsernameErrorMessage] = useState("");
  const [emailError, setEmailError] = useState(false);
  const [emailErrorMessage, setEmailErrorMessage] = useState("");
  const [passwordError, setPasswordError] = useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState(false);
  const [confirmPasswordErrorMessage, setConfirmPasswordErrorMessage] =
    useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("ROLE_STUDENT"); // Default role
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");

  const [snackBarOpen, setSnackBarOpen] = useState(false);
  const [snackBarMessage, setSnackBarMessage] = useState("");
  const [snackSeverity, setSnackSeverity] = useState("success");
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const username = formData.get("username");
    const email = formData.get("email");
    const password = formData.get("password");
    const confirmPassword = formData.get("confirmPassword");

    let isValid = true;

    // Validate Username
    if (!username || username.length < 3) {
      setUsernameError(true);
      setUsernameErrorMessage("Tên đăng nhập phải có ít nhất 3 ký tự.");
      isValid = false;
    } else {
      setUsernameError(false);
      setUsernameErrorMessage("");
    }

    // Validate Email
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setEmailError(true);
      setEmailErrorMessage("Vui lòng nhập email hợp lệ.");
      isValid = false;
    } else {
      setEmailError(false);
      setEmailErrorMessage("");
    }

    // Validate Password
    if (!password || password.length < 6) {
      setPasswordError(true);
      setPasswordErrorMessage("Mật khẩu phải có ít nhất 6 ký tự.");
      isValid = false;
    } else {
      setPasswordError(false);
      setPasswordErrorMessage("");
    }

    // Validate Confirm Password
    if (password !== confirmPassword) {
      setConfirmPasswordError(true);
      setConfirmPasswordErrorMessage("Mật khẩu không khớp.");
      isValid = false;
    } else {
      setConfirmPasswordError(false);
      setConfirmPasswordErrorMessage("");
    }

    // If all inputs are valid, send the registration data
    if (isValid) {
      try {
        const data = {
          username: username,
          password: password,
          firstName: firstname, // Ensure firstname and lastname are declared elsewhere in your code
          lastName: lastname,
          email: email,
          roles: [role], // Ensure role is defined and correctly handled
        };

        let response = await register(data);
        console.log("User registered successfully:", response.data);

        // Hiển thị thông báo thành công và chuyển về trang đăng nhập
        // Hiển thị thông báo thành công và chuyển về trang đăng nhập
        setSnackSeverity("success");
        setSnackBarMessage("Đăng ký thành công!");
        setSnackBarOpen(true);

        // Chuyển về trang đăng nhập sau khi thông báo hiển thị 2 giây
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } catch (error) {
        console.error("Error during registration:", error);
      }
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline enableColorScheme />
      <Snackbar
        open={snackBarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackBarOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert onClose={() => setSnackBarOpen(false)} severity={snackSeverity}>
          {snackBarMessage}
        </Alert>
      </Snackbar>
      <SignUpContainer direction="column" justifyContent="space-between">
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
            Đăng ký
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
            {/* Username */}
            <FormControl>
              <FormLabel htmlFor="username" sx={{ color: "text.primary" }}>
                Tên đăng nhập
              </FormLabel>
              <TextField
                error={usernameError}
                helperText={usernameErrorMessage}
                id="username"
                type="text"
                name="username"
                placeholder="Nhập tên đăng nhập"
                autoComplete="username"
                required
                fullWidth
                variant="outlined"
                color={usernameError ? "error" : "primary"}
                sx={{
                  backgroundColor: alpha(theme.palette.background.paper, 0.5),
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.background.paper, 0.7),
                  },
                }}
              />
            </FormControl>

            {/* Email */}
            <FormControl>
              <FormLabel htmlFor="email" sx={{ color: "text.primary" }}>
                Email
              </FormLabel>
              <TextField
                error={emailError}
                helperText={emailErrorMessage}
                id="email"
                type="email"
                name="email"
                placeholder="Nhập email của bạn"
                autoComplete="email"
                required
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

            {/* Lastname */}
            <FormControl>
              <FormLabel htmlFor="lastname" sx={{ color: "text.primary" }}>
                Họ
              </FormLabel>
              <TextField
                id="lastname"
                type="text"
                name="lastname"
                placeholder="Nhập họ của bạn"
                autoComplete="lastname"
                required
                value={lastname}
                fullWidth
                variant="outlined"
                onChange={(e) => setLastname(e.target.value)}
                sx={{
                  backgroundColor: alpha(theme.palette.background.paper, 0.5),
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.background.paper, 0.7),
                  },
                }}
              />
            </FormControl>

            {/* Firstname */}
            <FormControl>
              <FormLabel htmlFor="firstname" sx={{ color: "text.primary" }}>
                Tên
              </FormLabel>
              <TextField
                id="firstname"
                type="text"
                name="firstname"
                placeholder="Nhập tên của bạn"
                autoComplete="firstname"
                required
                value={firstname}
                fullWidth
                variant="outlined"
                onChange={(e) => setFirstname(e.target.value)}
                sx={{
                  backgroundColor: alpha(theme.palette.background.paper, 0.5),
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.background.paper, 0.7),
                  },
                }}
              />
            </FormControl>

            {/* Password */}
            <FormControl>
              <FormLabel htmlFor="password" sx={{ color: "text.primary" }}>
                Mật khẩu
              </FormLabel>
              <TextField
                error={passwordError}
                helperText={passwordErrorMessage}
                name="password"
                placeholder="••••••"
                type="password"
                id="password"
                autoComplete="new-password"
                required
                fullWidth
                onChange={(e) => setPassword(e.target.value)}
                variant="outlined"
                color={passwordError ? "error" : "primary"}
                sx={{
                  backgroundColor: alpha(theme.palette.background.paper, 0.5),
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.background.paper, 0.7),
                  },
                }}
              />
            </FormControl>

            {/* Confirm Password */}
            <FormControl>
              <FormLabel htmlFor="confirmPassword" sx={{ color: "text.primary" }}>
                Xác nhận mật khẩu
              </FormLabel>
              <TextField
                error={confirmPasswordError}
                helperText={confirmPasswordErrorMessage}
                name="confirmPassword"
                placeholder="••••••"
                type="password"
                id="confirmPassword"
                autoComplete="new-password"
                required
                fullWidth
                onChange={(e) => setConfirmPassword(e.target.value)}
                variant="outlined"
                color={confirmPasswordError ? "error" : "primary"}
                sx={{
                  backgroundColor: alpha(theme.palette.background.paper, 0.5),
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.background.paper, 0.7),
                  },
                }}
              />
            </FormControl>
            {/* Chọn Role */}
            <FormControl fullWidth margin="normal">
              <FormLabel id="role-select-label" sx={{ color: "text.primary" }}>
                Vai trò
              </FormLabel>
              <Select
                labelId="role-select-label"
                id="role-select"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                sx={{
                  backgroundColor: alpha(theme.palette.background.paper, 0.5),
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.background.paper, 0.7),
                  },
                }}
              >
                <MenuItem value="ROLE_STUDENT">Học viên</MenuItem>
                <MenuItem value="ROLE_TEACHER">Giảng viên</MenuItem>
              </Select>
            </FormControl>

            <FormControlLabel
              control={<Checkbox value="terms" color="primary" />}
              label="Tôi đồng ý với các điều khoản và điều kiện"
              sx={{ color: "text.primary" }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ 
                background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
                color: 'white',
                py: 1.5,
                '&:hover': {
                  background: 'linear-gradient(45deg, #1976D2 30%, #21CBF3 90%)',
                  boxShadow: '0 5px 8px 2px rgba(33, 203, 243, .4)',
                }
              }}
            >
              Đăng ký
            </Button>
            <Typography sx={{ textAlign: "center", color: "text.primary" }}>
              Đã có tài khoản?{" "}
              <Link href="/login" variant="body2" sx={{ color: theme.palette.primary.main }}>
                Đăng nhập
              </Link>
            </Typography>
          </Box>
        </Card>
      </SignUpContainer>
    </ThemeProvider>
  );
}
