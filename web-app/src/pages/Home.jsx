import {
  Alert,
  Box,
  Card,
  Snackbar,
  Typography,
  TextField,
  Button,
  Grid,
  CardMedia,
  CardContent,
  CardActions,
  Paper,
  InputAdornment,
  IconButton,
  Chip,
  Tooltip,
  Fade,
  Avatar,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import Scene from "./Scene";
import { useEffect, useState } from "react";
import { getAllCourses, searchCourses, getFeaturedInstructors, getCoursesByCategory, getCourseAverageRating } from "../services/courseService";
import { registerCourse } from "../services/registerService";
import { useProfile } from "../context/ProfileContext";
import useUserRoles from "../services/useUserRoles";
import SearchIcon from '@mui/icons-material/Search';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import PersonIcon from '@mui/icons-material/Person';
import BookmarkAddIcon from '@mui/icons-material/BookmarkAdd';
import InfoIcon from '@mui/icons-material/Info';
import { formatCurrency } from '../utils/formatters';
// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';
// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import 'swiper/css/effect-fade';
// Import required modules
import { Autoplay, Pagination, Navigation, EffectFade } from 'swiper/modules';
import StarIcon from '@mui/icons-material/Star';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CategoryIcon from '@mui/icons-material/Category';
import GroupIcon from '@mui/icons-material/Group';
import SchoolIcon from '@mui/icons-material/School';
import { alpha } from '@mui/material/styles';
import axios from 'axios';

const promotionSlides = [
  {
    image: 'https://img-for-web-default.s3.us-east-1.amazonaws.com/anh11.png',
    title: 'Học trực tuyến mọi lúc mọi nơi',
    description: 'Truy cập kho khóa học đa dạng từ các chuyên gia hàng đầu'
  },
  {
    image: '/jmg-homepage/kakaka.jpg',
    title: 'Giảng viên chất lượng cao',
    description: 'Đội ngũ giảng viên giàu kinh nghiệm, tận tâm hướng dẫn'
  },
  {
    image: '/jmg-homepage/tailieupp.jpg',
    title: 'Tài liệu học tập phong phú',
    description: 'Tài liệu được cập nhật liên tục, phù hợp với xu hướng'
  },
  {
    image: '/jmg-homepage/chungchi.jpg',
    title: 'Chứng chỉ được công nhận',
    description: 'Nhận chứng chỉ sau khi hoàn thành khóa học'
  }
];

const categories = [
  { id: 1, name: 'Lập Trình', icon: '💻', color: '#2196F3' },
  { id: 2, name: 'Ngoại Ngữ', icon: '🌎', color: '#4CAF50' },
  { id: 3, name: 'Marketing', icon: '📈', color: '#FF9800' },
  { id: 4, name: 'Thiết Kế', icon: '🎨', color: '#E91E63' },
  { id: 5, name: 'Kinh Doanh', icon: '💼', color: '#9C27B0' },
  { id: 6, name: 'Phát Triển Cá Nhân', icon: '🎯', color: '#795548' },
];

const featuredInstructors = [
  {
    id: 1,
    name: 'Nguyễn Văn A',
    specialty: 'Chuyên gia Lập trình',
    avatar: 'https://i.pravatar.cc/150?img=1',
    rating: 4.9,
    students: 1234
  },
  {
    id: 2,
    name: 'Trần Thị B',
    specialty: 'Giảng viên Marketing',
    avatar: 'https://i.pravatar.cc/150?img=2',
    rating: 4.8,
    students: 956
  },
  {
    id: 3,
    name: 'Lê Văn C',
    specialty: 'Chuyên gia Thiết kế',
    avatar: 'https://i.pravatar.cc/150?img=3',
    rating: 4.7,
    students: 789
  },
  {
    id: 4,
    name: 'Phạm Thị D',
    specialty: 'Giảng viên Ngoại ngữ',
    avatar: 'https://i.pravatar.cc/150?img=4',
    rating: 4.9,
    students: 1567
  },
];

export default function Home() {
  const [courses, setCourses] = useState([]);
  const [courseRatings, setCourseRatings] = useState({});
  const [searchKeyword, setSearchKeyword] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [teacherName, setTeacherName] = useState("");
  const [snackSeverity, setSnackSeverity] = useState("info");
  const [snackBarOpen, setSnackBarOpen] = useState(false);
  const [snackBarMessage, setSnackBarMessage] = useState("");
  const [featuredInstructors, setFeaturedInstructors] = useState([]);
  const [isLoadingInstructors, setIsLoadingInstructors] = useState(true);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const { profile, fetchProfile } = useProfile();
  const userRoles = useUserRoles();

  const handleCloseSnackBar = (event, reason) => {
    if (reason === "clickaway") return;
    setSnackBarOpen(false);
  };

  const fetchCourseRatings = async (courseId) => {
    try {
      const response = await getCourseAverageRating(courseId);
      setCourseRatings(prev => ({
        ...prev,
        [courseId]: response.data
      }));
    } catch (error) {
      console.error(`Error fetching rating for course ${courseId}:`, error);
    }
  };

  const getCourses = async () => {
    try {
      const response = await getAllCourses();
      setCourses(response.data);
      // Fetch ratings for each course
      response.data.forEach(course => {
        fetchCourseRatings(course.id);
      });
    } catch (error) {
      const errorResponse = error.response?.data;
      setSnackSeverity("error");
      setSnackBarMessage(errorResponse?.message ?? error.message);
      setSnackBarOpen(true);
    }
  };

  const handleRegisterCourse = async (courseId) => {
    try {
      const studentId = profile.profileId;
      await registerCourse({ studentId, courseId });
      setSnackSeverity("success");
      setSnackBarMessage("Đăng ký khóa học thành công!");
      setSnackBarOpen(true);
      await fetchProfile();
      setConfirmDialogOpen(false);
      setSelectedCourse(null);
    } catch (error) {
      setSnackSeverity("error");
      setSnackBarMessage("Bạn đã đăng ký khóa học này rồi!");
      setSnackBarOpen(true);
      setConfirmDialogOpen(false);
      setSelectedCourse(null);
    }
  };

  const handleSearch = async () => {
    try {
      const response = await searchCourses(
        searchKeyword,
        teacherName,
        minPrice,
        maxPrice
      );
      setCourses(response.data);
    } catch (error) {
      const errorResponse = error.response?.data;
      setSnackSeverity("error");
      setSnackBarMessage(errorResponse?.message ?? error.message);
      setSnackBarOpen(true);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    handleSearch();
  };

  const handleCategoryClick = async (category) => {
    try {
      setSnackSeverity("info");
      setSnackBarMessage(`Đang tìm kiếm khóa học danh mục ${category}...`);
      setSnackBarOpen(true);
      
      const response = await getCoursesByCategory(category);
      setCourses(response.data);
      
      setSnackSeverity("success");
      setSnackBarMessage(`Đã tìm thấy ${response.data.length} khóa học trong danh mục ${category}`);
      setSnackBarOpen(true);
    } catch (error) {
      const errorResponse = error.response?.data;
      setSnackSeverity("error");
      setSnackBarMessage(errorResponse?.message ?? "Không thể tìm kiếm khóa học theo danh mục này");
      setSnackBarOpen(true);
    }
  };

  const fetchFeaturedInstructors = async () => {
    try {
      setIsLoadingInstructors(true);
      const response = await getFeaturedInstructors();
      setFeaturedInstructors(response.data);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách giảng viên tiêu biểu:', error);
      setSnackSeverity("error");
      setSnackBarMessage("Không thể tải danh sách giảng viên tiêu biểu");
      setSnackBarOpen(true);
    } finally {
      setIsLoadingInstructors(false);
    }
  };

  const handleOpenConfirmDialog = (course) => {
    setSelectedCourse(course);
    setConfirmDialogOpen(true);
  };

  const handleCloseConfirmDialog = () => {
    setConfirmDialogOpen(false);
    setSelectedCourse(null);
  };

  useEffect(() => {
    getCourses();
    fetchFeaturedInstructors();
  }, []);

  const renderCourseCard = (course, isTrending = false) => (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 4,
        position: 'relative',
        overflow: 'visible',
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 12px 20px rgba(0,0,0,0.1)',
        },
      }}
    >
      {isTrending && (
        <Chip
          label="Hot"
          color="error"
          sx={{
            position: 'absolute',
            top: -10,
            right: 10,
            borderRadius: '16px',
            fontWeight: 'bold',
          }}
        />
      )}
      <CardMedia
        component="img"
        height="200"
        image={course.imageUrl || 'https://source.unsplash.com/random?education'}
        alt={course.name}
        sx={{ 
          objectFit: 'cover',
          borderRadius: '16px 16px 0 0',
        }}
      />
      <CardContent sx={{ flexGrow: 1, p: 3 }}>
        <Typography gutterBottom variant="h5" component="h2" fontWeight="600">
          {course.name}
        </Typography>
        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
          <Chip
            icon={<MonetizationOnIcon />}
            label={`${formatCurrency(course.price)}đ`}
            color="primary"
            variant="outlined"
          />
          <Chip
            icon={<StarIcon sx={{ color: '#FFD700 !important' }} />}
            label={courseRatings[course.id]?.toFixed(1) || '0.0'}
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
      <CardActions sx={{ p: 2, pt: 0 }}>
        {userRoles.includes("ROLE_STUDENT") && (
        <Button
          variant="contained"
          fullWidth={isTrending}
          startIcon={<BookmarkAddIcon />}
            onClick={() => handleOpenConfirmDialog(course)}
          sx={{
            borderRadius: 2,
            background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
            boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
            py: 1,
          }}
        >
          {isTrending ? 'Đăng ký ngay' : 'Đăng ký'}
        </Button>
        )}
        {!isTrending && (
          <Tooltip title="Xem chi tiết">
            <IconButton color="primary">
              <InfoIcon />
            </IconButton>
          </Tooltip>
        )}
      </CardActions>
    </Card>
  );

  const renderTrendingCourses = () => (
    <Box sx={{ mb: 6 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <TrendingUpIcon sx={{ mr: 1, color: 'primary.main' }} />
        <Typography variant="h5" fontWeight="600">
          Khóa học nổi bật
        </Typography>
      </Box>
      <Grid container spacing={3}>
        {courses.slice(0, 3).map((course) => (
          <Grid item xs={12} md={4} key={course.id}>
            {renderCourseCard(course, true)}
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  const renderAllCourses = () => (
    <Box sx={{ mb: 6 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <SchoolIcon sx={{ mr: 1, color: 'primary.main' }} />
        <Typography variant="h5" fontWeight="600">
          Tất cả khóa học
        </Typography>
      </Box>
      <Grid container spacing={3}>
        {courses.map((course) => (
          <Grid item xs={12} sm={6} md={4} key={course.id}>
            {renderCourseCard(course)}
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  return (
    <>
      <Snackbar
        open={snackBarOpen}
        onClose={handleCloseSnackBar}
        autoHideDuration={6000}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        TransitionComponent={Fade}
      >
        <Alert
          onClose={handleCloseSnackBar}
          severity={snackSeverity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackBarMessage}
        </Alert>
      </Snackbar>
      
      <Dialog
        open={confirmDialogOpen}
        onClose={handleCloseConfirmDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        PaperProps={{
          sx: {
            borderRadius: 4,
            p: 2,
            boxShadow: 12,
            minWidth: 380,
            maxWidth: 420,
          }
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', pt: 3 }}>
          <SchoolIcon color="primary" sx={{ fontSize: 48, mb: 1 }} />
        </Box>
        <DialogTitle id="alert-dialog-title" sx={{ textAlign: 'center', fontWeight: 700, fontSize: 22, pb: 0 }}>
          Xác nhận đăng ký khóa học
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description" sx={{ textAlign: 'center', fontSize: 17, mb: 2 }}>
            Bạn có chắc chắn muốn đăng ký khóa học <span style={{fontWeight:600, color:'#1976d2'}}>
              "{selectedCourse?.name}"
            </span><br/>
            với giá <span style={{fontWeight:700, color:'#388e3c'}}>
              {selectedCourse?.price ? formatCurrency(selectedCourse.price) + 'đ' : '0đ'}
            </span>?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
          <Button onClick={handleCloseConfirmDialog} color="inherit" variant="outlined" sx={{ borderRadius: 2, px: 3 }}>
            HỦY
          </Button>
          <Button 
            onClick={() => handleRegisterCourse(selectedCourse?.id)} 
            color="primary" 
            variant="contained"
            sx={{ borderRadius: 2, px: 3, fontWeight: 700, boxShadow: 2, background: 'linear-gradient(90deg, #1976d2 60%, #21cbf3 100%)' }}
            autoFocus
          >
            XÁC NHẬN
          </Button>
        </DialogActions>
      </Dialog>
      
      <Scene>
        <Box
          sx={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            gap: 4,
            p: 3,
          }}
        >
          {/* Promotion Carousel */}
          <Box sx={{ mb: 4 }}>
            <Swiper
              spaceBetween={30}
              centeredSlides={true}
              effect={'fade'}
              autoplay={{
                delay: 3000,
                disableOnInteraction: false,
              }}
              pagination={{
                clickable: true,
              }}
              navigation={true}
              modules={[Autoplay, Pagination, Navigation, EffectFade]}
              className="promotionSwiper"
              style={{
                '--swiper-navigation-color': '#fff',
                '--swiper-pagination-color': '#fff',
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              }}
            >
              {promotionSlides.map((slide, index) => (
                <SwiperSlide key={index}>
                  <Box
                    sx={{
                      position: 'relative',
                      height: '400px',
                      width: '100%',
                      backgroundColor: '#000',
                    }}
                  >
                    <Box
                      component="img"
                      src={slide.image}
                      sx={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        opacity: '0.7',
                      }}
                    />
                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        p: 4,
                        background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
                        color: 'white',
                        textAlign: 'left',
                      }}
                    >
                      <Typography variant="h4" sx={{ mb: 2, fontWeight: 600 }}>
                        {slide.title}
                      </Typography>
                      <Typography variant="h6">
                        {slide.description}
                      </Typography>
                    </Box>
                  </Box>
                </SwiperSlide>
              ))}
            </Swiper>
          </Box>

          {/* Categories Section */}
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <CategoryIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h5" fontWeight="600">
                Danh mục khóa học
              </Typography>
            </Box>
            <Grid container spacing={2}>
              {categories.map((category) => (
                <Grid item xs={6} sm={4} md={2} key={category.id}>
                  <Paper
                    sx={{
                      p: 2,
                      textAlign: 'center',
                      borderRadius: 4,
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                        background: `linear-gradient(45deg, ${category.color}22, ${category.color}11)`,
                      },
                    }}
                    onClick={() => handleCategoryClick(category.name)}
                  >
                    <Typography variant="h4" sx={{ mb: 1 }}>
                      {category.icon}
                    </Typography>
                    <Typography variant="subtitle1" fontWeight="500">
                      {category.name}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* Featured Instructors Section */}
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <GroupIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h5" fontWeight="600">
                Giảng viên tiêu biểu
              </Typography>
            </Box>
            <Grid container spacing={3}>
              {isLoadingInstructors ? (
                // Loading state
                Array(4).fill(0).map((_, index) => (
                  <Grid item xs={12} sm={6} md={3} key={index}>
                    <Paper
                      sx={{
                        p: 3,
                        borderRadius: 4,
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: 200,
                        bgcolor: (theme) => alpha(theme.palette.background.paper, 0.5),
                      }}
                    >
                      <Box sx={{ width: '100%', textAlign: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                          Đang tải...
                        </Typography>
                      </Box>
                    </Paper>
                  </Grid>
                ))
              ) : (
                featuredInstructors.map((instructor) => (
                  <Grid item xs={12} sm={6} md={3} key={instructor.teacherId}>
                    <Paper
                      sx={{
                        p: 3,
                        borderRadius: 4,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: (theme) => `0 8px 32px ${alpha(theme.palette.primary.main, 0.2)}`,
                        },
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        bgcolor: (theme) => alpha(theme.palette.background.paper, 0.8),
                        backdropFilter: 'blur(20px)',
                      }}
                    >
                      <Box sx={{ textAlign: 'center', mb: 2 }}>
                        <Avatar
                          src={instructor.avatar}
                          sx={{ 
                            width: 100, 
                            height: 100, 
                            margin: '0 auto',
                            border: '4px solid',
                            borderColor: (theme) => alpha(theme.palette.primary.main, 0.2),
                            boxShadow: (theme) => `0 4px 12px ${alpha(theme.palette.primary.main, 0.1)}`,
                          }}
                        >
                          {!instructor.avatar && <PersonIcon sx={{ fontSize: 60 }} />}
                        </Avatar>
                      </Box>
                      <Typography 
                        variant="h6" 
                        align="center" 
                        gutterBottom
                        sx={{ 
                          fontWeight: 600,
                          background: (theme) => `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.primary.light} 90%)`,
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                        }}
                      >
                        {instructor.teacherName}
                      </Typography>
                      <Stack 
                        direction="row" 
                        spacing={2} 
                        justifyContent="center"
                        alignItems="center"
                        sx={{ mt: 2 }}
                      >
                        {/* <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <StarIcon sx={{ color: '#FFD700', mr: 0.5 }} />
                          <Typography variant="body2">
                            {instructor.averageRating.toFixed(1)}
                          </Typography>
                        </Box> */}
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <SchoolIcon sx={{ color: 'primary.main', mr: 0.5 }} />
                          <Typography variant="body2">
                            {instructor.totalCourses} khóa học
                          </Typography>
                        </Box>
                      </Stack>
                    </Paper>
                  </Grid>
                ))
              )}
            </Grid>
          </Box>

          {/* Search Section */}
          <Paper
            component="form"
            onSubmit={handleSearchSubmit}
            elevation={3}
            sx={{
              p: 3,
              mb: 4,
              borderRadius: 4,
              backgroundColor: (theme) => alpha(theme.palette.background.paper, theme.palette.mode === 'dark' ? 0.6 : 0.9),
              backdropFilter: 'blur(20px)',
              '& .MuiInputBase-root': {
                bgcolor: (theme) => alpha(theme.palette.background.paper, theme.palette.mode === 'dark' ? 0.3 : 0.8),
              },
              '& .MuiInputBase-input': {
                color: (theme) => theme.palette.text.primary,
              },
              '& .MuiInputLabel-root': {
                color: (theme) => theme.palette.text.secondary,
              },
              '& .MuiSvgIcon-root': {
                color: (theme) => theme.palette.text.secondary,
              }
            }}
          >
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Tìm kiếm khóa học"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <TextField
                  fullWidth
                  label="Giá từ"
                  type="number"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <MonetizationOnIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <TextField
                  fullWidth
                  label="Giá đến"
                  type="number"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <MonetizationOnIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Tên giáo viên"
                  value={teacherName}
                  onChange={(e) => setTeacherName(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} md={1}>
                <Button
                  variant="contained"
                  type="submit"
                  fullWidth
                  sx={{
                    height: '56px',
                    borderRadius: 2,
                    background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                    boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
                  }}
                >
                  Tìm
                </Button>
              </Grid>
            </Grid>
          </Paper>

          {/* Trending Courses */}
          {renderTrendingCourses()}

          {/* All Courses Grid */}
          {renderAllCourses()}
        </Box>
      </Scene>
    </>
  );
}
