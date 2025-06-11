package com.vmaudev.profile_service.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Document(collection = "deposit_history")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DepositHistory {
    @Id
    private String id;

    private String profileId;
    private BigDecimal amountVnd;
    private BigDecimal amountCoin;
    private String transactionId;
    private LocalDateTime paymentTime;
    private String status; // SUCCESS, FAILED, PENDING
    private String paymentMethod; // VNPAY, etc.
    private String description;
} 