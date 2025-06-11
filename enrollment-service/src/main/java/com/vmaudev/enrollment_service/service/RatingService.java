package com.vmaudev.enrollment_service.service;

import com.vmaudev.enrollment_service.dto.RatingWithUserInfoResponse;
import com.vmaudev.enrollment_service.model.Enrollment;
import com.vmaudev.enrollment_service.model.Rating;
import com.vmaudev.enrollment_service.repository.EnrollmentRepository;
import com.vmaudev.enrollment_service.repository.RatingRepository;
import com.vmaudev.enrollment_service.repository.ProfileClient;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Slf4j
public class RatingService {

    @Autowired
    private RatingRepository ratingRepository;

    @Autowired
    private EnrollmentRepository enrollmentRepository;

    @Autowired
    private ProfileClient profileClient;

    // Hàm đánh giá khóa học
    public Rating rateCourse(String studentId, String courseId, Rating rating) {
        // Tìm Enrollment theo studentId và courseId
        log.info("End -Sending OrderPlaceEvent {} to Kafka topic order-placed ",studentId);
        log.info("End -Sending OrderPlaceEvent {} to Kafka topic order-placed ",courseId);
        log.info("End -Sending OrderPlaceEvent {} to Kafka topic order-placed ",rating.getComment());
        log.info("End -Sending OrderPlaceEvent {} to Kafka topic order-placed ",rating.getStars());

        Optional<Enrollment> enrollmentOpt = enrollmentRepository.findByStudentIdAndCourseId(studentId, courseId);
        if (enrollmentOpt.isEmpty()) {
            throw new RuntimeException("Sinh viên chưa tham gia khóa học này.");
        }
        // Kiểm tra xem người dùng đã đánh giá khóa học này chưa
        List<Rating> existingRatings = ratingRepository.findByStudentIdAndCourseId(studentId, courseId);
        if (!existingRatings.isEmpty()) {
            throw new RuntimeException("Bạn đã đánh giá khóa học này rồi.");
        }

        // Nếu có Enrollment, lưu đánh giá
        Enrollment enrollment = enrollmentOpt.get();
        rating.setEnrollmentId(enrollment.getId());
        rating.setStudentId(studentId);
        rating.setCourseId(courseId);
        rating.setRatedAt(LocalDateTime.now());

        return ratingRepository.save(rating);
    }

    // Lấy danh sách đánh giá cho khóa học
    public List<Rating> getRatingsByCourse(String courseId) {
        return ratingRepository.findByCourseId(courseId);
    }
    public Rating getRatingByCourseIdAndStudentId(String courseId, String studentId) {
        return ratingRepository.findByCourseIdAndStudentId(courseId, studentId);
    }

    public double getAverageRatingByCourseId(String courseId) {
        List<Rating> ratings = ratingRepository.findByCourseId(courseId);
        if (ratings.isEmpty()) {
            return 0.0;
        }
        
        double sum = ratings.stream()
                .mapToDouble(Rating::getStars)
                .sum();
        
        return Math.round((sum / ratings.size()) * 10.0) / 10.0; // Làm tròn đến 1 chữ số thập phân
    }

    // Lấy danh sách đánh giá cho khóa học với thông tin user
    public List<RatingWithUserInfoResponse> getRatingsByCourseWithUserInfo(String courseId) {
        List<Rating> ratings = ratingRepository.findByCourseId(courseId);
        String token = getTokenFromSecurityContext();
        
        return ratings.stream()
            .map(rating -> {
                RatingWithUserInfoResponse response = new RatingWithUserInfoResponse();
                response.setId(rating.getId());
                response.setStudentId(rating.getStudentId());
                response.setCourseId(rating.getCourseId());
                response.setStars(rating.getStars());
                response.setComment(rating.getComment());
                response.setRatedAt(rating.getRatedAt());
                
                try {
                    var userProfile = profileClient.getUserById(rating.getStudentId(), token);
                    response.setFullName(userProfile.getFirstName() + " " + userProfile.getLastName());
                    response.setEmail(userProfile.getEmail());
                } catch (Exception e) {
                    log.error("Error fetching user profile for user {}: {}", rating.getStudentId(), e.getMessage());
                }
                return response;
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
