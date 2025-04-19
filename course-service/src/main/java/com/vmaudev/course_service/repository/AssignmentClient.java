package com.vmaudev.course_service.repository;

import com.vmaudev.course_service.dto.response.AssignmentResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;

import java.util.List;


@FeignClient(name = "assignment-client", url = "${assignment.url}")
public interface AssignmentClient {

    @GetMapping("/api/assignments/lecture/{lectureId}")
    List<AssignmentResponse> getAssignmentsByLectureId(@PathVariable("lectureId") String lectureId, @RequestHeader("Authorization") String token);

}