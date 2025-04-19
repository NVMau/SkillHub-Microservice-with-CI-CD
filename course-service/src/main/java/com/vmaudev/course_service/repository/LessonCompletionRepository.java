package com.vmaudev.course_service.repository;

import com.vmaudev.course_service.model.LessonCompletion;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LessonCompletionRepository extends MongoRepository<LessonCompletion, String> {
    Optional<LessonCompletion> findByUserIdAndLessonId(String userId, String lessonId);
    List<LessonCompletion> findByUserIdAndCourseId(String userId, String courseId);
    int countByUserIdAndCourseIdAndCompletedTrue(String userId, String courseId);
} 