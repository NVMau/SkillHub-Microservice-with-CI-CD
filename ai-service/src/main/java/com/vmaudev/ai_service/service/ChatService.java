package com.vmaudev.ai_service.service;

import com.vmaudev.ai_service.config.OpenAiClient;
import com.vmaudev.ai_service.dto.ChatRequest;
import com.vmaudev.ai_service.dto.response.ProfileResponse;
import com.vmaudev.ai_service.model.ChatHistory;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ChatService {

    private final MongoTemplate mongoTemplate;
    private final OpenAiClient openAiClient;

    // Giả sử bạn lưu ngữ cảnh trong một Map hoặc một cơ sở dữ liệu
    private Map<String, String> userContext = new HashMap<>();

    public ChatService(MongoTemplate mongoTemplate, OpenAiClient openAiClient) {
        this.mongoTemplate = mongoTemplate;
        this.openAiClient = openAiClient;
    }

    public String getChatResponseWithContext(ProfileResponse profile, String userMessage) {
        String profileId = profile.getProfileId();

        // Lấy ngữ cảnh trước đó của người dùng (nếu có)
        String previousContext = userContext.getOrDefault(profileId, "");

        // Thêm thông điệp hệ thống để định nghĩa GPT là Skill Hub AI
        String systemMessageContent = "You are the Skill Hub AI. Your role is to guide users to various parts of the website. "
                + "Only provide direct URLs in response to clear and explicit navigation requests. For example, respond with: "
                + "'http://localhost:3000' for home page queries, "
                + "'http://localhost:3000/profile' for user profile queries, "
                + "'http://localhost:3000/settings' for settings, "
                + "'http://localhost:3000/chat' for chat, "
                + "'http://localhost:3000/blog' for the forum or experience sharing place, "
                + "and 'http://localhost:3000/404' if the requested page does not exist. "
                + "For all other questions or general inquiries, respond as usual without providing any URLs.";
        // Tạo thông điệp hệ thống
        ChatRequest.Message systemMessage = new ChatRequest.Message("system", systemMessageContent);

        // Gộp ngữ cảnh trước đó với tin nhắn hiện tại
        String fullMessage = previousContext + "\n" + "User: " + userMessage;

        // Tạo tin nhắn của người dùng
        ChatRequest.Message userMessageObject = new ChatRequest.Message("user", fullMessage);

        // Tạo yêu cầu GPT với cả thông điệp hệ thống và tin nhắn người dùng
        ChatRequest gptRequest = new ChatRequest("gpt-3.5-turbo", List.of(systemMessage, userMessageObject));

        // Gửi yêu cầu và nhận phản hồi từ GPT
        String gptResponse = openAiClient.sendMessage(gptRequest);

        // Lưu lại ngữ cảnh mới cho người dùng
        userContext.put(profileId, fullMessage + "\nGPT: " + gptResponse);

        return gptResponse;
    }

    public void saveChatHistory(ProfileResponse profile, String userMessage, String gptResponse) {
        ChatHistory chatHistory = new ChatHistory(profile.getProfileId(), userMessage, gptResponse);
        mongoTemplate.save(chatHistory, "chatHistory");
    }
}

