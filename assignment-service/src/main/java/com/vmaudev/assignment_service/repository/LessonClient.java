package com.vmaudev.assignment_service.repository;

import com.vmaudev.assignment_service.dto.response.LessonReponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;


@FeignClient(name = "lesson-service", url = "${lesson.service.url}")
public interface LessonClient {

    @GetMapping("/api/lectures/{lectureId}")
    LessonReponse getLessonById(
        @PathVariable("lectureId") String courseId,
        @RequestHeader("Authorization") String token
    );
}