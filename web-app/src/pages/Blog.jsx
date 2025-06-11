import { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  CardActions,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Snackbar,
  Alert,
  TextField,
  IconButton,
  Avatar,
  Stack,
  Chip,
} from "@mui/material";
import {
  getAllPosts,
  getCommentsByPostId,
  addComment,
  addInteraction,
  createPost,
  deletePost,
  getPostStats,
  getAuthorInfo,
} from "../services/blogService";
import Scene from "./Scene";
import { useProfile } from "../context/ProfileContext";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CloseIcon from "@mui/icons-material/Close";
import ReplyIcon from "@mui/icons-material/Reply";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import ShareIcon from "@mui/icons-material/Share";
import AssessmentIcon from "@mui/icons-material/Assessment";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import WarningIcon from "@mui/icons-material/Warning";
import { alpha } from "@mui/material/styles";

export default function Blog() {
  const [posts, setPosts] = useState([]);
  const [postStats, setPostStats] = useState({}); // Add state for post stats
  const [selectedPost, setSelectedPost] = useState(null); // Bài viết đang xem chi tiết
  const [comments, setComments] = useState({});
  const [newComment, setNewComment] = useState(""); // Bình luận mới cho bình luận cha
  const [newReplyComment, setNewReplyComment] = useState(""); // Bình luận mới cho phần trả lời
  const [replyCommentId, setReplyCommentId] = useState(null); // ID của comment đang được reply
  const [snackBarOpen, setSnackBarOpen] = useState(false);
  const [snackSeverity, setSnackSeverity] = useState("info");
  const [snackBarMessage, setSnackBarMessage] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false); // Trạng thái cho hộp thoại xóa
  const [detailDialogOpen, setDetailDialogOpen] = useState(false); // Trạng thái cho hộp thoại chi tiết bài viết
  const { profile, fetchProfile } = useProfile();
  const [postToDelete, setPostToDelete] = useState(null); // Bài viết được chọn để xóa
  const [authors, setAuthors] = useState({}); // State lưu thông tin tác giả

  // Trạng thái cho tạo bài viết
  const [createPostDialogOpen, setCreatePostDialogOpen] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostImage, setNewPostImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  // Mở form tạo bài viết
  const handleOpenCreatePostDialog = () => {
    setCreatePostDialogOpen(true);
  };

  // Đóng form tạo bài viết
  const handleCloseCreatePostDialog = () => {
    setCreatePostDialogOpen(false);
    setNewPostTitle("");
    setNewPostContent("");
    setNewPostImage(null);
    setPreviewImage(null);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setNewPostImage(selectedFile);
    if (selectedFile) {
      const objectUrl = URL.createObjectURL(selectedFile);
      setPreviewImage(objectUrl);
    }
  };

  // Mở hộp thoại xác nhận xóa
  const handleOpenDeleteDialog = (post) => {
    setPostToDelete(post); // Lưu bài viết được chọn để xóa
    setDeleteDialogOpen(true);   // Mở hộp thoại xóa
  };

  // Thực hiện việc xóa bài viết
  const handleDeletePost = async () => {
    try {
      await deletePost(postToDelete.postId); // Gọi API để xóa bài viết
      setSnackBarMessage("Xóa bài viết thành công!");
      setSnackSeverity("success");
      setSnackBarOpen(true);

      // Xóa bài viết khỏi giao diện sau khi xóa thành công
      setPosts(posts.filter((post) => post.postId !== postToDelete.postId));
    } catch (error) {
      setSnackBarMessage("Lỗi khi xóa bài viết!");
      setSnackSeverity("error");
      setSnackBarOpen(true);
    } finally {
      handleCloseDeleteDialog(); // Đóng hộp thoại xóa
    }
  };

  // Kiểm tra xem user hiện tại có quyền xóa bài viết không (là chủ bài viết hoặc là admin)
  const canDeletePost = (post) => {
    return profile?.profileId === post.authorId || profile?.roles.includes("ROLE_ADMIN");
  };

  // Đóng hộp thoại xóa
  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setPostToDelete(null); // Reset bài viết được chọn
  };

  const handleCreatePost = async () => {
    const formData = new FormData();
    formData.append("title", newPostTitle);
    formData.append("content", newPostContent);
    formData.append("authorId", profile.profileId);
    formData.append("image", newPostImage);

    try {
      await createPost(formData);
      setSnackBarMessage("Bài viết đã được tạo thành công!");
      setSnackSeverity("success");
      setSnackBarOpen(true);
      fetchPosts(); // Tải lại danh sách bài viết sau khi tạo
      handleCloseCreatePostDialog(); // Đóng form sau khi tạo thành công
    } catch (error) {
      setSnackBarMessage("Lỗi khi tạo bài viết!");
      setSnackSeverity("error");
      setSnackBarOpen(true);
    }
  };

  // Add function to fetch post stats
  const fetchPostStats = async (postId) => {
    try {
      const response = await getPostStats(postId);
      setPostStats(prev => ({
        ...prev,
        [postId]: response.data
      }));
    } catch (error) {
      console.error("Error fetching post stats:", error);
    }
  };

  // Hàm để lấy thông tin tác giả dựa trên userId
  const fetchAuthorInfo = async (userId) => {
    try {
      // Kiểm tra nếu đã lấy thông tin tác giả này rồi thì không cần lấy lại
      if (authors[userId]) return;
      
      const response = await getAuthorInfo(userId);
      setAuthors(prev => ({
        ...prev,
        [userId]: {
          name: `${response.data.firstName || ''} ${response.data.lastName || ''}`.trim(),
          avatar: response.data.avatarUrl
        }
      }));
    } catch (error) {
      console.error("Error fetching author info:", error);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // Lấy tất cả bài viết khi trang được load
  const fetchPosts = async () => {
    try {
      const response = await getAllPosts();
      setPosts(response.data);
      // Fetch stats for each post
      response.data.forEach(post => {
        fetchPostStats(post.postId);
        fetchAuthorInfo(post.authorId);
      });
    } catch (error) {
      setSnackBarMessage("Error fetching posts");
      setSnackSeverity("error");
      setSnackBarOpen(true);
    }
  };

  // Lấy bình luận cho mỗi bài viết khi nhấn "View More"
  const fetchComments = async (postId) => {
    try {
      const response = await getCommentsByPostId(postId);
      const groupedComments = groupCommentsByParent(response.data); // Group comments by parent-child relationship
      setComments((prev) => ({
        ...prev,
        [postId]: groupedComments,
      }));
      
      // Lấy thông tin tác giả cho mỗi bình luận
      response.data.forEach(comment => {
        fetchAuthorInfo(comment.authorId);
      });
    } catch (error) {
      setSnackBarMessage("Error fetching comments");
      setSnackSeverity("error");
      setSnackBarOpen(true);
    }
  };

  // Group comments by parent-child relationship
  const groupCommentsByParent = (comments) => {
    const commentMap = {};
    const grouped = [];

    comments.forEach((comment) => {
      commentMap[comment.commentId] = comment; // Map comment by ID
      comment.replies = []; // Initialize replies array
    });

    comments.forEach((comment) => {
      if (comment.commentParent) {
        // If it's a reply, attach it to the parent comment
        commentMap[comment.commentParent].replies.push(comment);
      } else {
        // If it's a parent comment, add it to the grouped list
        grouped.push(comment);
      }
    });

    return grouped;
  };

  const handleAddComment = async (postId, parentCommentId = null) => {
    const commentContent = parentCommentId ? newReplyComment : newComment; // Chọn nội dung bình luận phù hợp

    if (!commentContent) return;
    try {
      await addComment({
        postId,
        authorId: profile.profileId, // Thay thế bằng ID người dùng hiện tại
        content: commentContent,
        commentParent: parentCommentId, // Đặt parentCommentId nếu đang trả lời bình luận
      });

      // Reset giá trị sau khi gửi bình luận
      if (parentCommentId) {
        setNewReplyComment(""); // Reset bình luận trả lời
        setReplyCommentId(null); // Reset reply comment ID
      } else {
        setNewComment(""); // Reset bình luận cha
      }

      fetchComments(postId); // Tải lại danh sách bình luận
    } catch (error) {
      setSnackBarMessage("Error adding comment");
      setSnackSeverity("error");
      setSnackBarOpen(true);
    }
  };

  // Thêm Like hoặc Dislike
  const handleLikeDislike = async (postId, interactionType) => {
    try {
      await addInteraction({
        postId,
        interactionType,
        userId: profile.profileId, // Thay bằng ID người dùng hiện tại
      });
      setSnackBarMessage(
        `${interactionType === "like" ? "Liked" : "Disliked"} successfully!`
      );
      setSnackSeverity("success");
      setSnackBarOpen(true);
    } catch (error) {
      setSnackBarMessage("Error submitting interaction");
      setSnackSeverity("error");
      setSnackBarOpen(true);
    }
  };

  // Hiển thị chi tiết bài viết khi nhấn vào "View More" và mở Dialog chi tiết
  const handleViewMore = (post) => {
    setSelectedPost(post); // Lưu bài viết đang được chọn
    setDetailDialogOpen(true); // Mở Dialog chi tiết
    fetchComments(post.postId); // Lấy danh sách bình luận
  };

  // Đóng Dialog chi tiết bài viết
  const handleCloseDetailDialog = () => {
    setDetailDialogOpen(false);
    setSelectedPost(null);
  };

  // Đóng Snackbar
  const handleCloseSnackBar = () => setSnackBarOpen(false);

  // Chọn bình luận để trả lời
  const handleReply = (commentId) => {
    setReplyCommentId(commentId); // Chọn bình luận cha để reply
  };

  // Chỉnh sửa hàm renderComments
  const renderComments = (comments) => {
    return comments.map((comment) => (
      <Box
        key={comment.commentId}
        sx={{
          paddingLeft: comment.commentParent ? "40px" : "0",
          marginTop: "16px",
          position: 'relative',
          '&:before': comment.commentParent ? {
            content: '""',
            position: 'absolute',
            left: '20px',
            top: '20px',
            bottom: '0',
            width: '2px',
            backgroundColor: '#e0e0e0',
          } : {}
        }}
      >
        <Box
          sx={{
            backgroundColor: '#f5f5f5',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '8px'
          }}
        >
          {/* Header bình luận */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              marginBottom: "12px",
            }}
          >
            <Avatar
              src={authors[comment.authorId]?.avatar || "https://via.placeholder.com/40"}
              alt={authors[comment.authorId]?.name || "User"}
              sx={{
                width: 40,
                height: 40,
                marginRight: "12px",
              }}
            />
            <Box>
              <Typography 
                sx={{ 
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  color: '#1a237e'
                }}
              >
                {authors[comment.authorId]?.name || "User"}
              </Typography>
              <Typography 
                variant="caption" 
                sx={{ color: '#666' }}
              >
                {/* Thêm thời gian bình luận nếu có */}
                {comment.createdAt ? new Date(comment.createdAt).toLocaleDateString() : ''}
              </Typography>
            </Box>
          </Box>

          {/* Nội dung bình luận */}
          <Typography 
            sx={{ 
              fontSize: '0.95rem',
              color: '#333',
              whiteSpace: 'pre-wrap'
            }}
          >
            {comment.content}
          </Typography>

          {/* Nút trả lời */}
          <Button
            size="small"
            startIcon={<ReplyIcon />}
            onClick={() => handleReply(comment.commentId)}
            sx={{
              marginTop: '8px',
              textTransform: 'none',
              color: '#1976d2',
              '&:hover': {
                backgroundColor: 'rgba(25, 118, 210, 0.04)'
              }
            }}
          >
            Trả lời
          </Button>
        </Box>

        {/* Form trả lời bình luận */}
        {replyCommentId === comment.commentId && (
          <Box
            sx={{
              marginTop: '12px',
              marginLeft: '40px',
              marginBottom: '16px'
            }}
          >
            <TextField
              placeholder="Viết câu trả lời..."
              fullWidth
              multiline
              rows={2}
              value={newReplyComment}
              onChange={(e) => setNewReplyComment(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                  backgroundColor: '#fff',
                  '&:hover fieldset': {
                    borderColor: '#1976d2',
                  }
                }
              }}
            />
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '8px',
                marginTop: '8px'
              }}
            >
              <Button
                size="small"
                variant="outlined"
                onClick={() => setReplyCommentId(null)}
                sx={{
                  textTransform: 'none',
                  borderRadius: '6px'
                }}
              >
                Hủy
              </Button>
              <Button
                size="small"
                variant="contained"
                onClick={() => handleAddComment(selectedPost.postId, comment.commentId)}
                sx={{
                  textTransform: 'none',
                  borderRadius: '6px'
                }}
              >
                Gửi trả lời
              </Button>
            </Box>
          </Box>
        )}

        {/* Render các bình luận con */}
        {comment.replies && renderComments(comment.replies)}
      </Box>
    ));
  };

  return (
    <Scene>
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
        >
          {snackBarMessage}
        </Alert>
      </Snackbar>

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
              <AssessmentIcon sx={{ fontSize: 40 }} />
              <Typography variant="h4" fontWeight="bold">
                DIỄN ĐÀN
              </Typography>
            </Stack>
            <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
              Nơi chia sẻ và tương tác với cộng đồng
            </Typography>
          </Box>
        </Card>

        {/* Create Post Button */}
        <Box sx={{ mb: 6, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            onClick={handleOpenCreatePostDialog}
            startIcon={<AddIcon />}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              px: 3,
              py: 1,
              boxShadow: (theme) => `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`,
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: (theme) => `0 6px 16px ${alpha(theme.palette.primary.main, 0.3)}`,
              },
            }}
          >
            Tạo Bài Viết
          </Button>
        </Box>

        {/* Posts Grid */}
        <Grid container spacing={3}>
          {posts.map((post, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 3,
                  transition: 'all 0.3s ease',
                  boxShadow: (theme) => `0 4px 12px ${alpha(theme.palette.primary.main, 0.08)}`,
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: (theme) => `0 8px 24px ${alpha(theme.palette.primary.main, 0.15)}`,
                  },
                }}
              >
                <CardMedia
                  component="img"
                  height="200"
                  image={post.imageUrl || "https://via.placeholder.com/600"}
                  alt={post.title}
                  sx={{
                    objectFit: 'cover',
                    borderTopLeftRadius: '16px',
                    borderTopRightRadius: '16px',
                  }}
                />
                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                  <Typography
                    gutterBottom
                    variant="h6"
                    component="div"
                    sx={{
                      fontWeight: 600,
                      fontSize: '1.1rem',
                      mb: 2,
                      color: 'primary.main',
                    }}
                  >
                    {post.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      mb: 2,
                    }}
                  >
                    {post.content}
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ mt: 2, mb: 2 }}>
                    <Chip
                      icon={<ThumbUpIcon />}
                      label={`${postStats[post.postId]?.likeCount || 0} lượt thích`}
                      size="small"
                      sx={{ borderRadius: 1 }}
                    />
                    <Chip
                      icon={<AssessmentIcon />}
                      label={`${postStats[post.postId]?.commentCount || 0} bình luận`}
                      size="small"
                      sx={{ borderRadius: 1 }}
                    />
                  </Stack>
                  <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 'auto' }}>
                    <Avatar
                      src={authors[post.authorId]?.avatar || "https://via.placeholder.com/40"}
                      alt={authors[post.authorId]?.name || "User"}
                      sx={{ width: 32, height: 32 }}
                    />
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {authors[post.authorId]?.name || "User"}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(post.createdAt).toLocaleDateString('vi-VN')}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
                <CardActions sx={{ p: 2, pt: 0, gap: 1 }}>
                  <Button
                    size="small"
                    variant="contained"
                    onClick={() => handleViewMore(post)}
                    sx={{
                      borderRadius: 2,
                      textTransform: 'none',
                      flex: 1,
                    }}
                  >
                    Xem Thêm
                  </Button>
                  {canDeletePost(post) && (
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleOpenDeleteDialog(post)}
                      sx={{
                        borderRadius: 2,
                        '&:hover': {
                          backgroundColor: alpha('#d32f2f', 0.1),
                        },
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Detail Dialog */}
        {selectedPost && (
          <Dialog
            open={detailDialogOpen}
            onClose={handleCloseDetailDialog}
            fullWidth
            maxWidth="md"
            PaperProps={{
              sx: {
                borderRadius: 3,
                overflow: 'hidden',
              },
            }}
          >
            <DialogTitle
              sx={{
                background: (theme) =>
                  `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                color: 'white',
                p: 3,
              }}
            >
              <Stack direction="row" spacing={2} alignItems="center">
                <AssessmentIcon />
                <Typography variant="h5" fontWeight="bold">
                  {selectedPost.title}
                </Typography>
              </Stack>
            </DialogTitle>
            <DialogContent sx={{ p: 3 }}>
              {/* Post Header */}
              <Stack direction="row" spacing={2} alignItems="center" mb={3}>
                <Avatar
                  src={authors[selectedPost.authorId]?.avatar || "https://via.placeholder.com/40"}
                  sx={{ width: 48, height: 48 }}
                />
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {authors[selectedPost.authorId]?.name || "User"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {new Date(selectedPost.createdAt).toLocaleDateString('vi-VN')}
                  </Typography>
                </Box>
              </Stack>

              {/* Post Image */}
              <Box
                sx={{
                  position: 'relative',
                  width: '100%',
                  height: 400,
                  mb: 3,
                  borderRadius: 2,
                  overflow: 'hidden',
                  boxShadow: (theme) => `0 4px 12px ${alpha(theme.palette.primary.main, 0.1)}`,
                }}
              >
                <CardMedia
                  component="img"
                  image={selectedPost.imageUrl || "https://via.placeholder.com/800x400"}
                  alt={selectedPost.title}
                  sx={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              </Box>

              {/* Post Content */}
              <Typography
                variant="body1"
                sx={{
                  mb: 3,
                  lineHeight: 1.8,
                  whiteSpace: 'pre-wrap',
                }}
              >
                {selectedPost.content}
              </Typography>

              {/* Interaction Buttons */}
              <Stack direction="row" spacing={2} mb={3}>
                <Button
                  startIcon={<ThumbUpIcon />}
                  onClick={() => handleLikeDislike(selectedPost.postId, "like")}
                  sx={{
                    borderRadius: 2,
                    textTransform: 'none',
                    px: 3,
                  }}
                >
                  Thích
                </Button>
              </Stack>

              {/* Comments Section */}
              <Box>
                <Typography variant="h6" fontWeight="bold" mb={2}>
                  Bình luận
                </Typography>
                {comments[selectedPost.postId] && renderComments(comments[selectedPost.postId])}
                
                {/* Comment Form */}
                <Box sx={{ mt: 3 }}>
                  <TextField
                    placeholder="Viết bình luận của bạn..."
                    fullWidth
                    multiline
                    rows={3}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    sx={{
                      mb: 2,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      },
                    }}
                  />
                  <Button
                    variant="contained"
                    onClick={() => handleAddComment(selectedPost.postId)}
                    sx={{
                      borderRadius: 2,
                      textTransform: 'none',
                      px: 3,
                    }}
                  >
                    Gửi bình luận
                  </Button>
                </Box>
              </Box>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button onClick={handleCloseDetailDialog}>Đóng</Button>
            </DialogActions>
          </Dialog>
        )}

        {/* Create Post Dialog */}
        <Dialog
          open={createPostDialogOpen}
          onClose={handleCloseCreatePostDialog}
          fullWidth
          maxWidth="md"
          PaperProps={{
            sx: {
              borderRadius: 3,
              overflow: 'hidden',
            },
          }}
        >
          <DialogTitle
            sx={{
              background: (theme) =>
                `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              color: 'white',
              p: 3,
            }}
          >
            <Stack direction="row" spacing={2} alignItems="center">
              <AddIcon />
              <Typography variant="h5" fontWeight="bold">
                Tạo Bài Viết Mới
              </Typography>
            </Stack>
          </DialogTitle>
          <DialogContent sx={{ p: 3 }}>
            <TextField
              label="Tiêu đề bài viết"
              fullWidth
              value={newPostTitle}
              onChange={(e) => setNewPostTitle(e.target.value)}
              sx={{
                mb: 2,
                mt: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            />
            <TextField
              label="Nội dung bài viết"
              fullWidth
              multiline
              rows={6}
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            />
            <Button
              variant="outlined"
              component="label"
              startIcon={<CloudUploadIcon />}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                mb: 2,
              }}
            >
              Tải ảnh bài viết
              <input type="file" hidden onChange={handleFileChange} />
            </Button>
            {previewImage && (
              <Box
                sx={{
                  position: 'relative',
                  width: '100%',
                  height: 200,
                  borderRadius: 2,
                  overflow: 'hidden',
                  mb: 2,
                }}
              >
                <CardMedia
                  component="img"
                  image={previewImage}
                  alt="Preview"
                  sx={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
                <IconButton
                  onClick={() => {
                    setPreviewImage(null);
                    setNewPostImage(null);
                  }}
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    backgroundColor: 'rgba(255,255,255,0.8)',
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.9)',
                    },
                  }}
                >
                  <CloseIcon />
                </IconButton>
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={handleCloseCreatePostDialog}>Hủy</Button>
            <Button
              variant="contained"
              onClick={handleCreatePost}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                px: 3,
              }}
            >
              Đăng bài
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={handleCloseDeleteDialog}
          PaperProps={{
            sx: {
              borderRadius: 3,
            },
          }}
        >
          <DialogTitle sx={{ p: 3 }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <WarningIcon color="error" />
              <Typography variant="h6" fontWeight="bold">
                Xác nhận xóa bài viết
              </Typography>
            </Stack>
          </DialogTitle>
          <DialogContent sx={{ p: 3 }}>
            <Typography>
              Bạn có chắc chắn muốn xóa bài viết "{postToDelete?.title}" không?
            </Typography>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={handleCloseDeleteDialog}>Hủy</Button>
            <Button
              onClick={handleDeletePost}
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
      </Box>
    </Scene>
  );
}

