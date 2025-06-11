package com.vmaudev.course_service.repository;

import com.vmaudev.course_service.dto.response.EnrollmentReponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;

import java.util.List;

@FeignClient(name = "Enrollement-client", url = "${enrollement.url}")
public interface EnrollementClient {

    @GetMapping("/api/enrollments/course/{courseId}/students")
    List<EnrollmentReponse> getStudentsByCourseId(@PathVariable("courseId") String courseId, @RequestHeader("Authorization") String token);

    @GetMapping("/api/enrollments/student/{userId}")
    List<EnrollmentReponse> getEnrollmentsByUserId(@PathVariable("userId") String userId, @RequestHeader("Authorization") String token);

}
