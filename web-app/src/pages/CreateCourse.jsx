import { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Snackbar,
  Alert,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Card,
  Stack,
  IconButton,
  Chip,
  alpha,
  Tooltip,
  Divider,
} from "@mui/material";
import {
  Add as AddIcon,
  Close as CloseIcon,
  CloudUpload as CloudUploadIcon,
  School as SchoolIcon,
  LocalOffer as TagIcon,
  Description as DescriptionIcon,
  AttachMoney as MoneyIcon,
  Person as PersonIcon,
} from "@mui/icons-material";
import Scene from "./Scene";
import { getTeachers, createCourse } from "../services/courseService"; // Thay thế bằng courseService đã cấu hình sẵn
import useUserRoles from "../services/useUserRoles"; // Import custom hook
import { useProfile } from "../context/ProfileContext"; // Import useProfile



export default function CreateCourse() {
  const { profile, fetchProfile } = useProfile();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState([]); // Bắt đầu với một mảng rỗng
  const [teacherId, setTeacherId] = useState(""); // Lưu profileId thay vì userId
  const [file, setFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null); // Để hiển thị ảnh xem trước
  const [teachers, setTeachers] = useState([]); // Lưu danh sách giáo viên
  const [snackBarOpen, setSnackBarOpen] = useState(false);
  const [snackSeverity, setSnackSeverity] = useState("info");
  const [snackBarMessage, setSnackBarMessage] = useState("");
  const userRoles = useUserRoles();

  const handleCloseSnackBar = () => {
    setSnackBarOpen(false);
  };

  // Lấy danh sách giáo viên khi component được mount
  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const response = await getTeachers(); // Sử dụng service để lấy danh sách giáo viên
        setTeachers(response.data);
      } catch (error) {
        console.error("Error fetching teachers", error);
      }
    };

    fetchTeachers();
  }, []);

  // Hiển thị ảnh xem trước khi người dùng chọn file ảnh
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);

    // Hiển thị ảnh xem trước
    if (selectedFile) {
      const objectUrl = URL.createObjectURL(selectedFile);
      setPreviewImage(objectUrl);
    }
  };

  const handleTagChange = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault(); // Ngăn không cho nhập thêm
      const newTag = e.target.value.trim();
      if (newTag) {
        setTags((prevTags) => [...prevTags, newTag]); // Thêm tag mới vào mảng
        e.target.value = ""; // Xóa trường nhập
      }
    }
  };
  const handleDeleteTag = (tagToDelete) => {
    setTags((prevTags) => prevTags.filter((tag) => tag !== tagToDelete)); // Xóa tag khỏi danh sách
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("price", price);
    formData.append("category", category);
    formData.append("tags", JSON.stringify(tags));
    formData.append("teacherId", teacherId || profile.profileId); // profileId của giáo viên được chọn
    formData.append("file", file);

    try {
      await createCourse(formData); // Gọi API tạo khóa học
      setSnackSeverity("success");
      setSnackBarMessage("Course created successfully!");
      setSnackBarOpen(true);
    } catch (error) {
      setSnackSeverity("error");
      setSnackBarMessage(
        error.response?.data?.message || "Failed to create course"
      );
      setSnackBarOpen(true);
    }
  };

  return (
    <Scene>
      <Box sx={{ p: 3, maxWidth: 800, mx: "auto" }}>
        {/* Header Card */}
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
          <Box sx={{ p: 3 }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <SchoolIcon sx={{ fontSize: 40 }} />
              <Typography variant="h4" fontWeight="bold">
                Tạo khóa học mới
              </Typography>
            </Stack>
          </Box>
        </Card>

        {/* Main Form Card */}
        <Card
          component="form"
          onSubmit={handleSubmit}
          sx={{
            borderRadius: 4,
            boxShadow: (theme) => `0 8px 32px ${alpha(theme.palette.primary.main, 0.1)}`,
            overflow: "hidden",
          }}
        >
          <Box sx={{ p: 3 }}>
            <Stack spacing={3}>
              {/* Course Name */}
              <TextField
                label="Tên khóa học"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                fullWidth
                InputProps={{
                  startAdornment: <SchoolIcon color="action" sx={{ mr: 1 }} />,
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  },
                }}
              />

              {/* Description */}
              <TextField
                label="Mô tả khóa học"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                multiline
                rows={4}
                fullWidth
                InputProps={{
                  startAdornment: <DescriptionIcon color="action" sx={{ mr: 1, mt: 1 }} />,
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  },
                }}
              />

              {/* Price */}
              <TextField
                label="Giá khóa học"
                value={price}
                onChange={(e) => {
                  // Cho phép nhập chuỗi trống hoặc số dương
                  const value = e.target.value;
                  if (value === '' || /^\d+$/.test(value)) {
                    setPrice(value);
                  }
                }}
                required
                type="number"
                fullWidth
                inputProps={{
                  min: 0
                }}
                InputProps={{
                  startAdornment: <MoneyIcon color="action" sx={{ mr: 1 }} />,
                  endAdornment: <Typography color="text.secondary" variant="body2">COIN</Typography>
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  },
                  "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button": {
                    display: "none",
                  },
                  "& input[type=number]": {
                    MozAppearance: "textfield"
                  }
                }}
                helperText="Giá khóa học phải lớn hơn hoặc bằng 0"
              />

              {/* Category Selection */}
              <FormControl fullWidth required>
                <InputLabel id="category-label">Danh mục khóa học</InputLabel>
                <Select
                  labelId="category-label"
                  value={category}
                  label="Danh mục khóa học"
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <MenuItem value="Lập Trình">Lập Trình</MenuItem>
                  <MenuItem value="Thiết Kế">Thiết Kế</MenuItem>
                  <MenuItem value="Marketing">Marketing</MenuItem>
                  <MenuItem value="Kinh Doanh">Kinh Doanh</MenuItem>
                  <MenuItem value="Ngoại Ngữ">Ngoại Ngữ</MenuItem>
                  <MenuItem value="Phát Triển Cá Nhân">Phát Triển Cá Nhân</MenuItem>
                  <MenuItem value="Khác">Khác</MenuItem>
                </Select>
              </FormControl>

              {/* Tags Section */}
              <Box>
                <TextField
                  label="Tags"
                  placeholder="Nhấn Enter hoặc dấu phẩy để thêm tag"
                  onKeyDown={handleTagChange}
                  fullWidth
                  InputProps={{
                    startAdornment: <TagIcon color="action" sx={{ mr: 1 }} />,
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                    },
                  }}
                />
                <Stack
                  direction="row"
                  spacing={1}
                  flexWrap="wrap"
                  sx={{ mt: 2, gap: 1 }}
                >
                  {tags.map((tag, index) => (
                    <Chip
                      key={index}
                      label={tag}
                      onDelete={() => handleDeleteTag(tag)}
                      color="primary"
                      variant="outlined"
                      size="small"
                    />
                  ))}
                </Stack>
              </Box>

              {/* Teacher Selection */}
              {userRoles.includes("ROLE_ADMIN") ? (
                <FormControl fullWidth required>
                  <InputLabel id="teacher-select-label">Chọn giáo viên</InputLabel>
                  <Select
                    labelId="teacher-select-label"
                    value={teacherId}
                    onChange={(e) => setTeacherId(e.target.value)}
                    label="Chọn giáo viên"
                    startAdornment={<PersonIcon color="action" sx={{ ml: 1, mr: 1 }} />}
                    sx={{
                      borderRadius: 2,
                    }}
                  >
                    {teachers.map((teacher) => (
                      <MenuItem key={teacher.profileId} value={teacher.profileId}>
                        <Stack direction="row" spacing={2} alignItems="center">
                          <PersonIcon />
                          <Typography>
                            {teacher.firstName} {teacher.lastName}
                          </Typography>
                        </Stack>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              ) : (
                <Stack
                  direction="row"
                  spacing={2}
                  alignItems="center"
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                  }}
                >
                  <PersonIcon color="primary" />
                  <Typography>
                    Giảng viên: {profile ? `${profile.firstName} ${profile.lastName}` : "Chưa xác định"}
                  </Typography>
                </Stack>
              )}

              {/* Image Upload Section */}
              <Box>
                <Button
                  variant="outlined"
                  component="label"
                  fullWidth
                  startIcon={<CloudUploadIcon />}
                  sx={{
                    borderRadius: 2,
                    p: 1.5,
                    borderStyle: "dashed",
                    borderWidth: 2,
                  }}
                >
                  Tải ảnh cho khóa học
                  <input type="file" hidden onChange={handleFileChange} />
                </Button>

                {previewImage && (
                  <Box sx={{ mt: 2, position: "relative" }}>
                    <Box
                      component="img"
                      src={previewImage}
                      alt="Preview"
                      sx={{
                        width: "100%",
                        height: "auto",
                        borderRadius: 2,
                        boxShadow: (theme) => `0 4px 12px ${alpha(theme.palette.primary.main, 0.1)}`,
                      }}
                    />
                    <IconButton
                      onClick={() => {
                        setPreviewImage(null);
                        setFile(null);
                      }}
                      sx={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        bgcolor: "white",
                        "&:hover": { bgcolor: "white" },
                      }}
                    >
                      <CloseIcon />
                    </IconButton>
                  </Box>
                )}
              </Box>

              <Divider />

              {/* Submit Button */}
              <Button
                variant="contained"
                type="submit"
                size="large"
                startIcon={<AddIcon />}
                sx={{
                  borderRadius: 2,
                  p: 1.5,
                  boxShadow: (theme) => `0 8px 16px ${alpha(theme.palette.primary.main, 0.2)}`,
                }}
              >
                Tạo khóa học
              </Button>
            </Stack>
          </Box>
        </Card>
      </Box>

      <Snackbar
        open={snackBarOpen}
        onClose={handleCloseSnackBar}
        autoHideDuration={6000}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackBar}
          severity={snackSeverity}
          variant="filled"
          sx={{ borderRadius: 2 }}
        >
          {snackBarMessage}
        </Alert>
      </Snackbar>
    </Scene>
  );
}
