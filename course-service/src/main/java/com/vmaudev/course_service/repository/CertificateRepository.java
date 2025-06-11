package com.vmaudev.course_service.repository;

import com.vmaudev.course_service.model.Certificate;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CertificateRepository extends MongoRepository<Certificate, String> {
    Optional<Certificate> findByUserIdAndCourseId(String userId, String courseId);

    boolean existsByUserIdAndCourseId(String userId, String courseId);

    List<Certificate> findByUserId(String userId);

    Long countByUserId(String userId);
}