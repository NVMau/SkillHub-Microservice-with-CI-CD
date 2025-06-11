import httpClient from "../configurations/httpClient";
import { API } from "../configurations/configuration";


export const createKnowledge = async (data) => {
  return await httpClient.post(API.KNOWLEDGE, data);
};

export const searchKnowledge = async (query, limit = 10) => {
  return await httpClient.get(`${API.KNOWLEDGE}/search`, {
    params: { query, limit }
  });
};

export const getKnowledgeById = async (id) => {
  return await httpClient.get(`${API.KNOWLEDGE}/${id}`);
};

export const updateKnowledge = async (id, data) => {
  return await httpClient.put(`${API.KNOWLEDGE}/${id}`, data);
};

export const deleteKnowledge = async (id) => {
  return await httpClient.delete(`${API.KNOWLEDGE}/${id}`);
};

export const getKnowledgeList = async (page = 1, pageSize = 10) => {
  return await httpClient.get(API.KNOWLEDGE, {
    params: { page, page_size: pageSize }
  });
}; 


// export const createKnowledge = async (data) => {
//   return await httpClient.post(`${API.KNOWLEDGE}/v1/knowledge`, data);
// };

// export const searchKnowledge = async (query, limit = 5, offset = 0) => {
//   return await httpClient.get(`${API.KNOWLEDGE}/v1/knowledge/search`, {
//     params: { query, limit, offset }
//   });
// };

// export const getKnowledgeById = async (id) => {
//   return await httpClient.get(`${API.KNOWLEDGE}/v1/knowledge/${id}`);
// };

// export const updateKnowledge = async (id, data) => {
//   return await httpClient.put(`${API.KNOWLEDGE}/v1/knowledge/${id}`, data);
// };

// export const deleteKnowledge = async (id) => {
//   return await httpClient.delete(`${API.KNOWLEDGE}/v1/knowledge/${id}`);
// };

// export const getKnowledgeList = async (page = 1, limit = 10, sort = 'created_at_desc') => {
//   return await httpClient.get(`${API.KNOWLEDGE}/v1/knowledge`, {
//     params: { page, limit, sort }
//   });
// }; 