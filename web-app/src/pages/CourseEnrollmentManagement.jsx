import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Chip,
  Stack,
  useTheme,
  alpha,
} from "@mui/material";
import {
  MonetizationOn,
  TrendingUp,
  AccountBalance,
  CheckCircleOutline,
} from "@mui/icons-material";
import Scene from "./Scene";
import { getEnrollmentRevenue } from "../services/enrollmentManagementService";
import useUserRoles from "../services/useUserRoles";

export default function CourseEnrollmentManagement() {
  const theme = useTheme();
  const userRoles = useUserRoles();
  const [enrollmentData, setEnrollmentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDays, setSelectedDays] = useState("all");

  useEffect(() => {
    fetchData();
  }, [selectedDays]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await getEnrollmentRevenue(selectedDays !== "all" ? selectedDays : null);
      setEnrollmentData(res.data);
    } catch (error) {
      console.error("Error fetching enrollment data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount).replace("₫", "").trim();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!userRoles.includes("ROLE_ADMIN")) {
    return (
      <Scene>
        <Box sx={{ p: 3 }}>
          <Typography variant="h5" color="error">
            Bạn không có quyền truy cập trang này
          </Typography>
        </Box>
      </Scene>
    );
  }

  return (
    <Scene>
      <Box sx={{ p: 3 }}>
        <Card
          sx={{
            borderRadius: 4,
            boxShadow: (theme) =>
              `0 0 24px ${alpha(theme.palette.primary.main, 0.1)}`,
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
            }}
          >
            <Stack direction="row" spacing={2} alignItems="center">
              <MonetizationOn sx={{ fontSize: 40 }} />
              <Typography variant="h4" fontWeight="bold">
                Quản lý đăng ký khóa học
              </Typography>
            </Stack>
          </Box>

          {/* Filter Section */}
          <Box sx={{ p: 3, display: "flex", justifyContent: "flex-end" }}>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Thời gian</InputLabel>
              <Select
                value={selectedDays}
                label="Thời gian"
                onChange={(e) => setSelectedDays(e.target.value)}
              >
                <MenuItem value="all">Tất cả thời gian</MenuItem>
                <MenuItem value="1">24 giờ qua</MenuItem>
                <MenuItem value="7">7 ngày qua</MenuItem>
                <MenuItem value="30">30 ngày qua</MenuItem>
                <MenuItem value="90">90 ngày qua</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              {/* Statistics Cards */}
              <Grid container spacing={3} sx={{ p: 3 }}>
                {/* Tổng tiền đăng ký */}
                <Grid item xs={12} md={3}>
                  <Card
                    sx={{
                      p: 3,
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      borderRadius: 3,
                    }}
                  >
                    <Stack direction="row" spacing={2} alignItems="center">
                      <MonetizationOn
                        sx={{ fontSize: 40, color: theme.palette.primary.main }}
                      />
                      <Box>
                        <Typography variant="h6" color="text.secondary">
                          Tổng coin
                        </Typography>
                        <Typography variant="h4" fontWeight="bold">
                          {formatCurrency(enrollmentData?.totalRevenue || 0)}
                        </Typography>
                      </Box>
                    </Stack>
                  </Card>
                </Grid>

                {/* Doanh thu hệ thống */}
                <Grid item xs={12} md={3}>
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
                          Doanh thu hệ thống(coin)
                        </Typography>
                        <Typography variant="h4" fontWeight="bold">
                          {formatCurrency(enrollmentData?.platformRevenue || 0)}
                        </Typography>
                      </Box>
                    </Stack>
                  </Card>
                </Grid>

                {/* Doanh thu giáo viên */}
                <Grid item xs={12} md={3}>
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
                          Doanh thu giáo viên(coin)
                        </Typography>
                        <Typography variant="h4" fontWeight="bold">
                          {formatCurrency(enrollmentData?.teacherRevenue || 0)}
                        </Typography>
                      </Box>
                    </Stack>
                  </Card>
                </Grid>

                {/* Lần đăng ký hợp lệ */}
                <Grid item xs={12} md={3}>
                  <Card
                    sx={{
                      p: 3,
                      bgcolor: alpha(theme.palette.warning.main, 0.1),
                      borderRadius: 3,
                    }}
                  >
                    <Stack direction="row" spacing={2} alignItems="center">
                      <CheckCircleOutline
                        sx={{ fontSize: 40, color: theme.palette.warning.main }}
                      />
                      <Box>
                        <Typography variant="h6" color="text.secondary">
                          Lần đăng ký hợp lệ
                        </Typography>
                        <Typography variant="h4" fontWeight="bold">
                          {enrollmentData?.validEnrollments || 0}
                        </Typography>
                      </Box>
                    </Stack>
                  </Card>
                </Grid>
              </Grid>

              {/* Enrollment Details Table */}
              <Box sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Chi tiết đăng ký
                </Typography>
                <TableContainer component={Paper}>
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
                      {enrollmentData?.enrollmentDetails?.map((detail, index) => (
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
                          <TableCell>{formatDate(detail.enrollmentDate)}</TableCell>
                        </TableRow>
                      ))}
                      {enrollmentData?.enrollmentDetails?.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={6} align="center">
                            <Typography variant="body1" color="text.secondary">
                              Không có chi tiết đăng ký nào
                            </Typography>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            </>
          )}
        </Card>
      </Box>
    </Scene>
  );
} 