package com.vmaudev.enrollment_service.service;

import com.vmaudev.course_service.event.CourseDeleteEvent;
import com.vmaudev.enrollment_service.dto.CourseEnrollmentResponse;
import com.vmaudev.enrollment_service.dto.CourseResponse;
import com.vmaudev.enrollment_service.dto.EnrollmentRequest;
import com.vmaudev.enrollment_service.dto.EnrollmentRevenueDetail;
import com.vmaudev.enrollment_service.dto.ProfileResponse;
import com.vmaudev.enrollment_service.dto.StudentEnrollmentInfo;
import com.vmaudev.enrollment_service.event.OrderPlacedEvent;
import com.vmaudev.enrollment_service.model.Enrollment;
import com.vmaudev.enrollment_service.repository.CourseClient;
import com.vmaudev.enrollment_service.repository.EnrollmentRepository;
import com.vmaudev.enrollment_service.repository.ProfileClient;
import com.vmaudev.profile_service.event.ProfileDeleteEvent;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.HashMap;
import java.util.ArrayList;

@Service
@RequiredArgsConstructor
@Slf4j
public class EnrollmentService {

    private final EnrollmentRepository enrollmentRepository;
    private final KafkaTemplate<String,OrderPlacedEvent>kafkaTemplate;
    private final ProfileClient profileClient;
    private final CourseClient courseClient; // Inject ProfileServiceClient

    public Enrollment createEnrollment(EnrollmentRequest enrollmentRequest) {
        // Kiểm tra xem người dùng đã đăng ký khóa học này chưa
        Optional<Enrollment> existingEnrollment = enrollmentRepository
                .findByStudentIdAndCourseId(enrollmentRequest.getStudentId(), enrollmentRequest.getCourseId());
        if (existingEnrollment.isPresent()) {
            throw new RuntimeException("Student has already enrolled in this course.");
        }


        var authentication = SecurityContextHolder.getContext().getAuthentication();
        String token = "";


        if (authentication instanceof JwtAuthenticationToken) {
            JwtAuthenticationToken jwtAuth = (JwtAuthenticationToken) authentication;
            token = "Bearer " + jwtAuth.getToken().getTokenValue();
        } else {
            throw new RuntimeException("Token không hợp lệ");
        }

        // Lấy thông tin người dùng từ Profile Service
        ProfileResponse profile = profileClient.getUserById(enrollmentRequest.getStudentId(), token);

        CourseResponse course = courseClient.getCourseById(enrollmentRequest.getCourseId(),token);
        // Kiểm tra xem học sinh có đủ tiền để đăng ký khóa học hay không
        BigDecimal coursePrice = course.getPrice(); // Giá của khóa học
        BigDecimal studentBalance = profile.getCoin(); // Số tiền hiện tại của học sinh

        if (studentBalance.compareTo(coursePrice) < 0) {
            throw new RuntimeException("Không đủ tiền để đăng ký khóa học này.");
        }

        BigDecimal newBalance = studentBalance.subtract(coursePrice);
        profile.setCoin(newBalance);

        profileClient.updateUserProfile(profile.getProfileId(), profile,token);
        //Xu ly transaction
        ProfileResponse profileTeacher = profileClient.getUserById(course.getTeacherId(), token);
        BigDecimal teacherAmount = coursePrice.multiply(BigDecimal.valueOf(0.9));
        BigDecimal currentCoin = profileTeacher.getCoin() != null ? profileTeacher.getCoin() : BigDecimal.ZERO;
        // Cộng thêm số coin mới
        profileTeacher.setCoin(currentCoin.add(teacherAmount));
        profileClient.updateUserProfile(profileTeacher.getProfileId(), profileTeacher,token);
        

        Enrollment enrollment = new Enrollment();
        enrollment.setStudentId(enrollmentRequest.getStudentId());
        enrollment.setCourseId(enrollmentRequest.getCourseId());
        enrollment.setEnrollmentDate(LocalDateTime.now()); // Gán ngày giờ hiện tại


        OrderPlacedEvent orderPlacedEvent = new OrderPlacedEvent();
        orderPlacedEvent.setCourseId(enrollment.getCourseId());
        orderPlacedEvent.setEmail(profile.getEmail());
        orderPlacedEvent.setLastName(profile.getLastName());
        orderPlacedEvent.setFirstName(profile.getFirstName());
        log.info("Start -Sending OrderPlaceEvent {} to Kafka topic order-placed ",orderPlacedEvent);
        kafkaTemplate.send("order-placed", orderPlacedEvent);
        log.info("End -Sending OrderPlaceEvent {} to Kafka topic order-placed ",orderPlacedEvent);

        return enrollmentRepository.save(enrollment);
        //Sent message to student to Kafka Topic



    }

    public List<Enrollment> getAllEnrollments() {
        return enrollmentRepository.findAll();
    }

    public Optional<Enrollment> getEnrollmentById(Long id) {
        return enrollmentRepository.findById(id);
    }

    public Enrollment updateEnrollment(Long id, Enrollment updatedEnrollment) {
        return enrollmentRepository.findById(id)
                .map(enrollment -> {
                    enrollment.setStudentId(updatedEnrollment.getStudentId());
                    enrollment.setCourseId(updatedEnrollment.getCourseId());
                    enrollment.setEnrollmentDate(updatedEnrollment.getEnrollmentDate());
                    return enrollmentRepository.save(enrollment);
                })
                .orElseThrow(() -> new RuntimeException("Enrollment not found with id " + id));
    }

    public void deleteEnrollment(Long id) {
        enrollmentRepository.deleteById(id);
    }


    public List<Enrollment> getEnrollmentsByStudentId(String studentId) {
        return enrollmentRepository.findByStudentId(studentId);
    }



    @KafkaListener(topics = "user-deleted")
    @Transactional
    public void handleProfileDelete(ProfileDeleteEvent profileDeleteEvent) {
        String profileId = profileDeleteEvent.getProfileId().toString();
        // Xóa dữ liệu liên quan đến profileId trong enrollment-service
        List<Enrollment> enrollments = enrollmentRepository.findByStudentId(profileId);
        if (enrollments != null && !enrollments.isEmpty()) {
            // Thực hiện xóa hoặc các hành động khác
            log.info("Delete done for topc user-deleted!!");
            enrollmentRepository.deleteByStudentId(profileId);
        } else {
            log.info("Không có bản ghi nào liên quan đến profileId này.");
        }
    }

    @KafkaListener(topics = "course-deleted")
    @Transactional
    public void handleCourseDelete(CourseDeleteEvent courseDeleteEvent) {
        String courseId = courseDeleteEvent.getCourseId().toString();
        // Xóa dữ liệu liên quan đến profileId trong enrollment-service
        List<Enrollment> enrollments = enrollmentRepository.findByCourseId(courseId);
        if (enrollments != null && !enrollments.isEmpty()) {
            // Thực hiện xóa hoặc các hành động khác
            log.info("Delete done for topc course-deleted!!");
            enrollmentRepository.deleteByCourseId(courseId);
        } else {
            log.info("Không có bản ghi nào liên quan đến courseId này.");
        }
    }

    // Đếm số lượng học sinh đã đăng ký theo courseId
    public long countEnrollmentsByCourseId(String courseId) {
        return enrollmentRepository.countByCourseId(courseId);
    }

    public List<Enrollment> getEnrollmentsByCourseId(String courseId) {
        return enrollmentRepository.findByCourseId(courseId);
    }

    public CourseEnrollmentResponse getCourseEnrollmentDetails(String courseId) {
        try {
            // Lấy token từ SecurityContext
            var authentication = SecurityContextHolder.getContext().getAuthentication();
            final String token;
            if (authentication instanceof JwtAuthenticationToken) {
                JwtAuthenticationToken jwtAuth = (JwtAuthenticationToken) authentication;
                token = "Bearer " + jwtAuth.getToken().getTokenValue();
            } else {
                throw new RuntimeException("Token không hợp lệ");
            }

            // Lấy danh sách đăng ký
            List<Enrollment> enrollments = enrollmentRepository.findByCourseId(courseId);
            
            // Lấy thông tin chi tiết của từng học viên
            List<StudentEnrollmentInfo> studentInfos = enrollments.stream()
                .map(enrollment -> {
                    try {
                        ProfileResponse profile = profileClient.getUserById(enrollment.getStudentId(), token);
                        return StudentEnrollmentInfo.builder()
                            .studentId(enrollment.getStudentId())
                            .fullName(profile.getFirstName() + " " + profile.getLastName())
                            .avatar(profile.getAvatarUrl())
                            .email(profile.getEmail())
                            .enrollmentDate(enrollment.getEnrollmentDate())
                            .build();
                    } catch (Exception e) {
                        log.error("Lỗi khi lấy thông tin học viên {}: {}", enrollment.getStudentId(), e.getMessage());
                        return null;
                    }
                })
                .filter(info -> info != null)
                .collect(Collectors.toList());

            return CourseEnrollmentResponse.builder()
                .courseId(courseId)
                .totalStudents(studentInfos.size())
                .students(studentInfos)
                .build();
        } catch (Exception e) {
            log.error("Lỗi khi lấy thông tin đăng ký khóa học {}: {}", courseId, e.getMessage());
            throw new RuntimeException("Không thể lấy thông tin đăng ký khóa học", e);
        }
    }

    public Map<String, Object> getTotalRevenue(Integer days) {
        try {
            var authentication = SecurityContextHolder.getContext().getAuthentication();
            String token = "";
            if (authentication instanceof JwtAuthenticationToken) {
                JwtAuthenticationToken jwtAuth = (JwtAuthenticationToken) authentication;
                token = "Bearer " + jwtAuth.getToken().getTokenValue();
            } else {
                throw new RuntimeException("Token không hợp lệ");
            }

            LocalDateTime startDate = days != null ? 
                LocalDateTime.now().minusDays(days) : 
                LocalDateTime.now().minusYears(1);

            List<Enrollment> enrollments = enrollmentRepository.findByEnrollmentDateAfter(startDate);
            BigDecimal totalRevenue = BigDecimal.ZERO;
            BigDecimal platformRevenue = BigDecimal.ZERO;
            BigDecimal teacherRevenue = BigDecimal.ZERO;
            int validEnrollments = 0;
            List<EnrollmentRevenueDetail> enrollmentDetails = new ArrayList<>();

            for (Enrollment enrollment : enrollments) {
                try {
                    CourseResponse course = courseClient.getCourseById(enrollment.getCourseId(), token);
                    if (course != null && course.getPrice() != null) {
                        BigDecimal coursePrice = course.getPrice();
                        totalRevenue = totalRevenue.add(coursePrice);
                        
                        // Platform gets 10% of the course price
                        BigDecimal platformShare = coursePrice.multiply(BigDecimal.valueOf(0.1));
                        platformRevenue = platformRevenue.add(platformShare);
                        
                        // Teacher gets 90% of the course price
                        BigDecimal teacherShare = coursePrice.multiply(BigDecimal.valueOf(0.9));
                        teacherRevenue = teacherRevenue.add(teacherShare);
                        validEnrollments++;

                        // Get student profile information
                        ProfileResponse studentProfile = profileClient.getUserById(enrollment.getStudentId(), token);
                        String studentName = studentProfile.getFirstName() + " " + studentProfile.getLastName();

                        // Add enrollment details with course name and student name
                        enrollmentDetails.add(EnrollmentRevenueDetail.builder()
                            .userId(enrollment.getStudentId())
                            .courseId(enrollment.getCourseId())
                            .courseName(course.getName())
                            .studentName(studentName)
                            .coursePrice(coursePrice)
                            .teacherRevenue(teacherShare)
                            .platformRevenue(platformShare)
                            .enrollmentDate(enrollment.getEnrollmentDate())
                            .build());
                    } else {
                        log.warn("Course not found or has no price for courseId: {}", enrollment.getCourseId());
                    }
                } catch (Exception e) {
                    log.error("Error getting course info for courseId {}: {}", enrollment.getCourseId(), e.getMessage());
                }
            }

            Map<String, Object> result = new HashMap<>();
            result.put("totalRevenue", totalRevenue);
            result.put("platformRevenue", platformRevenue);
            result.put("teacherRevenue", teacherRevenue);
            result.put("totalEnrollments", enrollments.size());
            result.put("validEnrollments", validEnrollments);
            result.put("period", days != null ? days + " days" : "1 year");
            result.put("enrollmentDetails", enrollmentDetails);

            return result;
        } catch (Exception e) {
            log.error("Error calculating total revenue: {}", e.getMessage());
            throw new RuntimeException("Failed to calculate total revenue", e);
        }
    }

    public Map<String, Object> getInstructorRevenue(String userId, Integer days) {
        try {
            var authentication = SecurityContextHolder.getContext().getAuthentication();
            String token = "";
            if (authentication instanceof JwtAuthenticationToken) {
                JwtAuthenticationToken jwtAuth = (JwtAuthenticationToken) authentication;
                token = "Bearer " + jwtAuth.getToken().getTokenValue();
            } else {
                throw new RuntimeException("Token không hợp lệ");
            }

            LocalDateTime startDate = days != null ? 
                LocalDateTime.now().minusDays(days) : 
                LocalDateTime.now().minusYears(1);

            List<Enrollment> allEnrollments = enrollmentRepository.findByEnrollmentDateAfter(startDate);
            BigDecimal totalRevenue = BigDecimal.ZERO;
            int totalEnrollments = 0;
            List<EnrollmentRevenueDetail> enrollmentDetails = new ArrayList<>();

            for (Enrollment enrollment : allEnrollments) {
                try {
                    CourseResponse course = courseClient.getCourseById(enrollment.getCourseId(), token);
                    if (course != null && course.getPrice() != null && course.getTeacherId().equals(userId)) {
                        BigDecimal coursePrice = course.getPrice();
                        BigDecimal teacherShare = coursePrice.multiply(BigDecimal.valueOf(0.9));
                        totalRevenue = totalRevenue.add(teacherShare);
                        totalEnrollments++;

                        // Get student profile information
                        ProfileResponse studentProfile = profileClient.getUserById(enrollment.getStudentId(), token);
                        String studentName = studentProfile.getFirstName() + " " + studentProfile.getLastName();

                        // Add enrollment details with course name and student name
                        enrollmentDetails.add(EnrollmentRevenueDetail.builder()
                            .userId(enrollment.getStudentId())
                            .courseId(enrollment.getCourseId())
                            .courseName(course.getName())
                            .studentName(studentName)
                            .coursePrice(coursePrice)
                            .teacherRevenue(teacherShare)
                            .platformRevenue(coursePrice.multiply(BigDecimal.valueOf(0.1)))
                            .enrollmentDate(enrollment.getEnrollmentDate())
                            .build());
                    }
                } catch (Exception e) {
                    log.error("Error getting course info for courseId {}: {}", enrollment.getCourseId(), e.getMessage());
                }
            }

            Map<String, Object> result = new HashMap<>();
            result.put("totalRevenue", totalRevenue);
            result.put("totalEnrollments", totalEnrollments);
            result.put("period", days != null ? days + " days" : "1 year");
            result.put("enrollmentDetails", enrollmentDetails);

            return result;
        } catch (Exception e) {
            log.error("Error calculating instructor revenue: {}", e.getMessage());
            throw new RuntimeException("Failed to calculate instructor revenue", e);
        }
    }

}


