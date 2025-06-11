package com.vmaudev.enrollment_service.controller;

import com.vmaudev.enrollment_service.dto.EnrollmentRequest;
import com.vmaudev.enrollment_service.dto.CourseEnrollmentResponse;
import com.vmaudev.enrollment_service.dto.RatingWithUserInfoResponse;
import com.vmaudev.enrollment_service.model.Enrollment;
import com.vmaudev.enrollment_service.model.Rating;
import com.vmaudev.enrollment_service.service.EnrollmentService;
import com.vmaudev.enrollment_service.service.RatingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;
import java.util.Optional;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/enrollments")
@RequiredArgsConstructor
public class EnrollmentController {

    private final EnrollmentService enrollmentService;
    private final RatingService ratingService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Enrollment createEnrollment(@RequestBody EnrollmentRequest enrollmentRequest) {
        try {
            log.info("Nhận request tạo enrollment: studentId={}, courseId={}", 
                enrollmentRequest.getStudentId(), 
                enrollmentRequest.getCourseId());

            Enrollment result = enrollmentService.createEnrollment(enrollmentRequest);
            
            log.info("Tạo enrollment thành công: {}", result);
            return result;
        } catch (RuntimeException e) {
            log.error("Lỗi khi tạo enrollment: {}", e.getMessage(), e);
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }

    @GetMapping
    public List<Enrollment> getAllEnrollments() {
        return enrollmentService.getAllEnrollments();
    }

    @GetMapping("/{id}")
    public Optional<Enrollment> getEnrollmentById(@PathVariable Long id) {
        return enrollmentService.getEnrollmentById(id);
    }

    @PutMapping("/{id}")
    public Enrollment updateEnrollment(@PathVariable Long id, @RequestBody Enrollment enrollment) {
        return enrollmentService.updateEnrollment(id, enrollment);
    }

    @DeleteMapping("/{id}")
    public void deleteEnrollment(@PathVariable Long id) {
        enrollmentService.deleteEnrollment(id);
    }

    @GetMapping("/student/{studentId}")
    public List<Enrollment> getEnrollmentsByStudentId(@PathVariable String studentId) {
        return enrollmentService.getEnrollmentsByStudentId(studentId);
    }

    @GetMapping("/course/{courseId}/count")
    public ResponseEntity<Long> countEnrollmentsByCourseId(@PathVariable String courseId) {
        long count = enrollmentService.countEnrollmentsByCourseId(courseId);
        return ResponseEntity.ok(count);
    }

    @GetMapping("/course/{courseId}/students")
    public ResponseEntity<List<Enrollment>> getStudentsByCourseId(@PathVariable String courseId) {
        List<Enrollment> enrollments = enrollmentService.getEnrollmentsByCourseId(courseId);

        if (enrollments.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }

        return new ResponseEntity<>(enrollments, HttpStatus.OK);
    }

    @GetMapping("/course/{courseId}/details")
    public ResponseEntity<CourseEnrollmentResponse> getCourseEnrollmentDetails(@PathVariable String courseId) {
        try {
            CourseEnrollmentResponse response = enrollmentService.getCourseEnrollmentDetails(courseId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

  

    // API đánh giá khóa học
    // Đánh giá khóa học dựa trên studentId và courseId
    @PostMapping("ratings/rate")
    public ResponseEntity<Rating> rateCourse(@RequestBody Rating rating) {
        try {
            Rating savedRating = ratingService.rateCourse(rating.getStudentId(), rating.getCourseId(), rating);
            return ResponseEntity.ok(savedRating);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }
    // API lấy danh sách đánh giá cho khóa học
    @GetMapping("ratings/courses/{courseId}/ratings")
    public ResponseEntity<List<RatingWithUserInfoResponse>> getRatingsByCourse(@PathVariable String courseId) {
        return ResponseEntity.ok(ratingService.getRatingsByCourseWithUserInfo(courseId));
    }

    @GetMapping("ratings/course/{courseId}/student/{studentId}")
    public ResponseEntity<Rating> getRatingByCourseIdAndStudentId(@PathVariable String courseId,@PathVariable String studentId) {
        return ResponseEntity.ok(ratingService.getRatingByCourseIdAndStudentId(courseId,studentId));
    }

    @GetMapping("ratings/course/{courseId}/average")
    public ResponseEntity<Double> getAverageRatingByCourseId(@PathVariable String courseId) {
        return ResponseEntity.ok(ratingService.getAverageRatingByCourseId(courseId));
    }

    @GetMapping("/revenue")
    public ResponseEntity<Map<String, Object>> getTotalRevenue(
            @RequestParam(required = false) Integer days) {
        Map<String, Object> revenue = enrollmentService.getTotalRevenue(days);
        return new ResponseEntity<>(revenue, HttpStatus.OK);
    }

    @GetMapping("/revenue/instructor/{userId}")
    public ResponseEntity<Map<String, Object>> getInstructorRevenue(
            @PathVariable String userId,
            @RequestParam(required = false) Integer days) {
        Map<String, Object> revenue = enrollmentService.getInstructorRevenue(userId, days);
        return new ResponseEntity<>(revenue, HttpStatus.OK);
    }
    
}
