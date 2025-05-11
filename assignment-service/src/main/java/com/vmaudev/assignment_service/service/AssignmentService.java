package com.vmaudev.assignment_service.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.theokanning.openai.completion.chat.ChatCompletionRequest;
import com.theokanning.openai.completion.chat.ChatMessage;
import com.theokanning.openai.completion.chat.ChatMessageRole;
import com.theokanning.openai.service.OpenAiService;
import com.vmaudev.assignment_service.dto.response.LessonReponse;
import com.vmaudev.assignment_service.event.AssignmentDeletedEvent;
import com.vmaudev.assignment_service.model.AIEvaluationResponse;
import com.vmaudev.assignment_service.model.Assignment;
import com.vmaudev.assignment_service.repository.AssignmentRepository;
import com.vmaudev.assignment_service.repository.ExamResultClient;
import com.vmaudev.assignment_service.dto.response.ExamResultResponse;
import com.vmaudev.assignment_service.repository.LessonClient;
import com.vmaudev.assignment_service.util.PdfTextExtractor;
import com.vmaudev.lecture_service.event.LectureDeletedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AssignmentService {

    private final AssignmentRepository assignmentRepository;
    private final KafkaTemplate<String, AssignmentDeletedEvent> kafkaTemplateDelete;
    private final ExamResultClient examResultClient;
    private final LessonClient lessonClient;

    @Value("${openai.api.key}")
    private String openaiApiKey;

    // Lưu bài tập mới
    public Assignment createAssignment(Assignment assignment) {
        return assignmentRepository.save(assignment);
    }

    // Lấy danh sách tất cả bài tập
    public List<Assignment> getAllAssignments() {
        return assignmentRepository.findAll();
    }

    // Tìm kiếm bài tập theo tiêu đề
    public List<Assignment> searchAssignments(String title) {
        return assignmentRepository.findByTitleContaining(title);
    }

    // Lấy danh sách bài tập theo lectureId
    public List<Assignment> getAssignmentsByLectureId(String lectureId) {
        return assignmentRepository.findByLectureId(lectureId);
    }
    public Assignment findAssignmentById(String id) {
        return assignmentRepository.findById(id).orElse(null);
    }

    // Xóa bài tập theo ID
    public void deleteAssignment(String id) {
        assignmentRepository.deleteById(id);
    }

    @KafkaListener(topics = "lectures-deleted")
    @Transactional
    public void handleLectureDeleted(LectureDeletedEvent event) {
        List<String> lectureIds = event.getLectureIds().stream()
                .map(CharSequence::toString)  // Chuyển đổi từ CharSequence thành String
                .collect(Collectors.toList());
        log.info("Received lecture-deleted event for lectures: {}", lectureIds);

        // Khởi tạo danh sách assignmentIds để chứa các ID của assignments bị xóa
        List<String> assignmentIds = new ArrayList<>();

        // Xóa tất cả assignment liên quan đến lectureId
        for (String lectureId : lectureIds) {
            List<Assignment> assignments = assignmentRepository.findByLectureId(lectureId);
            if (assignments != null && !assignments.isEmpty()) {
                log.info("Deleting assignments for lectureId: {}", lectureId);

                // Thêm assignmentIds vào danh sách để gửi sự kiện sau khi xóa
                assignmentIds.addAll(assignments.stream()
                        .map(Assignment::getId)
                        .collect(Collectors.toList()));

                // Thực hiện xóa các assignments
                assignmentRepository.deleteAll(assignments);
            } else {
                log.info("No assignments found for lectureId: {}", lectureId);
            }
        }

        // Nếu có assignmentIds, gửi sự kiện AssignmentDeletedEvent
        if (!assignmentIds.isEmpty()) {

            List<CharSequence> assignmentCharSeqIds = assignmentIds.stream()
                    .map(id -> (CharSequence) id)  // Ép kiểu sang CharSequence
                    .collect(Collectors.toList());
            AssignmentDeletedEvent assignmentDeletedEvent = new AssignmentDeletedEvent(assignmentCharSeqIds);
            log.info("Sending AssignmentDeletedEvent for deleted assignments: {}", assignmentIds);
            kafkaTemplateDelete.send("assignments-deleted", assignmentDeletedEvent);
            log.info(" End Sending AssignmentDeletedEvent for deleted assignments: {}", assignmentIds);
        }
    }


    public AIEvaluationResponse getAIEvaluation(String assignmentId, String userId) {
        log.info("Bắt đầu đánh giá AI cho assignmentId: {}, userId: {}", assignmentId, userId);
        
        // Lấy thông tin bài tập
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new RuntimeException("Assignment not found"));

        String token = getTokenFromSecurityContext();

        // Lấy bài làm của user
        ExamResultResponse submission = examResultClient.getExamResultByUserIdAndAssignmentId(assignmentId, userId,token);
        if (submission == null) {
            log.error("Không tìm thấy bài làm cho assignmentId: {}, userId: {}", assignmentId, userId);
            throw new RuntimeException("Submission not found");
        }

        // Lấy nội dung PDF từ lecture
        LessonReponse lessonReponse = lessonClient.getLessonById(assignment.getLectureId(), token);
        String contentFile = "";
        try {
            contentFile = PdfTextExtractor.extractTextFromPdfUrl(lessonReponse.getFileUrl());
            log.info("Đã đọc được nội dung PDF từ URL: {}", lessonReponse.getFileUrl());
        } catch (IOException e) {
            log.error("Không đọc được file PDF từ URL: {}", lessonReponse.getFileUrl(), e);
            throw new RuntimeException("Không đọc được nội dung file PDF của bài giảng", e);
        }

        // Chuyển đổi assignment và submission thành text
        String assignmentText = assignmentToText(assignment);
        String userAnswerText = submissionToText(submission);
        
        log.info("Đã chuẩn bị xong dữ liệu cho AI evaluation");

        // Khởi tạo OpenAI service
        OpenAiService service = new OpenAiService(openaiApiKey, Duration.ofSeconds(60));

        // Tạo prompt
        String prompt = String.format(
            "Bạn là trợ lý đánh giá bài tập. Hãy đánh giá câu trả lời và đưa ra lời khuyên dựa trên:\n\n" +
            "PHẦN 1: NỘI DUNG BÀI GIẢNG\n%s\n\n" +
            "PHẦN 2: ĐỀ BÀI\n%s\n\n" +
            "PHẦN 3: BÀI LÀM CỦA HỌC VIÊN\n%s\n\n" +
            "Hãy trả lời theo cấu trúc sau:\n" +
            "1. Nhận xét tổng quan: [Nhận xét về bài làm]\n" +
            "2. Điểm cần cải thiện: [Liệt kê các điểm cần cải thiện]\n" +
            "3. Tài liệu tham khảo: [Gợi ý các tài liệu tham khảo hữu ích]\n\n" +
            "Hãy viết phản hồi một cách tự nhiên, dễ hiểu và mang tính xây dựng.", 
            contentFile, 
            assignmentText, 
            userAnswerText
        );

        log.info("Đã tạo prompt cho AI");
        log.info("Prompt: {}", prompt);

        // Tạo request
        List<ChatMessage> messages = new ArrayList<>();
        messages.add(new ChatMessage(ChatMessageRole.SYSTEM.value(), "Bạn là trợ lý đánh giá bài tập chuyên nghiệp."));
        messages.add(new ChatMessage(ChatMessageRole.USER.value(), prompt));

        ChatCompletionRequest completionRequest = ChatCompletionRequest.builder()
                .model("gpt-3.5-turbo")
                .messages(messages)
                .temperature(0.7)
                .build();

        // Gọi API và parse kết quả
        String response = service.createChatCompletion(completionRequest).getChoices().get(0).getMessage().getContent();
        log.info("Nhận được response từ AI: {}", response);
        
        AIEvaluationResponse result = parseResponse(response);
        log.info("Đã parse response thành công: {}", result);
        
        return result;
    }

    /**
     * Chuyển đổi đối tượng Assignment thành text có cấu trúc
     */
    private String assignmentToText(Assignment assignment) {
        StringBuilder sb = new StringBuilder();
        sb.append("Tiêu đề bài tập: ").append(assignment.getTitle()).append("\n\n");
        
        if (assignment.getQuestions() != null && !assignment.getQuestions().isEmpty()) {
            sb.append("Các câu hỏi:\n");
            int idx = 1;
            for (Assignment.Question q : assignment.getQuestions()) {
                sb.append("Câu ").append(idx++).append(": ").append(q.getQuestionText()).append("\n");
                if (q.getOptions() != null && !q.getOptions().isEmpty()) {
                    char opt = 'A';
                    for (String option : q.getOptions()) {
                        sb.append("   ").append(opt++).append(". ").append(option).append("\n");
                    }
                }
                sb.append("\n");
            }
        }
        
        return sb.toString();
    }

    /**
     * Chuyển đổi đối tượng ExamResultResponse thành text có cấu trúc
     */
    private String submissionToText(ExamResultResponse submission) {
        StringBuilder sb = new StringBuilder();
        
        sb.append("Điểm số: ").append(submission.getScore()).append("/10\n\n");
        
        if (submission.getQuestionResults() != null && !submission.getQuestionResults().isEmpty()) {
            sb.append("Câu trả lời của học viên:\n\n");
            int idx = 1;
            for (ExamResultResponse.QuestionResultResponse result : submission.getQuestionResults()) {
                sb.append("Câu ").append(idx++).append(": ").append(result.getQuestionText()).append("\n");
                sb.append("- Câu trả lời: ").append(result.getUserAnswer()).append("\n\n");
            }
        } else {
            sb.append("Không có câu trả lời nào được ghi nhận.");
        }
        
        return sb.toString();
    }

    private AIEvaluationResponse parseResponse(String response) {
        try {
            AIEvaluationResponse evaluationResponse = new AIEvaluationResponse();
            evaluationResponse.setEvaluation(response);
            return evaluationResponse;
        } catch (Exception e) {
            log.error("Lỗi khi parse response từ AI: {}", response, e);
            throw new RuntimeException("Không thể parse response từ AI", e);
        }
    }

    private String getTokenFromSecurityContext() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication instanceof JwtAuthenticationToken) {
            JwtAuthenticationToken jwtAuth = (JwtAuthenticationToken) authentication;
            return "Bearer " + jwtAuth.getToken().getTokenValue();
        }
        throw new RuntimeException("Token không hợp lệ");
    }

}
