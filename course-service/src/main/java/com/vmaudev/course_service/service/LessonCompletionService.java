package com.vmaudev.course_service.service;

import com.vmaudev.course_service.dto.StudentLearningStatisticsResponse;
import com.vmaudev.course_service.dto.response.*;
import com.vmaudev.course_service.repository.*;
import com.vmaudev.course_service.dto.LearningProgressResponse;
import com.vmaudev.course_service.model.LessonCompletion;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class LessonCompletionService {
    private final LessonCompletionRepository lessonCompletionRepository;
    private final LessonClient lessonClient;
    private final AssignmentClient assignmentClient;
    private final EnrollementClient enrollementClient;
    private  final ProfileClient profileClient;
    private final ExamResultClient examResultClient;

    public void markLessonAsCompleted(String userId, String courseId, String lessonId, String completionType) {
        log.info("Đánh dấu bài học {} đã hoàn thành cho người dùng {}", lessonId, userId);
        
        // Kiểm tra xem bài học đã được đánh dấu hoàn thành chưa
        LessonCompletion completion = lessonCompletionRepository
                .findByUserIdAndLessonId(userId, lessonId)
                .orElseGet(() -> LessonCompletion.builder()
                        .userId(userId)
                        .courseId(courseId)
                        .lessonId(lessonId)
                        .completed(false)
                        .build());
        
        // Nếu chưa hoàn thành, đánh dấu là đã hoàn thành
        if (!completion.isCompleted()) {
            completion.setCompleted(true);
            completion.setCompletedAt(LocalDateTime.now());
            completion.setCompletionType(completionType);
            lessonCompletionRepository.save(completion);
            log.info("Đã đánh dấu bài học {} là đã hoàn thành", lessonId);
        } else {
            log.info("Bài học {} đã được đánh dấu hoàn thành trước đó", lessonId);
        }
    }

    public boolean isLessonCompleted(String userId, String lessonId) {
        return lessonCompletionRepository
                .findByUserIdAndLessonId(userId, lessonId)
                .map(LessonCompletion::isCompleted)
                .orElse(false);
    }

    public int getCompletedLessonsCount(String userId, String courseId) {
        return lessonCompletionRepository.countByUserIdAndCourseIdAndCompletedTrue(userId, courseId);
    }

    public LearningProgressResponse getLearningProgress(String userId, String courseId) {
        log.info("Getting learning progress for user {} in course {}", userId, courseId);
        
        // Lấy token từ security context
        String token = getTokenFromSecurityContext();
        
        // Lấy danh sách bài học
        List<LessonReponse> lessons = getLessonsByCourseId(courseId);
        int totalLessons = lessons.size();
        log.info("Total lessons in course: {}", totalLessons);
        
        // Lấy danh sách bài học đã hoàn thành
        List<LessonCompletion> completions = lessonCompletionRepository.findByUserIdAndCourseId(userId, courseId);
        int completedLessons = (int) completions.stream().filter(LessonCompletion::isCompleted).count();
        log.info("Completed lessons: {}", completedLessons);
        
        // Lấy danh sách bài tập cho từng bài học và kết quả làm bài
        int totalAssignments = 0;
        int completedAssignments = 0;
        
        for (LessonReponse lesson : lessons) {
            log.info("Processing lesson: {}", lesson.getId());
            // Lấy danh sách bài tập cho bài học này
            List<AssignmentResponse> assignments = assignmentClient.getAssignmentsByLectureId(lesson.getId(), token);
            log.info("Found {} assignments for lesson {}", assignments.size(), lesson.getId());
            totalAssignments += assignments.size();
            
            // Lấy kết quả làm bài cho từng bài tập
            for (AssignmentResponse assignment : assignments) {
                try {
                    // log.info("Getting exam result for assignment {} and user {} with token: {}", assignment.getId(), userId, token);
                    
                    ExamResultResponse result = examResultClient.getExamResultByUserIdAndAssignmentId(
                        assignment.getId(),
                        userId,
                        token
                    );
                    
                    if (result != null) {
                        // log.info("Exam result found: {}", result);
                        completedAssignments++;
                    } else {
                        // log.warn("No exam result found for assignment {} and user {}", assignment.getId(), userId);
                    }
                } catch (Exception e) {
                    log.error("Error getting exam result for assignment {} and user {}: {}", 
                        assignment.getId(), userId, e.getMessage(), e);
                }
            }
        }
        
        log.info("Total assignments: {}", totalAssignments);
        log.info("Completed assignments: {}", completedAssignments);
        
        // Tính phần trăm hoàn thành bài học
        double lessonProgressPercentage = totalLessons > 0 ? 
            (double) completedLessons / totalLessons * 100 : 0;
        log.info("Lesson progress percentage: {}%", Math.round(lessonProgressPercentage * 100.0) / 100.0);
        
        // Tính phần trăm hoàn thành bài tập
        double assignmentProgressPercentage = totalAssignments > 0 ? 
            (double) completedAssignments / totalAssignments * 100 : 0;
        log.info("Assignment progress percentage: {}%", Math.round(assignmentProgressPercentage * 100.0) / 100.0);
        
        // Lấy thời gian hoàn thành bài học cuối cùng
        LocalDateTime lastCompletedAt = completions.stream()
            .filter(LessonCompletion::isCompleted)
            .map(LessonCompletion::getCompletedAt)
            .max(LocalDateTime::compareTo)
            .orElse(null);
        log.info("Last completed at: {}", lastCompletedAt);
        
        // Lấy thời gian truy cập cuối cùng
        LocalDateTime lastAccessedAt = completions.stream()
            .map(LessonCompletion::getCompletedAt)
            .max(LocalDateTime::compareTo)
            .orElse(null);
        log.info("Last accessed at: {}", lastAccessedAt);
        
        LearningProgressResponse response = LearningProgressResponse.builder()
            .courseId(courseId)
            .totalLessons(totalLessons)
            .completedLessons(completedLessons)
            .totalAssignments(totalAssignments)
            .completedAssignments(completedAssignments)
            .lessonProgressPercentage(Math.round(lessonProgressPercentage * 100.0) / 100.0)
            .assignmentProgressPercentage(Math.round(assignmentProgressPercentage * 100.0) / 100.0)
            .lastCompletedAt(lastCompletedAt)
            .lastAccessedAt(lastAccessedAt)
            .build();
        
        log.info("Final learning progress response: {}", response);
        return response;
    }

    public List<LessonReponse> getLessonsByCourseId(String courseId) {
        log.info("Getting lessons for course {}", courseId);
        
        // Lấy token từ security context
        String token = getTokenFromSecurityContext();
        
        // Lấy danh sách bài học từ lesson service
        return lessonClient.getLessonByCourseId(courseId, token);
    }
    public List<LessonReponse> getAssByCourseId(String courseId) {
        log.info("Getting lessons for course {}", courseId);

        // Lấy token từ security context
        String token = getTokenFromSecurityContext();

        // Lấy danh sách bài học từ lesson service
        return lessonClient.getLessonByCourseId(courseId, token);
    }
    public List<StudentLearningStatisticsResponse> getStudentsProgress(String courseId) {
        String token = getTokenFromSecurityContext();

        List<EnrollmentReponse> enrolledStudents = enrollementClient.getStudentsByCourseId(courseId, token);



        /// 2. Lấy learning progress cho từng học sinh
        return enrolledStudents.stream()
                .map(enrollment -> {
                    // Lấy thông tin profile của học viên
                    ProfileResponse profile = profileClient.getUserById(enrollment.getStudentId(), token);
                    log.info("Đang xử lý học viên: {} - {}", profile.getProfileId(), profile.getFirstName());

                    // Lấy tiến độ học tập
                    LearningProgressResponse progress =
                            getLearningProgress(enrollment.getStudentId(), courseId);

                    return StudentLearningStatisticsResponse.builder()
                            .userId(enrollment.getStudentId())
                            .studentName(profile.getFirstName() + " " + profile.getLastName())
                            .totalLessons(progress.getTotalLessons())
                            .completedLessons(progress.getCompletedLessons())
                            .totalAssignments(progress.getTotalAssignments())
                            .completedAssignments(progress.getCompletedAssignments())
                            .lessonProgressPercentage(progress.getLessonProgressPercentage())
                            .assignmentProgressPercentage(progress.getAssignmentProgressPercentage())
                            .lastCompletedAt(progress.getLastCompletedAt())
                            .lastAccessedAt(progress.getLastAccessedAt())
                            .build();
                })
                .collect(Collectors.toList());
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