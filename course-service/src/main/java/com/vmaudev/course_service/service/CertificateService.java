package com.vmaudev.course_service.service;

import com.vmaudev.course_service.dto.response.CertificateResponse;
import com.vmaudev.course_service.dto.response.CertificateStatusResponse;
import com.vmaudev.course_service.dto.response.ProfileResponse;
import com.vmaudev.course_service.model.Certificate;
import com.vmaudev.course_service.repository.CertificateRepository;
import com.vmaudev.course_service.repository.ProfileClient;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class CertificateService {
    private final CertificateRepository certificateRepository;
    private final CourseService courseService;
    private final ProfileClient profileClient;
    private final LessonCompletionService lessonCompletionService;

    public CertificateStatusResponse checkCertificateStatus(String courseId, String userId) {
        // Check if course is completed
        var progress = lessonCompletionService.getLearningProgress(userId, courseId);
        if (progress.getLessonProgressPercentage() < 100) {
            return new CertificateStatusResponse(false, "Course not completed");
        }

        // Check if certificate exists
        boolean hasCertificate = certificateRepository.existsByUserIdAndCourseId(userId, courseId);
        return new CertificateStatusResponse(hasCertificate, 
            hasCertificate ? "Certificate already issued" : "Certificate available");
    }

    public CertificateResponse issueCertificate(String courseId, String userId) {
        // Check if course is completed
        var progress = lessonCompletionService.getLearningProgress(userId, courseId);
        if (progress.getLessonProgressPercentage() < 100) {
            throw new RuntimeException("Course not completed");
        }

        // Check if certificate already exists
        if (certificateRepository.existsByUserIdAndCourseId(userId, courseId)) {
            throw new RuntimeException("Certificate already issued");
        }
        String token = getTokenFromSecurityContext();

        // Get course and user information
        var course = courseService.getCourseById(courseId);

        // Lấy thông tin học viên
        ProfileResponse studentProfile = profileClient.getUserById(userId, token);
        String studentName = studentProfile.getFirstName() + " " + studentProfile.getLastName();

        // Lấy thông tin giảng viên
        ProfileResponse teacherProfile = profileClient.getUserById(course.getTeacherId(), token);
        String teacherName = teacherProfile.getFirstName() + " " + teacherProfile.getLastName();

        // Generate certificate number
        String certificateNumber = generateCertificateNumber();

        // Create and save certificate
        Certificate certificate = Certificate.builder()
                .userId(userId)
                .courseId(courseId)
                .studentName(studentName)
                .courseName(course.getName())
                .instructorName(teacherName)
                .issuedDate(LocalDateTime.now())
                .certificateNumber(certificateNumber)
                .status("ACTIVE")
                .build();

        certificate = certificateRepository.save(certificate);

        return mapToCertificateResponse(certificate);
    }

    public CertificateResponse getCertificate(String courseId, String userId) {
        Certificate certificate = certificateRepository.findByUserIdAndCourseId(userId, courseId)
                .orElseThrow(() -> new RuntimeException("Certificate not found"));

        return mapToCertificateResponse(certificate);
    }

    public List<CertificateResponse> getAllCertificatesByUserId(String userId) {
        List<Certificate> certificates = certificateRepository.findByUserId(userId);
        return certificates.stream()
                .map(this::mapToCertificateResponse)
                .toList();
    }

    public Long countCertificatesByUserId(String userId) {
        return certificateRepository.countByUserId(userId);
    }

    private String generateCertificateNumber() {
        // Format: CERT-YYYYMMDD-XXXXX
        return String.format("CERT-%s-%05d",
                LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd")),
                new Random().nextInt(100000));
    }

    private CertificateResponse mapToCertificateResponse(Certificate certificate) {
        return CertificateResponse.builder()
                .id(certificate.getId())
                .certificateNumber(certificate.getCertificateNumber())
                .studentName(certificate.getStudentName())
                .courseName(certificate.getCourseName())
                .instructorName(certificate.getInstructorName())
                .issuedDate(certificate.getIssuedDate())
                .status(certificate.getStatus())
                .build();
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