import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Grid,
  CardMedia,
  Link,
  RadioGroup,
  FormControlLabel,
  Radio,
  Rating,
  TextField,
  Snackbar,
  Alert,
  Paper,
  Stack,
  Divider,
  IconButton,
  Tooltip,
  Fade,
  alpha,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
} from "@mui/material";
import { getLecturesByCourseId, getStudentsProgress } from "../services/lectureService";
import { useParams } from "react-router-dom";
import Scene from "./Scene";
import TimelineIcon from '@mui/icons-material/Timeline';
import GroupIcon from '@mui/icons-material/Group';
import CloseIcon from '@mui/icons-material/Close';

export default function LecturesTeacher() {
  const { courseId } = useParams();
  const [lectures, setLectures] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [studentsProgress, setStudentsProgress] = useState([]);
  const [progressDialogOpen, setProgressDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // ... existing code ...

  const handleOpenProgressDialog = async () => {
    try {
      const progress = await getStudentsProgress(courseId);
      setStudentsProgress(progress);
      setProgressDialogOpen(true);
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Không thể lấy thông tin tiến độ học tập",
        severity: "error",
      });
    }
  };

  const handleCloseProgressDialog = () => {
    setProgressDialogOpen(false);
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
                <Typography variant="h4" fontWeight="bold">
                  Bài giảng
                </Typography>
                <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
                  Quản lý bài giảng và theo dõi tiến độ học tập
                </Typography>
              </Box>
            </Stack>
          </Box>
        </Card>

        {/* Thêm nút xem tiến độ học tập */}
        <Button
          variant="contained"
          color="info"
          startIcon={<GroupIcon />}
          onClick={handleOpenProgressDialog}
          sx={{
            mb: 4,
            borderRadius: 2,
            textTransform: 'none',
            px: 4,
            background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
            boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
          }}
        >
          Xem tiến độ học tập của học sinh
        </Button>

        {/* ... rest of the component ... */}

        {/* Dialog hiển thị tiến độ học tập */}
        <Dialog
          open={progressDialogOpen}
          onClose={handleCloseProgressDialog}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="h6" fontWeight="bold">
                Tiến độ học tập của học sinh
              </Typography>
              <IconButton onClick={handleCloseProgressDialog}>
                <CloseIcon />
              </IconButton>
            </Stack>
          </DialogTitle>
          <DialogContent>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Tên học sinh</TableCell>
                    <TableCell align="center">Tiến độ bài giảng</TableCell>
                    <TableCell align="center">Tiến độ bài tập</TableCell>
                    <TableCell align="center">Lần truy cập cuối</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {studentsProgress.map((student) => (
                    <TableRow key={student.userId}>
                      <TableCell>{student.studentName}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ width: '100%' }}>
                            <LinearProgress
                              variant="determinate"
                              value={student.lessonProgressPercentage}
                              sx={{
                                height: 10,
                                borderRadius: 5,
                                backgroundColor: alpha('#2196F3', 0.1),
                                '& .MuiLinearProgress-bar': {
                                  borderRadius: 5,
                                  backgroundColor: '#2196F3',
                                },
                              }}
                            />
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            {student.completedLessons}/{student.totalLessons}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ width: '100%' }}>
                            <LinearProgress
                              variant="determinate"
                              value={student.assignmentProgressPercentage}
                              sx={{
                                height: 10,
                                borderRadius: 5,
                                backgroundColor: alpha('#4CAF50', 0.1),
                                '& .MuiLinearProgress-bar': {
                                  borderRadius: 5,
                                  backgroundColor: '#4CAF50',
                                },
                              }}
                            />
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            {student.completedAssignments}/{student.totalAssignments}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        {student.lastAccessedAt ? new Date(student.lastAccessedAt).toLocaleString() : 'Chưa truy cập'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseProgressDialog} color="primary">
              Đóng
            </Button>
          </DialogActions>
        </Dialog>

        {/* ... rest of the component ... */}
      </Box>
    </Scene>
  );
} 