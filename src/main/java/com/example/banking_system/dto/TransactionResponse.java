package com.example.banking_system.dto;

import com.example.banking_system.entity.Transaction;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TransactionResponse {
    
    private Long id;
    private BigDecimal amount;
    private Transaction.TransactionType type;
    private String sourceAccountNumber;
    private String targetAccountNumber;
    private String description;
    private String referenceNumber;
    private LocalDateTime timestamp;
    private Transaction.TransactionStatus status;
    
    public TransactionResponse(Transaction transaction) {
        this.id = transaction.getId();
        this.amount = transaction.getAmount();
        this.type = transaction.getType();
        this.sourceAccountNumber = transaction.getSourceAccount() != null ? 
            transaction.getSourceAccount().getAccountNumber() : null;
        this.targetAccountNumber = transaction.getTargetAccount() != null ? 
            transaction.getTargetAccount().getAccountNumber() : null;
        this.description = transaction.getDescription();
        this.referenceNumber = transaction.getReferenceNumber();
        this.timestamp = transaction.getTimestamp();
        this.status = transaction.getStatus();
    }
}