import { useState, useEffect } from "react";
import {
  Box,
  Card,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  Avatar,
  Paper,
  Divider,
  IconButton,
  Tooltip,
  Fade,
  Grid,
} from "@mui/material";
import {
  getMyProfile,
  updateUserProfile,
  updateAvatar,
} from "../services/userService";
import Scene from "./Scene";
import EditIcon from '@mui/icons-material/Edit';
import EmailIcon from '@mui/icons-material/Email';
import BadgeIcon from '@mui/icons-material/Badge';
import CakeIcon from '@mui/icons-material/Cake';
import PersonIcon from '@mui/icons-material/Person';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import LocationOnIcon from '@mui/icons-material/LocationOn';

export default function Profile() {
  const [profile, setProfile] = useState({});
  const [editMode, setEditMode] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [previewAvatar, setPreviewAvatar] = useState(null);
  const [snackBarOpen, setSnackBarOpen] = useState(false);
  const [snackSeverity, setSnackSeverity] = useState("info");
  const [snackBarMessage, setSnackBarMessage] = useState("");

  const handleCloseSnackBar = () => setSnackBarOpen(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setPreviewAvatar(URL.createObjectURL(file));
    }
  };

  const getProfile = async () => {
    try {
      const response = await getMyProfile();
      setProfile(response.data);
    } catch (error) {
      setSnackSeverity("error");
      setSnackBarMessage("Lỗi khi lấy thông tin người dùng");
      setSnackBarOpen(true);
    }
  };

  useEffect(() => {
    getProfile();
  }, []);

  const handleUpdateProfile = async () => {
    try {
      await updateUserProfile(profile);
      if (avatarFile) {
        const formData = new FormData();
        formData.append("avatar", avatarFile);
        await updateAvatar(profile.profileId, formData);
      }
      setSnackSeverity("success");
      setSnackBarMessage("Cập nhật thông tin thành công!");
      setEditMode(false);
      getProfile();
    } catch (error) {
      setSnackSeverity("error");
      setSnackBarMessage("Lỗi khi cập nhật thông tin");
    } finally {
      setSnackBarOpen(true);
    }
  };

  const InfoItem = ({ icon, label, value }) => (
    <Box sx={{ 
      display: 'flex', 
      alignItems: 'center',
      p: 1.5, 
      mb: 0.5,
      borderRadius: 2,
      bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
      '&:hover': {
        bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
      },
    }}>
      <Box sx={{ 
        mr: 2, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(33, 150, 243, 0.2)' : 'rgba(33, 150, 243, 0.1)',
        p: 1,
        borderRadius: 2
      }}>
      {icon}
      </Box>
      <Box>
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', fontWeight: 500 }}>
          {label}
        </Typography>
        <Typography variant="body1" sx={{ fontWeight: 500 }}>
          {value || "Chưa cập nhật"}
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Scene>
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

      <Box
        sx={{
          maxWidth: 800,
          mx: "auto",
          p: 3,
          width: "100%",
        }}
      >
        <Paper
          elevation={3}
          sx={{
            borderRadius: 4,
            overflow: 'hidden',
          }}
        >
          {/* Header với Avatar */}
          <Box
            sx={{
              position: 'relative',
              height: 220,
              background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
              backgroundImage: 'url(/profile-bg.jpg)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundBlendMode: 'overlay',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              color: 'white',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(45deg, rgba(33, 150, 243, 0.8) 30%, rgba(33, 203, 243, 0.8) 90%)',
                zIndex: 0,
              }
            }}
          >
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Avatar
                src={previewAvatar || profile.avatarUrl}
                sx={{
                  width: 130,
                  height: 130,
                  border: '4px solid white',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                  bgcolor: (theme) => theme.palette.mode === 'dark' ? 'grey.800' : 'grey.200',
                  transition: 'transform 0.3s ease',
                  '&:hover': {
                    transform: 'scale(1.05)',
                  }
                }}
              >
                {!profile.avatarUrl && <PersonIcon sx={{ fontSize: 70, color: (theme) => theme.palette.mode === 'dark' ? 'grey.300' : 'grey.700' }} />}
              </Avatar>
              <Tooltip title="Thay đổi ảnh đại diện">
                <IconButton
                  component="label"
                  sx={{
                    position: 'absolute',
                    bottom: 5,
                    right: 5,
                    backgroundColor: 'white',
                    color: 'primary.main',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                    transition: 'transform 0.2s',
                    '&:hover': { 
                      backgroundColor: 'white',
                      transform: 'scale(1.1)',
                    },
                  }}
                >
                  <input type="file" hidden onChange={handleFileChange} accept="image/*" />
                  <PhotoCameraIcon />
                </IconButton>
              </Tooltip>
            </Box>
            <Typography variant="h5" sx={{ mt: 2, fontWeight: 600, textShadow: '0 2px 4px rgba(0,0,0,0.2)', zIndex: 1 }}>
              {profile.firstName} {profile.lastName}
            </Typography>
          </Box>

          {/* Thông tin chi tiết */}
          <Box sx={{ p: 4 }}>
            <Grid container>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Thông tin cá nhân
                </Typography>
                  <Tooltip title="Chỉnh sửa thông tin">
                    <IconButton 
                      onClick={() => setEditMode(true)} 
                      sx={{ 
                        color: (theme) => theme.palette.mode === 'dark' ? theme.palette.primary.light : theme.palette.primary.main 
                      }}
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <InfoItem
                  icon={<BadgeIcon sx={{ color: (theme) => theme.palette.mode === 'dark' ? theme.palette.primary.light : theme.palette.primary.main }} />}
                  label="Username"
                  value={profile.username}
                />
                <InfoItem
                  icon={<EmailIcon sx={{ color: (theme) => theme.palette.mode === 'dark' ? theme.palette.primary.light : theme.palette.primary.main }} />}
                  label="Email"
                  value={profile.email}
                />
                <InfoItem
                  icon={<PersonIcon sx={{ color: (theme) => theme.palette.mode === 'dark' ? theme.palette.primary.light : theme.palette.primary.main }} />}
                  label="Họ và tên"
                  value={`${profile.firstName || ''} ${profile.lastName || ''}`}
                />
                <InfoItem
                  icon={<CakeIcon sx={{ color: (theme) => theme.palette.mode === 'dark' ? theme.palette.primary.light : theme.palette.primary.main }} />}
                  label="Ngày sinh"
                  value={profile.dob}
                />
                  <InfoItem
                    icon={<LocationOnIcon sx={{ color: (theme) => theme.palette.mode === 'dark' ? theme.palette.primary.light : theme.palette.primary.main }} />}
                    label="Địa chỉ"
                    value={profile.address}
                  />
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Box>

      {/* Dialog chỉnh sửa thông tin */}
      <Dialog 
        open={editMode} 
        onClose={() => setEditMode(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          }
        }}
      >
        <DialogTitle 
          sx={{ 
            pb: 2,
            pt: 3,
            background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
            color: 'white',
            textAlign: 'center',
            fontSize: '1.5rem',
            fontWeight: 600,
            position: 'relative'
          }}
        >
          <PersonIcon sx={{ fontSize: 40, mb: 1, opacity: 0.9 }} />
          <Typography variant="h5" sx={{ mt: 1 }}>
            Chỉnh sửa thông tin cá nhân
          </Typography>
          <IconButton
            onClick={() => setEditMode(false)}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: 'white',
              '&:hover': {
                background: 'rgba(255,255,255,0.1)'
              }
            }}
          >
            <CancelIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent 
          sx={{ 
            pt: 5,
            pb: 5,
            px: 4,
            background: '#f8f9fa'
          }}
        >
          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
            </Typography>
          </Box>
          <Grid container spacing={4}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Họ"
                fullWidth
                value={profile.firstName || ""}
                onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                variant="outlined"
                InputProps={{
                  sx: {
                    background: 'white',
                    '&:hover': {
                      background: 'white'
                    }
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Tên"
                fullWidth
                value={profile.lastName || ""}
                onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                variant="outlined"
                InputProps={{
                  sx: {
                    background: 'white',
                    '&:hover': {
                      background: 'white'
                    }
                  }
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Ngày sinh"
                type="date"
                fullWidth
                InputLabelProps={{ 
                  shrink: true,
                  sx: { 
                    color: 'text.primary',
                    '&.Mui-focused': {
                      color: 'primary.main'
                    }
                  }
                }}
                value={profile.dob || ""}
                onChange={(e) => setProfile({ ...profile, dob: e.target.value })}
                variant="outlined"
                InputProps={{
                  startAdornment: (
                    <CakeIcon color="action" sx={{ mr: 1 }} />
                  ),
                  sx: {
                    background: 'white',
                    '&:hover': {
                      background: 'white'
                    }
                  }
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Địa chỉ"
                fullWidth
                multiline
                rows={2}
                value={profile.address || ""}
                onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                variant="outlined"
                InputProps={{
                  startAdornment: (
                    <LocationOnIcon color="action" sx={{ mr: 1, mt: 1 }} />
                  ),
                  sx: {
                    background: 'white',
                    '&:hover': {
                      background: 'white'
                    }
                  }
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions 
          sx={{ 
            p: 3,
            background: '#f8f9fa',
            borderTop: '1px solid #e9ecef',
            justifyContent: 'center',
            gap: 2
          }}
        >
          <Button
            variant="outlined"
            onClick={() => setEditMode(false)}
            startIcon={<CancelIcon />}
            sx={{
              borderRadius: 2,
              px: 4,
              py: 1,
              borderColor: '#e9ecef',
              color: 'text.secondary',
              '&:hover': {
                borderColor: 'primary.main',
                background: 'rgba(33, 150, 243, 0.04)'
              }
            }}
          >
            Hủy
          </Button>
          <Button
            variant="contained"
            onClick={handleUpdateProfile}
            startIcon={<SaveIcon />}
            sx={{
              borderRadius: 2,
              px: 4,
              py: 1,
              background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
              boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
              '&:hover': {
                background: 'linear-gradient(45deg, #1976D2 30%, #21CBF3 90%)',
              }
            }}
          >
            Lưu thay đổi
          </Button>
        </DialogActions>
      </Dialog>
    </Scene>
  );
}
