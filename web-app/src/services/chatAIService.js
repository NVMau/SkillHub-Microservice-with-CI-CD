import httpClient from "../configurations/httpClient";
import { API } from "../configurations/configuration";

// API để gửi tin nhắn đến AI
export const sendChatAi = async (message, chatHistory = []) => {
  // Dữ liệu cần gửi đi theo định dạng mới
  const payload = {
    message: message,
    chatHistory: chatHistory
  };

  // Gửi request POST với message và chatHistory
  return await httpClient.post(`${API.SENDCHAT}`, payload);
};