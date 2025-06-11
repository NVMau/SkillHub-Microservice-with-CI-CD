import * as React from "react";
import Divider from "@mui/material/Divider";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Toolbar from "@mui/material/Toolbar";
import HomeIcon from "@mui/icons-material/Home";
import AssignmentIcon from '@mui/icons-material/Assignment';
import AssessmentIcon from "@mui/icons-material/Assessment";
import ChatIcon from "@mui/icons-material/Chat";
import LocalLibraryIcon from "@mui/icons-material/LocalLibrary";
import { useNavigate } from "react-router-dom";
import useUserRoles from "../services/useUserRoles"; // Import custom hook
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import ForumIcon from '@mui/icons-material/Forum';
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import Collapse from "@mui/material/Collapse";
import Typography from "@mui/material/Typography";
import PsychologyIcon from '@mui/icons-material/Psychology';
import { Box, Stack, Chip, LinearProgress, Avatar } from "@mui/material";
import ContactSupportIcon from '@mui/icons-material/ContactSupport';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import FeedbackIcon from '@mui/icons-material/Feedback';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { useTheme } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';
import { useProfile } from "../context/ProfileContext";
import { getUserOverallProgress } from "../services/courseService";

function SideMenu() {
  const navigate = useNavigate();
  const userRoles = useUserRoles();
  const theme = useTheme();
  const { profile } = useProfile();
  const [openAdminMenu, setOpenAdminMenu] = React.useState(false);

  // State cho thống kê
  const [stats, setStats] = React.useState({
    coursesProgress: 0,
    completedLessons: 0,
    totalLessons: 0,
    completedAssignments: 0,
    totalAssignments: 0
  });

  // Fetch course progress
  React.useEffect(() => {
    const fetchCourseProgress = async () => {
      if (profile?.profileId) {
        try {
          const response = await getUserOverallProgress(profile.profileId);
          const data = response.data;
          const averageProgress = (data.lessonProgressPercentage + data.assignmentProgressPercentage) / 2;
          setStats(prev => ({
            ...prev,
            coursesProgress: Math.round(averageProgress),
            completedLessons: data.completedLessons,
            totalLessons: data.totalLessons,
            completedAssignments: data.completedAssignments,
            totalAssignments: data.totalAssignments
          }));
        } catch (error) {
          console.error("Error fetching course progress:", error);
        }
      } else {
        console.log('Chưa có profile.profileId, không gọi API tiến độ học tập');
      }
    };
    fetchCourseProgress();
  }, [profile?.profileId]);

  const handleAdminMenuClick = () => {
    setOpenAdminMenu(!openAdminMenu);
  };

  return (
    <>
      <Toolbar />
      
      <List>
        <ListItem key={"home"} disablePadding>
          <ListItemButton onClick={() => navigate("/")}>
            <ListItemIcon>
              <HomeIcon />
            </ListItemIcon>
            <ListItemText
              primary={"Trang chủ "}
              primaryTypographyProps={{ style: { fontWeight: "bold" } }}
            />
          </ListItemButton>
        </ListItem>
        {userRoles.includes("ROLE_STUDENT") ? (
          <ListItem key={"courses-student"} disablePadding>
            <ListItemButton onClick={() => navigate("/courses-student")}>
              <ListItemIcon>
                <LocalLibraryIcon />
              </ListItemIcon>
              <ListItemText
                primary={"Khóa học đã đăng kí"}
                primaryTypographyProps={{ style: { fontWeight: "bold" } }}
              />
            </ListItemButton>
          </ListItem>
        ) : null}

        {/* Hiển thị mục khóa học chỉ khi người dùng có ROLE_ADMIN hoặc ROLE_TEACHER */}
        {userRoles.includes("ROLE_ADMIN") ||
        userRoles.includes("ROLE_TEACHER") ? (
          <ListItem key={"createCourses"} disablePadding>
            <ListItemButton onClick={() => navigate("/createCourses")}>
              <ListItemIcon>
                <LocalLibraryIcon />
              </ListItemIcon>
              <ListItemText
                primary={"Tạo khóa học"}
                primaryTypographyProps={{ style: { fontWeight: "bold" } }}
              />
            </ListItemButton>
          </ListItem>
        ) : null}
        {userRoles.includes("ROLE_ADMIN")? (
          <ListItem key={"knowledge-management"} disablePadding>
            <ListItemButton onClick={() => navigate("/knowledge-management")}>
              <ListItemIcon>
                <LocalLibraryIcon />
              </ListItemIcon>
              <ListItemText
                primary={"Kiến thức AI"}
                primaryTypographyProps={{ style: { fontWeight: "bold" } }}
              />
            </ListItemButton>
          </ListItem>
        ) : null}


        {/* Hiển thị mục khóa học chỉ khi người dùng có ROLE_ADMIN hoặc ROLE_TEACHER */}
        {userRoles.includes("ROLE_ADMIN") ||
        userRoles.includes("ROLE_TEACHER") ? (
          <ListItem key={"courses-teacher"} disablePadding>
            <ListItemButton onClick={() => navigate("/courses-teacher")}>
              <ListItemIcon>
                <LocalLibraryIcon />
              </ListItemIcon>
              <ListItemText
                primary={"Chỉnh sửa khóa học"}
                primaryTypographyProps={{ style: { fontWeight: "bold" } }}
              />
            </ListItemButton>
          </ListItem>
        ) : null}

        {/* Khóa học Item */}
        {/* <ListItem key={"baitap"} disablePadding> */}
          {/* <ListItemButton> */}
            {/* <ListItemIcon> */}
              {/* Khóa học icon */}
              {/* <AssignmentTurnedInIcon /> */}
            {/* </ListItemIcon> */}
            {/* <ListItemText */}
              {/* primary={"Bài Tập"} */}
              {/* primaryTypographyProps={{ style: { fontWeight: "bold" } }} */}
            {/* /> */}
          {/* </ListItemButton> */}
        {/* </ListItem> */}

        {/* Khóa học Item */}
        <ListItem key={"chat-ai"} disablePadding>
          <ListItemButton onClick={() => navigate("/chat-ai")}>
            <ListItemIcon>
              {/* Khóa học icon */}
              <PsychologyIcon />
            </ListItemIcon>
            <ListItemText
              primary={"SKILL-HUB AI"}
              primaryTypographyProps={{ style: { fontWeight: "bold" } }}
            />
          </ListItemButton>
        </ListItem>


        {/* Khóa học Item */}
        <ListItem key={"chat"} disablePadding>
          <ListItemButton onClick={() => navigate("/chat")}>
            <ListItemIcon>
              {/* Khóa học icon */}
              <ChatIcon />
            </ListItemIcon>
            <ListItemText
              primary={"Trò truyện trực tuyến"}
              primaryTypographyProps={{ style: { fontWeight: "bold" } }}
            />
          </ListItemButton>
        </ListItem>

        {/* Khóa học Item */}
        {userRoles.includes("ROLE_TEACHER") ? (
        <ListItem key={"thongke"} disablePadding>
          <ListItemButton onClick={() => navigate("/teacher-statistics")}>
            <ListItemIcon>
              {/* Khóa học icon */}
              <AssessmentIcon />
            </ListItemIcon>
            <ListItemText
              primary={"Thống Kê"}
              primaryTypographyProps={{ style: { fontWeight: "bold" } }}
            />
          </ListItemButton>
        </ListItem>
         ) : null}

        <ListItem key={"blog"} disablePadding>
        <ListItemButton onClick={() => navigate("/blog")}>
            <ListItemIcon>
              {/* Khóa học icon */}
              <ForumIcon />
            </ListItemIcon>
            <ListItemText
              primary={"Diễn đàn"}
              primaryTypographyProps={{ style: { fontWeight: "bold" } }}
            />
          </ListItemButton>
        </ListItem>

        {userRoles.includes("ROLE_STUDENT") ? (
          <ListItem key={"my-certificates"} disablePadding>
            <ListItemButton onClick={() => navigate("/my-certificates")}>
              <ListItemIcon>
                <EmojiEventsIcon />
              </ListItemIcon>
              <ListItemText
                primary={"Chứng chỉ của tôi"}
                primaryTypographyProps={{ style: { fontWeight: "bold" } }}
              />
            </ListItemButton>
          </ListItem>
        ) : null}

        {userRoles.includes("ROLE_ADMIN") ? (
          <ListItem key={"admin-menu"} disablePadding>
          <ListItemButton onClick={handleAdminMenuClick}>
            <ListItemIcon>
              <AdminPanelSettingsIcon />
            </ListItemIcon>
            <ListItemText
              primary={"Quản lý web"}
              primaryTypographyProps={{ style: { fontWeight: "bold" } }}
            />
            {openAdminMenu ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>
        </ListItem>
          
        ) : null}



        {/* Quản lý web (nút chính) */}
        

        {/* Menu con của Quản lý web */}
        <Collapse in={openAdminMenu} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItemButton
              sx={{ pl: 5 }}
              onClick={() => navigate("/user-management")}
            >
              <ListItemText
                primary={
                  <Typography style={{ fontWeight: "bold" }}>
                    Quản lý người dùng 
                  </Typography>
                }
              />
            </ListItemButton>
            <ListItemButton
              sx={{ pl: 5 }}
              onClick={() => navigate("/course-management")}
            >
              <ListItemText
                primary={
                  <Typography style={{ fontWeight: "bold" }}>
                    Quản lý khóa học
                  </Typography>
                }
              />
            </ListItemButton>
            <ListItemButton
              sx={{ pl: 5 }}
              onClick={() => navigate("/statistics")}
            >
              <ListItemText
                primary={
                  <Typography style={{ fontWeight: "bold" }}>
                    Thống kê hệ thống 
                  </Typography>
                }
              />
            </ListItemButton>
            <ListItemButton
              sx={{ pl: 5 }}
              onClick={() => navigate("/payment-management")}
            >
              <ListItemText
                primary={
                  <Typography style={{ fontWeight: "bold" }}>
                    Quản lý thanh toán
                  </Typography>
                }
              />
            </ListItemButton>
            <ListItemButton
              sx={{ pl: 5 }}
              onClick={() => navigate("/course-enrollment-management")}
            >
              <ListItemText
                primary={
                  <Typography style={{ fontWeight: "bold" }}>
                    Quản lý đăng kí khoá học
                  </Typography>
                }
              />
            </ListItemButton>
          </List>
        </Collapse>

        <ListItem key={"profile"} disablePadding>
          <ListItemButton onClick={() => navigate("/profile")}>
            <ListItemIcon>
              <LocalLibraryIcon />
            </ListItemIcon>
            <ListItemText
              primary={"Thông tin cá nhân"}
              primaryTypographyProps={{ style: { fontWeight: "bold" } }}
            />
          </ListItemButton>
        </ListItem>
      </List>
      <Divider />
      
      {/* Thêm phần thống kê nhanh */}
      {userRoles.includes("ROLE_STUDENT") && (
      <Box sx={{ p: 2, mt: 2 }}>
        <Typography
          variant="subtitle2"
          sx={{ 
            fontWeight: 'bold', 
            mb: 2, 
            pl: 2,
            color: theme.palette.mode === 'dark' ? theme.palette.primary.light : theme.palette.primary.main
          }}
        >
          Tổng quan học tập
        </Typography>

        <Box sx={{ px: 2, mb: 3 }}>
          <Stack spacing={2}>
            {/* Tiến độ học tập */}
            <Box>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="body2" color="text.secondary">
                  Tiến độ học tập
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: theme.palette.mode === 'dark' ? theme.palette.primary.light : theme.palette.primary.main,
                    fontWeight: 'bold'
                  }}
                >
                  {stats.coursesProgress}%
                </Typography>
              </Stack>
              <LinearProgress 
                variant="determinate" 
                value={stats.coursesProgress}
                sx={{
                  height: 6,
                  borderRadius: 3,
                  bgcolor: theme.palette.mode === 'dark' 
                    ? alpha(theme.palette.primary.main, 0.2)
                    : alpha(theme.palette.primary.main, 0.1),
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 3,
                    bgcolor: theme.palette.mode === 'dark' 
                      ? theme.palette.primary.light 
                      : theme.palette.primary.main,
                  }
                }}
              />
            </Box>

            {/* Thành tích */}
            <Stack direction="column" spacing={1}>
              <Chip
                icon={<AssignmentIcon sx={{ fontSize: 18 }} />}
                label={`${stats.completedAssignments}/${stats.totalAssignments} bài tập đã làm`}
                size="small"
                sx={{
                  bgcolor: theme.palette.mode === 'dark' 
                    ? alpha(theme.palette.warning.main, 0.2)
                    : alpha(theme.palette.warning.main, 0.1),
                  color: theme.palette.mode === 'dark'
                    ? theme.palette.warning.light
                    : theme.palette.warning.dark,
                  '& .MuiChip-icon': {
                    color: theme.palette.mode === 'dark'
                      ? theme.palette.warning.light
                      : theme.palette.warning.main,
                  }
                }}
              />
              <Chip
                icon={<LocalLibraryIcon sx={{ fontSize: 18 }} />}
                label={`${stats.completedLessons}/${stats.totalLessons} bài học đã làm`}
                size="small"
                sx={{
                  bgcolor: theme.palette.mode === 'dark'
                    ? alpha(theme.palette.success.main, 0.2)
                    : alpha(theme.palette.success.main, 0.1),
                  color: theme.palette.mode === 'dark'
                    ? theme.palette.success.light
                    : theme.palette.success.dark,
                  '& .MuiChip-icon': {
                    color: theme.palette.mode === 'dark'
                      ? theme.palette.success.light
                      : theme.palette.success.main,
                  }
                }}
              />
            </Stack>
          </Stack>
        </Box>


        {/* Box chào mừng ở dưới cùng */}
        <Box sx={{
          width: '100%',
          borderRadius: 4,
          boxShadow: '0 1px 4px rgba(33, 150, 243, 0.04)',
          bgcolor: theme.palette.background.paper,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          px: 1.5,
          py: 1.5,
          mt: 2,
        }}>
          <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.13), width: 40, height: 40, mb: 1 }}>
            <LocalLibraryIcon sx={{ fontSize: 20, color: theme.palette.primary.main }} />
          </Avatar>
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: 700, mb: 0.5, color: theme.palette.primary.main, letterSpacing: 0.5, fontSize: 17 }}
          >
            Chào mừng bạn đến với SkillHub!
          </Typography>
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontSize: 13, maxWidth: 260, textAlign: 'center', lineHeight: 1.5 }}>
            Chúc bạn học tập hiệu quả và đạt nhiều thành tích mới.
          </Typography>
        </Box>

        {/* Liên kết nhanh sát dưới cùng */}
        <Box sx={{ mt: 'auto', mb: 1 }}>
          <Typography
            variant="subtitle2"
            sx={{ 
              fontWeight: 'bold', 
              mb: 2, 
              pl: 2,
              color: theme.palette.mode === 'dark' ? theme.palette.primary.light : theme.palette.primary.main
            }}
          >
            Liên kết nhanh
          </Typography>
          <Stack 
            direction="row" 
            spacing={1} 
            sx={{ 
              px: 2,
              flexWrap: 'wrap',
              '& > *': {
                mb: 1
              }
            }}
          >
            <Chip
              icon={<HelpOutlineIcon sx={{ fontSize: 18 }} />}
              label="Trợ giúp"
              size="small"
              onClick={() => navigate('/help')}
              sx={{
                bgcolor: theme.palette.mode === 'dark'
                  ? alpha(theme.palette.primary.main, 0.15)
                  : alpha(theme.palette.primary.main, 0.05),
                color: theme.palette.mode === 'dark'
                  ? theme.palette.primary.light
                  : theme.palette.primary.main,
                '&:hover': {
                  bgcolor: theme.palette.mode === 'dark'
                    ? alpha(theme.palette.primary.main, 0.25)
                    : alpha(theme.palette.primary.main, 0.1),
                }
              }}
            />
            <Chip
              icon={<ContactSupportIcon sx={{ fontSize: 18 }} />}
              label="Liên hệ"
              size="small"
              onClick={() => navigate('/contact')}
              sx={{
                bgcolor: theme.palette.mode === 'dark'
                  ? alpha(theme.palette.primary.main, 0.15)
                  : alpha(theme.palette.primary.main, 0.05),
                color: theme.palette.mode === 'dark'
                  ? theme.palette.primary.light
                  : theme.palette.primary.main,
                '&:hover': {
                  bgcolor: theme.palette.mode === 'dark'
                    ? alpha(theme.palette.primary.main, 0.25)
                    : alpha(theme.palette.primary.main, 0.1),
                }
              }}
            />
            <Chip
              icon={<FeedbackIcon sx={{ fontSize: 18 }} />}
              label="Góp ý"
              size="small"
              onClick={() => navigate('/feedback')}
              sx={{
                bgcolor: theme.palette.mode === 'dark'
                  ? alpha(theme.palette.primary.main, 0.15)
                  : alpha(theme.palette.primary.main, 0.05),
                color: theme.palette.mode === 'dark'
                  ? theme.palette.primary.light
                  : theme.palette.primary.main,
                '&:hover': {
                  bgcolor: theme.palette.mode === 'dark'
                    ? alpha(theme.palette.primary.main, 0.25)
                    : alpha(theme.palette.primary.main, 0.1),
                }
              }}
            />
          </Stack>
        </Box>
      </Box>
      )}
      {userRoles.includes("ROLE_TEACHER") && !userRoles.includes("ROLE_STUDENT") && (
        <Box sx={{
          width: '100%',
          borderRadius: 6,
          boxShadow: '0 2px 8px rgba(33, 150, 243, 0.06)',
          bgcolor: theme.palette.background.paper,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          px: 3,
          py: 4,
          mt: 0,
          mb: 2,
        }}>
          <Avatar sx={{ bgcolor: alpha(theme.palette.info.main, 0.13), width: 56, height: 56, mb: 1.5 }}>
            <LocalLibraryIcon sx={{ fontSize: 28, color: theme.palette.info.main }} />
          </Avatar>
          <Typography
            variant="h6"
            sx={{ fontWeight: 700, mb: 1, color: theme.palette.info.main, letterSpacing: 0.5 }}
          >
            Chào mừng giáo viên!
          </Typography>
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontSize: 15, maxWidth: 320, textAlign: 'center', lineHeight: 1.6 }}>
            Đây là giao diện dành cho giáo viên. Bạn có thể quản lý khóa học và theo dõi tiến độ học sinh tại đây.
          </Typography>
        </Box>
      )}
      {userRoles.includes("ROLE_ADMIN") && !userRoles.includes("ROLE_STUDENT") && !userRoles.includes("ROLE_TEACHER") && (
        <Box sx={{
          width: '100%',
          borderRadius: 6,
          boxShadow: '0 2px 8px rgba(255, 152, 0, 0.06)',
          bgcolor: theme.palette.background.paper,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          px: 3,
          py: 4,
          mt: 0,
          mb: 2,
        }}>
          <Avatar sx={{ bgcolor: alpha(theme.palette.warning.main, 0.13), width: 56, height: 56, mb: 1.5 }}>
            <AdminPanelSettingsIcon sx={{ fontSize: 28, color: theme.palette.warning.main }} />
          </Avatar>
          <Typography
            variant="h6"
            sx={{ fontWeight: 700, mb: 1, color: theme.palette.warning.main, letterSpacing: 0.5 }}
          >
            Chào mừng quản trị viên!
          </Typography>
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontSize: 15, maxWidth: 320, textAlign: 'center', lineHeight: 1.6 }}>
            Đây là giao diện dành cho quản trị viên. Bạn có thể quản lý hệ thống và người dùng tại đây.
          </Typography>
        </Box>
      )}

      {/* Footer */}
      <Box
        sx={{
          p: 2,
          position: 'absolute',
          bottom: 0,
          width: '100%',
          bgcolor: theme.palette.mode === 'dark'
            ? alpha(theme.palette.background.paper, 0.5)
            : theme.palette.background.paper,
          borderTop: '1px solid',
          borderColor: theme.palette.mode === 'dark'
            ? alpha(theme.palette.divider, 0.1)
            : theme.palette.divider,
        }}
      >
        <Stack spacing={1} alignItems="center">
          <Typography 
            variant="caption" 
            sx={{
              color: theme.palette.mode === 'dark'
                ? theme.palette.primary.light
                : theme.palette.primary.main,
              fontWeight: 500
            }}
          >
            SKILL-HUB Learning Platform
          </Typography>
          <Typography 
            variant="caption" 
            sx={{
              color: theme.palette.mode === 'dark'
                ? alpha(theme.palette.text.secondary, 0.8)
                : theme.palette.text.secondary
            }}
          >
            © 2024 Bản quyền thuộc về SKILL-HUB
          </Typography>
        </Stack>
      </Box>
    </>
  );
}

export default SideMenu;
