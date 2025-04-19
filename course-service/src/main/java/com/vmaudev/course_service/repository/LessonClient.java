package com.vmaudev.course_service.repository;

import com.vmaudev.course_service.dto.response.LessonReponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;

import java.util.List;

@FeignClient(name = "lesson-service", url = "${lesson.service.url}")
public interface LessonClient {

    @GetMapping("/api/lectures/course/{courseId}")
    List<LessonReponse> getLessonByCourseId(
        @PathVariable("courseId") String courseId,
        @RequestHeader("Authorization") String token
    );
}