import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Dialog,
  IconButton,
  Avatar,
  Typography,
  Snackbar,
  Alert,
  useTheme,
} from "@mui/material";
import ChatIcon from "@mui/icons-material/Chat";
import { sendChatAi } from "../services/chatAIService";
import { useProfile } from "../context/ProfileContext";
import { useNavigate } from "react-router-dom";

// Hình ảnh avatar GPT
const gptAvatarUrl = "/logo/logo-ai.png";

export default function ChatAI() {
  const [chatOpen, setChatOpen] = useState(false); // Quản lý trạng thái mở/đóng chat
  const [inputMessage, setInputMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [snackBarOpen, setSnackBarOpen] = useState(false);
  const [snackBarMessage, setSnackBarMessage] = useState("");
  const [snackSeverity, setSnackSeverity] = useState("info");
  const { profile } = useProfile();
  const [isOpen, setIsOpen] = useState(false); // Trạng thái mở/đóng khung chat
  const toggleChat = () => setIsOpen(!isOpen);
  const navigate = useNavigate();
  const theme = useTheme();

  const handleOpenChat = () => setChatOpen(true);
  const handleCloseChat = () => setChatOpen(false);

  const handleSendMessage = async () => {
    if (!inputMessage) return;

    const userMessage = {
      role: "user",
      content: inputMessage,
      avatar: profile.avatarUrl,
    };
    setChatHistory((prevChatHistory) => [...prevChatHistory, userMessage]);

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
      };
      setChatHistory((prevChatHistory) => [
        ...prevChatHistory,
        assistantMessage,
      ]);

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
        case gptResponse.includes("http://localhost:3000"):
            navigate("/");
            break;
        default:
          console.log("No matching URL found in GPT response.");
      }
    } catch (error) {
      setSnackBarMessage("Failed to send message. Please try again.");
      setSnackSeverity("error");
      setSnackBarOpen(true);
    }

    setInputMessage("");
  };

  const handleCloseSnackBar = () => setSnackBarOpen(false);

  return (
    <>
      {/* Icon chat ở góc phải */}
      <Box
        sx={{
          position: "fixed",
          bottom: 16,
          right: 16,
          zIndex: 1000,
        }}
      >
        <IconButton
          onClick={toggleChat}
          sx={{
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
            "&:hover": { backgroundColor: theme.palette.primary.dark },
            boxShadow: "0px 4px 10px rgba(0,0,0,0.2)",
          }}
        >
          <ChatIcon />
        </IconButton>
      </Box>

      {/* Khung chat */}
      {isOpen && (
        <Box
          sx={{
            position: "fixed",
            bottom: 80,
            right: 16,
            width: "350px",
            height: "450px",
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: "8px",
            backgroundColor: theme.palette.background.paper,
            boxShadow: theme.shadows[5],
            display: "flex",
            flexDirection: "column",
            zIndex: 1000,
          }}
        >
          {/* Header khung chat */}
          <Box
            sx={{
              padding: "8px",
              backgroundColor: theme.palette.primary.main,
              color: theme.palette.primary.contrastText,
              textAlign: "center",
              fontWeight: "bold",
              borderTopLeftRadius: "8px",
              borderTopRightRadius: "8px",
            }}
          >
            SKILL-HUB-AI
          </Box>

          {/* Nội dung chat */}
          <Box
            sx={{
              flex: 1,
              padding: "8px",
              overflowY: "auto",
              backgroundColor: theme.palette.background.default,
            }}
          >
            {chatHistory.map((message, index) => (
              <Box
              key={index}
              sx={{
                display: "flex",
                justifyContent: message.role === "user" ? "flex-end" : "flex-start",
                marginBottom: "8px",
              }}
            >
              <Box
                sx={{
                  maxWidth: "70%",
                  padding: "8px",
                  backgroundColor:
                    message.role === "user"
                      ? theme.palette.primary.main // Nền tin nhắn của người dùng
                      : theme.palette.background.paper, // Nền tin nhắn của bot
                  borderRadius: "8px",
                  color:
                    message.role === "user"
                      ? theme.palette.primary.contrastText // Chữ tin nhắn của người dùng
                      : theme.palette.text.primary, // Chữ tin nhắn của bot
                  boxShadow: theme.shadows[1],
                }}
              >
                {message.content}
              </Box>
            </Box>
            
            ))}
          </Box>

          {/* Input tin nhắn */}
          <Box
            sx={{
              display: "flex",
              padding: "8px",
              borderTop: `1px solid ${theme.palette.divider}`,
            }}
          >
            <TextField
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Nhập tin nhắn của bạn..."
              fullWidth
              size="small"
              onKeyPress={(e) => {
                if (e.key === "Enter") handleSendMessage();
              }}
              
            />
            <Button
              onClick={handleSendMessage}
              variant="contained"
              color="primary"
              disabled={!inputMessage}
              sx={{ marginLeft: "8px" }}
            >
              Gửi
            </Button>
          </Box>
        </Box>
      )}
    </>
  );
}