import * as React from "react";
import { styled, alpha } from "@mui/material/styles";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import InputBase from "@mui/material/InputBase";
import Badge from "@mui/material/Badge";
import MenuItem from "@mui/material/MenuItem";
import Menu from "@mui/material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import AccountCircle from "@mui/icons-material/AccountCircle";
import MailIcon from "@mui/icons-material/Mail";
import NotificationsIcon from "@mui/icons-material/Notifications";
import MoreIcon from "@mui/icons-material/MoreVert";
import { useNavigate } from "react-router-dom";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import { useDarkMode } from "../DarkModeContext";
import { useState } from "react";
import Typography from "@mui/material/Typography";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import TextField from "@mui/material/TextField";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import { getMyProfile, getDepositHistory } from "../services/userService";
import { submitOrder } from "../services/paymentService";
import { useProfile } from "../context/ProfileContext";
import { Table, TableHead, TableRow, TableCell, TableBody, Chip } from "@mui/material";

const Search = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  "&:hover": {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: "100%",
  [theme.breakpoints.up("sm")]: {
    marginLeft: theme.spacing(3),
    width: "auto",
  },
}));

const SearchIconWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: "100%",
  position: "absolute",
  pointerEvents: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

const CoinContainer = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  "&:hover": {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  paddingLeft: theme.spacing(1),
  paddingRight: theme.spacing(0.2),
  paddingBottom: theme.spacing(0.1),
  paddingTop: theme.spacing(0.1),

  display: "flex",
  alignItems: "center",
}));

// const clearCookies = () => {
//   document.cookie.split(";").forEach((cookie) => {
//     document.cookie = cookie
//       .replace(/^ +/, "")
//       .replace(/=.*/, `=;expires=${new Date(0).toUTCString()};path=/`);
//   });
// };

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: "inherit",
  "& .MuiInputBase-input": {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create("width"),
    width: "100%",
    [theme.breakpoints.up("md")]: {
      width: "20ch",
    },
  },
}));

export default function Header() {
  const { profile, fetchProfile, resetProfile } = useProfile();
  const [amount, setAmount] = useState(0);
  const [open, setOpen] = useState(false);
  const [snackSeverity, setSnackSeverity] = useState("info");
  const [snackBarOpen, setSnackBarOpen] = useState(false);
  const [snackBarMessage, setSnackBarMessage] = useState("");
  const [openDepositDialog, setOpenDepositDialog] = useState(false);
  const [depositHistory, setDepositHistory] = useState([]);
  const [loadingDeposit, setLoadingDeposit] = useState(false);

  const { darkMode, setDarkMode } = useDarkMode();

  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = React.useState(null);

  const isMenuOpen = Boolean(anchorEl);
  const isMobileMenuOpen = Boolean(mobileMoreAnchorEl);

  const handleProfileMenuOpen = (event) => {
    console.log(profile.avatarUrl)
    setAnchorEl(event.currentTarget);
  };

  const handleProfileClick = () => {
    navigate("/profile");
  };

  const handleMobileMenuClose = () => {
    setMobileMoreAnchorEl(null);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    handleMobileMenuClose();
  };

  const handleMobileMenuOpen = (event) => {
    setMobileMoreAnchorEl(event.currentTarget);
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    resetProfile();
    navigate("/login");
  };

  const menuId = "primary-search-account-menu";
  const handleDepositHistoryOpen = async () => {
    setOpenDepositDialog(true);
    setLoadingDeposit(true);
    try {
      if (profile?.profileId) {
        const res = await getDepositHistory(profile.profileId);
        setDepositHistory(res.data);
      } else {
        setDepositHistory([]);
      }
    } catch (e) {
      setDepositHistory([]);
    }
    setLoadingDeposit(false);
  };
  const handleDepositHistoryClose = () => setOpenDepositDialog(false);

  const renderMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: "bottom", // Căn theo phía dưới
        horizontal: "center", // Căn giữa theo chiều ngang
      }}
      id={menuId}
      keepMounted
      transformOrigin={{
        vertical: "top", // Điểm bắt đầu render từ phía trên
        horizontal: "center", // Căn giữa theo chiều ngang
      }}
      open={isMenuOpen}
      onClose={handleMenuClose}
    >
      <MenuItem onClick={handleProfileClick}>Profile</MenuItem>
      <MenuItem onClick={handleDepositHistoryOpen}>Lịch sử nạp tiền</MenuItem>
      <MenuItem onClick={handleLogout}>Log Out</MenuItem>
    </Menu>
  );
  const mobileMenuId = "primary-search-account-menu-mobile";
  const renderMobileMenu = (
    <Menu
      anchorEl={mobileMoreAnchorEl}
      anchorOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      id={mobileMenuId}
      keepMounted
      transformOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      open={isMobileMenuOpen}
      onClose={handleMobileMenuClose}
    >
      <MenuItem>
        <IconButton size="large" aria-label="show 4 new mails" color="inherit">
          <Badge badgeContent={4} color="error">
            <MailIcon />
          </Badge>
        </IconButton>
        <p>Messages</p>
      </MenuItem>
      <MenuItem>
        <IconButton
          size="large"
          aria-label="show notifications"
          color="inherit"
        >
          <Badge badgeContent={0} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>
        <p>Notifications</p>
      </MenuItem>
      <MenuItem onClick={handleProfileMenuOpen}>
        <IconButton
          size="large"
          edge="end"
          aria-label="account of current user"
          aria-controls={menuId}
          aria-haspopup="true"
          onClick={handleProfileMenuOpen}
          color="inherit"
        >
          {profile?.avatarUrl ? (
            <Box
              component="img"
              src={profile.avatarUrl} // Đường dẫn avatar của người dùng
              alt="User Avatar"
              sx={{
                width: 35,
                height: 35,
                borderRadius: "50%", // Làm tròn ảnh
                objectFit: "cover", // Đảm bảo ảnh không bị méo
              }}
            />
          ) : (
            <AccountCircle /> // Hiển thị icon mặc định nếu không có avatar
          )}
        </IconButton>
        <p>Profile</p>
      </MenuItem>
    </Menu>
  );
  const handleClickOpen = () => {
    setOpen(true);
  };

  const formatCurrency = (value) => {
    return Number(value)
      .toLocaleString("vi-VN", {
        style: "currency",
        currency: "VND",
        minimumFractionDigits: 0,
      })
      .replace("₫", "")
      .trim(); // Loại bỏ ký hiệu ₫ nếu không muốn hiển thị
  };
  const handleMoneyChange = (event) => {
    const input = event.target.value.replace(/\./g, ""); // Loại bỏ dấu chấm cũ
    setAmount(input); // Cập nhật giá trị nhập vào
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleDeposit = async () => {
    if (!profile.profileId) {
      console.error("Profile ID không tồn tại");
      return;
    }
    console.log(`Nạp số tiền: ${amount}`);
    try {
      const result = await submitOrder(amount, profile.profileId);
      console.log("Order submitted:", result.data);
      console.log("Order submitted:", result);
      window.location.href = result.data;
      fetchProfile();
    } catch (error) {
      console.error("Failed to submit order:", error);
    }
    setOpen(false);
  };

  return (
    <>
      <IconButton
        size="large"
        edge="start"
        color="inherit"
        aria-label="open drawer"
        sx={{ mr: 2 }}
      >
        <Box
          component={"img"}
          style={{
            width: "35px",
            height: "35px",
            borderRadius: 6,
          }}
          src="/logo/skilhublogo.png"
        ></Box>
        <Typography
          variant="h6"
          sx={{
            ml: 1.2,
            fontWeight: 700,
            color: 'white',
            letterSpacing: 2,
            userSelect: 'none',
            fontSize: 22,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          SKILLHUB
        </Typography>
      </IconButton>
      <Box sx={{ flexGrow: 1 }} />
      <Box sx={{ display: { xs: "none", md: "flex" }, alignItems: 'center' }}>
        {/* Hiển thị tên và vai trò người dùng sát avatar */}
        {profile && (
          <Box sx={{ display: 'flex', alignItems: 'center', mr: 1.5 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', mr: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'white', lineHeight: 1 }}>
                {profile.firstName} {profile.lastName}
              </Typography>
              <Typography variant="caption" sx={{ color: 'white', opacity: 0.8 }}>
                {Array.isArray(profile.roles) ? profile.roles.map(r => r.replace('ROLE_', '')).join(', ') : ''}
              </Typography>
            </Box>
            <IconButton
              size="large"
              edge="end"
              aria-label="account of current user"
              aria-controls={menuId}
              aria-haspopup="true"
              onClick={handleProfileMenuOpen}
              color="inherit"
            >
              {profile?.avatarUrl ? (
                <Box
                  component="img"
                  src={profile.avatarUrl}
                  alt="User Avatar"
                  sx={{
                    width: 40, // Kích thước lớn hơn một chút
                    height: 40,
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: "2px solid", // Viền nổi bật
                    borderColor: "primary.main", // Sử dụng màu chính của theme
                    boxShadow: "0 0 10px rgba(0, 0, 0, 0.2)", // Tạo hiệu ứng nổi
                  }}
                />
              ) : (
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "2px solid",
                    borderColor: "primary.main",
                    backgroundColor: "background.paper", // Màu nền cho avatar mặc định
                    boxShadow: "0 0 10px rgba(0, 0, 0, 0.2)",
                  }}
                >
                  <AccountCircle sx={{ fontSize: 30, color: "text.secondary" }} />
                </Box>
              )}
            </IconButton>
          </Box>
        )}
        {/* Dark mode toggle button */}
        <IconButton
          size="large"
          edge="end"
          aria-label="toggle dark mode"
          color="inherit"
          onClick={() => setDarkMode(!darkMode)}
        >
          {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
        </IconButton>
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", ml: 0.5 }}>
        {/* Số dư và icon với nền đã được stylize */}
        <CoinContainer onClick={handleClickOpen}>
          <Typography
            variant="h7"
            sx={{
              paddingRight: "5px",
              display: "flex",
              alignItems: "center",
            }}
          >
            {profile ? profile.coin : "0"}
          </Typography>
          <MonetizationOnIcon /> {/* Icon coin bên cạnh số dư */}
        </CoinContainer>
      </Box>

      {/* Modal nạp tiền */}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle textAlign={"center"}>Nạp tiền VNPay</DialogTitle>
        <DialogContent>
          <Box sx={{ textAlign: "center", marginBottom: 2 }}>
            <img
              src="/logo/Logo-VNPAY-QR.png" // Đường dẫn đến logo
              alt="VNPay Logo"
              style={{ width: "150px" }} // Điều chỉnh kích thước nếu cần
            />
          </Box>
          <TextField
            autoFocus
            margin="dense"
            id="amount"
            label="Nhập số tiền cần nạp (VND)"
            type="text" // Chuyển sang "text" để hiển thị số có dấu chấm
            fullWidth
            variant="standard"
            value={formatCurrency(amount)} // Định dạng số tiền
            onChange={handleMoneyChange} // Xử lý khi nhập giá trị
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Hủy</Button>
          <Button onClick={handleDeposit}>Nạp tiền</Button>
        </DialogActions>
      </Dialog>

      <Box sx={{ display: { xs: "flex", md: "none" } }}>
        <IconButton
          size="large"
          aria-label="show more"
          aria-controls={mobileMenuId}
          aria-haspopup="true"
          onClick={handleMobileMenuOpen}
          color="inherit"
        >
          <MoreIcon />
        </IconButton>
      </Box>
      {renderMobileMenu}
      {renderMenu}
      <Dialog open={openDepositDialog} onClose={handleDepositHistoryClose} maxWidth="sm" fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ textAlign: 'center', fontWeight: 700, fontSize: 22 }}>
          Lịch sử nạp tiền
        </DialogTitle>
        <DialogContent>
          {loadingDeposit ? (
            <Typography align="center" sx={{ my: 3 }}>Đang tải...</Typography>
          ) : depositHistory.length === 0 ? (
            <Typography align="center" sx={{ my: 3 }}>Không có lịch sử nạp tiền.</Typography>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>Số tiền (VNĐ)</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>Số coin</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>Thời gian</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>Trạng thái</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {depositHistory.map((item) => (
                  <TableRow key={item.id} hover>
                    <TableCell align="center">{item.amountVnd.toLocaleString()}</TableCell>
                    <TableCell align="center">{item.amountCoin}</TableCell>
                    <TableCell align="center">{new Date(item.paymentTime).toLocaleString()}</TableCell>
                    <TableCell align="center">
                      <Chip
                        label={item.status}
                        color={item.status === "SUCCESS" ? "success" : "error"}
                        size="small"
                        sx={{ fontWeight: 600 }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
          <Button onClick={handleDepositHistoryClose} variant="outlined" sx={{ borderRadius: 2, px: 3 }}>
            Đóng
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
