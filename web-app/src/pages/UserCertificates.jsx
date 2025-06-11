import { useState, useEffect, useRef } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Stack,
  alpha,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import Scene from "./Scene";
import { getUserCertificates } from "../services/certificateService";
import { getMyProfile } from "../services/userService";
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import SchoolIcon from '@mui/icons-material/School';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import GetAppIcon from '@mui/icons-material/GetApp';
import VisibilityIcon from '@mui/icons-material/Visibility';

export default function UserCertificates() {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [certificateDialogOpen, setCertificateDialogOpen] = useState(false);
  const certificateRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const profileResponse = await getMyProfile();
        setProfile(profileResponse.data);
        
        if (profileResponse.data?.profileId) {
          const certificatesResponse = await getUserCertificates(profileResponse.data.profileId);
          setCertificates(certificatesResponse.data);
        }
      } catch (error) {
        console.error("Error fetching certificates:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleViewCertificate = (certificate) => {
    setSelectedCertificate(certificate);
    setCertificateDialogOpen(true);
  };

  const handleCloseCertificateDialog = () => {
    setCertificateDialogOpen(false);
    setSelectedCertificate(null);
  };

  const handleDownloadCertificate = () => {
    if (!certificateRef.current) return;
    
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
          pdf.save(`certificate-${selectedCertificate.courseName}.pdf`);
        });
      });
    });
  };

  if (loading) {
    return (
      <Scene>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <CircularProgress />
        </Box>
      </Scene>
    );
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
              <EmojiEventsIcon sx={{ fontSize: 40 }} />
              <Box>
                <Typography variant="h4" fontWeight="bold">
                  Chứng chỉ của tôi
                </Typography>
                <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
                  Danh sách các chứng chỉ đã đạt được
                </Typography>
              </Box>
            </Stack>
          </Box>
        </Card>

        {/* Certificates Grid */}
        <Grid container spacing={3}>
          {certificates.length === 0 ? (
            <Grid item xs={12}>
              <Card sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="h6" color="text.secondary">
                  Bạn chưa có chứng chỉ nào
                </Typography>
              </Card>
            </Grid>
          ) : (
            certificates.map((certificate) => (
              <Grid item xs={12} md={6} key={certificate.id}>
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
                      {/* Certificate Title */}
                      <Typography
                        variant="h5"
                        fontWeight="bold"
                        sx={{
                          color: 'primary.main',
                          mb: 2,
                        }}
                      >
                        {certificate.courseName}
                      </Typography>

                      {/* Certificate Details */}
                      <Stack spacing={2}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <SchoolIcon color="primary" />
                          <Typography variant="body1">
                            Giảng viên: {certificate.instructorName}
                          </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CalendarTodayIcon color="primary" />
                          <Typography variant="body1">
                            Ngày cấp: {new Date(certificate.issuedDate).toLocaleDateString('vi-VN')}
                          </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <EmojiEventsIcon color="primary" />
                          <Typography variant="body1">
                            Mã chứng chỉ: {certificate.certificateNumber}
                          </Typography>
                        </Box>
                      </Stack>

                      {/* View Certificate Button */}
                      <Button
                        variant="contained"
                        color="primary"
                        startIcon={<VisibilityIcon />}
                        onClick={() => handleViewCertificate(certificate)}
                        sx={{
                          mt: 2,
                          borderRadius: 2,
                          textTransform: 'none',
                          px: 4,
                          background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                          boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
                        }}
                      >
                        Xem chứng chỉ
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      </Box>

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
          {selectedCertificate && (
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
                Số: {selectedCertificate.certificateNumber}
              </Typography>
              <Typography variant="h5" fontWeight="bold" sx={{ mt: 3, mb: 1 }}>
                Xác nhận
              </Typography>
              <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
                {selectedCertificate.studentName}
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                đã hoàn thành xuất sắc khóa học
              </Typography>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 3, color: 'primary.main' }}>
                "{selectedCertificate.courseName}"
              </Typography>
              <Typography variant="body1" sx={{ mb: 3 }}>
                do {selectedCertificate.instructorName} giảng dạy
              </Typography>
              <Typography variant="body2">
                Ngày cấp: {new Date(selectedCertificate.issuedDate).toLocaleDateString('vi-VN')}
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
                    {selectedCertificate.instructorName}
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