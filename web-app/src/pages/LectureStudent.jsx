import { useState, useEffect, useRef } from "react";
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
  CircularProgress,
  LinearProgress,
  Dialog,
  DialogContent,
  DialogActions,
  DialogTitle,
} from "@mui/material";
import { getLecturesByCourseId, markLessonAsCompleted, checkLessonCompletionStatus } from "../services/lectureService"; // API service
import { useParams } from "react-router-dom"; // Import useParams để lấy courseId
import Scene from "./Scene";
import {
  createRating,
  getRatingbyCourseAndUser,
} from "../services/RatingsService";
import { getMyProfile } from "../services/userService";
import Loading from "../components/Loading"; // Component Loading

import {
  getAssignmentsByLectureId,
  submitExamResult,
  getExamResultByLectureId, // API để lấy kết quả bài thi
  getAIEvaluation,
} from "../services/examResultService"; // Service để lấy bài tập và gửi kết quả
import SchoolIcon from '@mui/icons-material/School';
import AssignmentIcon from '@mui/icons-material/Assignment';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import DescriptionIcon from '@mui/icons-material/Description';
import StarIcon from '@mui/icons-material/Star';
import SendIcon from '@mui/icons-material/Send';
import TimelineIcon from '@mui/icons-material/Timeline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import GetAppIcon from '@mui/icons-material/GetApp';
import { getCourseProgress, checkCertificateStatus, getCertificate, createCertificate } from "../services/courseService";

export default function LecturePage() {
  const { courseId } = useParams(); // Lấy courseId từ URL
  const [lectures, setLectures] = useState([]);
  const [assignments, setAssignments] = useState({}); // assignment theo từng bài giảng
  const [examResults, setExamResults] = useState({}); // examResult theo từng bài giảng
  const [userAnswers, setUserAnswers] = useState({}); // Trạng thái để lưu câu trả lời của người dùng
  const [loadingAssignment, setLoadingAssignment] = useState(false); // Để kiểm tra trạng thái load bài tập
  const [selectedLectureId, setSelectedLectureId] = useState(null); // Theo dõi bài giảng được chọn để làm bài
  const [profile, setProfile] = useState({});
  const [stars, setStars] = useState(0);
  const [comment, setComment] = useState("");
  const [hasRated, setHasRated] = useState(false); // Define the hasRated state

  const [snackSeverity, setSnackSeverity] = useState("info");
  const [snackBarOpen, setSnackBarOpen] = useState(false);
  const [snackBarMessage, setSnackBarMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const [stats, setStats] = useState({
    completedLectures: 0,
    totalLectures: 0,
    completedAssignments: 0,
    totalAssignments: 0,
  });

  const [completionLoading, setCompletionLoading] = useState({});

  const [openedAssignments, setOpenedAssignments] = useState({}); // Trạng thái đã mở bài tập theo từng bài giảng
  const [assignmentIds, setAssignmentIds] = useState({}); // Lưu assignmentId cho từng bài giảng

  const [aiEvaluations, setAIEvaluations] = useState({});
  const [loadingAIEvaluation, setLoadingAIEvaluation] = useState({});

  const [progress, setProgress] = useState(null); // Thêm state lưu tiến độ học tập
  
  // Certificate states
  const [hasCertificate, setHasCertificate] = useState(false);
  const [certificateData, setCertificateData] = useState(null);
  const [certificateDialogOpen, setCertificateDialogOpen] = useState(false);
  const [loadingCertificate, setLoadingCertificate] = useState(false);
  const certificateRef = useRef(null);

  const handleCloseSnackBar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackBarOpen(false);
  };

  const getProfile = async () => {
    try {
      console.log("Đang lấy profile...");
      const response = await getMyProfile();
      const data = response.data;

      console.log("Đã nhận được profile:", data);
      setProfile(data);
      return data; // Trả về profile data
    } catch (error) {
      const errorResponse = error.response?.data;
      console.error("Lỗi khi lấy profile:", errorResponse || error);
      setIsLoading(false);
      return null;
    }
  };

  // useEffect mới để tự động load profile khi component mount
  useEffect(() => {
    console.log("Component mounted, đang lấy profile...");
    getProfile();
  }, []);

  const handleSubmitReview = async () => {
    const studentId = profile.profileId;

    if (!stars || !comment) {
      alert("Vui lòng đánh giá và viết nhận xét!");
      return;
    }
    try {
      console.log(studentId, courseId, stars, comment);
      await createRating({ studentId, courseId, stars, comment });
      setSnackSeverity("success");
      setSnackBarMessage("Đánh gía thành công");
      setSnackBarOpen(true);
      setIsLoading(false);
    } catch (error) {
      const errorResponse = error.response?.data;
      setSnackSeverity("error");
      console.log("errorResponse data:", error);
      setIsLoading(false);

      // Kiểm tra xem lỗi có phải là do đã đăng ký khóa học trước đó

      setSnackBarMessage("Lỗi khi thực hiện đánh giá");

      setSnackBarOpen(true);

      // Gửi dữ liệu rating và review lên backend tại đây.
    }
  };

  useEffect(() => {
    const fetchLecturesAndResults = async () => {
      try {
        // Kiểm tra profileId có tồn tại không
        if (!profile?.profileId) {
          console.log("ProfileId không tồn tại, chờ profile load xong");
          setIsLoading(true);
          return; // Dừng hàm nếu không có profileId
        }
        
        console.log("Bắt đầu load lectures với profileId:", profile.profileId);

        // Lấy danh sách bài giảng
        const response = await getLecturesByCourseId(courseId);
        const lectures = response.data;
        console.log("Đã tải được lectures:", lectures.length);
        setIsLoading(false);

        console.log("Bắt đầu kiểm tra trạng thái hoàn thành cho mỗi bài học");
        // Kiểm tra trạng thái hoàn thành cho mỗi bài học
        const lecturesWithStatus = await Promise.all(
          lectures.map(async (lecture) => {
            console.log(`Kiểm tra completion cho lecture ${lecture.id} với profileId ${profile.profileId}`);
            const isCompleted = await checkLessonCompletionStatus(lecture.id, profile.profileId);
            console.log(`Kết quả completion cho lecture ${lecture.id}:`, isCompleted);
            return { ...lecture, completed: isCompleted };
          })
        );
        console.log("Đã xử lý xong lecturesWithStatus:", lecturesWithStatus.length);

        // Kiểm tra từng bài giảng xem có kết quả bài thi hay không
        for (let lecture of lecturesWithStatus) {
          console.log(`Đang lấy assignments cho lecture ${lecture.id}`);
          const assignmentResponse = await getAssignmentsByLectureId(lecture.id);

          if (assignmentResponse.data && assignmentResponse.data.length > 0) {
            const assignment = assignmentResponse.data[0];
            console.log(`Lecture ${lecture.id} có assignment: ${assignment.id}`);

            // Kiểm tra kết quả bài thi cho từng assignment
            try {
              console.log(`Đang lấy exam result cho assignment ${assignment.id}`);
              const examResultResponse = await getExamResultByLectureId(
                assignment.id,
                profile.profileId
              );

              if (examResultResponse?.data) {
                // Nếu có kết quả, lưu kết quả vào state
                console.log(`Đã có exam result cho assignment ${assignment.id}`);
                lecture.examResult = examResultResponse.data;
              } else {
                // Nếu chưa có kết quả, lưu assignment
                console.log(`Chưa có exam result cho assignment ${assignment.id}`);
                lecture.assignment = assignment;
                // Trộn câu trả lời nếu chưa làm
                lecture.assignment.questions = assignment.questions.map(
                  (question) => ({
                    ...question,
                    shuffledOptions: shuffleArray(question.options),
                  })
                );
              }
            } catch (error) {
              console.error(`Lỗi khi lấy exam result cho assignment ${assignment.id}:`, error);
            }
          } else {
            console.log(`Lecture ${lecture.id} không có assignment nào`);
          }
        }
        console.log("Đã xử lý xong tất cả lectures và assignments");

        setLectures(lecturesWithStatus);
        console.log("Đã cập nhật state lectures");
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu bài giảng hoặc bài thi:", error);
        console.error("Chi tiết lỗi:", error.response || error.message || error);
        setIsLoading(false);
      }
    };

    const fetchRating = async () => {
      try {
        // Kiểm tra profileId có tồn tại không
        if (!profile?.profileId) {
          console.log("ProfileId không tồn tại trong fetchRating");
          return; // Dừng hàm nếu không có profileId
        }
        
        console.log("Bắt đầu lấy rating với profileId:", profile.profileId);
        const response = await getRatingbyCourseAndUser(
          courseId,
          profile.profileId
        );
        if (response.data) {
          // Đã có đánh giá
          console.log("Đã có rating:", response.data);
          setStars(response.data.stars);
          setComment(response.data.comment);
          setHasRated(true); // Đặt trạng thái đã đánh giá
        } else {
          console.log("Chưa có rating");
        }
      } catch (error) {
        console.error("Error fetching rating:", error);
      }
    };

    // Gọi hàm nếu profile đã sẵn sàng
    if (profile?.profileId) {
      console.log("Profile đã sẵn sàng, gọi các hàm fetch data");
      fetchLecturesAndResults();
      fetchRating();
    } else {
      console.log("Profile chưa sẵn sàng:", profile);
    }
  }, [courseId, profile]); // Chỉ phụ thuộc vào profile thay vì profile.profileId

  useEffect(() => {
    const calculateStats = () => {
      const total = lectures.length;
      const completed = lectures.filter(lecture => lecture.examResult).length;
      const totalAssign = lectures.filter(lecture => lecture.assignment || lecture.examResult).length;
      const completedAssign = lectures.filter(lecture => lecture.examResult).length;
      
      setStats({
        completedLectures: completed,
        totalLectures: total,
        completedAssignments: completedAssign,
        totalAssignments: totalAssign,
      });
    };

    if (lectures.length > 0) {
      calculateStats();
      // Nếu đã có lectures thì đánh dấu là không còn loading nữa
      setIsLoading(false);
    }
  }, [lectures]);

  // Thêm useEffect để xử lý loading state
  useEffect(() => {
    // Đặt isLoading thành false sau 10 giây để đảm bảo không bị loading vô tận
    const timeout = setTimeout(() => {
      if (isLoading) {
        console.log("Force stop loading sau 10 giây");
        setIsLoading(false);
      }
    }, 10000);

    return () => clearTimeout(timeout);
  }, [isLoading]);

  // Xử lý khi học sinh chọn câu trả lời
  const handleAnswerChange = (questionIndex, answer) => {
    setUserAnswers((prevAnswers) => ({
      ...prevAnswers,
      [questionIndex]: answer,
    }));
  };
  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  // Gửi kết quả bài tập
  const handleSubmitExam = async () => {
    try {
      const resultPayload = {
        userAnswers: Object.values(userAnswers),
      };
      const assignmentId = assignmentIds[selectedLectureId];
      if (!assignmentId || !assignments[selectedLectureId]) {
        alert("Không tìm thấy bài tập để nộp!");
        return;
      }
      await submitExamResult(assignmentId, profile.profileId, resultPayload);
      // Lấy kết quả bài thi mới nhất
      const examResultResponse = await getExamResultByLectureId(assignmentId, profile.profileId);
      if (examResultResponse?.data) {
        setExamResults(prev => ({ ...prev, [selectedLectureId]: examResultResponse.data }));
        setAssignments(prev => ({ ...prev, [selectedLectureId]: null }));
        setUserAnswers({});
      }
      alert("Bài thi đã được gửi thành công!");
    } catch (error) {
      console.error("Lỗi khi gửi bài thi:", error);
      alert("Lỗi khi gửi bài thi.");
    }
  };

  // Lấy bài tập cho từng bài giảng khi học sinh muốn làm bài
  const handleFetchAssignment = async (lectureId) => {
    setLoadingAssignment(true);
    // Đánh dấu đã mở bài tập cho bài giảng này
    setOpenedAssignments(prev => ({ ...prev, [lectureId]: true }));
    try {
      const assignmentResponse = await getAssignmentsByLectureId(lectureId);
      if (assignmentResponse.data && assignmentResponse.data.length > 0) {
        const assignment = assignmentResponse.data[0];
        setAssignmentIds(prev => ({ ...prev, [lectureId]: assignment.id }));
        setSelectedLectureId(lectureId); // Chỉ set khi có assignment
        const examResultResponse = await getExamResultByLectureId(
          assignment.id,
          profile.profileId
        );
        if (examResultResponse?.data) {
          setExamResults(prev => ({ ...prev, [lectureId]: examResultResponse.data }));
          setAssignments(prev => ({ ...prev, [lectureId]: null }));
        } else {
          assignment.questions = assignment.questions.map((question) => ({
            ...question,
            shuffledOptions: shuffleArray(question.options),
          }));
          setAssignments(prev => ({ ...prev, [lectureId]: assignment }));
          setExamResults(prev => ({ ...prev, [lectureId]: null }));
        }
      } else {
        setAssignmentIds(prev => ({ ...prev, [lectureId]: null }));
        setOpenedAssignments(prev => ({ ...prev, [lectureId]: false })); // reset openedAssignments cho bài giảng này
        setAssignments(prev => ({ ...prev, [lectureId]: null }));
        alert("Không có bài tập nào cho bài giảng này.");
        setLoadingAssignment(false);
        return;
      }
    } catch (error) {
      setAssignmentIds(prev => ({ ...prev, [lectureId]: null }));
      setOpenedAssignments(prev => ({ ...prev, [lectureId]: false }));
      setAssignments(prev => ({ ...prev, [lectureId]: null }));
      setLoadingAssignment(false);
      alert("Lỗi khi lấy dữ liệu bài tập hoặc kết quả.");
      return;
    }
    setLoadingAssignment(false);
  };

  const handleMarkAsCompleted = async (lectureId) => {
    try {
      setCompletionLoading(prev => ({ ...prev, [lectureId]: true }));
      await markLessonAsCompleted(lectureId, profile.profileId, courseId);
      setSnackSeverity("success");
      setSnackBarMessage("Đã đánh dấu hoàn thành bài học");
      setSnackBarOpen(true);
      
      // Cập nhật trạng thái hoàn thành trong lectures
      setLectures(prevLectures => 
        prevLectures.map(lecture => 
          lecture.id === lectureId 
            ? { ...lecture, completed: true }
            : lecture
        )
      );
    } catch (error) {
      console.error("Error marking lesson as completed:", error);
      setSnackSeverity("error");
      setSnackBarMessage("Không thể đánh dấu hoàn thành bài học");
      setSnackBarOpen(true);
    } finally {
      setCompletionLoading(prev => ({ ...prev, [lectureId]: false }));
    }
  };

  // Lấy đánh giá AI cho bài tập
  const handleGetAIEvaluation = async (lectureId) => {
    try {
      setLoadingAIEvaluation(prev => ({ ...prev, [lectureId]: true }));
      const assignmentId = assignmentIds[lectureId];
      if (!assignmentId) {
        throw new Error("Không tìm thấy bài tập");
      }
      const response = await getAIEvaluation(assignmentId, profile.profileId);
      setAIEvaluations(prev => ({ ...prev, [lectureId]: response.data.evaluation }));
      setSnackSeverity("success");
      setSnackBarMessage("Đã nhận được đánh giá từ AI");
      setSnackBarOpen(true);
    } catch (error) {
      console.error("Lỗi khi lấy đánh giá AI:", error);
      setSnackSeverity("error");
      setSnackBarMessage("Không thể lấy đánh giá từ AI");
      setSnackBarOpen(true);
    } finally {
      setLoadingAIEvaluation(prev => ({ ...prev, [lectureId]: false }));
    }
  };

  // Lấy tiến độ học tập từ backend khi có courseId và profileId
  useEffect(() => {
    if (courseId && profile?.profileId) {
      getCourseProgress(courseId, profile.profileId)
        .then(res => setProgress(res.data))
        .catch(err => setProgress(null));
    }
  }, [courseId, profile]);

  // Kiểm tra trạng thái chứng chỉ khi có courseId và profileId
  useEffect(() => {
    if (courseId && profile?.profileId) {
      checkCertificateStatus(courseId, profile.profileId)
        .then(res => {
          setHasCertificate(res.data.hasCertificate);
          if (res.data.hasCertificate) {
            // Nếu đã có chứng chỉ, lấy thông tin chứng chỉ
            getCertificate(courseId, profile.profileId)
              .then(res => setCertificateData(res.data))
              .catch(err => {
                console.error("Lỗi khi lấy thông tin chứng chỉ:", err);
              });
          }
        })
        .catch(err => {
          console.error("Lỗi khi kiểm tra trạng thái chứng chỉ:", err);
          setHasCertificate(false);
        });
    }
  }, [courseId, profile]);

  // Hàm tạo chứng chỉ mới
  const handleCreateCertificate = async () => {
    try {
      setLoadingCertificate(true);
      const res = await createCertificate(courseId, profile.profileId);
      setCertificateData(res.data);
      setHasCertificate(true);
      setCertificateDialogOpen(true);
      setSnackSeverity("success");
      setSnackBarMessage("Chứng chỉ đã được tạo thành công");
      setSnackBarOpen(true);
    } catch (error) {
      console.error("Lỗi khi tạo chứng chỉ:", error);
      setSnackSeverity("error");
      setSnackBarMessage("Không thể tạo chứng chỉ, vui lòng thử lại sau");
      setSnackBarOpen(true);
    } finally {
      setLoadingCertificate(false);
    }
  };

  // Hàm hiển thị chứng chỉ
  const handleViewCertificate = () => {
    setCertificateDialogOpen(true);
  };

  // Hàm đóng dialog chứng chỉ
  const handleCloseCertificateDialog = () => {
    setCertificateDialogOpen(false);
  };

  // Hàm tải chứng chỉ dưới dạng PDF
  const handleDownloadCertificate = () => {
    if (!certificateRef.current) return;
    
    // Hiển thị thông báo cho người dùng
    setSnackSeverity("info");
    setSnackBarMessage("Đang chuẩn bị tải chứng chỉ...");
    setSnackBarOpen(true);
    
    import('html2canvas').then(({ default: html2canvas }) => {
      import('jspdf').then(({ default: jsPDF }) => {
        html2canvas(certificateRef.current, { scale: 2 }).then(canvas => {
          const imgData = canvas.toDataURL('image/png');
          const pdf = new jsPDF('l', 'mm', 'a4');
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = pdf.internal.pageSize.getHeight();
          const imgWidth = canvas.width;
          const imgHeight = canvas.height;
          const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
          const imgX = (pdfWidth - imgWidth * ratio) / 2;
          const imgY = 0;
          pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
          pdf.save(`certificate-${certificateData.courseName}.pdf`);
          
          setSnackSeverity("success");
          setSnackBarMessage("Chứng chỉ đã được tải xuống thành công!");
          setSnackBarOpen(true);
        });
      });
    }).catch(err => {
      console.error("Lỗi khi tải thư viện:", err);
      setSnackSeverity("error");
      setSnackBarMessage("Không thể tải chứng chỉ, vui lòng thử lại sau");
      setSnackBarOpen(true);
    });
  };

  if (isLoading) {
    return <Loading />;
  }

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
                  Học tập và kiểm tra kiến thức
                </Typography>
              </Box>
            </Stack>
          </Box>
        </Card>

        {/* Thêm phần thống kê */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <Card
              sx={{
                borderRadius: 4,
                background: (theme) =>
                  `linear-gradient(135deg, ${theme.palette.success.light} 0%, ${theme.palette.success.main} 100%)`,
                color: "white",
                height: "100%",
              }}
            >
              <CardContent>
                <Stack spacing={2}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <TimelineIcon sx={{ fontSize: 36, color: 'white', bgcolor: 'success.main', borderRadius: '50%', p: 1, boxShadow: 2 }} />
                    <Typography variant="h6" fontWeight="bold" sx={{ color: 'white', fontSize: 22 }}>
                      Tiến độ học tập
                    </Typography>
                  </Stack>
                  <Box sx={{ mt: 2 }}>
                    {progress ? (
                      <>
                        {/* Bài học */}
                        <Typography variant="subtitle2" sx={{ color: 'white', mb: 0.5 }}>
                          Bài học đã hoàn thành
                    </Typography>
                        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 1 }}>
                          <LinearProgress
                            variant="determinate"
                            value={progress.lessonProgressPercentage}
                            sx={{ flex: 1, height: 12, borderRadius: 6, bgcolor: 'rgba(255,255,255,0.2)', '& .MuiLinearProgress-bar': { background: 'linear-gradient(90deg, #43e97b 0%, #38f9d7 100%)' } }}
                          />
                          <Typography variant="h6" fontWeight="bold" sx={{ color: 'white', minWidth: 60, textAlign: 'right' }}>
                            {progress.lessonProgressPercentage}%
                    </Typography>
                        </Stack>
                        <Typography variant="body2" sx={{ color: 'white', mb: 2 }}>
                          {progress.completedLessons}/{progress.totalLessons} bài học
                        </Typography>
                        {/* Bài tập */}
                        <Typography variant="subtitle2" sx={{ color: 'white', mb: 0.5 }}>
                          Bài tập đã hoàn thành
                        </Typography>
                        <Stack direction="row" alignItems="center" spacing={2}>
                          <LinearProgress
                            variant="determinate"
                            value={progress.assignmentProgressPercentage}
                            sx={{ flex: 1, height: 12, borderRadius: 6, bgcolor: 'rgba(255,255,255,0.2)', '& .MuiLinearProgress-bar': { background: 'linear-gradient(90deg, #fa709a 0%, #fee140 100%)' } }}
                          />
                          <Typography variant="h6" fontWeight="bold" sx={{ color: 'white', minWidth: 60, textAlign: 'right' }}>
                            {progress.assignmentProgressPercentage}%
                          </Typography>
                        </Stack>
                        <Typography variant="body2" sx={{ color: 'white' }}>
                          {progress.completedAssignments}/{progress.totalAssignments} bài tập
                        </Typography>
                        
                        {/* Certificate button when progress is 100% */}
                        {progress.lessonProgressPercentage === 100 && (
                          <Box sx={{ mt: 3 }}>
                            <Button
                              variant="contained"
                              onClick={hasCertificate ? handleViewCertificate : handleCreateCertificate}
                              startIcon={hasCertificate ? <EmojiEventsIcon /> : <CheckCircleIcon />}
                              disabled={loadingCertificate}
                              sx={{
                                width: '100%',
                                py: 1.5,
                                bgcolor: 'white',
                                color: 'success.main',
                                fontWeight: 'bold',
                                '&:hover': {
                                  bgcolor: 'rgba(255,255,255,0.9)',
                                },
                                boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
                                borderRadius: 2,
                              }}
                            >
                              {loadingCertificate ? (
                                <CircularProgress size={24} color="success" />
                              ) : hasCertificate ? (
                                "Xem Chứng Chỉ"
                              ) : (
                                "Nhận Chứng Chỉ"
                              )}
                            </Button>
                          </Box>
                        )}
                      </>
                    ) : (
                      <Typography variant="body1" sx={{ opacity: 0.9, color: 'white' }}>
                        Đang tải tiến độ...
                      </Typography>
                    )}
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card
              sx={{
                borderRadius: 4,
                background: (theme) =>
                  `linear-gradient(135deg, ${theme.palette.info.light} 0%, ${theme.palette.info.main} 100%)`,
                color: "white",
                height: "100%",
              }}
            >
              <CardContent>
                <Stack spacing={2}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <TipsAndUpdatesIcon sx={{ fontSize: 30 }} />
                    <Typography variant="h6" fontWeight="bold">
                      Mẹo học tập
                    </Typography>
                  </Stack>
                  <Box>
                    <Typography variant="body1" sx={{ opacity: 0.9, mb: 1 }}>
                      • Xem video bài giảng trước khi làm bài tập
                    </Typography>
                    <Typography variant="body1" sx={{ opacity: 0.9, mb: 1 }}>
                      • Ghi chú những điểm quan trọng
                    </Typography>
                    <Typography variant="body1" sx={{ opacity: 0.9 }}>
                      • Đặt câu hỏi nếu chưa hiểu rõ
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          {lectures.map((lecture) => {
            const assignment = assignments[lecture.id];
            const examResult = examResults[lecture.id];
            const isOpened = openedAssignments[lecture.id];
            return (
              <Grid item xs={12} md={12} key={lecture.id}>
                <Card
                  sx={{
                    borderRadius: 4,
                    boxShadow: (theme) => `0 8px 24px ${alpha(theme.palette.primary.main, 0.12)}`,
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  <CardContent sx={{ p: 4 }}>
                    <Stack spacing={3}>
                      {/* Tiêu đề bài giảng */}
                      <Typography
                        variant="h5"
                        fontWeight="bold"
                        sx={{
                          color: 'primary.main',
                          mb: 2,
                        }}
                      >
                        {lecture.title}
                      </Typography>

                      {/* Nội dung bài giảng */}
                      <Typography variant="body1" color="text.secondary">
                        {lecture.content}
                      </Typography>

                      {/* Tài liệu */}
                      {lecture.fileUrl && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <DescriptionIcon color="primary" />
                          <Link
                            href={lecture.fileUrl}
                            target="_blank"
                            rel="noopener"
                            sx={{
                              color: 'primary.main',
                              textDecoration: 'none',
                              '&:hover': {
                                textDecoration: 'underline',
                              },
                            }}
                          >
                            {lecture.fileUrl.split("/").pop()}
                          </Link>
                        </Box>
                      )}

                      {/* Video bài giảng */}
                      {lecture.videoUrls && lecture.videoUrls.length > 0 && (
                        <Box>
                          <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                            <VideoLibraryIcon color="primary" />
                            <Typography variant="h6" fontWeight="bold">
                              Video bài giảng
                            </Typography>
                          </Stack>
                          {lecture.videoUrls.map((videoUrl, index) => (
                            <Box
                              key={index}
                              sx={{
                                mb: 3,
                                borderRadius: 2,
                                overflow: 'hidden',
                                boxShadow: (theme) => `0 4px 12px ${alpha(theme.palette.primary.main, 0.1)}`,
                              }}
                            >
                              <CardMedia
                                component="video"
                                height="300"
                                controls
                                src={videoUrl}
                              />
                            </Box>
                          ))}
                        </Box>
                      )}

                      {/* Bài tập */}
                      {isOpened && assignment && assignmentIds[lecture.id] && selectedLectureId === lecture.id && (
                        <Box sx={{ mt: 3 }}>
                          <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                            <AssignmentIcon color="primary" />
                            <Typography variant="h6" fontWeight="bold">
                              Bài tập
                            </Typography>
                          </Stack>
                          {assignment.questions.map((question, index) => (
                            <Paper
                              key={index}
                              sx={{
                                p: 3,
                                mb: 2,
                                borderRadius: 2,
                                bgcolor: 'background.default',
                              }}
                            >
                              <Typography variant="subtitle1" fontWeight="bold" mb={2}>
                                Câu {index + 1}: {question.questionText}
                              </Typography>
                              <RadioGroup
                                value={userAnswers[index] || ""}
                                onChange={(e) => handleAnswerChange(index, e.target.value)}
                              >
                                {question.shuffledOptions.map((option, optionIndex) => (
                                  <FormControlLabel
                                    key={optionIndex}
                                    value={option}
                                    control={<Radio />}
                                    label={option}
                                    sx={{
                                      '& .MuiFormControlLabel-label': {
                                        color: 'text.secondary',
                                      },
                                    }}
                                  />
                                ))}
                              </RadioGroup>
                            </Paper>
                          ))}
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={handleSubmitExam}
                            startIcon={<SendIcon />}
                            sx={{
                              mt: 2,
                              borderRadius: 2,
                              textTransform: 'none',
                              px: 4,
                            }}
                          >
                            Nộp bài
                          </Button>
                        </Box>
                      )}

                      {/* Kết quả bài thi */}
                      {isOpened && examResult && (
                        <Box sx={{ mt: 3 }}>
                          <Paper
                            sx={{
                              p: 3,
                              borderRadius: 2,
                              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04),
                            }}
                          >
                            <Typography variant="h6" fontWeight="bold" color="primary" gutterBottom>
                              Điểm của bạn: {examResult.score}
                            </Typography>
                            {examResult.questionResults.map((result, index) => (
                              <Box
                                key={index}
                                sx={{
                                  mb: 2,
                                  p: 2,
                                  borderRadius: 2,
                                  bgcolor: result.correct ? alpha('#4caf50', 0.1) : alpha('#f44336', 0.1),
                                  border: '1px solid',
                                  borderColor: result.correct ? 'success.main' : 'error.main',
                                }}
                              >
                                <Typography variant="subtitle1" fontWeight="bold">
                                  Câu {index + 1}: {result.questionText}
                                </Typography>
                                <Typography
                                  variant="body2"
                                  sx={{
                                    color: result.correct ? 'success.main' : 'error.main',
                                    fontWeight: 'bold',
                                  }}
                                >
                                  Câu trả lời của bạn: {result.userAnswer}{" "}
                                  {result.correct ? "(Đúng)" : "(Sai)"}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  Đáp án đúng: {result.correctAnswer}
                                </Typography>
                              </Box>
                            ))}

                            {/* Nút nhận xét từ AI */}
                            <Button
                              variant="contained"
                              color="primary"
                              onClick={() => handleGetAIEvaluation(lecture.id)}
                              disabled={loadingAIEvaluation[lecture.id]}
                              startIcon={loadingAIEvaluation[lecture.id] ? <CircularProgress size={20} /> : <SmartToyIcon />}
                              sx={{
                                mt: 2,
                                borderRadius: 2,
                                textTransform: 'none',
                                px: 4,
                                py: 1.5,
                                background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                                boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
                                animation: 'pulse 2s infinite',
                                '@keyframes pulse': {
                                  '0%': {
                                    transform: 'scale(1)',
                                    boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
                                  },
                                  '50%': {
                                    transform: 'scale(1.05)',
                                    boxShadow: '0 5px 15px 2px rgba(33, 203, 243, .5)',
                                  },
                                  '100%': {
                                    transform: 'scale(1)',
                                    boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
                                  },
                                },
                                '&:hover': {
                                  background: 'linear-gradient(45deg, #1976D2 30%, #1E88E5 90%)',
                                  animation: 'none',
                                  transform: 'scale(1.05)',
                                },
                              }}
                            >
                              {loadingAIEvaluation[lecture.id] ? 'Đang xử lý...' : 'Nhận xét từ SkillHub AI'}
                            </Button>

                            {/* Hiển thị đánh giá AI */}
                            {aiEvaluations[lecture.id] && (
                              <Paper
                                sx={{
                                  mt: 2,
                                  p: 2,
                                  bgcolor: (theme) => alpha(theme.palette.info.main, 0.04),
                                  borderRadius: 2,
                                  animation: 'fadeIn 0.5s ease-in',
                                  '@keyframes fadeIn': {
                                    '0%': {
                                      opacity: 0,
                                      transform: 'translateY(10px)',
                                    },
                                    '100%': {
                                      opacity: 1,
                                      transform: 'translateY(0)',
                                    },
                                  },
                                }}
                              >
                                <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                                  <SmartToyIcon sx={{ mr: 1, color: 'primary.main' }} /> Đánh giá từ SkillHub AI
                                </Typography>
                                <Typography
                                  variant="body1"
                                  component="div"
                                  sx={{
                                    whiteSpace: 'pre-line',
                                    '& ul': { pl: 2 },
                                    '& li': { mb: 1 }
                                  }}
                                >
                                  {aiEvaluations[lecture.id]}
                                </Typography>
                              </Paper>
                            )}
                          </Paper>
                        </Box>
                      )}

                      {/* Nút làm bài tập */}
                      {!isOpened && !examResult && (
                        <Button
                          variant="outlined"
                          color="primary"
                          onClick={() => handleFetchAssignment(lecture.id)}
                          startIcon={<AssignmentIcon />}
                          sx={{
                            mt: 2,
                            borderRadius: 2,
                            textTransform: 'none',
                            px: 4,
                          }}
                        >
                          Xem bài tập
                        </Button>
                      )}

                      {/* Nút đánh dấu hoàn thành */}
                      {!lecture.completed && (
                        <Button
                          variant="contained"
                          color="success"
                          onClick={() => handleMarkAsCompleted(lecture.id)}
                          startIcon={
                            completionLoading[lecture.id] ? (
                              <CircularProgress size={20} color="inherit" />
                            ) : (
                              <CheckCircleIcon />
                            )
                          }
                          disabled={completionLoading[lecture.id]}
                          sx={{
                            mt: 2,
                            borderRadius: 2,
                            textTransform: 'none',
                            px: 4,
                            background: 'linear-gradient(45deg, #4CAF50 30%, #81C784 90%)',
                            boxShadow: '0 3px 5px 2px rgba(76, 175, 80, .3)',
                          }}
                        >
                          Đánh dấu hoàn thành
                        </Button>
                      )}

                      {/* Hiển thị trạng thái đã hoàn thành */}
                      {lecture.completed && (
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            color: 'success.main',
                            mt: 2,
                          }}
                        >
                          <CheckCircleIcon />
                          <Typography variant="body1" fontWeight="bold">
                            Đã hoàn thành
                          </Typography>
                        </Box>
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>

        {/* Phần đánh giá */}
        <Card
          sx={{
            mt: 4,
            borderRadius: 4,
            boxShadow: (theme) => `0 8px 24px ${alpha(theme.palette.primary.main, 0.12)}`,
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Stack spacing={3}>
              <Stack direction="row" spacing={2} alignItems="center">
                <StarIcon color="primary" />
                <Typography variant="h6" fontWeight="bold">
                  Đánh giá khóa học
                </Typography>
              </Stack>

              {hasRated ? (
                <Box>
                  <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                    Bạn đã đánh giá khóa học này
                  </Typography>
                  <Rating value={stars} readOnly />
                  <Typography variant="body1" sx={{ mt: 2 }}>
                    {comment}
                  </Typography>
                </Box>
              ) : (
                <Box>
                  <Rating
                    value={stars}
                    onChange={(event, newValue) => setStars(newValue)}
                    size="large"
                  />
                  <TextField
                    fullWidth
                    label="Nhận xét của bạn"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    multiline
                    rows={4}
                    sx={{
                      mt: 2,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      },
                    }}
                  />
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSubmitReview}
                    startIcon={<SendIcon />}
                    sx={{
                      mt: 2,
                      borderRadius: 2,
                      textTransform: 'none',
                      px: 4,
                    }}
                  >
                    Gửi đánh giá
                  </Button>
                </Box>
              )}
            </Stack>
          </CardContent>
        </Card>
      </Box>

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

      {/* Certificate Dialog */}
      <Dialog
        open={certificateDialogOpen}
        onClose={handleCloseCertificateDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ textAlign: 'center', fontWeight: 'bold', fontSize: 24 }}>
          Chứng chỉ hoàn thành khóa học
        </DialogTitle>
        <DialogContent>
          {certificateData && (
            <Box
              ref={certificateRef}
              sx={{
                p: 4,
                border: '10px solid #1976d2',
                borderRadius: 2,
                position: 'relative',
                background: 'linear-gradient(135deg, #ffffff 0%, #f5f7fa 100%)',
                textAlign: 'center',
                mb: 2,
                overflow: 'hidden',
              }}
            >
              <Box
                component="img"
                src="/logo/skilhublogo.png"
                alt="SkillHub Logo"
                sx={{
                  position: 'absolute',
                  top: '10px',
                  left: '10px',
                  width: '100px',
                  opacity: 0.3,
                }}
              />
              <Box
                component="img"
                src="/logo/skilhublogo.png"
                alt="SkillHub Logo"
                sx={{
                  position: 'absolute',
                  bottom: '10px',
                  right: '10px',
                  width: '100px',
                  opacity: 0.3,
                }}
              />
              <Typography variant="h4" color="primary" fontWeight="bold" sx={{ mb: 2 }}>
                CHỨNG CHỈ HOÀN THÀNH
              </Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                Số: {certificateData.certificateNumber}
              </Typography>
              <Typography variant="h5" fontWeight="bold" sx={{ mt: 3, mb: 1 }}>
                Xác nhận
              </Typography>
              <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
                {certificateData.studentName}
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                đã hoàn thành xuất sắc khóa học
              </Typography>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 3, color: 'primary.main' }}>
                "{certificateData.courseName}"
              </Typography>
              <Typography variant="body1" sx={{ mb: 3 }}>
                do {certificateData.instructorName} giảng dạy
              </Typography>
              <Typography variant="body2">
                Ngày cấp: {new Date(certificateData.issuedDate).toLocaleDateString('vi-VN')}
              </Typography>
              <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-around' }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="body2" fontWeight="bold">
                    GIÁM ĐỐC SKILLHUB
                  </Typography>
                  <Box
                    component="img"
                    src="/logo/chukigiamdoc.jpg" 
                    alt="Signature"
                    sx={{ height: '60px', mt: 1, mb: 1 }}
                  />
                  <Typography variant="body2" fontWeight="bold">
                  Rodrigo SkilHub
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="body2" fontWeight="bold">
                    GIẢNG VIÊN
                  </Typography>
                  <Box
                    component="img"
                    src="/logo/chikigiangvien.jpg" 
                    alt="Instructor Signature"
                    sx={{ height: '60px', mt: 1, mb: 1 }}
                  />
                  <Typography variant="body2" fontWeight="bold">
                    {certificateData.instructorName}
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<GetAppIcon />}
            onClick={handleDownloadCertificate}
            sx={{
              px: 4,
              py: 1.2,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 'bold',
            }}
          >
            Tải xuống chứng chỉ
          </Button>
        </DialogActions>
      </Dialog>
    </Scene>
  );
}
