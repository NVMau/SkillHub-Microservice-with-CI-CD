package com.vmaudev.lecture_service.service;

import com.vmaudev.course_service.event.CourseDeleteEvent;
import com.vmaudev.lecture_service.configuration.S3Service;
import com.vmaudev.lecture_service.event.LectureDeletedEvent;
import com.vmaudev.lecture_service.model.Lecture;
import com.vmaudev.lecture_service.repository.LectureRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Date;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class LectureService {
    private final LectureRepository lectureRepository;
    private final S3Service s3Service;  // Inject S3Service
    private final KafkaTemplate<String, LectureDeletedEvent> kafkaTemplateDelete;




    public List<Lecture> getLecturesByCourseId(String courseId) {
        return lectureRepository.findByCourseIdOrderByIndexAsc(courseId);
    }

    public Lecture createLecture(Lecture lecture, MultipartFile file, List<MultipartFile> videoFiles) throws IOException {
        // Tìm bài giảng cuối cùng của khóa học để thiết lập index tiếp theo
        List<Lecture> lectures = lectureRepository.findByCourseIdOrderByIndexAsc(lecture.getCourseId());
        int nextIndex = lectures.isEmpty() ? 0 : lectures.get(lectures.size() - 1).getIndex() + 1;
        lecture.setIndex(nextIndex);

        // Tải file PDF/Word lên S3
        String fileUrl = s3Service.uploadFile(file);
        lecture.setFileUrl(fileUrl);

        // Tải các video lên S3 và lưu danh sách URL video
        List<String> videoUrls = videoFiles.stream()
                .map(video -> {
                    try {
                        return s3Service.uploadFile(video);
                    } catch (IOException e) {
                        throw new RuntimeException(e);
                    }
                })
                .toList();
        lecture.setVideoUrls(videoUrls);

        // Tạo mới
        lecture.setCreatedAt(new Date());
        lecture.setUpdatedAt(new Date());

        return lectureRepository.save(lecture);
    }

    @KafkaListener(topics = "course-deleted")
    @Transactional
    public void deleteLecturebyCouredDeleted(CourseDeleteEvent courseDeleteEvent) {
        String courseId = courseDeleteEvent.getCourseId().toString();
        List<Lecture> lectures = lectureRepository.findByCourseId(courseId);
        if (lectures != null && !lectures.isEmpty()) {
            List<CharSequence> lectureIds = lectures.stream()
                    .map(Lecture::getId)
                    .map(CharSequence.class::cast)
                    .collect(Collectors.toList());
            // Gửi sự kiện LectureDeletedEvent chứa các lectureId cần xóa
            LectureDeletedEvent lectureDeletedEvent = new LectureDeletedEvent(lectureIds);
            log.info("Start -Sending LectureDeletedEvent {} to Kafka topic lectures-deleted",lectureDeletedEvent);
            kafkaTemplateDelete.send("lectures-deleted", lectureDeletedEvent);
            log.info("End -Sending LectureDeletedEvent {} to Kafka topic lectures-deleted ",lectureDeletedEvent);
            // Thực hiện xóa
            log.info("Delete done for topc course-deleted!!");
            lectureRepository.deleteLectureByCourseId(courseId);
        } else {
            log.info("Không có bản ghi nào liên quan đến courseId này.");
        }
    }
    

    public Lecture getLectureById(String lectureId){
        return lectureRepository.findById(lectureId)
        .orElseThrow(() -> new RuntimeException("Lecture not found"));
    }


    public void deleteLecture(String lectureId) {
        try {
            log.info("Starting to delete lecture with id: {}", lectureId);
            
            // Kiểm tra bài giảng có tồn tại không
            if (!lectureRepository.existsById(lectureId)) {
                log.error("Lecture with id {} not found", lectureId);
                throw new RuntimeException("Lecture not found");
            }

            // Tạo sự kiện xóa bài giảng
            log.info("Creating LectureDeletedEvent for lecture id: {}", lectureId);
            LectureDeletedEvent lectureDeletedEvent = new LectureDeletedEvent(List.of(lectureId));
            
            // Gửi sự kiện
            log.info("Sending LectureDeletedEvent to Kafka topic lectures-deleted");
            kafkaTemplateDelete.send("lectures-deleted", lectureDeletedEvent);
            log.info("Successfully sent LectureDeletedEvent to Kafka");
            
            // Xóa bài giảng
            log.info("Deleting lecture from database");
            lectureRepository.deleteById(lectureId);
            log.info("Successfully deleted lecture with id: {}", lectureId);
        } catch (Exception e) {
            log.error("Error deleting lecture with id {}: {}", lectureId, e.getMessage(), e);
            throw e;
        }
    }

    public Lecture updateLecture(String lectureId, Lecture updatedLecture, MultipartFile file, List<MultipartFile> videoFiles) throws IOException {
        // Tìm bài giảng cần cập nhật
        Lecture existingLecture = lectureRepository.findById(lectureId)
                .orElseThrow(() -> new RuntimeException("Lecture not found"));

        // Cập nhật thông tin cơ bản
        existingLecture.setTitle(updatedLecture.getTitle());
        existingLecture.setContent(updatedLecture.getContent());
        existingLecture.setUpdatedAt(new Date());

        // Nếu có file mới, cập nhật fileUrl
        if (file != null && !file.isEmpty()) {
            String fileUrl = s3Service.uploadFile(file);
            existingLecture.setFileUrl(fileUrl);
        }

        // Nếu có video mới, cập nhật videoUrls
        if (videoFiles != null && !videoFiles.isEmpty()) {
            List<String> videoUrls = videoFiles.stream()
                    .map(video -> {
                        try {
                            return s3Service.uploadFile(video);
                        } catch (IOException e) {
                            throw new RuntimeException(e);
                        }
                    })
                    .toList();
            existingLecture.setVideoUrls(videoUrls);
        }

        return lectureRepository.save(existingLecture);
    }
}
