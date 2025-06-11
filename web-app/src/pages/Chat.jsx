import { useState, useEffect, useRef } from "react";
import {
  Box,
  Button,
  TextField,
  List,
  ListItem,
  ListItemText,
  Avatar,
  Paper,
  Typography,
  IconButton,
  Badge,
  Divider,
  InputAdornment,
} from "@mui/material";
import { getAllUsers } from "../services/userService"; // API lấy danh sách người dùng
import { useProfile } from "../context/ProfileContext";
import { useTheme } from "@mui/material/styles";
import Scene from "./Scene"; // Lấy thông tin người dùng hiện tại
import SearchIcon from '@mui/icons-material/Search';
import SendIcon from '@mui/icons-material/Send';
import PersonIcon from '@mui/icons-material/Person';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Chat() {
  const { profile, loading, error } = useProfile();
  console.log("Chat component rendered, profile:", profile);

  const [users, setUsers] = useState([]); // Danh sách người dùng
  const [filteredUsers, setFilteredUsers] = useState([]); // Danh sách người dùng sau khi lọc
  const [searchTerm, setSearchTerm] = useState(""); // Từ khóa tìm kiếm
  const [selectedUser, setSelectedUser] = useState(null); // Người dùng được chọn để chat
  const [message, setMessage] = useState(""); // Nội dung tin nhắn
  const [messagesByUser, setMessagesByUser] = useState({}); // Lưu trữ tin nhắn theo từng profileId
  const webSocketRef = useRef(null); // Dùng để lưu kết nối WebSocket
  const theme = useTheme(); 

  // Lấy danh sách người dùng khi component được mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await getAllUsers();
        setUsers(response.data); // Lưu danh sách người dùng vào state
        setFilteredUsers(response.data); // Khởi tạo danh sách người dùng được lọc
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
  }, []);

  // Cập nhật danh sách người dùng khi có từ khóa tìm kiếm
  useEffect(() => {
    if (searchTerm === "") {
      setFilteredUsers(users); // Nếu không có từ khóa tìm kiếm, hiển thị tất cả người dùng
    } else {
      const filtered = users.filter((user) =>
        (user.fullName || `${user.firstName} ${user.lastName}`)
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) // Lọc người dùng theo tên đầy đủ
      );
      setFilteredUsers(filtered);
    }
  }, [searchTerm, users]);

  // Tạo hàm gọi API lấy lịch sử tin nhắn
  const fetchMessageHistory = async (profileId) => {
    try {
      const response = await fetch(
        `http://localhost:8091/messages?senderId=${profile.profileId}&receiverId=${profileId}`
      );
      const data = await response.json();

      setMessagesByUser((prevMessages) => ({
        ...prevMessages,
        [profileId]: data, // Lưu lịch sử tin nhắn vào state
      }));
    } catch (error) {
      console.error("Error fetching message history:", error);
    }
  };

  // Khi người dùng được chọn, gọi API để lấy lịch sử chat
  const handleUserSelection = (user) => {
    setSelectedUser(user); // Chọn người dùng để chat
    fetchMessageHistory(user.profileId); // Gọi API để lấy lịch sử tin nhắn giữa hai người dùng
  };

  // Thiết lập WebSocket khi người dùng được chọn
  useEffect(() => {
    if (selectedUser && profile) {
      // Thêm profileId vào URL khi khởi tạo WebSocket
      webSocketRef.current = new WebSocket(
        `ws://localhost:8091/chat?userId=${profile.profileId}`
      );

      webSocketRef.current.onopen = () => {
        console.log("WebSocket connected with profileId:", profile.profileId);
      };

      webSocketRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log("Received message:", data); // Log tin nhắn nhận được

          // Kiểm tra điều kiện nhận tin nhắn và cập nhật tin nhắn theo từng profileId
          if (
            (data.receiverId === profile.profileId &&
              data.senderId === selectedUser.profileId) ||
            (data.senderId === profile.profileId &&
              data.receiverId === selectedUser.profileId)
          ) {
            setMessagesByUser((prevMessages) => ({
              ...prevMessages,
              [selectedUser.profileId]: [
                ...(prevMessages[selectedUser.profileId] || []),
                data,
              ],
            }));
          }
        } catch (error) {
          console.error("Error processing message:", error);
        }
      };

      webSocketRef.current.onerror = (error) => {
        console.error("WebSocket error", error);
      };

      webSocketRef.current.onclose = () => {
        console.log("WebSocket closed");
      };

      return () => {
        if (webSocketRef.current) {
          webSocketRef.current.close(); // Đóng WebSocket khi component bị unmount
        }
      };
    }
  }, [selectedUser, profile]);

  // Gửi tin nhắn qua WebSocket
  const sendMessage = () => {
    if (!selectedUser || message.trim() === "" || !profile) return; // Kiểm tra profile trước khi gửi tin nhắn

    const chatMessage = {
      senderId: profile.profileId, // Thông tin người gửi
      receiverId: selectedUser.profileId, // Thông tin người nhận
      content: message,
    };

    console.log("Sending message:", chatMessage); // Log khi gửi tin nhắn
    webSocketRef.current.send(JSON.stringify(chatMessage)); // Gửi tin nhắn qua WebSocket
    setMessage(""); // Clear input sau khi gửi
  };

  // Tự động cuộn xuống cuối khi có tin nhắn mới
  useEffect(() => {
    const messageContainer = document.getElementById("message-container");
    if (messageContainer) {
      messageContainer.scrollTop = messageContainer.scrollHeight;
    }
  }, [messagesByUser, selectedUser]); // Mỗi khi `messagesByUser` thay đổi, cuộn xuống cuối danh sách tin nhắn

  // Hiển thị loading spinner khi đang tải
  if (loading) {
    return <LoadingSpinner message="Đang tải thông tin..." />;
  }

  // Hiển thị lỗi nếu có
  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  // Hiển thị loading hoặc thông báo nếu profile chưa sẵn sàng
  if (!profile) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <Typography>Vui lòng đăng nhập để tiếp tục</Typography>
      </Box>
    );
  }

  console.log("Profile loaded successfully in Chat:", profile);

  const currentMessages = messagesByUser[selectedUser?.profileId] || []; // Lấy tin nhắn của người dùng hiện tại

  return (
    <Scene>
      <Box 
        display="flex" 
        flexDirection="row" 
        gap={2} 
        p={3} 
        sx={{
          height: "calc(100vh - 100px)",
          backgroundColor: theme.palette.background.default
        }}
      >
        {/* Danh sách người dùng */}
        <Paper
          elevation={3}
          sx={{
            width: "350px",
            height: "100%",
            borderRadius: "16px",
            backgroundColor: theme.palette.background.paper,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Box p={3} pb={2}>
            <Typography variant="h5" fontWeight="600" mb={3}>
              Tin nhắn
            </Typography>
            <TextField
              placeholder="Tìm kiếm người dùng..."
              variant="outlined"
              fullWidth
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "12px",
                  backgroundColor: theme.palette.background.default,
                },
              }}
            />
          </Box>
          
          <Divider />
          
          <List sx={{ flex: 1, overflowY: "auto", px: 1 }}>
            {filteredUsers.map((user) => (
              <ListItem
                button
                key={user.profileId}
                selected={selectedUser?.profileId === user.profileId}
                onClick={() => handleUserSelection(user)}
                sx={{
                  borderRadius: "12px",
                  mb: 1,
                  backgroundColor: selectedUser?.profileId === user.profileId
                    ? theme.palette.primary.light + "20"
                    : "transparent",
                  "&:hover": {
                    backgroundColor: theme.palette.action.hover,
                  },
                }}
              >
                <Avatar 
                  src={user.avatarUrl} 
                  sx={{ 
                    width: 48, 
                    height: 48,
                    bgcolor: theme.palette.primary.main 
                  }}
                >
                  {!user.avatarUrl && <PersonIcon />}
                </Avatar>
                <Box ml={2} flex={1}>
                  <Typography variant="subtitle1" fontWeight="600">
                    {user.fullName || `${user.firstName} ${user.lastName}`}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" noWrap>
                    Nhấn để bắt đầu trò chuyện
                  </Typography>
                </Box>
              </ListItem>
            ))}
          </List>
        </Paper>

        {/* Khu vực chat */}
        {selectedUser ? (
          <Paper
            elevation={3}
            sx={{
              flex: 1,
              borderRadius: "16px",
              display: "flex",
              flexDirection: "column",
              backgroundColor: theme.palette.background.paper,
            }}
          >
            {/* Header */}
            <Box 
              p={3} 
              display="flex" 
              alignItems="center" 
              borderBottom={1}
              borderColor="divider"
            >
              <Avatar 
                src={selectedUser.avatarUrl}
                sx={{ 
                  width: 48, 
                  height: 48,
                  bgcolor: theme.palette.primary.main 
                }}
              >
                {!selectedUser.avatarUrl && <PersonIcon />}
              </Avatar>
              <Box ml={2}>
                <Typography variant="h6" fontWeight="600">
                  {selectedUser.fullName || `${selectedUser.firstName} ${selectedUser.lastName}`}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Đang hoạt động
                </Typography>
              </Box>
            </Box>

            {/* Messages */}
            <Box 
              flex={1} 
              p={3} 
              overflow="auto" 
              id="message-container"
              sx={{
                backgroundColor: theme.palette.background.default,
              }}
            >
              <List>
                {currentMessages.map((msg, index) => (
                  <ListItem
                    key={index}
                    sx={{
                      display: "flex",
                      justifyContent: msg.senderId === profile.profileId ? "flex-end" : "flex-start",
                      py: 0.5,
                    }}
                  >
                    <Box
                      sx={{
                        maxWidth: "70%",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: msg.senderId === profile.profileId ? "flex-end" : "flex-start",
                      }}
                    >
                      <Paper
                        elevation={0}
                        sx={{
                          p: 2,
                          backgroundColor: msg.senderId === profile.profileId
                            ? theme.palette.primary.main
                            : theme.palette.background.paper,
                          color: msg.senderId === profile.profileId
                            ? "white"
                            : theme.palette.text.primary,
                          borderRadius: "16px",
                          borderTopRightRadius: msg.senderId === profile.profileId ? "4px" : "16px",
                          borderTopLeftRadius: msg.senderId === profile.profileId ? "16px" : "4px",
                        }}
                      >
                        <Typography variant="body1">
                          {msg.content}
                        </Typography>
                      </Paper>
                      <Typography 
                        variant="caption" 
                        color="text.secondary"
                        sx={{ mt: 0.5 }}
                      >
                        {formatDistanceToNow(new Date(msg.timestamp || Date.now()), { 
                          addSuffix: true,
                          locale: vi 
                        })}
                      </Typography>
                    </Box>
                  </ListItem>
                ))}
              </List>
            </Box>

            {/* Input */}
            <Box 
              p={3} 
              borderTop={1}
              borderColor="divider"
              sx={{
                backgroundColor: theme.palette.background.paper,
              }}
            >
              <Box
                component="form"
                display="flex"
                gap={2}
                onSubmit={(e) => {
                  e.preventDefault();
                  sendMessage();
                }}
              >
                <TextField
                  fullWidth
                  placeholder="Nhập tin nhắn..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  variant="outlined"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "12px",
                      backgroundColor: theme.palette.background.default,
                    },
                  }}
                />
                <IconButton 
                  type="submit"
                  color="primary"
                  sx={{ 
                    width: 48, 
                    height: 48,
                    backgroundColor: theme.palette.primary.main,
                    color: "white",
                    "&:hover": {
                      backgroundColor: theme.palette.primary.dark,
                    },
                  }}
                >
                  <SendIcon />
                </IconButton>
              </Box>
            </Box>
          </Paper>
        ) : (
          <Paper
            elevation={3}
            sx={{
              flex: 1,
              borderRadius: "16px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: theme.palette.background.paper,
            }}
          >
            <Typography variant="h6" color="text.secondary">
              Chọn một người dùng để bắt đầu trò chuyện
            </Typography>
          </Paper>
        )}
      </Box>
    </Scene>
  );
}