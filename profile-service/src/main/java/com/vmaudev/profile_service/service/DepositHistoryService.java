package com.vmaudev.profile_service.service;

import com.vmaudev.profile_service.model.DepositHistory;
import com.vmaudev.profile_service.repository.DepositHistoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class DepositHistoryService {

    private final DepositHistoryRepository depositHistoryRepository;

    public List<DepositHistory> getDepositHistoryByProfileId(String profileId) {
        return depositHistoryRepository.findByProfileIdOrderByPaymentTimeDesc(profileId);
    }

    public List<DepositHistory> getAllDepositHistory(Integer days) {
        List<DepositHistory> allHistory = depositHistoryRepository.findAll(Sort.by(Sort.Direction.DESC, "paymentTime"));
        
        if (days != null) {
            LocalDateTime startDate = LocalDateTime.now().minusDays(days);
            return allHistory.stream()
                .filter(history -> history.getPaymentTime().isAfter(startDate))
                .collect(Collectors.toList());
        }
        
        return allHistory;
    }

    public Map<String, Object> getTotalDeposits(Integer days) {
        List<DepositHistory> histories = getAllDepositHistory(days);
        
        Map<String, Object> response = new HashMap<>();
        response.put("totalVnd", histories.stream()
            .filter(h -> "SUCCESS".equals(h.getStatus()))
            .map(DepositHistory::getAmountVnd)
            .reduce(BigDecimal.ZERO, BigDecimal::add));
            
        response.put("totalCoin", histories.stream()
            .filter(h -> "SUCCESS".equals(h.getStatus()))
            .map(DepositHistory::getAmountCoin)
            .reduce(BigDecimal.ZERO, BigDecimal::add));
            
        response.put("totalTransactions", histories.stream()
            .filter(h -> "SUCCESS".equals(h.getStatus()))
            .count());

        return response;
    }

    public Map<String, Object> getDepositStatistics() {
        Map<String, Object> statistics = new HashMap<>();
        List<DepositHistory> allHistories = depositHistoryRepository.findAll();
        
        // Tổng số tiền tất cả thời gian
        Map<String, Object> allTimeStats = new HashMap<>();
        allTimeStats.put("totalVnd", allHistories.stream()
            .filter(h -> "SUCCESS".equals(h.getStatus()))
            .map(DepositHistory::getAmountVnd)
            .reduce(BigDecimal.ZERO, BigDecimal::add));
        allTimeStats.put("totalCoin", allHistories.stream()
            .filter(h -> "SUCCESS".equals(h.getStatus()))
            .map(DepositHistory::getAmountCoin)
            .reduce(BigDecimal.ZERO, BigDecimal::add));
        statistics.put("allTime", allTimeStats);

        // Thống kê theo các khoảng thời gian
        int[] periods = {1, 7, 30, 100};
        for (int days : periods) {
            LocalDateTime startDate = LocalDateTime.now().minusDays(days);
            List<DepositHistory> periodHistories = allHistories.stream()
                .filter(h -> h.getPaymentTime().isAfter(startDate))
                .collect(Collectors.toList());

            Map<String, Object> periodStats = new HashMap<>();
            periodStats.put("totalVnd", periodHistories.stream()
                .filter(h -> "SUCCESS".equals(h.getStatus()))
                .map(DepositHistory::getAmountVnd)
                .reduce(BigDecimal.ZERO, BigDecimal::add));
            periodStats.put("totalCoin", periodHistories.stream()
                .filter(h -> "SUCCESS".equals(h.getStatus()))
                .map(DepositHistory::getAmountCoin)
                .reduce(BigDecimal.ZERO, BigDecimal::add));
            periodStats.put("totalTransactions", periodHistories.stream()
                .filter(h -> "SUCCESS".equals(h.getStatus()))
                .count());
            
            statistics.put(days + "days", periodStats);
        }

        return statistics;
    }

    public DepositHistory saveDepositHistory(DepositHistory depositHistory) {
        return depositHistoryRepository.save(depositHistory);
    }
} 