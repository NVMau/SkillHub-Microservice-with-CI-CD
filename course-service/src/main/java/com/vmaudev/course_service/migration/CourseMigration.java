// package com.vmaudev.course_service.migration;

// import com.vmaudev.course_service.model.Course;
// import com.vmaudev.course_service.repository.CourseRepository;
// import lombok.RequiredArgsConstructor;
// import lombok.extern.slf4j.Slf4j;
// import org.springframework.boot.CommandLineRunner;
// import org.springframework.stereotype.Component;
// import java.text.Normalizer;
// import java.util.regex.Pattern;
// import java.util.List;

// @Component
// @RequiredArgsConstructor
// @Slf4j
// public class CourseMigration implements CommandLineRunner {

//     private final CourseRepository courseRepository;

//     private String normalizeText(String text) {
//         if (text == null) return null;
//         String normalized = Normalizer.normalize(text, Normalizer.Form.NFD);
//         Pattern pattern = Pattern.compile("\\p{InCombiningDiacriticalMarks}+");
//         return pattern.matcher(normalized).replaceAll("").toLowerCase();
//     }

//     @Override
//     public void run(String... args) {
//         log.info("Bắt đầu migration cho các khóa học...");
        
//         try {
//             // Lấy tất cả khóa học
//             List<Course> courses = courseRepository.findAll();
//             log.info("Tìm thấy {} khóa học cần cập nhật", courses.size());

//             // Cập nhật từng khóa học
//             for (Course course : courses) {
//                 if (course.getNameNormalized() == null || course.getDescriptionNormalized() == null) {
//                     course.setNameNormalized(normalizeText(course.getName()));
//                     course.setDescriptionNormalized(normalizeText(course.getDescription()));
//                     courseRepository.save(course);
//                     log.info("Đã cập nhật khóa học: {}", course.getName());
//                 }
//             }

//             log.info("Hoàn thành migration cho các khóa học!");
//         } catch (Exception e) {
//             log.error("Lỗi trong quá trình migration: {}", e.getMessage());
//         }
//     }
// } 