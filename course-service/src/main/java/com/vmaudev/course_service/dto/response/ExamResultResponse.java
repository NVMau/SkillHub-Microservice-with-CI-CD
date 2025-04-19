package com.vmaudev.course_service.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ExamResultResponse {
    private String id;  // ID của kết quả bài thi
    private String userId;  // ID của người dùng
    private String assignmentId;  // ID của bài tập
    private List<QuestionResultResponse> questionResults;  // Danh sách kết quả của từng câu hỏi
    private int score;  // Điểm số của người dùng

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class QuestionResultResponse {
        private String questionText;  // Nội dung câu hỏi
        private String userAnswer;  // Câu trả lời của người dùng
        private String correctAnswer;  // Đáp án đúng
        private boolean isCorrect;  // Trạng thái đúng hay sai
    }
} 