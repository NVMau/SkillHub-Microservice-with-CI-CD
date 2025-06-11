import React, { useEffect, useState } from "react";
import {
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Stack,
  alpha,
  Avatar,
  Paper,
} from "@mui/material";
import {
  People as PeopleIcon,
  School as SchoolIcon,
  Assessment as AssessmentIcon,
  TrendingUp as TrendingUpIcon,
} from "@mui/icons-material";
import { Pie, Bar } from "react-chartjs-2";
import { getAllUsersCount } from "../services/userService";
import { getAllCourses, getEnrollmentCountByCourseId } from "../services/courseService";
import Scene from "./Scene";

// Cấu hình Chart.js
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

export default function StatistSys() {
  const [userStats, setUserStats] = useState({});
  const [courseStats, setCourseStats] = useState([]);

  // Gọi API lấy số lượng người dùng và khóa học
  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        const response = await getAllUsersCount();  // Gọi API đếm người dùng
        setUserStats(response.data);
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu người dùng:", error);
      }
    };

    const fetchCourseStats = async () => {
      try {
        const courseResponse = await getAllCourses(); // Lấy danh sách khóa học
        const courses = courseResponse.data;
        console.log("Courses:", courses);


        // Lấy số lượng đăng ký cho từng khóa học
        const enrollmentPromises = courses.map(async (course) => {
          const countResponse = await getEnrollmentCountByCourseId(course.id);
          console.log(`Enrollment for course ${course.name}:`, countResponse.data);
          return { courseName: course.name, count: countResponse.data };
        });

        const enrollmentData = await Promise.all(enrollmentPromises);
        setCourseStats(enrollmentData);
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu khóa học:", error);
      }
    };

    fetchUserStats();
    fetchCourseStats();
  }, []);

  // Cập nhật dữ liệu biểu đồ với màu sắc và hiệu ứng đẹp hơn
  const userPieData = {
    labels: ["Học viên", "Quản trị viên", "Giảng viên"],
    datasets: [
      {
        data: [
          userStats["ROLE_STUDENT"] || 0,
          userStats["ROLE_ADMIN"] || 0,
          userStats["ROLE_TEACHER"] || 0,
        ],
        backgroundColor: [
          alpha('#FF6384', 0.8),
          alpha('#36A2EB', 0.8),
          alpha('#FFCE56', 0.8),
        ],
        hoverBackgroundColor: [
          alpha('#FF6384', 1),
          alpha('#36A2EB', 1),
          alpha('#FFCE56', 1),
        ],
        borderWidth: 2,
        borderColor: '#fff',
        hoverBorderColor: '#fff',
        hoverOffset: 4,
      },
    ],
  };

  const courseBarData = {
    labels: courseStats.map((course) => course.courseName),
    datasets: [
      {
        label: "Số lượng đăng ký",
        data: courseStats.map((course) => course.count),
        backgroundColor: alpha('#4CAF50', 0.6),
        borderColor: alpha('#4CAF50', 1),
        borderWidth: 1,
        borderRadius: 5,
        hoverBackgroundColor: alpha('#4CAF50', 0.8),
      },
    ],
  };

  // Cấu hình options cho biểu đồ
  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          font: {
            size: 12,
          },
        },
      },
    },
    cutout: '70%',
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: alpha('#000', 0.1),
        },
        ticks: {
          stepSize: 1,
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
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
              <AssessmentIcon sx={{ fontSize: 40 }} />
              <Typography variant="h4" fontWeight="bold">
                Thống kê hệ thống
              </Typography>
            </Stack>
            <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
              Theo dõi và phân tích dữ liệu hệ thống
            </Typography>
          </Box>
        </Card>

        {/* Stats Cards */}
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} md={3}>
            <Card
              sx={{
                borderRadius: 2,
                p: 2,
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                },
                boxShadow: (theme) => `0 4px 12px ${alpha(theme.palette.primary.main, 0.08)}`,
              }}
            >
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar sx={{ bgcolor: alpha('#FF6384', 0.1) }}>
                  <PeopleIcon sx={{ color: '#FF6384' }} />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {userStats["ROLE_STUDENT"] || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Học viên
                  </Typography>
                </Box>
              </Stack>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card
              sx={{
                borderRadius: 2,
                p: 2,
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                },
                boxShadow: (theme) => `0 4px 12px ${alpha(theme.palette.primary.main, 0.08)}`,
              }}
            >
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar sx={{ bgcolor: alpha('#36A2EB', 0.1) }}>
                  <SchoolIcon sx={{ color: '#36A2EB' }} />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {userStats["ROLE_TEACHER"] || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Giảng viên
                  </Typography>
                </Box>
              </Stack>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card
              sx={{
                borderRadius: 2,
                p: 2,
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                },
                boxShadow: (theme) => `0 4px 12px ${alpha(theme.palette.primary.main, 0.08)}`,
              }}
            >
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar sx={{ bgcolor: alpha('#FFCE56', 0.1) }}>
                  <AssessmentIcon sx={{ color: '#FFCE56' }} />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {userStats["ROLE_ADMIN"] || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Quản trị viên
                  </Typography>
                </Box>
              </Stack>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card
              sx={{
                borderRadius: 2,
                p: 2,
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                },
                boxShadow: (theme) => `0 4px 12px ${alpha(theme.palette.primary.main, 0.08)}`,
              }}
            >
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar sx={{ bgcolor: alpha('#4CAF50', 0.1) }}>
                  <TrendingUpIcon sx={{ color: '#4CAF50' }} />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {courseStats.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Tổng số khóa học
                  </Typography>
                </Box>
              </Stack>
            </Card>
          </Grid>
        </Grid>

        {/* Charts Grid */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
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
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" spacing={2} alignItems="center" mb={3}>
                  <PeopleIcon color="primary" />
                  <Typography variant="h6" fontWeight="bold">
                    Thống kê số lượng người dùng
                  </Typography>
                </Stack>
                <Box sx={{ height: 300, position: 'relative' }}>
                  <Pie data={userPieData} options={pieOptions} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
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
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" spacing={2} alignItems="center" mb={3}>
                  <SchoolIcon color="primary" />
                  <Typography variant="h6" fontWeight="bold">
                    Thống kê số lượng đăng ký khóa học
                  </Typography>
                </Stack>
                <Box sx={{ height: 300, position: 'relative' }}>
                  <Bar data={courseBarData} options={barOptions} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Scene>
  );
}
