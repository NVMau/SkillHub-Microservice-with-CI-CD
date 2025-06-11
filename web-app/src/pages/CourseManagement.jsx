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
  MenuItem,
  IconButton,
  InputLabel,
  Snackbar,
  FormControl,
  Select,
  Alert,
  Stack,
  Chip,
  alpha,
  Tooltip,
  Grid,
  Avatar,
  Divider,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  School as SchoolIcon,
  Image as ImageIcon,
  AttachMoney as MoneyIcon,
  Description as DescriptionIcon,
  LocalOffer as TagIcon,
  Person as PersonIcon,
  Group as GroupIcon,
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon,
} from "@mui/icons-material";
import Scene from "./Scene"; // Dùng Scene để bọc nội dung
import {
  getAllCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  getTeachers,
} from "../services/courseService"; // Các API thao tác với backend

export default function CourseManagement() {
  const [courses, setCourses] = useState([]); // Danh sách khóa học
  const [openAddDialog, setOpenAddDialog] = useState(false); // Để mở hoặc đóng dialog thêm khóa học
  const [openEditDialog, setOpenEditDialog] = useState(false); // Để mở dialog sửa khóa học

  const [previewImage, setPreviewImage] = useState(null); // Để hiển thị ảnh xem trước
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [tags, setTags] = useState("");
  const [teacherId, setTeacherId] = useState(""); // Lưu profileId thay vì userId
  const [file, setFile] = useState(null);
  const [teachers, setTeachers] = useState([]); // Lưu danh sách giáo viên

  const [snackBarOpen, setSnackBarOpen] = useState(false);
  const [snackSeverity, setSnackSeverity] = useState("info");
  const [snackBarMessage, setSnackBarMessage] = useState("");

  const handleCloseSnackBar = () => {
    setSnackBarOpen(false);
  };

  const [editCourse, setEditCourse] = useState({
    name: "",
    description: "",
    price: "",
  }); // Thông tin khóa học để sửa

  // Thêm state cho thống kê
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    totalRevenue: 0,
  });

  // Hàm lấy danh sách khóa học từ API
  const fetchCourses = async () => {
    try {
      const response = await getAllCourses();
      setCourses(response.data);
    } catch (error) {
      console.error("Error fetching courses", error);
    }
  };

  const fetchTeachers = async () => {
    try {
      const response = await getTeachers(); // Sử dụng service để lấy danh sách giáo viên
      setTeachers(response.data);
    } catch (error) {
      console.error("Error fetching teachers", error);
    }
  };

  useEffect(() => {
    fetchCourses();
    fetchTeachers();
  }, []);

  // Cập nhật thống kê khi courses thay đổi
  useEffect(() => {
    if (courses.length > 0) {
      setStats({
        totalCourses: courses.length,
        totalStudents: courses.reduce((acc, course) => acc + (course.students?.length || 0), 0),
        totalRevenue: courses.reduce((acc, course) => acc + (course.price || 0), 0),
      });
    }
  }, [courses]);

  // Hàm mở dialog sửa khóa học và gán thông tin vào form
  const handleEditCourseOpen = (course) => {
    setEditCourse(course); // Gán thông tin khóa học vào form để sửa
    setOpenEditDialog(true);
  };

  // Hàm cập nhật khóa học
  const handleUpdateCourse = async () => {
    try {
      console.log(editCourse);
      await updateCourse(editCourse);

      fetchCourses(); // Load lại danh sách sau khi cập nhật
      setOpenEditDialog(false); // Đóng dialog sửa khóa học
      setEditCourse({ name: "", description: "", price: "" }); // Reset form
    } catch (error) {
      console.error("Error updating course", error);
    }
  };

  // Hàm xóa khóa học
  const handleDeleteCourse = async (courseId) => {
    try {
      await deleteCourse(courseId);
      fetchCourses(); // Load lại danh sách sau khi xóa
    } catch (error) {
      console.error("Error deleting course", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("price", price);
    formData.append("tags", tags.split(","));
    formData.append("teacherId", teacherId);
    formData.append("file", file);

    try {
      await createCourse(formData);
      setSnackSeverity("success");
      setSnackBarMessage("Course created successfully!");
      setSnackBarOpen(true);

      // Refresh lại danh sách khóa học sau khi tạo thành công
      fetchCourses();

      // Đóng dialog và reset các trường
      setOpenAddDialog(false);
      setName("");
      setDescription("");
      setPrice("");
      setTags("");
      setTeacherId("");
      setFile(null);
      setPreviewImage(null);
    } catch (error) {
      setSnackSeverity("error");
      setSnackBarMessage(
        error.response?.data?.message || "Failed to create course"
      );
      setSnackBarOpen(true);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);

    // Hiển thị ảnh xem trước
    if (selectedFile) {
      const objectUrl = URL.createObjectURL(selectedFile);
      setPreviewImage(objectUrl);
    }
  };

  return (
    <Scene>
      <Box sx={{ p: 3 }}>
        {/* Header Card */}
        <Card
          sx={{
            mb: 4,
            borderRadius: 4,
            background: (theme) =>
              `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            color: "white",
            boxShadow: (theme) => `0 8px 32px ${alpha(theme.palette.primary.main, 0.18)}`,
          }}
        >
          <Box sx={{ p: 4 }}>
            <Stack direction="row" spacing={2} alignItems="center" mb={3}>
              <SchoolIcon sx={{ fontSize: 40 }} />
              <Typography variant="h4" fontWeight="bold">
                Quản lý khóa học
              </Typography>
            </Stack>
            <Typography variant="subtitle1" sx={{ opacity: 0.9, mb: 4 }}>
              Quản lý và tổ chức các khóa học của bạn
            </Typography>

            {/* Stats Grid */}
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Card
                  sx={{
                    bgcolor: alpha('#fff', 0.1),
                    backdropFilter: 'blur(10px)',
                    borderRadius: 2,
                    p: 2,
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                    },
                  }}
                >
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar sx={{ bgcolor: alpha('#fff', 0.2) }}>
                      <SchoolIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h4" fontWeight="bold">
                        {stats.totalCourses}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.8 }}>
                        Tổng số khóa học
                      </Typography>
                    </Box>
                  </Stack>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card
                  sx={{
                    bgcolor: alpha('#fff', 0.1),
                    backdropFilter: 'blur(10px)',
                    borderRadius: 2,
                    p: 2,
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                    },
                  }}
                >
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar sx={{ bgcolor: alpha('#fff', 0.2) }}>
                      <GroupIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h4" fontWeight="bold">
                        {stats.totalStudents}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.8 }}>
                        Tổng số học viên
                      </Typography>
                    </Box>
                  </Stack>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card
                  sx={{
                    bgcolor: alpha('#fff', 0.1),
                    backdropFilter: 'blur(10px)',
                    borderRadius: 2,
                    p: 2,
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                    },
                  }}
                >
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar sx={{ bgcolor: alpha('#fff', 0.2) }}>
                      <MoneyIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h4" fontWeight="bold">
                        {stats.totalRevenue}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.8 }}>
                        Tổng doanh thu (coin)
                      </Typography>
                    </Box>
                  </Stack>
                </Card>
              </Grid>
            </Grid>
          </Box>
        </Card>

        {/* Main Content */}
        <Card
          sx={{
            borderRadius: 3,
            boxShadow: (theme) => `0 8px 24px ${alpha(theme.palette.primary.main, 0.12)}`,
            transition: 'transform 0.2s',
            '&:hover': {
              transform: 'translateY(-2px)',
            },
          }}
        >
          <Box sx={{ p: 3 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
              <Stack direction="row" spacing={2} alignItems="center">
                <AssessmentIcon color="primary" />
                <Typography variant="h5" fontWeight="bold">
                  Danh sách khóa học
                </Typography>
              </Stack>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setOpenAddDialog(true)}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  background: (theme) =>
                    `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                  transition: 'all 0.2s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: (theme) => `0 8px 16px ${alpha(theme.palette.primary.main, 0.2)}`,
                  },
                }}
              >
                Thêm khóa học
              </Button>
            </Stack>

            <TableContainer 
              component={Paper}
              sx={{
                borderRadius: 2,
                boxShadow: (theme) => `0 4px 12px ${alpha(theme.palette.primary.main, 0.08)}`,
                overflow: 'hidden',
              }}
            >
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04) }}>
                    <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Tên khóa học</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Mô tả</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Giá</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Hành động</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {courses.map((course) => (
                    <TableRow 
                      key={course.id}
                      sx={{
                        '&:hover': {
                          bgcolor: (theme) => alpha(theme.palette.primary.main, 0.02),
                        },
                        transition: 'all 0.2s',
                      }}
                    >
                      <TableCell>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <SchoolIcon color="primary" />
                          <Typography>{course.name}</Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Typography
                          sx={{
                            maxWidth: 300,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {course.description}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={<MoneyIcon />}
                          label={`${course.price} coin`}
                          color="primary"
                          variant="outlined"
                          sx={{
                            '&:hover': {
                              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                            },
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1}>
                          <Tooltip title="Chỉnh sửa">
                            <IconButton 
                              onClick={() => handleEditCourseOpen(course)}
                              color="primary"
                              sx={{
                                '&:hover': {
                                  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                                  transform: 'scale(1.1)',
                                },
                                transition: 'all 0.2s',
                              }}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Xóa">
                            <IconButton 
                              onClick={() => handleDeleteCourse(course.id)}
                              color="error"
                              sx={{
                                '&:hover': {
                                  bgcolor: (theme) => alpha(theme.palette.error.main, 0.1),
                                  transform: 'scale(1.1)',
                                },
                                transition: 'all 0.2s',
                              }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Card>

        {/* Add Course Dialog */}
        <Dialog
          open={openAddDialog}
          onClose={() => setOpenAddDialog(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              boxShadow: (theme) => `0 8px 32px ${alpha(theme.palette.primary.main, 0.18)}`,
            },
          }}
        >
          <DialogTitle>
            <Stack direction="row" spacing={2} alignItems="center">
              <AddIcon color="primary" />
              <Typography variant="h6" fontWeight="bold">
                Thêm khóa học mới
              </Typography>
            </Stack>
          </DialogTitle>
          <DialogContent>
            <Box
              component="form"
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 3,
                mt: 2,
              }}
              onSubmit={handleSubmit}
            >
              <TextField
                label="Tên khóa học"
                value={name}
                onChange={(e) => setName(e.target.value)}
                fullWidth
                required
                InputProps={{
                  startAdornment: <SchoolIcon sx={{ mr: 1, color: 'primary.main' }} />,
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />

              <TextField
                label="Mô tả"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                fullWidth
                required
                multiline
                rows={4}
                InputProps={{
                  startAdornment: <DescriptionIcon sx={{ mr: 1, color: 'primary.main' }} />,
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />

              <TextField
                label="Giá (coin)"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                fullWidth
                required
                type="number"
                InputProps={{
                  startAdornment: <MoneyIcon sx={{ mr: 1, color: 'primary.main' }} />,
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />

              <TextField
                label="Tags (phân cách bằng dấu phẩy)"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                fullWidth
                InputProps={{
                  startAdornment: <TagIcon sx={{ mr: 1, color: 'primary.main' }} />,
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />

              <FormControl fullWidth required>
                <InputLabel id="teacher-select-label">
                  Chọn giảng viên
                </InputLabel>
                <Select
                  labelId="teacher-select-label"
                  value={teacherId}
                  onChange={(e) => setTeacherId(e.target.value)}
                  label="Chọn giảng viên"
                  startAdornment={<PersonIcon sx={{ mr: 1, color: 'primary.main' }} />}
                  sx={{
                    borderRadius: 2,
                  }}
                >
                  {teachers.map((teacher) => (
                    <MenuItem key={teacher.profileId} value={teacher.profileId}>
                      {teacher.firstName} {teacher.lastName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Button
                variant="outlined"
                component="label"
                fullWidth
                startIcon={<ImageIcon />}
                sx={{
                  borderRadius: 2,
                  p: 1.5,
                  textTransform: 'none',
                }}
              >
                Tải lên ảnh bìa
                <input type="file" hidden onChange={handleFileChange} accept="image/*" />
              </Button>

              {previewImage && (
                <Box
                  component="img"
                  src={previewImage}
                  alt="Preview"
                  sx={{
                    width: '100%',
                    height: 'auto',
                    borderRadius: 2,
                    boxShadow: (theme) => `0 4px 12px ${alpha(theme.palette.primary.main, 0.08)}`,
                  }}
                />
              )}
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button
              onClick={() => setOpenAddDialog(false)}
              variant="outlined"
              color="error"
              sx={{
                borderRadius: 2,
                textTransform: 'none',
              }}
            >
              Hủy
            </Button>
            <Button
              onClick={handleSubmit}
              variant="contained"
              startIcon={<AddIcon />}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                background: (theme) =>
                  `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              }}
            >
              Tạo khóa học
            </Button>
          </DialogActions>
        </Dialog>

        {/* Edit Course Dialog */}
        <Dialog 
          open={openEditDialog} 
          onClose={() => setOpenEditDialog(false)}
          PaperProps={{
            sx: {
              borderRadius: 3,
              boxShadow: (theme) => `0 8px 32px ${alpha(theme.palette.primary.main, 0.18)}`,
            },
          }}
        >
          <DialogTitle>
            <Stack direction="row" spacing={2} alignItems="center">
              <EditIcon color="primary" />
              <Typography variant="h6" fontWeight="bold">
                Chỉnh sửa khóa học
              </Typography>
            </Stack>
          </DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField
                label="Tên khóa học"
                fullWidth
                value={editCourse.name}
                onChange={(e) => setEditCourse({ ...editCourse, name: e.target.value })}
                InputProps={{
                  startAdornment: <SchoolIcon sx={{ mr: 1, color: 'primary.main' }} />,
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />
              <TextField
                label="Mô tả"
                fullWidth
                multiline
                rows={4}
                value={editCourse.description}
                onChange={(e) => setEditCourse({ ...editCourse, description: e.target.value })}
                InputProps={{
                  startAdornment: <DescriptionIcon sx={{ mr: 1, color: 'primary.main' }} />,
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />
              <TextField
                label="Giá (coin)"
                fullWidth
                type="number"
                value={editCourse.price}
                onChange={(e) => setEditCourse({ ...editCourse, price: e.target.value })}
                InputProps={{
                  startAdornment: <MoneyIcon sx={{ mr: 1, color: 'primary.main' }} />,
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button
              onClick={() => setOpenEditDialog(false)}
              variant="outlined"
              color="error"
              sx={{
                borderRadius: 2,
                textTransform: 'none',
              }}
            >
              Hủy
            </Button>
            <Button
              onClick={handleUpdateCourse}
              variant="contained"
              startIcon={<EditIcon />}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                background: (theme) =>
                  `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              }}
            >
              Lưu thay đổi
            </Button>
          </DialogActions>
        </Dialog>

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
            sx={{
              borderRadius: 2,
              boxShadow: (theme) => `0 4px 12px ${alpha(theme.palette.primary.main, 0.08)}`,
            }}
          >
            {snackBarMessage}
          </Alert>
        </Snackbar>
      </Box>
    </Scene>
  );
}
