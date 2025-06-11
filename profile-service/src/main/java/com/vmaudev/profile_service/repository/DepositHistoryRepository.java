package com.vmaudev.profile_service.repository;

import com.vmaudev.profile_service.model.DepositHistory;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DepositHistoryRepository extends MongoRepository<DepositHistory, String> {
    List<DepositHistory> findByProfileIdOrderByPaymentTimeDesc(String profileId);
} 