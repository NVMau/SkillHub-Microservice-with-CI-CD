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
  Receipt,
} from "@mui/icons-material";
import Scene from "./Scene";
import {
  getDepositHistory,
  getTotalDeposits,
  getDepositStatistics,
} from "../services/paymentManagementService";
import useUserRoles from "../services/useUserRoles";

export default function PaymentManagement() {
  const theme = useTheme();
  const userRoles = useUserRoles();
  const [depositHistory, setDepositHistory] = useState([]);
  const [totalDeposits, setTotalDeposits] = useState(0);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDays, setSelectedDays] = useState("all");

  useEffect(() => {
    fetchData();
  }, [selectedDays]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [historyRes, totalRes] = await Promise.all([
        getDepositHistory(selectedDays !== "all" ? selectedDays : null),
        getTotalDeposits(selectedDays !== "all" ? selectedDays : null),
      ]);

      setDepositHistory(historyRes.data);
      setTotalDeposits(totalRes.data.totalVnd);
      setStatistics(totalRes.data);
    } catch (error) {
      console.error("Error fetching payment data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
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
                Quản lý thanh toán
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
                <Grid item xs={12} md={4}>
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
                          Tổng tiền
                        </Typography>
                        <Typography variant="h4" fontWeight="bold">
                          {formatCurrency(totalDeposits)}
                        </Typography>
                      </Box>
                    </Stack>
                  </Card>
                </Grid>

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
                          Tổng số giao dịch
                        </Typography>
                        <Typography variant="h4" fontWeight="bold">
                          {statistics?.totalTransactions || 0}
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
                          Tổng số coin
                        </Typography>
                        <Typography variant="h4" fontWeight="bold">
                          {((statistics?.totalCoin || 0))}
                        </Typography>
                      </Box>
                    </Stack>
                  </Card>
                </Grid>
              </Grid>

              {/* Transaction History Table */}
              <Box sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Lịch sử giao dịch
                </Typography>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Người dùng</TableCell>
                        <TableCell>Thời gian</TableCell>
                        <TableCell>Số tiền</TableCell>
                        <TableCell>Số coin</TableCell>
                        <TableCell>Trạng thái</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {depositHistory.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Typography>
                                Profile ID:
                              </Typography>
                              <Chip
                                size="small"
                                label={transaction.profileId || 'N/A'}
                                variant="outlined"
                              />
                            </Stack>
                          </TableCell>
                          <TableCell>{formatDate(transaction.paymentTime)}</TableCell>
                          <TableCell>{formatCurrency(transaction.amountVnd)}</TableCell>
                          <TableCell>{transaction.amountCoin || 0}</TableCell>
                          <TableCell>
                            <Chip
                              label={transaction.status || 'UNKNOWN'}
                              color={
                                transaction.status === "SUCCESS"
                                  ? "success"
                                  : transaction.status === "PENDING"
                                  ? "warning"
                                  : "error"
                              }
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                      {depositHistory.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} align="center">
                            <Typography variant="body1" color="text.secondary">
                              Không có giao dịch nào
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