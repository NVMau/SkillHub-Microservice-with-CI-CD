import React, { useEffect, useState } from "react";
import {
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Stack,
  Chip,
  Avatar,
  Divider,
  alpha,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  useTheme,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import { Pie, Bar } from "react-chartjs-2";
import {
  BarChart as BarChartIcon,
  School,
  MenuBook,
  Group,
  TrendingUp,
  AccountBalance,
} from "@mui/icons-material";
import { getAllCourseByTeacherId, getEnrollmentCountByCourseId } from "../services/courseService";
import { getLecturesByCourseId } from "../services/lectureService";
import { getInstructorRevenue } from "../services/enrollmentManagementService";
import { useProfile } from "../context/ProfileContext";
import Loading from '../components/Loading';
import Scene from "./Scene";
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

export default function TeacherStatistics() {
  const theme = useTheme();
  const [courseStats, setCourseStats] = useState([]);
  const [lectureStats, setLectureStats] = useState([]);
  const [enrollmentStats, setEnrollmentStats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { profile, fetchProfile } = useProfile();
  const [totalStudents, setTotalStudents] = useState(0);
  const [totalLectures, setTotalLectures] = useState(0);
  const [revenueData, setRevenueData] = useState(null);
  const [selectedDays, setSelectedDays] = useState(365); // Mặc định 1 năm

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN').format(amount);
  };

  const fetchRevenueData = async (days) => {
    try {
      const response = await getInstructorRevenue(profile.profileId, days);
      if (response.data) {
        setRevenueData(response.data);
      }
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu doanh thu:", error);
    }
  };

  useEffect(() => {
    const fetchStats = async () => {
      if (!profile?.userId) {
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        const courseResponse = await getAllCourseByTeacherId(profile.profileId);
        const courses = courseResponse.data;

        const statsPromises = courses.map(async (course) => {
          const lectureResponse = await getLecturesByCourseId(course.id);
          const lectureCount = lectureResponse.data.length;

          const enrollmentResponse = await getEnrollmentCountByCourseId(course.id);
          const enrollmentCount = enrollmentResponse.data;

          return {
            courseName: course.name,
            lectureCount: lectureCount,
            enrollmentCount: enrollmentCount,
          };
        });

        const statsData = await Promise.all(statsPromises);
        setCourseStats(statsData.map(stat => stat.courseName));
        setLectureStats(statsData.map(stat => stat.lectureCount));
        setEnrollmentStats(statsData.map(stat => stat.enrollmentCount));
        
        setTotalStudents(statsData.reduce((sum, stat) => sum + stat.enrollmentCount, 0));
        setTotalLectures(statsData.reduce((sum, stat) => sum + stat.lectureCount, 0));

        // Fetch revenue data với số ngày mặc định
        await fetchRevenueData(selectedDays);
        
        setIsLoading(false);
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu:", error);
        setIsLoading(false);
      }
    };

    if (profile?.userId) {
      fetchStats();
    } else {
      fetchProfile();
    }
  }, [profile?.userId, selectedDays]);

  const handleDaysChange = (event) => {
    setSelectedDays(event.target.value);
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          font: {
            size: 12
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      }
    }
  };

  const lectureBarData = {
    labels: courseStats,
    datasets: [
      {
        label: "Số lượng bài giảng",
        data: lectureStats,
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
        borderRadius: 8,
      },
    ],
  };

  const enrollmentBarData = {
    labels: courseStats,
    datasets: [
      {
        label: "Số lượng học viên đăng ký",
        data: enrollmentStats,
        backgroundColor: "rgba(255, 159, 64, 0.6)",
        borderColor: "rgba(255, 159, 64, 1)",
        borderWidth: 1,
        borderRadius: 8,
      },
    ],
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <Scene>
      <Box sx={{ p: 3, bgcolor: (theme) => theme.palette.background.default }}>
        {/* Header Section */}
        <Card
          sx={{
            mb: 3,
            borderRadius: 4,
            background: (theme) =>
              `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            color: "white",
            boxShadow: (theme) => `0 8px 32px ${alpha(theme.palette.primary.main, 0.18)}`,
          }}
        >
          <CardContent>
            <Stack direction="row" spacing={2} alignItems="center" mb={3}>
              <BarChartIcon sx={{ fontSize: 40 }} />
              <Typography variant="h4" fontWeight="bold">
                Thống kê giảng dạy
              </Typography>
            </Stack>

            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={4}>
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
                  <MenuBook sx={{ fontSize: 30 }} />
                  <Box>
                    <Typography variant="h5" fontWeight="bold">
                      {courseStats.length}
                    </Typography>
                    <Typography variant="body2">Khóa học</Typography>
                  </Box>
                </Stack>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
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
                  <School sx={{ fontSize: 30 }} />
                  <Box>
                    <Typography variant="h5" fontWeight="bold">
                      {totalLectures}
                    </Typography>
                    <Typography variant="body2">Bài giảng</Typography>
                  </Box>
                </Stack>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
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
                  <Group sx={{ fontSize: 30 }} />
                  <Box>
                    <Typography variant="h5" fontWeight="bold">
                      {totalStudents}
                    </Typography>
                    <Typography variant="body2">Học viên</Typography>
                  </Box>
                </Stack>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Revenue Section */}
        <Card sx={{ mb: 3, borderRadius: 4 }}>
          <CardContent>
            <Stack direction="row" spacing={2} alignItems="center" mb={3} justifyContent="space-between">
              <Stack direction="row" spacing={2} alignItems="center">
                <TrendingUp color="primary" />
                <Typography variant="h6" fontWeight="bold">
                  Thống kê doanh thu
                </Typography>
              </Stack>
              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel>Khoảng thời gian</InputLabel>
                <Select
                  value={selectedDays}
                  label="Khoảng thời gian"
                  onChange={handleDaysChange}
                >
                  <MenuItem value={3}>3 ngày gần nhất</MenuItem>
                  <MenuItem value={7}>7 ngày gần nhất</MenuItem>
                  <MenuItem value={30}>30 ngày gần nhất</MenuItem>
                  <MenuItem value={90}>90 ngày gần nhất</MenuItem>
                  <MenuItem value={356}>1 năm gần nhất</MenuItem>
                </Select>
              </FormControl>
            </Stack>

            <Grid container spacing={3} mb={3}>
              <Grid item xs={12} md={4}>
                <Card
                  sx={{
                    p: 3,
                    bgcolor: alpha(theme.palette.success.main, 0.1),
                    borderRadius: 3,
                  }}
                >
                  <Stack direction="row" spacing={2} alignItems="center">
                    <TrendingUp
                      sx={{ fontSize: 40, color: theme.palette.success.main }}
                    />
                    <Box>
                      <Typography variant="h6" color="text.secondary">
                        Tổng doanh thu(coin)
                      </Typography>
                      <Typography variant="h4" fontWeight="bold">
                        {formatCurrency(revenueData?.totalRevenue || 0)}
                      </Typography>
                    </Box>
                  </Stack>
                </Card>
              </Grid>

              <Grid item xs={12} md={4}>
                <Card
                  sx={{
                    p: 3,
                    bgcolor: alpha(theme.palette.info.main, 0.1),
                    borderRadius: 3,
                  }}
                >
                  <Stack direction="row" spacing={2} alignItems="center">
                    <AccountBalance
                      sx={{ fontSize: 40, color: theme.palette.info.main }}
                    />
                    <Box>
                      <Typography variant="h6" color="text.secondary">
                        Số lượng đăng ký
                      </Typography>
                      <Typography variant="h4" fontWeight="bold">
                        {revenueData?.totalEnrollments || 0}
                      </Typography>
                    </Box>
                  </Stack>
                </Card>
              </Grid>
            </Grid>

            <TableContainer component={Paper} sx={{ mt: 2 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Học viên</TableCell>
                    <TableCell>Khóa học</TableCell>
                    <TableCell>Giá khóa học(coin)</TableCell>
                    <TableCell>Doanh thu giáo viên(coin)</TableCell>
                    <TableCell>Doanh thu hệ thống(coin)</TableCell>
                    <TableCell>Ngày đăng ký</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {revenueData?.enrollmentDetails?.map((detail, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Chip
                          size="small"
                          label={detail.studentName || 'N/A'}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={detail.courseName || 'N/A'}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>{formatCurrency(detail.coursePrice)}</TableCell>
                      <TableCell>{formatCurrency(detail.teacherRevenue)}</TableCell>
                      <TableCell>{formatCurrency(detail.platformRevenue)}</TableCell>
                      <TableCell>
                        {new Date(detail.enrollmentDate).toLocaleDateString('vi-VN')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        {/* Charts Section */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card
              sx={{
                height: "100%",
                borderRadius: 4,
                boxShadow: (theme) => `0 8px 32px ${alpha(theme.palette.primary.main, 0.1)}`,
              }}
            >
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="center" mb={3}>
                  <MenuBook color="primary" />
                  <Typography variant="h6" fontWeight="bold">
                    Số lượng bài giảng theo khóa học
                  </Typography>
                </Stack>
                <Box sx={{ height: 300, position: "relative" }}>
                  <Bar data={lectureBarData} options={chartOptions} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card
              sx={{
                height: "100%",
                borderRadius: 4,
                boxShadow: (theme) => `0 8px 32px ${alpha(theme.palette.primary.main, 0.1)}`,
              }}
            >
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="center" mb={3}>
                  <Group color="primary" />
                  <Typography variant="h6" fontWeight="bold">
                    Số lượng học viên đăng ký theo khóa học
                  </Typography>
                </Stack>
                <Box sx={{ height: 300, position: "relative" }}>
                  <Bar data={enrollmentBarData} options={chartOptions} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Scene>
  );
}
