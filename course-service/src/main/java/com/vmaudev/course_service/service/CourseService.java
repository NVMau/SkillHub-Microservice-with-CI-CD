package com.vmaudev.course_service.service;

import com.vmaudev.course_service.configuration.S3Service;
import com.vmaudev.course_service.dto.CourseRequest;
import com.vmaudev.course_service.dto.CourseResponse;
import com.vmaudev.course_service.dto.FeaturedInstructorResponse;
import com.vmaudev.course_service.dto.response.ProfileResponse;
//
import com.vmaudev.course_service.event.CourseDeleteEvent;
import com.vmaudev.course_service.model.Course;
import com.vmaudev.course_service.repository.CourseRepository;
import com.vmaudev.course_service.repository.ProfileClient;
import com.vmaudev.profile_service.event.ProfileDeleteEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.security.core.context.SecurityContextHolder;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.Comparator;
import java.text.Normalizer;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
@Slf4j
public class CourseService {
    private final CourseRepository courseRepository;
    private final S3Service s3Service;
    private final ProfileClient profileClient;
    private final KafkaTemplate<String, CourseDeleteEvent> kafkaTemplateDelete;
    private final LessonCompletionService lessonCompletionService;

    private String normalizeText(String text) {
        if (text == null) return null;
        String normalized = Normalizer.normalize(text, Normalizer.Form.NFD);
        Pattern pattern = Pattern.compile("\\p{InCombiningDiacriticalMarks}+");
        return pattern.matcher(normalized).replaceAll("").toLowerCase();
    }

    public CourseResponse createCourse(CourseRequest courseRequest, MultipartFile file) throws IOException {
        String fileUrl = s3Service.uploadFile(file);  // Upload file lên S3 và lấy URL của file

        Course course = Course.builder()
                .name(courseRequest.getName())
                .description(courseRequest.getDescription())
                .nameNormalized(normalizeText(courseRequest.getName()))
                .descriptionNormalized(normalizeText(courseRequest.getDescription()))
                .price(courseRequest.getPrice())
                .category(courseRequest.getCategory())
                .imageUrl(fileUrl)  // Lưu URL file vào imageUrl
                .tags(courseRequest.getTags())
                .teacherId(courseRequest.getTeacherId())
                .build();

        course = courseRepository.save(course);
        log.info("Course created successfully");

        return mapToCourseResponse(course);
    }

    public List<CourseResponse> getAllCourses() {
        return courseRepository.findAll().stream()
                .map(this::mapToCourseResponse)
                .collect(Collectors.toList());
    }

    public CourseResponse getCourseById(String id) {
        return courseRepository.findById(id)
                .map(this::mapToCourseResponse)
                .orElse(null);
    }

    public CourseResponse updateCourse(String id, CourseRequest courseRequest) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Course not found"));

        course.setName(courseRequest.getName());
        course.setDescription(courseRequest.getDescription());
        course.setNameNormalized(normalizeText(courseRequest.getName()));
        course.setDescriptionNormalized(normalizeText(courseRequest.getDescription()));
        course.setPrice(courseRequest.getPrice());
        course.setCategory(courseRequest.getCategory());
        course.setImageUrl(courseRequest.getImageUrl());
        course.setTags(courseRequest.getTags());
        course.setTeacherId(courseRequest.getTeacherId());

        course = courseRepository.save(course);
        log.info("Course updated successfully");

        return mapToCourseResponse(course);
    }

    public void deleteCourse(String id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Course not found with Id: " + id));
        CourseDeleteEvent courseDeleteEvent = new CourseDeleteEvent(id);
        courseDeleteEvent.setCourseId(id);
        log.info("Start -Sending CourseDeleteEvent {} to Kafka topic course-deleted",courseDeleteEvent);
        kafkaTemplateDelete.send("course-deleted", courseDeleteEvent);
        log.info("End -Sending CourseDeleteEvent {} to Kafka topic course-deleted ",courseDeleteEvent);
        courseRepository.deleteById(id);
        log.info("Course deleted successfully");
    }

    private CourseResponse mapToCourseResponse(Course course) {
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

            // Lấy thông tin giảng viên từ Profile Service
            ProfileResponse teacher = profileClient.getUserById(course.getTeacherId(), token);

            return CourseResponse.builder()
                    .id(course.getId())
                    .name(course.getName())
                    .description(course.getDescription())
                    .price(course.getPrice())
                    .category(course.getCategory())
                    .imageUrl(course.getImageUrl())
                    .createdAt(course.getCreatedAt())
                    .updatedAt(course.getUpdatedAt())
                    .tags(course.getTags())
                    .teacherId(course.getTeacherId())
                    // Thông tin giảng viên
                    .teacherName(teacher.getFirstName() + " " + teacher.getLastName())
                    .teacherAvatar(teacher.getAvatarUrl())
                    .teacherEmail(teacher.getEmail())
                    .build();
        } catch (Exception e) {
            log.error("Lỗi khi lấy thông tin giảng viên: {}", e.getMessage());
            // Trả về response không có thông tin giảng viên nếu có lỗi
            return CourseResponse.builder()
                    .id(course.getId())
                    .name(course.getName())
                    .description(course.getDescription())
                    .price(course.getPrice())
                    .category(course.getCategory())
                    .imageUrl(course.getImageUrl())
                    .createdAt(course.getCreatedAt())
                    .updatedAt(course.getUpdatedAt())
                    .tags(course.getTags())
                    .teacherId(course.getTeacherId())
                    .build();
        }
    }


    public List<Course> getCoursesByTeacherId(String teacherId) {
        return courseRepository.findByTeacherId(teacherId);
    }


    // Trong CourseService, lấy token từ SecurityContext
    public List<CourseResponse> searchCourses(String keyword, String teacherName, BigDecimal minPrice, BigDecimal maxPrice) {
        // Xử lý token từ Keycloak
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        String token = "";

        if (authentication instanceof JwtAuthenticationToken) {
            JwtAuthenticationToken jwtAuth = (JwtAuthenticationToken) authentication;
            token = "Bearer " + jwtAuth.getToken().getTokenValue();
        } else {
            throw new RuntimeException("Token không hợp lệ");
        }

        // Kiểm tra nếu không có bất kỳ tham số tìm kiếm nào
        if ((keyword == null || keyword.trim().isEmpty()) && 
            (teacherName == null || teacherName.trim().isEmpty()) && 
            minPrice == null && maxPrice == null) {
            return courseRepository.findAll().stream()
                    .map(this::mapToCourseResponse)
                    .collect(Collectors.toList());
        }

        // Normalize keyword nếu có
        String normalizedKeyword = (keyword != null && !keyword.trim().isEmpty()) ? normalizeText(keyword) : "";

        // Danh sách teacherId
        List<String> teacherIds = new ArrayList<>();
        if (teacherName != null && !teacherName.isEmpty()) {
            List<ProfileResponse> teachers = profileClient.searchUsersByName(teacherName, token);
            if (teachers != null && !teachers.isEmpty()) {
                teacherIds = teachers.stream()
                        .map(ProfileResponse::getProfileId)
                        .collect(Collectors.toList());
            } else {
                // Nếu không tìm thấy giáo viên, trả về danh sách rỗng
                return new ArrayList<>();
            }
        }

        List<Course> courses;
        // Tìm kiếm theo các trường hợp
        if (!teacherIds.isEmpty() && minPrice != null && maxPrice != null) {
            // Tìm kiếm theo keyword, teacherId, và khoảng giá
            courses = courseRepository.findCoursesWithTeacherId(normalizedKeyword, teacherIds, minPrice, maxPrice);
        } else if (!teacherIds.isEmpty()) {
            // Tìm kiếm theo keyword và teacherId, không có khoảng giá
            courses = courseRepository.findCoursesByTeacherIdOnly(normalizedKeyword, teacherIds);
        } else if (minPrice != null && maxPrice != null) {
            // Tìm kiếm theo keyword và khoảng giá, không có teacherId
            courses = courseRepository.findCoursesWithoutTeacherId(normalizedKeyword, minPrice, maxPrice);
        } else {
            // Tìm kiếm chỉ theo keyword
            courses = courseRepository.findCoursesByKeyword(normalizedKeyword);
        }

        return courses.stream()
                .map(this::mapToCourseResponse)
                .collect(Collectors.toList());
    }

    public List<FeaturedInstructorResponse> getFeaturedInstructors() {
        try {
            // Lấy tất cả các khóa học
            List<Course> allCourses = courseRepository.findAll();
            
            // Lấy token từ SecurityContext
            final String token;
            var authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication instanceof JwtAuthenticationToken) {
                JwtAuthenticationToken jwtAuth = (JwtAuthenticationToken) authentication;
                token = "Bearer " + jwtAuth.getToken().getTokenValue();
            } else {
                throw new RuntimeException("Token không hợp lệ");
            }

            // Tính toán số lượng khóa học cho mỗi giảng viên
            Map<String, FeaturedInstructorResponse> instructorStats = allCourses.stream()
                .collect(Collectors.groupingBy(
                    Course::getTeacherId,
                    Collectors.collectingAndThen(
                        Collectors.toList(),
                        courses -> {
                            String teacherId = courses.get(0).getTeacherId();
                            long totalCourses = courses.size();
                            
                            try {
                                // Lấy thông tin giảng viên từ profile service
                                ProfileResponse profile = profileClient.getUserById(teacherId, token);
                                
                                return FeaturedInstructorResponse.builder()
                                    .teacherId(teacherId)
                                    .teacherName(profile.getFirstName() + " " + profile.getLastName())
                                    .avatar(profile.getAvatarUrl())
                                    .totalCourses(totalCourses)
                                    .averageRating(0.0) // Không sử dụng rating
                                    .build();
                            } catch (Exception e) {
                                log.error("Lỗi khi lấy thông tin giảng viên từ profile service: {}", e.getMessage());
                                return null;
                            }
                        }
                    )
                ));

            // Lọc bỏ các giảng viên null và sắp xếp theo số lượng khóa học
            return instructorStats.values().stream()
                .filter(instructor -> instructor != null)
                .sorted(Comparator.comparing(FeaturedInstructorResponse::getTotalCourses).reversed())
                .limit(4)
                .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Lỗi khi lấy danh sách giảng viên tiêu biểu: {}", e.getMessage());
            throw new RuntimeException("Không thể lấy danh sách giảng viên tiêu biểu", e);
        }
    }

    public List<CourseResponse> getCoursesByCategory(String category) {
        List<Course> courses = courseRepository.findByCategory(category);
        return courses.stream()
                .map(this::mapToCourseResponse)
                .collect(Collectors.toList());
    }

}
