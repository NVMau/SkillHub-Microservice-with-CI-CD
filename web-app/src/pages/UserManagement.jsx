import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  IconButton,
  Avatar,
  Chip,
  Tooltip,
  Stack,
  InputAdornment,
  useTheme,
  alpha,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from "@mui/material";
import {
  Edit,
  Delete,
  Add as AddIcon,
  Search as SearchIcon,
  PersonAdd,
  MonetizationOn,
  School,
  AdminPanelSettings,
} from "@mui/icons-material";
import Scene from "./Scene";
import {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
} from "../services/userService";
import useUserRoles from "../services/useUserRoles";

export default function UserManagement() {
  const [users, setUsers] = useState([]); // Danh sách người dùng
  const [openAddDialog, setOpenAddDialog] = useState(false); // Để mở hoặc đóng dialog thêm người dùng
  const [openEditDialog, setOpenEditDialog] = useState(false); // Để mở dialog sửa người dùng
  const [selectedUser, setSelectedUser] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const userRoles = useUserRoles();
  
  
  // Lưu người dùng được chọn để sửa
  const [newUser, setNewUser] = useState({
    username: "",
    password: "",
    email: "",
    firstName: "",
    lastName: "",
    dob: "",
    roles: [],
  }); // Thông tin người dùng mới
  const [editUser, setEditUser] = useState({
    username: "",
    email: "",
    firstName: "",
    lastName: "",
    dob: "",
    coin: 0,
  }); // Thông tin người dùng để sửa

  // Hàm lấy danh sách người dùng từ API
  const fetchUsers = async () => {
    try {
      const response = await getAllUsers();
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Hàm thêm người dùng mới
  const handleAddUser = async () => {
    try {
      await createUser(newUser);
      fetchUsers(); // Load lại danh sách người dùng sau khi thêm
      setOpenAddDialog(false);
      setNewUser({ username: "", password: "", email: "", firstName: "", lastName: "", dob: "", roles: [] }); // Reset form
    } catch (error) {
      console.error("Error adding user", error);
    }
  };

  // Hàm mở dialog sửa người dùng và gán thông tin vào form
  const handleEditUserOpen = (user) => {
    setEditUser(user); // Gán thông tin người dùng vào form để sửa
    setOpenEditDialog(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteUser(userToDelete.profileId); // Xóa người dùng thông qua API
      setOpenDeleteDialog(false); // Đóng dialog sau khi xóa thành công
      fetchUsers(); // Load lại danh sách người dùng sau khi xóa
      alert("Xóa người dùng thành công!"); // Hiển thị thông báo thành công
    } catch (error) {
      console.error("Error deleting user", error);
      alert("Lỗi khi xóa người dùng.");
    }
  };

  const handleDeleteDialogOpen = (user) => {
    setUserToDelete(user); // Lưu thông tin người dùng vào state
    setOpenDeleteDialog(true); // Mở dialog xác nhận xóa
  };
  // Hàm cập nhật người dùng
  const handleUpdateUser = async () => {
    try {
      await updateUser(editUser);
      fetchUsers(); // Load lại danh sách sau khi cập nhật
      setOpenEditDialog(false); // Đóng dialog sửa người dùng
      setEditUser({
        username: "",
        email: "",
        firstName: "",
        lastName: "",
        dob: "",
        coin: 0,
      }); // Reset form
    } catch (error) {
      console.error("Error updating user", error);
    }
  };

  // Hàm xóa người dùng
  const handleDeleteUser = async (userId) => {
    try {
      await deleteUser(userId);
      fetchUsers(); // Load lại danh sách sau khi xóa
    } catch (error) {
      console.error("Error deleting user", error);
    }
  };

  return (
    <Scene>
      <Box
        sx={{
          p: 3,
          minHeight: "100vh",
          bgcolor: (theme) => theme.palette.background.default,
        }}
      >
        <Card
          sx={{
            borderRadius: 4,
            boxShadow: (theme) => `0 0 24px ${alpha(theme.palette.primary.main, 0.1)}`,
            overflow: "visible",
          }}
        >
          {/* Header Section */}
          <Box
            sx={{
              p: 3,
              background: (theme) =>
                `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              color: "white",
              borderRadius: "16px 16px 0 0",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Stack direction="row" spacing={2} alignItems="center">
              <AdminPanelSettings sx={{ fontSize: 40 }} />
              <Typography variant="h4" fontWeight="bold">
                Quản lý người dùng
              </Typography>
            </Stack>
            {userRoles.includes("ROLE_SUPERADMIN") && (
            <Button
              variant="contained"
              startIcon={<PersonAdd />}
              onClick={() => setOpenAddDialog(true)}
              sx={{
                bgcolor: "white",
                color: "primary.main",
                "&:hover": {
                  bgcolor: alpha("#fff", 0.9),
                },
                px: 3,
              }}
            >
              Thêm người dùng
            </Button>
            )}
          </Box>

          {/* Search and Filter Section */}
          <Box sx={{ p: 3, display: "flex", gap: 2 }}>
            <TextField
              fullWidth
              placeholder="Tìm kiếm người dùng..."
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
                sx: {
                  borderRadius: 2,
                  bgcolor: "background.paper",
                },
              }}
            />
          </Box>

          {/* Table Section */}
          <TableContainer sx={{ px: 3, pb: 3 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Thông tin người dùng</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Coin</TableCell>
                  <TableCell>Vai trò</TableCell>
                  <TableCell align="right">Hành động</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow
                    key={user.userId}
                    sx={{
                      "&:hover": {
                        bgcolor: "action.hover",
                      },
                    }}
                  >
                    <TableCell>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar
                          src={user.avatarUrl}
                          alt={user.username}
                          sx={{
                            width: 48,
                            height: 48,
                            border: (theme) => `2px solid ${theme.palette.primary.main}`,
                          }}
                        />
                        <Box>
                          <Typography variant="subtitle1" fontWeight="medium">
                            {user.firstName} {user.lastName}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            @{user.username}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Chip
                        icon={<MonetizationOn />}
                        label={`${user.coin} coin`}
                        color="primary"
                        variant="outlined"
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        {user.roles.map((role) => (
                          <Chip
                            key={role}
                            icon={role.includes("ADMIN") ? <AdminPanelSettings /> : <School />}
                            label={role.replace("ROLE_", "")}
                            color={role.includes("ADMIN") ? "error" : "primary"}
                            size="small"
                            variant="outlined"
                          />
                        ))}
                      </Stack>
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <Tooltip title="Chỉnh sửa">
                          <IconButton
                            onClick={() => handleEditUserOpen(user)}
                            color="primary"
                            size="small"
                            sx={{
                              "&:hover": {
                                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                              },
                            }}
                          >
                            <Edit />
                          </IconButton>
                        </Tooltip>
                        {user.roles.includes("ROLE_STUDENT") && (
                          <Tooltip title="Xóa">
                            <IconButton
                              onClick={() => handleDeleteDialogOpen(user)}
                              color="error"
                              size="small"
                              sx={{
                                "&:hover": {
                                  bgcolor: (theme) => alpha(theme.palette.error.main, 0.1),
                                },
                              }}
                            >
                              <Delete />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>

        {/* Add User Dialog */}
        <Dialog
          open={openAddDialog}
          onClose={() => setOpenAddDialog(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
            },
          }}
        >
          <DialogTitle sx={{ pb: 0 }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <PersonAdd color="primary" />
              <Typography variant="h6" fontWeight="bold">
                Thêm người dùng mới
              </Typography>
            </Stack>
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            <Stack spacing={2}>
              <TextField
                label="Tên đăng nhập"
                fullWidth
                value={newUser.username}
                onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
              />
              <TextField
                label="Mật khẩu"
                fullWidth
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              />
              <TextField
                label="Email"
                fullWidth
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              />
              <Stack direction="row" spacing={2}>
                <TextField
                  label="Họ"
                  fullWidth
                  value={newUser.firstName}
                  onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
                />
                <TextField
                  label="Tên"
                  fullWidth
                  value={newUser.lastName}
                  onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
                />
              </Stack>
              <TextField
                label="Ngày sinh"
                fullWidth
                type="date"
                InputLabelProps={{ shrink: true }}
                value={newUser.dob}
                onChange={(e) => setNewUser({ ...newUser, dob: e.target.value })}
              />
              <FormControl fullWidth>
                <InputLabel id="role-label">Vai trò</InputLabel>
                <Select
                  labelId="role-label"
                  label="Vai trò"
                  value={newUser.roles[0] || ""}
                  onChange={e => setNewUser({ ...newUser, roles: [e.target.value] })}
                >
                  <MenuItem value="ROLE_ADMIN">Admin</MenuItem>
                  <MenuItem value="ROLE_STUDENT">Student</MenuItem>
                  <MenuItem value="ROLE_TEACHER">Teacher</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button
              variant="outlined"
              onClick={() => setOpenAddDialog(false)}
              sx={{ borderRadius: 2 }}
            >
              Hủy
            </Button>
            <Button
              variant="contained"
              onClick={handleAddUser}
              startIcon={<AddIcon />}
              sx={{ borderRadius: 2 }}
            >
              Thêm người dùng
            </Button>
          </DialogActions>
        </Dialog>

        {/* Edit User Dialog */}
        <Dialog
          open={openEditDialog}
          onClose={() => setOpenEditDialog(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
            },
          }}
        >
          <DialogTitle sx={{ pb: 0 }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Edit color="primary" />
              <Typography variant="h6" fontWeight="bold">
                Chỉnh sửa thông tin người dùng
              </Typography>
            </Stack>
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            <Stack spacing={2}>
              <TextField
                label="ID"
                fullWidth
                value={editUser.profileId}
                disabled
              />
              <TextField
                label="Tên đăng nhập"
                fullWidth
                value={editUser.username}
                disabled
              />
              <TextField
                label="Email"
                fullWidth
                value={editUser.email}
                onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
              />
              <Stack direction="row" spacing={2}>
                <TextField
                  label="Họ"
                  fullWidth
                  value={editUser.firstName}
                  onChange={(e) => setEditUser({ ...editUser, firstName: e.target.value })}
                />
                <TextField
                  label="Tên"
                  fullWidth
                  value={editUser.lastName}
                  onChange={(e) => setEditUser({ ...editUser, lastName: e.target.value })}
                />
              </Stack>
              <Stack direction="row" spacing={2}>
                <TextField
                  label="Coin"
                  fullWidth
                  type="number"
                  value={editUser.coin}
                  onChange={(e) => setEditUser({ ...editUser, coin: e.target.value })}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <MonetizationOn color="primary" />
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  label="Ngày sinh"
                  fullWidth
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  value={editUser.dob}
                  onChange={(e) => setEditUser({ ...editUser, dob: e.target.value })}
                />
              </Stack>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button
              variant="outlined"
              onClick={() => setOpenEditDialog(false)}
              sx={{ borderRadius: 2 }}
            >
              Hủy
            </Button>
            <Button
              variant="contained"
              onClick={handleUpdateUser}
              startIcon={<Edit />}
              sx={{ borderRadius: 2 }}
            >
              Cập nhật
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={openDeleteDialog}
          onClose={() => setOpenDeleteDialog(false)}
          PaperProps={{
            sx: {
              borderRadius: 3,
            },
          }}
        >
          <DialogTitle sx={{ pb: 0 }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Delete color="error" />
              <Typography variant="h6" fontWeight="bold">
                Xác nhận xóa người dùng
              </Typography>
            </Stack>
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            <Typography>
              Bạn có chắc chắn muốn xóa người dùng này? Hành động này không thể hoàn tác.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button
              variant="outlined"
              onClick={() => setOpenDeleteDialog(false)}
              sx={{ borderRadius: 2 }}
            >
              Hủy
            </Button>
            <Button
              variant="contained"
              onClick={handleConfirmDelete}
              color="error"
              startIcon={<Delete />}
              sx={{ borderRadius: 2 }}
            >
              Xác nhận xóa
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Scene>
  );
}
