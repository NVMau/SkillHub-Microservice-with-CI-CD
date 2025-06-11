import { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Snackbar,
  Alert,
  Typography,
  Avatar,
  Paper,
  IconButton,
  CircularProgress,
  Tooltip,
  Fade,
  InputAdornment,
  Button,
} from "@mui/material";
import Scene from "./Scene";
import { sendChatAi } from "../services/chatAIService";
import { useProfile } from "../context/ProfileContext";
import { useNavigate } from "react-router-dom";
import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import AddIcon from '@mui/icons-material/Add';
import { useTheme } from "@mui/material/styles";
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import ReactMarkdown from 'react-markdown';

// Hình ảnh avatar GPT (bạn có thể thay thế bằng URL từ file bạn đã tải lên)
const gptAvatarUrl = "/logo/logo-ai.png";

const WELCOME_MESSAGE = {
  role: "assistant",
  content: "Xin chào! Tôi là SKILL-HUB AI, trợ lý ảo của bạn. Tôi có thể giúp bạn tìm hiểu về các kỹ năng, khóa học và kết nối với những người có cùng sở thích. Bạn cần giúp đỡ gì?",
  avatar: gptAvatarUrl,
  timestamp: new Date(),
};

export default function ChatAI() {
  const [inputMessage, setInputMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([WELCOME_MESSAGE]);
  const [snackBarOpen, setSnackBarOpen] = useState(false);
  const [snackBarMessage, setSnackBarMessage] = useState("");
  const [snackSeverity, setSnackSeverity] = useState("info");
  const [isTyping, setIsTyping] = useState(false);
  const { profile } = useProfile();
  const navigate = useNavigate();
  const theme = useTheme();

  // Khôi phục lịch sử chat từ sessionStorage khi load trang
  useEffect(() => {
    const saved = sessionStorage.getItem('aiChatHistory');
    if (saved) {
      setChatHistory(JSON.parse(saved));
    }
  }, []);

  // Lưu lịch sử chat vào sessionStorage mỗi khi chatHistory thay đổi
  useEffect(() => {
    sessionStorage.setItem('aiChatHistory', JSON.stringify(chatHistory));
  }, [chatHistory]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      role: "user",
      content: inputMessage,
      avatar: profile.avatarUrl,
      timestamp: new Date(),
    };
    setChatHistory((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsTyping(true);

    try {
      // Tạo mảng chatHistory để gửi đến API
      const historyCopy = chatHistory.map(msg => ({
        role: msg.role,
        content: msg.content
      }));
      
      const response = await sendChatAi(inputMessage, historyCopy);
      // Lấy phản hồi từ thuộc tính response
      const gptResponse = response.data.response || response.data;

      const assistantMessage = {
        role: "assistant",
        content: gptResponse,
        avatar: gptAvatarUrl,
        timestamp: new Date(),
      };
      setChatHistory((prev) => [...prev, assistantMessage]);

      // Xử lý chuyển hướng
      switch (true) {
        case gptResponse.includes("http://localhost:3000/chat"):
          navigate("/chat");
          break;
        case gptResponse.includes("http://localhost:3000/profile"):
          navigate("/profile");
          break;
        case gptResponse.includes("http://localhost:3000/blog"):
          navigate("/blog");
          break;
        case gptResponse.includes("http://localhost:3000/"):
          navigate("/");
          break;
      }
    } catch (error) {
      setSnackBarMessage("Không thể gửi tin nhắn. Vui lòng thử lại.");
      setSnackSeverity("error");
      setSnackBarOpen(true);
    } finally {
      setIsTyping(false);
    }
  };

  const handleCloseSnackBar = () => {
    setSnackBarOpen(false);
  };

  const handleNewChat = () => {
    setChatHistory([WELCOME_MESSAGE]);
    sessionStorage.removeItem('aiChatHistory');
  };

  return (
    <Scene>
      <Box
        sx={{
          height: "calc(100vh - 100px)",
          display: "flex",
          flexDirection: "column",
          p: 3,
          gap: 2,
        }}
      >
        {/* Header */}
        <Paper
          elevation={3}
          sx={{
            p: 3,
            borderRadius: "16px",
            backgroundColor: theme.palette.background.paper,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Avatar
              src={gptAvatarUrl}
              sx={{
                width: 56,
                height: 56,
                bgcolor: theme.palette.primary.main,
              }}
            >
              <SmartToyIcon />
            </Avatar>
            <Box>
              <Typography variant="h5" fontWeight="600">
                SKILL-HUB AI
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Trợ lý thông minh của bạn
              </Typography>
            </Box>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleNewChat}
            sx={{
              borderRadius: "12px",
              textTransform: "none",
              px: 3,
              py: 1,
              background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.primary.light} 90%)`,
              boxShadow: `0 3px 5px 2px ${theme.palette.primary.main}40`,
              '&:hover': {
                background: `linear-gradient(45deg, ${theme.palette.primary.dark} 30%, ${theme.palette.primary.main} 90%)`,
              }
            }}
          >
            Đoạn chat mới
          </Button>
        </Paper>

        {/* Chat Container */}
        <Paper
          elevation={3}
          sx={{
            flex: 1,
            borderRadius: "16px",
            backgroundColor: theme.palette.background.paper,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {/* Messages */}
          <Box
            sx={{
              flex: 1,
              overflowY: "auto",
              p: 3,
              backgroundColor: theme.palette.background.default,
            }}
          >
            {chatHistory.map((message, index) => (
              <Box
                key={index}
                sx={{
                  display: "flex",
                  flexDirection: message.role === "user" ? "row-reverse" : "row",
                  alignItems: "flex-start",
                  mb: 2,
                  gap: 1,
                }}
              >
                <Tooltip
                  title={message.role === "user" ? "Bạn" : "SKILL-HUB AI"}
                  placement={message.role === "user" ? "left" : "right"}
                >
                  <Avatar
                    src={message.avatar}
                    sx={{
                      width: 40,
                      height: 40,
                      bgcolor: message.role === "assistant" ? theme.palette.primary.main : undefined,
                    }}
                  >
                    {message.role === "assistant" && !message.avatar && <SmartToyIcon />}
                  </Avatar>
                </Tooltip>
                
                <Box
                  sx={{
                    maxWidth: "70%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: message.role === "user" ? "flex-end" : "flex-start",
                  }}
                >
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      backgroundColor: message.role === "user"
                        ? theme.palette.primary.main
                        : theme.palette.background.paper,
                      color: message.role === "user"
                        ? "white"
                        : theme.palette.text.primary,
                      borderRadius: "16px",
                      borderTopRightRadius: message.role === "user" ? "4px" : "16px",
                      borderTopLeftRadius: message.role === "user" ? "16px" : "4px",
                    }}
                  >
                    {message.role === "assistant" ? (
                      <ReactMarkdown
                        components={{
                          p: ({ node, ...props }) => (
                            <Typography sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', m: 0 }} {...props} />
                          )
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    ) : (
                      <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
                        {message.content}
                      </Typography>
                    )}
                  </Paper>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mt: 0.5 }}
                  >
                    {formatDistanceToNow(new Date(message.timestamp), {
                      addSuffix: true,
                      locale: vi,
                    })}
                  </Typography>
                </Box>
              </Box>
            ))}
            {isTyping && (
              <Box display="flex" alignItems="center" gap={1} ml={2}>
                <Avatar
                  src={gptAvatarUrl}
                  sx={{
                    width: 40,
                    height: 40,
                    bgcolor: theme.palette.primary.main,
                  }}
                >
                  <SmartToyIcon />
                </Avatar>
                <CircularProgress size={20} />
              </Box>
            )}
          </Box>

          {/* Input */}
          <Box
            component="form"
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            sx={{
              p: 2,
              borderTop: 1,
              borderColor: "divider",
              backgroundColor: theme.palette.background.paper,
            }}
          >
            <TextField
              fullWidth
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Nhập câu hỏi của bạn..."
              variant="outlined"
              disabled={isTyping}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Tooltip title="Gửi tin nhắn">
                      <IconButton
                        type="submit"
                        color="primary"
                        disabled={!inputMessage.trim() || isTyping}
                        sx={{
                          bgcolor: theme.palette.primary.main,
                          color: "white",
                          "&:hover": {
                            bgcolor: theme.palette.primary.dark,
                          },
                          "&.Mui-disabled": {
                            bgcolor: theme.palette.action.disabledBackground,
                          },
                        }}
                      >
                        <SendIcon />
                      </IconButton>
                    </Tooltip>
                  </InputAdornment>
                ),
                sx: {
                  borderRadius: "12px",
                  backgroundColor: theme.palette.background.default,
                },
              }}
            />
          </Box>
        </Paper>
      </Box>

      <Snackbar
        open={snackBarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackBar}
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
    </Scene>
  );
}  