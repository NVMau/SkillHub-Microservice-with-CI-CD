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
public class AssignmentResponse {
    private String id;  // ID của bài tập
    private String lectureId;  // ID của bài giảng
    private String title;  // Tiêu đề của bài tập
    private List<QuestionResponse> questions;  // Danh sách các câu hỏi

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class QuestionResponse {
        private String questionText;  // Nội dung câu hỏi
        private List<String> options;  // Các lựa chọn
        private String correctAnswer;  // Đáp án đúng
    }
} 