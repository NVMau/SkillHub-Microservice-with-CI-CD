import httpClient from "../configurations/httpClient";
import { API } from "../configurations/configuration";

// Hàm tạo khóa học
export const createCourse = async (courseData) => {
  return await httpClient.post(API.CREATE_COURSE, courseData, {
    headers: {
      "Content-Type": "multipart/form-data",  // Chỉ cần giữ lại headers cần thiết khác
    },
  });
};

// Hàm lấy danh sách giáo viên
export const getTeachers = async () => {
  return await httpClient.get(API.GET_TEACHERS);
};

// Hàm lấy danh sách tất cả khóa học
export const getAllCourses = async () => {
  return await httpClient.get(API.GET_ALLCOURSE);
};

// Hàm tìm kiếm khóa học theo từ khóa, tên giáo viên, giá
export const searchCourses = async (keyword, teacherName, minPrice, maxPrice) => {
  const params = new URLSearchParams();
  if (keyword) params.append("keyword", keyword);
  if (teacherName) params.append("teacherName", teacherName);
  if (minPrice) params.append("minPrice", minPrice);
  if (maxPrice) params.append("maxPrice", maxPrice);

  return await httpClient.get(`${API.GET_ALLCOURSE}?${params.toString()}`);
};

export const deleteCourse = async (courseId) => {
  return await httpClient.delete(`${API.DELETE_COURSE}/${courseId}`);
};

export const updateCourse = async (courseData) => {
  return await httpClient.put(`${API.UPDATE_COURSE}/${courseData.id}`, courseData);
};

export const getEnrollmentCountByCourseId = async (courseId) => {
  return await httpClient.get(`${API.COUNT_USER_REGIST}/${courseId}/count`);
};

export const getAllCourseByTeacherId = async (teacherId) => {
  return await httpClient.get(`${API.GETALL_COURSE_BYTEACHERID}/${teacherId}`);
};

export const getFeaturedInstructors  = async () => {
  return await httpClient.get(`${API.FEATURED_INSTRUCTORS}`);
};

// API lấy tiến độ học tập tổng quan của user (side menu)
export const getUserOverallProgress = async (userId) => {
  return await httpClient.get(`/api/courses/overview/progress?userId=${userId}`);
};

// API lấy tiến độ học tập của sinh viên cho 1 khóa học cụ thể
export const getCourseProgress = async (courseId, userId) => {
  return await httpClient.get(`${API.LESSON_COMPLETION_PROGRESS}/${courseId}/progress?userId=${userId}`);
};

// API để kiểm tra trạng thái chứng chỉ
export const checkCertificateStatus = async (courseId, userId) => {
  return await httpClient.get(`/api/courses/${courseId}/certificate/status?userId=${userId}`);
};

// API để lấy thông tin chứng chỉ
export const getCertificate = async (courseId, userId) => {
  return await httpClient.get(`/api/courses/${courseId}/certificate?userId=${userId}`);
};

// API để tạo chứng chỉ mới
export const createCertificate = async (courseId, userId) => {
  return await httpClient.post(`/api/courses/${courseId}/certificate?userId=${userId}`);
};

// API tìm kiếm khóa học theo danh mục
export const getCoursesByCategory = async (category) => {
  return await httpClient.get(`/api/courses/category/${encodeURIComponent(category)}`);
};

// API lấy đánh giá trung bình của khóa học
export const getCourseAverageRating = async (courseId) => {
  return await httpClient.get(`/api/enrollments/ratings/course/${courseId}/average`);
};

// API lấy danh sách đánh giá và bình luận của khóa học
export const getCourseRatings = async (courseId) => {
  return await httpClient.get(`/api/enrollments/ratings/courses/${courseId}/ratings`);
};
