import httpClient from "../configurations/httpClient";
import { API } from "../configurations/configuration";

export const getUserCertificates = async (userId) => {
  return await httpClient.get(`${API.CREATE_COURSE}/certificates/user/${userId}`);
}; 