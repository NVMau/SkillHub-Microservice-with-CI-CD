import httpClient from "../configurations/httpClient";
import { API } from "../configurations/configuration";
 
export const getEnrollmentRevenue = async (days) => {
  const url = days ? `${API.ENROLLMENT_REVENUE}?days=${days}` : API.ENROLLMENT_REVENUE;
  return await httpClient.get(url);
}; 

export const getInstructorRevenue = async (instructorId, days) => {
  const url = days 
    ? `${API.ENROLLMENT_REVENUE}/instructor/${instructorId}?days=${days}` 
    : `${API.ENROLLMENT_REVENUE}/instructor/${instructorId}`;
  return await httpClient.get(url);
}; 