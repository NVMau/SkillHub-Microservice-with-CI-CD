import { useEffect, useState } from "react";
import {
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Button,
  Box,
  Typography,
  Grid,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  Stack,
  Avatar,
  Divider,
  alpha,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import Scene from "./Scene";
import { getTeachingCourses } from "../services/userService";
import { useNavigate } from "react-router-dom";
import useUserRoles from "../services/useUserRoles";
import {
  MonetizationOn as MoneyIcon,
  MenuBook as MenuBookIcon,
  Info as InfoIcon,
  Add as AddIcon,
  School as SchoolIcon,
  People as PeopleIcon,
  Timer as TimerIcon,
  Star as StarIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { formatCurrency } from '../utils/formatters';
import { updateCourse } from "../services/courseService";

export default function CoursesTeacher() {
  const [courses, setCourses] = useState([]);
  const [snackSeverity, setSnackSeverity] = useState("info");
  const [snackBarOpen, setSnackBarOpen] = useState(false);
  const [snackBarMessage, setSnackBarMessage] = useState("");
  const navigate = useNavigate();
  const userRoles = useUserRoles();
  
  // Edit course states
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    description: "",
    price: 0,
    category: "",
    imageUrl: "",
    tags: []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCloseSnackBar = (event, reason) => {
    if (reason === "clickaway") return;
    setSnackBarOpen(false);
  };

  const fetchCourses = async () => {
    try {
      const response = await getTeachingCourses();
      setCourses(response.data);
    } catch (error) {
      const errorResponse = error.response?.data;
      setSnackSeverity("error");
      setSnackBarMessage(errorResponse?.message ?? error.message);
      setSnackBarOpen(true);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  // Handle opening the edit dialog
  const handleOpenEditDialog = (course) => {
    setEditingCourse(course);
    setEditFormData({
      id: course.id,
      name: course.name || "",
      description: course.description || "",
      price: course.price || 0,
      category: course.category || "",
      imageUrl: course.imageUrl || "",
      tags: course.tags || [],
      teacherId: course.teacherId
    });
    setEditDialogOpen(true);
  };

  // Handle closing the edit dialog
  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setEditingCourse(null);
  };

  // Handle form input changes
  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle tags input (comma-separated values)
  const handleTagsChange = (e) => {
    const tagsString = e.target.value;
    const tagsArray = tagsString.split(',').map(tag => tag.trim()).filter(tag => tag);
    setEditFormData(prev => ({
      ...prev,
      tags: tagsArray
    }));
  };

  // Handle form submission
  const handleSubmitEdit = async () => {
    try {
      setIsSubmitting(true);
      await updateCourse(editFormData);
      
      // Update the courses list with the edited course
      setCourses(prevCourses => 
        prevCourses.map(course => 
          course.id === editFormData.id ? { ...course, ...editFormData } : course
        )
      );
      
      setSnackSeverity("success");
      setSnackBarMessage("Khóa học đã được cập nhật thành công!");
      setSnackBarOpen(true);
      handleCloseEditDialog();
    } catch (error) {
      const errorResponse = error.response?.data;
      setSnackSeverity("error");
      setSnackBarMessage(errorResponse?.message || "Không thể cập nhật khóa học. Vui lòng thử lại sau.");
      setSnackBarOpen(true);
    } finally {
      setIsSubmitting(false);
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
              <Box>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                  Khóa học giảng dạy
                </Typography>
                <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
                  Quản lý và theo dõi các khóa học của bạn
                </Typography>
              </Box>
            </Stack>

            <Grid container spacing={3}>
              <Grid item xs={12} sm={4}>
                <Stack
                  direction="row"
                  spacing={2}
                  alignItems="center"
                  sx={{
                    bgcolor: alpha("#fff", 0.1),
                    p: 2,
                    borderRadius: 2,
                  }}
                >
                  <MenuBookIcon sx={{ fontSize: 30 }} />
                  <Box>
                    <Typography variant="h5" fontWeight="bold">
                      {courses.length}
                    </Typography>
                    <Typography variant="body2">Khóa học</Typography>
                  </Box>
                </Stack>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Stack
                  direction="row"
                  spacing={2}
                  alignItems="center"
                  sx={{
                    bgcolor: alpha("#fff", 0.1),
                    p: 2,
                    borderRadius: 2,
                  }}
                >
                  <PeopleIcon sx={{ fontSize: 30 }} />
                  <Box>
                    <Typography variant="h5" fontWeight="bold">
                      {courses.reduce((sum, course) => sum + (course.enrollmentCount || 0), 0)}
                    </Typography>
                    <Typography variant="body2">Học viên</Typography>
                  </Box>
                </Stack>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Stack
                  direction="row"
                  spacing={2}
                  alignItems="center"
                  sx={{
                    bgcolor: alpha("#fff", 0.1),
                    p: 2,
                    borderRadius: 2,
                  }}
                >
                  <MoneyIcon sx={{ fontSize: 30 }} />
                  <Box>
                    <Typography variant="h5" fontWeight="bold">
                      {formatCurrency(courses.reduce((sum, course) => sum + (course.price || 0), 0))}
                    </Typography>
                    <Typography variant="body2">Tổng coin</Typography>
                  </Box>
                </Stack>
              </Grid>
            </Grid>
          </Box>
        </Card>

        {/* Courses Grid */}
        <Grid container spacing={3}>
          {/* Add New Course Card */}
          <Grid item xs={12} sm={6} md={4}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 4,
                border: '2px dashed',
                borderColor: 'primary.main',
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.05),
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                },
                p: 4,
              }}
              onClick={() => navigate('/createCourses')}
            >
              <AddIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" color="primary" fontWeight="bold">
                Tạo khóa học mới
              </Typography>
            </Card>
          </Grid>

          {/* Course Cards */}
          {courses.map((course) => (
            <Grid item xs={12} sm={6} md={4} key={course.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 4,
                  overflow: 'hidden',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: (theme) => `0 12px 24px ${alpha(theme.palette.primary.main, 0.2)}`,
                  },
                }}
              >
                <Box sx={{ position: 'relative' }}>
                  <CardMedia
                    component="img"
                    height="200"
                    image={course.imageUrl || 'https://source.unsplash.com/random?education'}
                    alt={course.name}
                    sx={{ objectFit: 'cover' }}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
                      p: 2,
                    }}
                  >
                    <Chip
                      icon={<MoneyIcon sx={{ color: 'white !important' }} />}
                      label={`${formatCurrency(course.price)} coin`}
                      sx={{
                        bgcolor: 'primary.main',
                        color: 'white',
                        '& .MuiChip-icon': { color: 'white' },
                      }}
                    />
                  </Box>
                </Box>

                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                  <Typography variant="h5" component="h2" fontWeight="bold" gutterBottom>
                    {course.name}
                  </Typography>

                  <Stack direction="row" spacing={2} mb={2}>
                    <Chip
                      size="small"
                      icon={<PeopleIcon />}
                      label={`${course.enrollmentCount || 0} học viên`}
                      variant="outlined"
                    />
                    <Chip
                      size="small"
                      icon={<TimerIcon />}
                      label={`${course.lectureCount || 0} bài giảng`}
                      variant="outlined"
                    />
                  </Stack>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      mb: 2,
                    }}
                  >
                    {course.description}
                  </Typography>
                </CardContent>

                <Divider />

                <CardActions sx={{ p: 2, gap: 1 }}>
                  <Button
                    variant="contained"
                    fullWidth
                    startIcon={<MenuBookIcon />}
                    onClick={() => navigate(`/lectures-teacher/${course.id}`)}
                    sx={{
                      borderRadius: 2,
                      background: (theme) =>
                        `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                      boxShadow: (theme) => `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`,
                    }}
                  >
                    Quản lý bài giảng
                  </Button>
                  <Tooltip title="Chỉnh sửa">
                    <IconButton
                      color="primary"
                      onClick={() => handleOpenEditDialog(course)}
                      sx={{
                        bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                        '&:hover': {
                          bgcolor: (theme) => alpha(theme.palette.primary.main, 0.2),
                        },
                      }}
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Xem chi tiết">
                    <IconButton
                      color="primary"
                      sx={{
                        bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                        '&:hover': {
                          bgcolor: (theme) => alpha(theme.palette.primary.main, 0.2),
                        },
                      }}
                    >
                      <InfoIcon />
                    </IconButton>
                  </Tooltip>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Empty State */}
        {courses.length === 0 && (
          <Paper
            sx={{
              p: 6,
              textAlign: 'center',
              borderRadius: 4,
              bgcolor: 'background.paper',
              boxShadow: (theme) => `0 8px 32px ${alpha(theme.palette.primary.main, 0.1)}`,
            }}
          >
            <SchoolIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2, opacity: 0.5 }} />
            <Typography variant="h5" gutterBottom fontWeight="bold">
              Chưa có khóa học nào
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              Hãy bắt đầu tạo khóa học đầu tiên của bạn
            </Typography>
            <Button
              variant="contained"
              size="large"
              startIcon={<AddIcon />}
              onClick={() => navigate('/create-course')}
              sx={{
                borderRadius: 2,
                background: (theme) =>
                  `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                boxShadow: (theme) => `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`,
                px: 4,
                py: 1.5,
              }}
            >
              Tạo khóa học mới
            </Button>
          </Paper>
        )}
      </Box>

      {/* Edit Course Dialog */}
      <Dialog open={editDialogOpen} onClose={handleCloseEditDialog} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>
          Chỉnh sửa khóa học
        </DialogTitle>
        <DialogContent dividers>
          <Box component="form" noValidate sx={{ mt: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Tên khóa học"
                  name="name"
                  value={editFormData.name}
                  onChange={handleEditInputChange}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="Giá (coin)"
                  name="price"
                  type="number"
                  value={editFormData.price}
                  onChange={handleEditInputChange}
                  margin="normal"
                  InputProps={{ inputProps: { min: 0 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Danh mục</InputLabel>
                  <Select
                    name="category"
                    value={editFormData.category}
                    onChange={handleEditInputChange}
                    label="Danh mục"
                  >
                    <MenuItem value="Lập Trình">Lập Trình</MenuItem>
                    <MenuItem value="Thiết Kế">Thiết Kế</MenuItem>
                    <MenuItem value="Marketing">Marketing</MenuItem>
                    <MenuItem value="Kinh Doanh">Kinh Doanh</MenuItem>
                    <MenuItem value="Ngoại Ngữ">Ngoại Ngữ</MenuItem>
                    <MenuItem value="Khác">Khác</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="URL Hình ảnh"
                  name="imageUrl"
                  value={editFormData.imageUrl}
                  onChange={handleEditInputChange}
                  margin="normal"
                  helperText="Đường dẫn đến hình ảnh khóa học"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Thẻ (cách nhau bởi dấu phẩy)"
                  name="tags"
                  value={editFormData.tags.join(', ')}
                  onChange={handleTagsChange}
                  margin="normal"
                  helperText="Ví dụ: java, spring, microservices"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Mô tả khóa học"
                  name="description"
                  value={editFormData.description}
                  onChange={handleEditInputChange}
                  margin="normal"
                  multiline
                  rows={4}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={handleCloseEditDialog} variant="outlined" disabled={isSubmitting}>
            Hủy
          </Button>
          <Button
            onClick={handleSubmitEdit}
            variant="contained"
            disabled={isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
          >
            {isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
          </Button>
        </DialogActions>
      </Dialog>
    </Scene>
  );
}
