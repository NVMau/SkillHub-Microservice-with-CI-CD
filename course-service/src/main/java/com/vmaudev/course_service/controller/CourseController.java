package com.vmaudev.course_service.controller;
import com.vmaudev.course_service.dto.*;
import com.vmaudev.course_service.dto.response.LessonReponse;
import com.vmaudev.course_service.model.Course;
import com.vmaudev.course_service.service.CourseService;
import com.vmaudev.course_service.service.LessonCompletionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.List;

import static org.apache.kafka.common.requests.DeleteAclsResponse.log;

@RestController
@RequestMapping("/api/courses")
@RequiredArgsConstructor
public class CourseController {

    private final CourseService courseService;
    private final LessonCompletionService lessonCompletionService;

    @PostMapping(consumes = {"multipart/form-data"})
    @ResponseStatus(HttpStatus.CREATED)
    public CourseResponse createCourse(
            @RequestParam("name") String name,
            @RequestParam("description") String description,
            @RequestParam("price") BigDecimal price,
            @RequestParam("tags") List<String> tags,
            @RequestParam("teacherId") String teacherId,
            @RequestPart("file") MultipartFile file) throws IOException {

        CourseRequest courseRequest = CourseRequest.builder()
                .name(name)
                .description(description)
                .price(price)
                .tags(tags)
                .teacherId(teacherId)
                .build();

        return courseService.createCourse(courseRequest, file);
    }

    @GetMapping("/teacher/{teacherId}")
    public List<Course> getCoursesByTeacherId(@PathVariable String teacherId) {
        return courseService.getCoursesByTeacherId(teacherId);
    }


    @GetMapping
    public List<CourseResponse> getAllCourses() {
        return courseService.getAllCourses();
    }

    @GetMapping("/{id}")
    public CourseResponse getCourseById(@PathVariable String id) {
        return courseService.getCourseById(id);
    }

    @PutMapping("/{id}")
    public CourseResponse updateCourse(@PathVariable String id, @RequestBody CourseRequest courseRequest) {
        return courseService.updateCourse(id, courseRequest);
    }

    @DeleteMapping("/{id}")
    public void deleteCourse(@PathVariable String id) {
        courseService.deleteCourse(id);
    }


    @GetMapping("/search")
    public List<CourseResponse> searchCourses(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String teacherName,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice) {

        // Kiểm tra nếu minPrice lớn hơn maxPrice, thì trả về lỗi hoặc xử lý phù hợp
        if (minPrice != null && maxPrice != null && minPrice.compareTo(maxPrice) > 0) {
            throw new IllegalArgumentException("Giá tối thiểu không thể lớn hơn giá tối đa");
        }

        // Gọi service để xử lý tìm kiếm
        return courseService.searchCourses(keyword, teacherName, minPrice, maxPrice);
    }

    @GetMapping("/featured-instructors")
    public ResponseEntity<List<FeaturedInstructorResponse>> getFeaturedInstructors() {
        return ResponseEntity.ok(courseService.getFeaturedInstructors());
    }

    @PostMapping("/lesson-completion/{lessonId}/complete")
    public ResponseEntity<Void> markLessonAsCompleted(
            @PathVariable String lessonId,
            @RequestBody LessonCompletionRequest request) {
        log.info("Nhận request đánh dấu bài học {} đã hoàn thành", lessonId);

        lessonCompletionService.markLessonAsCompleted(
                request.getUserId(),
                request.getCourseId(),
                lessonId,
                request.getCompletionType());

        return ResponseEntity.ok().build();
    }

    @GetMapping("/lesson-completion/{lessonId}/status")
    public ResponseEntity<Boolean> getLessonCompletionStatus(
            @PathVariable String lessonId,
            @RequestParam String userId) {
        boolean isCompleted = lessonCompletionService.isLessonCompleted(userId, lessonId);
        return ResponseEntity.ok(isCompleted);
    }

    @GetMapping("/lesson-completion/course/{courseId}/completed-count")
    public ResponseEntity<Integer> getCompletedLessonsCount(
            @PathVariable String courseId,
            @RequestParam String userId) {
        int count = lessonCompletionService.getCompletedLessonsCount(userId, courseId);
        return ResponseEntity.ok(count);
    }

    @GetMapping("/lesson-completion/course/{courseId}/progress")
    public ResponseEntity<LearningProgressResponse> getLearningProgress(
            @PathVariable String courseId,
            @RequestParam String userId) {
        log.info("Getting learning progress for user {} in course {}", userId, courseId);
        return ResponseEntity.ok(lessonCompletionService.getLearningProgress(userId, courseId));
    }

    @GetMapping("/lesson-completion/course/{courseId}/lessons")
    public ResponseEntity<List<LessonReponse>> getLessonsByCourseId(
            @PathVariable String courseId) {
        log.info("Getting lessons for course {}", courseId);
        return ResponseEntity.ok(lessonCompletionService.getLessonsByCourseId(courseId));
    }

    @GetMapping("/lesson-completion/{courseId}/students-progress")
    public ResponseEntity<List<StudentLearningStatisticsResponse>> getStudentsProgress(
            @PathVariable String courseId
    ) {
        return ResponseEntity.ok(lessonCompletionService.getStudentsProgress(courseId));
    }


}
