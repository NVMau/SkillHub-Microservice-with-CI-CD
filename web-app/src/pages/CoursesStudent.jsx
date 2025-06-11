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
} from "@mui/material";
import Scene from "./Scene";
import { getRegisteredCourses } from "../services/userService";
import { useNavigate } from "react-router-dom";
import keycloak from "../keycloak";
import Loading from '../components/Loading';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import InfoIcon from '@mui/icons-material/Info';
import { formatCurrency } from '../utils/formatters';

export default function CoursesStudent() {
  const [courses, setCourses] = useState([]);
  const [snackSeverity, setSnackSeverity] = useState("info");
  const [snackBarOpen, setSnackBarOpen] = useState(false);
  const [snackBarMessage, setSnackBarMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const userRoles = keycloak.tokenParsed?.realm_access?.roles || [];

  const handleCloseSnackBar = (event, reason) => {
    if (reason === "clickaway") return;
    setSnackBarOpen(false);
  };

  const fetchCourses = async () => {
    try {
      const response = await getRegisteredCourses();
      setCourses(response.data);
      setIsLoading(false);
    } catch (error) {
      const errorResponse = error.response?.data;
      setSnackSeverity("error");
      setSnackBarMessage(errorResponse?.message ?? error.message);
      setSnackBarOpen(true);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <Scene>
      <Box
        sx={{
          width: "100%",
          p: 3,
          display: "flex",
          flexDirection: "column",
          gap: 4,
        }}
      >
        {/* Header Section */}
        <Box sx={{ textAlign: "center", mb: 2 }}>
          <Typography
            variant="h3"
            component="h1"
            fontWeight="bold"
            sx={{
              mb: 2,
              background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
              backgroundClip: 'text',
              textFillColor: 'transparent',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Khóa học của bạn
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Tiếp tục học tập và phát triển bản thân
          </Typography>
        </Box>

        {/* Courses Grid */}
        <Grid container spacing={3}>
          {courses.map((course) => (
            <Grid item xs={12} sm={6} md={4} key={course.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 4,
                  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 20px rgba(0,0,0,0.1)',
                  },
                }}
              >
                <CardMedia
                  component="img"
                  height="200"
                  image={course.imageUrl || 'https://source.unsplash.com/random?education'}
                  alt={course.name}
                  sx={{ objectFit: 'cover' }}
                />
                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                  <Typography gutterBottom variant="h5" component="h2" fontWeight="600">
                    {course.name}
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Chip
                      icon={<MonetizationOnIcon />}
                      label={`${formatCurrency(course.price)}đ`}
                      color="primary"
                      variant="outlined"
                      sx={{ mr: 1 }}
                    />
                  </Box>
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
                  <Button
                    variant="contained"
                    startIcon={<PlayCircleOutlineIcon />}
                    onClick={() => navigate(`/lectures-student/${course.id}`)}
                    sx={{
                      borderRadius: 2,
                      background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                      boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
                    }}
                  >
                    Học ngay
                  </Button>
                  <Tooltip title="Xem chi tiết">
                    <IconButton color="primary">
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
              p: 4,
              textAlign: 'center',
              borderRadius: 4,
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
            }}
          >
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Bạn chưa đăng ký khóa học nào
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate('/')}
              sx={{
                mt: 2,
                borderRadius: 2,
                background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
              }}
            >
              Khám phá khóa học
            </Button>
          </Paper>
        )}
      </Box>
    </Scene>
  );
}
