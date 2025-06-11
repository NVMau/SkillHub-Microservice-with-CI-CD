import httpClient from "../configurations/httpClient";
import { API } from "../configurations/configuration";

// Lấy lịch sử nạp tiền của tất cả người dùng
export const getDepositHistory = async (days) => {
  const url = days ? `${API.DEPOSIT_HISTORY}?days=${days}` : API.DEPOSIT_HISTORY;
  return await httpClient.get(url);
};

// Lấy tổng số tiền nạp của tất cả user
export const getTotalDeposits = async (days) => {
  const url = days ? `${API.TOTAL_DEPOSITS}?days=${days}` : API.TOTAL_DEPOSITS;
  return await httpClient.get(url);
};

// Lấy thống kê nạp tiền
export const getDepositStatistics = async (days) => {
  const url = days ? `${API.DEPOSIT_STATISTICS}?days=${days}` : API.DEPOSIT_STATISTICS;
  return await httpClient.get(url);
}; 