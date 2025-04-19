package com.vmaudev.course_service.repository;

import com.vmaudev.course_service.dto.response.ExamResultResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;

@FeignClient(name = "exam-service", url = "${exam-result.url}")
public interface ExamResultClient {

    @GetMapping("/api/exam-results/assignment/{assignmentId}/user/{userId}")
    ExamResultResponse getExamResultByUserIdAndAssignmentId(
        @PathVariable("assignmentId") String assignmentId,
        @PathVariable("userId") String userId,
        @RequestHeader("Authorization") String token
    );
}