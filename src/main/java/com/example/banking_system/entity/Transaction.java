package com.example.banking_system.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "transactions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Transaction {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, precision = 19, scale = 2)
    @DecimalMin(value = "0.01", message = "Amount must be greater than 0")
    private BigDecimal amount;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TransactionType type;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "source_account_id")
    private Account sourceAccount;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "target_account_id")
    private Account targetAccount;
    
    @Column(name = "description")
    private String description;
    
    @Column(name = "reference_number", unique = true)
    private String referenceNumber;
    
    @Column(name = "timestamp", nullable = false)
    private LocalDateTime timestamp;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private TransactionStatus status = TransactionStatus.PENDING;
    
    @PrePersist
    protected void onCreate() {
        timestamp = LocalDateTime.now();
        if (referenceNumber == null || referenceNumber.isEmpty()) {
            generateReferenceNumber();
        }
    }
    
    private void generateReferenceNumber() {
        // Generate unique reference number: TXN + timestamp + random
        long timestamp = System.currentTimeMillis();
        int random = (int) (Math.random() * 1000);
        this.referenceNumber = String.format("TXN%d%03d", timestamp, random);
    }
    
    public enum TransactionType {
        DEPOSIT, WITHDRAW, TRANSFER
    }
    
    public enum TransactionStatus {
        PENDING, COMPLETED, FAILED, CANCELLED
    }
}