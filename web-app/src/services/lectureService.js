import httpClient from "../configurations/httpClient";
import { API } from "../configurations/configuration";


// Lấy danh sách các bài giảng theo khóa học
export const getLecturesByCourseId = async (courseId) => {
  return await httpClient.get(`${API.GET_LECTURES_BY_COURSE}/${courseId}`);
};

// Thêm bài giảng mới
export const createLecture = async (formData) => {
  return await httpClient.post(API.CREATE_LECTURE, formData, {
    headers: {
      "Content-Type": "multipart/form-data",  // Chỉ giữ lại Content-Type nếu cần
    },
  });
};

export const markLessonAsCompleted = async (lessonId, userId, courseId) => {
  try {
    const response = await httpClient.post(
      `${API.MARK_LESSON_AS_COMPLETED}/${lessonId}/complete`,
      {
        userId,
        courseId,
        completionType: "MANUAL"
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error marking lesson as completed:', error);
    throw error;
  }
};

export const checkLessonCompletionStatus = async (lessonId, userId) => {
  try {
    if (!userId) {
      console.error('checkLessonCompletionStatus called with invalid userId:', userId);
      return false;
    }
    
    console.log(`Checking completion status for lessonId=${lessonId}, userId=${userId}`);
    
    const response = await httpClient.get(`${API.LESSON_COMPLETION_URL}/${lessonId}/status`, {
      params: { userId }
    });
    return response.data; 
  } catch (error) {
    console.error('Error checking lesson completion status:', error);
    return false;
  }
};

export const getStudentsProgress = async (courseId) => {
  try {
    const response = await httpClient.get(`${API.LESSON_COMPLETION_URL}/${courseId}/students-progress`);
    return response.data;
  } catch (error) {
    console.error('Error fetching students progress:', error);
    return [];
  }
};

// curl -X POST 'http://localhost:8080/api/course/lesson-completion/lessons/{lessonId}/complete' \
// -H 'Content-Type: application/json' \
// -H 'Authorization: Bearer {token}' \
// -d '{
//     "userId": "6780f91a02de5a36a056dcf7",
//     "courseId": "67dd113a5a9f48614aac8a9e",
//     "completionType": "MANUAL"
// }'

// Cập nhật bài giảng
export const updateLecture = async (lectureId, formData) => {
  return await httpClient.put(`${API.UPDATE_LECTURE}/${lectureId}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

// Xóa bài giảng
export const deleteLecture = async (lectureId) => {
  try {
    if (!lectureId) {
      throw new Error('Lecture ID is required');
    }
    return await httpClient.delete(`/api/lectures/${lectureId}`);
  } catch (error) {
    console.error('Error deleting lecture:', error);
    throw error;
  }
};
