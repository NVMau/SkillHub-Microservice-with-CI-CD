package com.vmaudev.course_service.controller;

import com.vmaudev.course_service.dto.LearningProgressResponse;
import com.vmaudev.course_service.dto.LessonCompletionRequest;
import com.vmaudev.course_service.dto.StudentLearningStatisticsResponse;
import com.vmaudev.course_service.dto.response.LessonReponse;
import com.vmaudev.course_service.service.LessonCompletionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/course/lesson-completion")
@RequiredArgsConstructor
@Slf4j
public class LessonCompletionController {
    private final LessonCompletionService lessonCompletionService;

    @PostMapping("/{lessonId}/complete")
    public ResponseEntity<Void> markLessonAsCompleted(
            @PathVariable String lessonId,
            @RequestBody LessonCompletionRequest request) {
        log.info("Nhận request đánh dấu bài học {} đã hoàn thành", lessonId);
        
        lessonCompletionService.markLessonAsCompleted(
                request.getUserId(),
                request.getCourseId(),
                lessonId,
                request.getCompletionType());
        
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{lessonId}/status")
    public ResponseEntity<Boolean> getLessonCompletionStatus(
            @PathVariable String lessonId,
            @RequestParam String userId) {
        boolean isCompleted = lessonCompletionService.isLessonCompleted(userId, lessonId);
        return ResponseEntity.ok(isCompleted);
    }

    @GetMapping("/course/{courseId}/completed-count")
    public ResponseEntity<Integer> getCompletedLessonsCount(
            @PathVariable String courseId,
            @RequestParam String userId) {
        int count = lessonCompletionService.getCompletedLessonsCount(userId, courseId);
        return ResponseEntity.ok(count);
    }

    @GetMapping("/course/{courseId}/progress")
    public ResponseEntity<LearningProgressResponse> getLearningProgress(
            @PathVariable String courseId,
            @RequestParam String userId) {
        log.info("Getting learning progress for user {} in course {}", userId, courseId);
        return ResponseEntity.ok(lessonCompletionService.getLearningProgress(userId, courseId));
    }

    @GetMapping("/course/{courseId}/lessons")
    public ResponseEntity<List<LessonReponse>> getLessonsByCourseId(
            @PathVariable String courseId) {
        log.info("Getting lessons for course {}", courseId);
        return ResponseEntity.ok(lessonCompletionService.getLessonsByCourseId(courseId));
    }

    @GetMapping("/{courseId}/students-progress")
    public ResponseEntity<List<StudentLearningStatisticsResponse>> getStudentsProgress(
            @PathVariable String courseId
    ) {
        return ResponseEntity.ok(lessonCompletionService.getStudentsProgress(courseId));
    }
} 