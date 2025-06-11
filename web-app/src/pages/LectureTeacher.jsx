import { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  Card,
  CardContent,
  Typography,
  Grid,
  CardMedia,
  Link,
  Paper,
  IconButton,
  Tooltip,
  Stack,
  Divider,
  alpha,
  Chip,
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
  Rating,
  Avatar,
  Snackbar,
  Alert,
} from "@mui/material";
import {
  VideoLibrary as VideoIcon,
  Assignment as AssignmentIcon,
  Add as AddIcon,
  Description as FileIcon,
  PlayArrow as PlayIcon,
  School as SchoolIcon,
  QuestionAnswer as QuestionIcon,
  CheckCircle as CorrectIcon,
  Group as GroupIcon,
  Close as CloseIcon,
  Edit as EditIcon,
  Star as StarIcon,
  Comment as CommentIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import keycloak from "../keycloak"; // Keycloak to get user roles
import {
  getLecturesByCourseId,
  createLecture,
  getStudentsProgress,
  updateLecture,
  deleteLecture,
} from "../services/lectureService"; // API service
import { useParams } from "react-router-dom"; // Import useParams để lấy courseId
import Scene from "./Scene";
import {
  createAssignment,
  getAssignmentsByLectureId,
} from "../services/assignmentService";
import useUserRoles from "../services/useUserRoles";
import { getCourseRatings } from "../services/courseService";

export default function LectureTeacher() {
  const { courseId } = useParams(); // Lấy courseId từ URL
  const [lectures, setLectures] = useState([]);
  const [newLecture, setNewLecture] = useState({
    title: "",
    content: "",
    file: null,
    videos: [],
  });
  const [previewVideo, setPreviewVideo] = useState([]); // Hiển thị video preview
  const userRoles = useUserRoles();
  // Get user roles

  // Trạng thái để theo dõi câu hỏi của từng bài giảng
  const [lectureQuestions, setLectureQuestions] = useState({});
  const [newAssignment, setNewAssignment] = useState({
    name: "",
    description: "",
  });
  const [lectureAssignments, setLectureAssignments] = useState({});
  // Lấy danh sách bài giảng và khởi tạo câu hỏi cho mỗi bài giảng
  // Lấy danh sách bài giảng và bài tập
  const [studentsProgress, setStudentsProgress] = useState([]);
  const [progressDialogOpen, setProgressDialogOpen] = useState(false);
  const [editingLecture, setEditingLecture] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    title: "",
    content: "",
    file: null,
    videos: [],
  });
  const [editPreviewVideo, setEditPreviewVideo] = useState([]);
  const [courseRatings, setCourseRatings] = useState([]);
  const [ratingsDialogOpen, setRatingsDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [lectureToDelete, setLectureToDelete] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const fetchLecturesAndAssignments = async () => {
    try {
      // Lấy danh sách bài giảng
      const response = await getLecturesByCourseId(courseId);
      const lecturesData = response.data;
      setLectures(lecturesData);

      // Khởi tạo mảng câu hỏi cho từng bài giảng
      const initialQuestions = lecturesData.reduce((acc, lecture) => {
        acc[lecture.id] = []; // Mỗi bài giảng có mảng câu hỏi riêng
        return acc;
      }, {});
      setLectureQuestions(initialQuestions);

      // Lấy bài tập cho từng bài giảng
      const assignmentsMap = {};
      for (const lecture of lecturesData) {
        const assignmentResponse = await getAssignmentsByLectureId(lecture.id);
        assignmentsMap[lecture.id] = assignmentResponse.data;
      }
      setLectureAssignments(assignmentsMap);
    } catch (error) {
      console.error("Error fetching lectures or assignments:", error);
    }
  };

  const fetchCourseRatings = async () => {
    try {
      const response = await getCourseRatings(courseId);
      setCourseRatings(response.data);
    } catch (error) {
      console.error("Error fetching course ratings:", error);
    }
  };

  useEffect(() => {
    fetchLecturesAndAssignments();
    fetchCourseRatings();
  }, [courseId]);

  // Xử lý chọn video
  const handleVideoChange = (e) => {
    const selectedVideos = Array.from(e.target.files); // Chuyển filelist thành array
    setNewLecture({ ...newLecture, videos: selectedVideos });

    const previewUrls = selectedVideos.map((video) =>
      URL.createObjectURL(video)
    );
    setPreviewVideo(previewUrls);
  };

  // Xử lý thêm bài giảng
  const handleCreateLecture = async () => {
    const formData = new FormData();
    formData.append("courseId", courseId);
    formData.append("title", newLecture.title);
    formData.append("content", newLecture.content);
    formData.append("file", newLecture.file);

    newLecture.videos.forEach((video) => {
      formData.append("videos", video); // Thêm video vào form data
    });

    try {
      await createLecture(formData);
      alert("Bài giảng đã được thêm thành công!");
      const response = await getLecturesByCourseId(courseId);
      setLectures(response.data); // Làm mới danh sách bài giảng
      fetchLecturesAndAssignments();
      // Reset lại form thêm bài giảng
      setNewLecture({
        title: "",
        content: "",
        file: null,
        videos: [],
      });
      setPreviewVideo([]); // Xóa các video đã preview
    } catch (error) {
      console.error("Error creating lecture:", error);
      alert("Lỗi khi thêm bài giảng.");
    }
  };

  // Xử lý thêm bài tập
  const handleCreateAssignment = async (lectureId) => {
    try {
      const processedQuestions = lectureQuestions[lectureId].map(
        (question) => ({
          ...question,
          correctAnswer: question.options[0], // Mặc định câu trả lời đầu tiên là đúng
        })
      );

      const payload = {
        lectureId: lectureId,
        title: newAssignment.name,
        questions: processedQuestions,
      };
      console.log("Sending assignment data:", payload); // Xuất dữ liệu gửi đi ra console

      await createAssignment(payload);
      alert("Bài tập đã được thêm thành công!");
    } catch (error) {
      console.error("Lỗi khi thêm bài tập:", error);
      alert("Lỗi khi thêm bài tập.");
    }
  };

  // Thay đổi câu hỏi
  const handleQuestionTextChange = (lectureId, index, value) => {
    setLectureQuestions((prev) => ({
      ...prev,
      [lectureId]: prev[lectureId].map((question, i) =>
        i === index ? { ...question, questionText: value } : question
      ),
    }));
  };

  // Thay đổi lựa chọn
  const handleOptionChange = (lectureId, questionIndex, optionIndex, value) => {
    setLectureQuestions((prevQuestions) => {
      const newQuestions = [...prevQuestions[lectureId]];
      newQuestions[questionIndex].options[optionIndex] = value;

      // Tự động gán câu trả lời đầu tiên là đúng
      if (optionIndex === 0) {
        newQuestions[questionIndex].correctAnswer = value;
      }

      return { ...prevQuestions, [lectureId]: newQuestions };
    });
  };

  // Thêm câu hỏi mới
  const addNewQuestion = (lectureId) => {
    setLectureQuestions((prevQuestions) => {
      const newQuestions = [...prevQuestions[lectureId]];
      newQuestions.push({
        questionText: "",
        options: ["", "", "", ""], // Tạo ít nhất 2 lựa chọn trống
        correctAnswer: "",
      });
      return { ...prevQuestions, [lectureId]: newQuestions };
    });
  };

  const handleOpenProgressDialog = async () => {
    try {
      const progress = await getStudentsProgress(courseId);
      setStudentsProgress(progress);
      setProgressDialogOpen(true);
    } catch (error) {
      console.error("Error fetching students progress:", error);
    }
  };

  const handleCloseProgressDialog = () => {
    setProgressDialogOpen(false);
  };

  const handleEditClick = (lecture) => {
    setEditingLecture(lecture);
    setEditForm({
      title: lecture.title,
      content: lecture.content,
      file: null,
      videos: [],
    });
    setEditPreviewVideo([]);
    setEditDialogOpen(true);
  };

  const handleEditVideoChange = (e) => {
    const selectedVideos = Array.from(e.target.files);
    setEditForm({ ...editForm, videos: selectedVideos });

    const previewUrls = selectedVideos.map((video) =>
      URL.createObjectURL(video)
    );
    setEditPreviewVideo(previewUrls);
  };

  const handleUpdateLecture = async () => {
    const formData = new FormData();
    formData.append("title", editForm.title);
    formData.append("content", editForm.content);
    if (editForm.file) {
      formData.append("file", editForm.file);
    }

    editForm.videos.forEach((video) => {
      formData.append("videos", video);
    });

    try {
      await updateLecture(editingLecture.id, formData);
      alert("Bài giảng đã được cập nhật thành công!");
      fetchLecturesAndAssignments();
      setEditDialogOpen(false);
      setEditingLecture(null);
      setEditForm({
        title: "",
        content: "",
        file: null,
        videos: [],
      });
      setEditPreviewVideo([]);
    } catch (error) {
      console.error("Error updating lecture:", error);
      alert("Lỗi khi cập nhật bài giảng.");
    }
  };

  const handleOpenRatingsDialog = () => {
    setRatingsDialogOpen(true);
  };

  const handleCloseRatingsDialog = () => {
    setRatingsDialogOpen(false);
  };

  const handleDeleteClick = (lecture) => {
    setLectureToDelete(lecture);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteLecture(lectureToDelete.id);
      setSnackbar({
        open: true,
        message: "Bài giảng đã được xóa thành công",
        severity: "success",
      });
      fetchLecturesAndAssignments(); // Refresh the list
      setDeleteDialogOpen(false);
      setLectureToDelete(null);
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Không thể xóa bài giảng",
        severity: "error",
      });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setLectureToDelete(null);
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
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
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="h4" fontWeight="bold">
                  Danh sách bài giảng
                </Typography>
                <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
                  Quản lý nội dung và bài tập cho khóa học của bạn
                </Typography>
              </Box>
              <Stack direction="row" spacing={2}>
                <Button
                  variant="contained"
                  color="info"
                  startIcon={<GroupIcon />}
                  onClick={handleOpenProgressDialog}
                  sx={{
                    borderRadius: 2,
                    textTransform: 'none',
                    px: 4,
                    background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                    boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
                  }}
                >
                  Xem tiến độ học tập
                </Button>
                <Button
                  variant="contained"
                  color="secondary"
                  startIcon={<CommentIcon />}
                  onClick={handleOpenRatingsDialog}
                  sx={{
                    borderRadius: 2,
                    textTransform: 'none',
                    px: 4,
                    background: 'linear-gradient(45deg, #9C27B0 30%, #E91E63 90%)',
                    boxShadow: '0 3px 5px 2px rgba(233, 30, 99, .3)',
                  }}
                >
                  Xem đánh giá
                </Button>
              </Stack>
            </Stack>
          </Box>
        </Card>

        <Grid container spacing={3}>
          {lectures.map((lecture) => (
            <Grid item xs={12} key={lecture.id}>
              <Card
                sx={{
                  borderRadius: 3,
                  boxShadow: (theme) => `0 8px 24px ${alpha(theme.palette.primary.main, 0.12)}`,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: (theme) => `0 12px 32px ${alpha(theme.palette.primary.main, 0.18)}`,
                  },
                }}
              >
                <CardContent>
                  <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                      <Typography
                        variant="h5"
                        fontWeight="bold"
                        gutterBottom
                        sx={{
                          background: (theme) =>
                            `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                          backgroundClip: 'text',
                          WebkitBackgroundClip: 'text',
                          color: 'transparent',
                        }}
                      >
                        {lecture.title}
                      </Typography>
                      
                      <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
                        {lecture.content}
                      </Typography>
                    </Box>
                    <Stack direction="row" spacing={1}>
                      <Tooltip title="Chỉnh sửa bài giảng">
                        <IconButton
                          onClick={() => handleEditClick(lecture)}
                          sx={{
                            color: 'primary.main',
                            '&:hover': {
                              backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.1),
                            },
                          }}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Xóa bài giảng">
                        <IconButton
                          onClick={() => handleDeleteClick(lecture)}
                          sx={{
                            color: 'error.main',
                            '&:hover': {
                              backgroundColor: (theme) => alpha(theme.palette.error.main, 0.1),
                            },
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </Box>

                  <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
                    {lecture.fileUrl && (
                      <Chip
                        icon={<FileIcon />}
                        label="Tài liệu"
                        component={Link}
                        href={lecture.fileUrl}
                        target="_blank"
                        clickable
                        color="primary"
                        variant="outlined"
                      />
                    )}
                    {lecture.videoUrls && lecture.videoUrls.length > 0 && (
                      <Chip
                        icon={<VideoIcon />}
                        label={`${lecture.videoUrls.length} video`}
                        color="primary"
                        variant="outlined"
                      />
                    )}
                    {lectureAssignments[lecture.id]?.length > 0 && (
                      <Chip
                        icon={<AssignmentIcon />}
                        label={`${lectureAssignments[lecture.id].length} bài tập`}
                        color="primary"
                        variant="outlined"
                      />
                    )}
                  </Stack>

                  {lecture.videoUrls && lecture.videoUrls.length > 0 && (
                    <Box sx={{ mb: 4 }}>
                      <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                        <VideoIcon sx={{ mr: 1 }} /> Video bài giảng
                      </Typography>
                      <Grid container spacing={2}>
                        {lecture.videoUrls.map((videoUrl, index) => (
                          <Grid item xs={12} md={6} key={index}>
                            <Card
                              sx={{
                                position: 'relative',
                                borderRadius: 2,
                                overflow: 'hidden',
                                '&:hover': {
                                  '& .play-overlay': {
                                    opacity: 1,
                                  },
                                },
                              }}
                            >
                              <CardMedia
                                component="video"
                                height="240"
                                controls
                                src={videoUrl}
                                sx={{ bgcolor: 'black', zIndex: 1 }}
                              />
                              <Box
                                className="play-overlay"
                                onClick={(e) => {
                                  // Tìm video element và toggle play/pause
                                  const videoElement = e.currentTarget.previousSibling;
                                  if (videoElement && videoElement.paused) {
                                    videoElement.play();
                                  } else if (videoElement) {
                                    videoElement.pause();
                                  }
                                }}
                                sx={{
                                  position: 'absolute',
                                  top: 0,
                                  left: 0,
                                  right: 0,
                                  bottom: 0,
                                  bgcolor: 'rgba(0,0,0,0.4)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  opacity: 0,
                                  transition: 'opacity 0.3s',
                                  zIndex: 0, // Overlay nằm dưới video
                                  pointerEvents: 'none', // Không chặn tương tác với video
                                }}
                              >
                                <PlayIcon sx={{ fontSize: 64, color: 'white' }} />
                              </Box>
                            </Card>
                          </Grid>
                        ))}
                      </Grid>
                    </Box>
                  )}

                  {lectureAssignments[lecture.id] && lectureAssignments[lecture.id].length > 0 ? (
                    <Box sx={{ mt: 3 }}>
                      <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                        <AssignmentIcon sx={{ mr: 1 }} /> Bài tập
                      </Typography>
                      {lectureAssignments[lecture.id].map((assignment) => (
                        <Paper
                          key={assignment.id}
                          sx={{
                            p: 3,
                            mb: 2,
                            borderRadius: 2,
                            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04),
                          }}
                        >
                          <Typography variant="h6" fontWeight="bold" gutterBottom>
                            {assignment.title}
                          </Typography>
                          {assignment.questions.map((question, index) => (
                            <Box
                              key={index}
                              sx={{
                                mt: 2,
                                p: 2,
                                borderRadius: 1,
                                bgcolor: 'background.paper',
                              }}
                            >
                              <Typography
                                variant="subtitle1"
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  fontWeight: 'bold',
                                  mb: 1,
                                }}
                              >
                                <QuestionIcon sx={{ mr: 1, color: 'primary.main' }} />
                                Câu {index + 1}: {question.questionText}
                              </Typography>
                              <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
                                Các lựa chọn:
                              </Typography>
                              <Typography variant="caption" color="info.main" sx={{ mb: 2 }}>
              
                              </Typography>
                              <Stack spacing={2}>
                                {question.options.map((option, optionIndex) => (
                                  <TextField
                                    key={optionIndex}
                                    label={`Lựa chọn ${optionIndex + 1}${optionIndex === 0 ? " (Đáp án đúng)" : ""}`}
                                    value={option}
                                    onChange={(e) => handleOptionChange(lecture.id, index, optionIndex, e.target.value)}
                                    fullWidth
                                    sx={{
                                      '& .MuiOutlinedInput-root': {
                                        borderRadius: 2,
                                        borderColor: optionIndex === 0 ? 'success.main' : undefined,
                                      },
                                    }}
                                    InputProps={{
                                      endAdornment: optionIndex === 0 ? (
                                        <Tooltip title="Đáp án đúng">
                                          <CorrectIcon color="success" />
                                        </Tooltip>
                                      ) : null,
                                    }}
                                  />
                                ))}
                              </Stack>
                            </Box>
                          ))}
                        </Paper>
                      ))}
                    </Box>
                  ) : (
                    (userRoles.includes("ROLE_ADMIN") || userRoles.includes("ROLE_TEACHER")) && (
                      <Box sx={{ mt: 3 }}>
                        <Typography variant="h6" fontWeight="bold" sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
                          <AssignmentIcon sx={{ mr: 1 }} /> Thêm bài tập mới
                        </Typography>
                        
                        <TextField
                          label="Tiêu đề bài tập"
                          value={newAssignment.name}
                          onChange={(e) => setNewAssignment({ ...newAssignment, name: e.target.value })}
                          fullWidth
                          sx={{
                            mb: 3,
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                            },
                          }}
                        />

                        {lectureQuestions[lecture.id]?.map((question, index) => (
                          <Paper
                            key={index}
                            sx={{
                              p: 3,
                              mb: 3,
                              borderRadius: 2,
                              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04),
                            }}
                          >
                            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                              Câu hỏi {index + 1}
                            </Typography>
                            <TextField
                              label="Nội dung câu hỏi"
                              value={question.questionText}
                              onChange={(e) => handleQuestionTextChange(lecture.id, index, e.target.value)}
                              fullWidth
                              sx={{ mb: 2 }}
                            />
                            
                            <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
                              Các lựa chọn:
                            </Typography>
                            <Typography variant="caption" color="info.main" sx={{ mb: 2 }}>
                            </Typography>
                            <Stack spacing={2}>
                              {question.options.map((option, optionIndex) => (
                                <TextField
                                  key={optionIndex}
                                  label={`Lựa chọn ${optionIndex + 1}${optionIndex === 0 ? " (Đáp án đúng)" : ""}`}
                                  value={option}
                                  onChange={(e) => handleOptionChange(lecture.id, index, optionIndex, e.target.value)}
                                  fullWidth
                                  sx={{
                                    '& .MuiOutlinedInput-root': {
                                      borderRadius: 2,
                                      borderColor: optionIndex === 0 ? 'success.main' : undefined,
                                    },
                                  }}
                                  InputProps={{
                                    endAdornment: optionIndex === 0 ? (
                                      <Tooltip title="Đáp án đúng">
                                        <CorrectIcon color="success" />
                                      </Tooltip>
                                    ) : null,
                                  }}
                                />
                              ))}
                            </Stack>
                          </Paper>
                        ))}

                        <Stack direction="row" spacing={2}>
                          <Button
                            variant="outlined"
                            startIcon={<AddIcon />}
                            onClick={() => addNewQuestion(lecture.id)}
                            sx={{
                              borderRadius: 2,
                              textTransform: 'none',
                            }}
                          >
                            Thêm câu hỏi
                          </Button>
                          
                          <Button
                            variant="contained"
                            startIcon={<AssignmentIcon />}
                            onClick={() => handleCreateAssignment(lecture.id)}
                            sx={{
                              borderRadius: 2,
                              textTransform: 'none',
                              background: (theme) =>
                                `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                            }}
                          >
                            Lưu bài tập
                          </Button>
                        </Stack>
                      </Box>
                    )
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Form thêm bài giảng mới */}
        {(userRoles.includes("ROLE_ADMIN") || userRoles.includes("ROLE_TEACHER")) && (
          <Card
            sx={{
              mt: 4,
              borderRadius: 3,
              boxShadow: (theme) => `0 8px 24px ${alpha(theme.palette.primary.main, 0.12)}`,
            }}
          >
            <CardContent>
              <Typography
                variant="h5"
                fontWeight="bold"
                gutterBottom
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  mb: 3,
                }}
              >
                <AddIcon sx={{ mr: 1 }} /> Thêm bài giảng mới
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    label="Tên bài giảng"
                    value={newLecture.title}
                    onChange={(e) => setNewLecture({ ...newLecture, title: e.target.value })}
                    fullWidth
                    required
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      },
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    label="Nội dung chính"
                    value={newLecture.content}
                    onChange={(e) => setNewLecture({ ...newLecture, content: e.target.value })}
                    fullWidth
                    required
                    multiline
                    rows={4}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      },
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Button
                    variant="outlined"
                    component="label"
                    fullWidth
                    startIcon={<FileIcon />}
                    sx={{
                      borderRadius: 2,
                      p: 1.5,
                      textTransform: 'none',
                    }}
                  >
                    Chọn tài liệu (PDF/Word)
                    <input
                      type="file"
                      accept="application/pdf, application/msword"
                      hidden
                      onChange={(e) => setNewLecture({ ...newLecture, file: e.target.files[0] })}
                    />
                  </Button>
                </Grid>

                {newLecture.file && newLecture.file.type === "application/pdf" && (
                  <Grid item xs={12}>
                    <Paper
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04),
                      }}
                    >
                      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                        Xem trước tài liệu PDF:
                      </Typography>
                      <Box
                        component="iframe"
                        src={URL.createObjectURL(newLecture.file)}
                        sx={{
                          width: '100%',
                          height: 500,
                          border: 'none',
                          borderRadius: 1,
                        }}
                      />
                    </Paper>
                  </Grid>
                )}

                <Grid item xs={12}>
                  <Button
                    variant="outlined"
                    component="label"
                    fullWidth
                    startIcon={<VideoIcon />}
                    sx={{
                      borderRadius: 2,
                      p: 1.5,
                      textTransform: 'none',
                    }}
                  >
                    Chọn video bài giảng (MP4)
                    <input
                      type="file"
                      accept="video/mp4"
                      multiple
                      hidden
                      onChange={handleVideoChange}
                    />
                  </Button>
                </Grid>

                {previewVideo && previewVideo.length > 0 && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                      Xem trước video:
                    </Typography>
                    <Grid container spacing={2}>
                      {previewVideo.map((videoUrl, index) => (
                        <Grid item xs={12} md={6} key={index}>
                          <Card
                            sx={{
                              position: 'relative',
                              borderRadius: 2,
                              overflow: 'hidden',
                            }}
                          >
                            <CardMedia
                              component="video"
                              height="240"
                              controls
                              src={videoUrl}
                              sx={{ bgcolor: 'black' }}
                            />
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  </Grid>
                )}

                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    onClick={handleCreateLecture}
                    fullWidth
                    startIcon={<AddIcon />}
                    sx={{
                      borderRadius: 2,
                      p: 1.5,
                      textTransform: 'none',
                      background: (theme) =>
                        `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                    }}
                  >
                    Thêm bài giảng
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        )}

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

        {/* Ratings Dialog */}
        <Dialog
          open={ratingsDialogOpen}
          onClose={handleCloseRatingsDialog}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="h6" fontWeight="bold">
                Đánh giá và bình luận của học viên
              </Typography>
              <IconButton onClick={handleCloseRatingsDialog}>
                <CloseIcon />
              </IconButton>
            </Stack>
          </DialogTitle>
          <DialogContent>
            <Stack spacing={3}>
              {courseRatings.map((rating) => (
                <Paper
                  key={rating.id}
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    bgcolor: (theme) => alpha(theme.palette.background.paper, 0.8),
                    backdropFilter: 'blur(20px)',
                  }}
                >
                  <Stack direction="row" spacing={2} alignItems="flex-start">
                    <Avatar
                      sx={{
                        bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                        color: 'primary.main',
                      }}
                    >
                      {rating.fullName.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                        <Box>
                          <Typography variant="subtitle1" fontWeight="bold">
                            {rating.fullName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {rating.email}
                          </Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(rating.ratedAt).toLocaleString()}
                        </Typography>
                      </Stack>
                      <Rating
                        value={rating.stars}
                        readOnly
                        precision={0.5}
                        icon={<StarIcon fontSize="inherit" />}
                        sx={{ mb: 1 }}
                      />
                      <Typography variant="body1" color="text.secondary">
                        {rating.comment}
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>
              ))}
              {courseRatings.length === 0 && (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <CommentIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    Chưa có đánh giá nào
                  </Typography>
                </Box>
              )}
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseRatingsDialog} color="primary">
              Đóng
            </Button>
          </DialogActions>
        </Dialog>

        {/* Edit Lecture Dialog */}
        <Dialog
          open={editDialogOpen}
          onClose={() => setEditDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            <Typography variant="h5" fontWeight="bold">
              Chỉnh sửa bài giảng
            </Typography>
          </DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    label="Tên bài giảng"
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    fullWidth
                    required
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      },
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    label="Nội dung chính"
                    value={editForm.content}
                    onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                    fullWidth
                    required
                    multiline
                    rows={4}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      },
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Button
                    variant="outlined"
                    component="label"
                    fullWidth
                    startIcon={<FileIcon />}
                    sx={{
                      borderRadius: 2,
                      p: 1.5,
                      textTransform: 'none',
                    }}
                  >
                    Chọn tài liệu mới (PDF/Word)
                    <input
                      type="file"
                      accept="application/pdf, application/msword"
                      hidden
                      onChange={(e) => setEditForm({ ...editForm, file: e.target.files[0] })}
                    />
                  </Button>
                </Grid>

                <Grid item xs={12}>
                  <Button
                    variant="outlined"
                    component="label"
                    fullWidth
                    startIcon={<VideoIcon />}
                    sx={{
                      borderRadius: 2,
                      p: 1.5,
                      textTransform: 'none',
                    }}
                  >
                    Thêm video mới
                    <input
                      type="file"
                      accept="video/*"
                      multiple
                      hidden
                      onChange={handleEditVideoChange}
                    />
                  </Button>
                </Grid>

                {editPreviewVideo.length > 0 && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                      Video đã chọn:
                    </Typography>
                    <Stack spacing={2}>
                      {editPreviewVideo.map((url, index) => (
                        <Box
                          key={index}
                          sx={{
                            position: 'relative',
                            width: '100%',
                            height: 200,
                            borderRadius: 2,
                            overflow: 'hidden',
                          }}
                        >
                          <video
                            src={url}
                            controls
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                            }}
                          />
                        </Box>
                      ))}
                    </Stack>
                  </Grid>
                )}
              </Grid>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button
              onClick={() => setEditDialogOpen(false)}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                px: 3,
              }}
            >
              Hủy
            </Button>
            <Button
              onClick={handleUpdateLecture}
              variant="contained"
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                px: 3,
                background: (theme) =>
                  `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              }}
            >
              Cập nhật
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={handleDeleteCancel}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            <Typography variant="h6" fontWeight="bold">
              Xác nhận xóa bài giảng
            </Typography>
          </DialogTitle>
          <DialogContent>
            <Typography>
              Bạn có chắc chắn muốn xóa bài giảng "{lectureToDelete?.title}"? Hành động này không thể hoàn tác.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDeleteCancel} color="primary">
              Hủy
            </Button>
            <Button
              onClick={handleDeleteConfirm}
              color="error"
              variant="contained"
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                px: 3,
              }}
            >
              Xóa
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Scene>
  );
}
