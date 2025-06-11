package com.vmaudev.lecture_service.controller;

import com.vmaudev.lecture_service.model.Lecture;
import com.vmaudev.lecture_service.service.LectureService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/lectures")
public class LectureController {
    private final LectureService lectureService;

    public LectureController(LectureService lectureService) {
        this.lectureService = lectureService;
    }

    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<Lecture>> getLecturesByCourseId(@PathVariable String courseId) {
        return ResponseEntity.ok(lectureService.getLecturesByCourseId(courseId));
    }

    @PostMapping(consumes = {"multipart/form-data"})
    public ResponseEntity<Lecture> createLecture(
            @RequestParam("courseId") String courseId,
            @RequestParam("title") String title,
            @RequestParam("content") String content,
            @RequestPart("file") MultipartFile file,  // File PDF/Word
            @RequestPart("videos") List<MultipartFile> videos  // Danh sách các video
    ) throws IOException {
        Lecture lecture = Lecture.builder()
                .courseId(courseId)
                .title(title)
                .content(content)
                .build();

        return ResponseEntity.ok(lectureService.createLecture(lecture, file, videos));
    }
    @GetMapping("/{lectureId}")
    public ResponseEntity<Lecture> getLectureById(@PathVariable String lectureId) {
        try {
            Lecture lecture = lectureService.getLectureById(lectureId);
            return ResponseEntity.ok(lecture);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{lectureId}")
    public ResponseEntity<Void> deleteLecture(@PathVariable String lectureId) {
        lectureService.deleteLecture(lectureId);
        return ResponseEntity.ok().build();
    }

    @PutMapping(value = "/{lectureId}", consumes = {"multipart/form-data"})
    public ResponseEntity<Lecture> updateLecture(
            @PathVariable String lectureId,
            @RequestParam("title") String title,
            @RequestParam("content") String content,
            @RequestPart(value = "file", required = false) MultipartFile file,
            @RequestPart(value = "videos", required = false) List<MultipartFile> videos
    ) throws IOException {
        Lecture updatedLecture = Lecture.builder()
                .title(title)
                .content(content)
                .build();

        Lecture result = lectureService.updateLecture(lectureId, updatedLecture, file, videos);
        return ResponseEntity.ok(result);
    }
}
