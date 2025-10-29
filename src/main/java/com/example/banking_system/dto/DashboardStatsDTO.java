package com.example.banking_system.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.Map;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DashboardStatsDTO {
    
    // Common stats
    private long totalUsers;
    private long totalAccounts;
    private BigDecimal totalBalance;
    private long recentTransactions;
    
    // User role breakdown
    private long customerCount;
    private long adminCount;
    private long tellerCount;
    
    // Account type breakdown
    private long checkingAccounts;
    private long savingsAccounts;
    
    // Transaction type breakdown
    private long depositsCount;
    private long withdrawalsCount;
    private long transfersCount;
    
    // Transaction amounts
    private BigDecimal totalDeposits;
    private BigDecimal totalWithdrawals;
    private BigDecimal totalTransfers;
    
    // Recent activity (last 30 days)
    private long recentDeposits;
    private long recentWithdrawals;
    private long recentTransfers;
    
    // Additional metrics
    private BigDecimal averageBalance;
    private BigDecimal largestTransaction;
    
    // Custom data for flexibility
    private Map<String, Object> additionalData;
}