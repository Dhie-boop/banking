package com.example.banking_system.service;

import com.example.banking_system.dto.DashboardStatsDTO;
import com.example.banking_system.entity.Account;
import com.example.banking_system.entity.Transaction;
import com.example.banking_system.entity.User;
import com.example.banking_system.repository.AccountRepository;
import com.example.banking_system.repository.TransactionRepository;
import com.example.banking_system.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@Service
@Transactional(readOnly = true)
public class DashboardService {

    @Autowired
    private UserService userService;

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private UserRepository userRepository;

    public DashboardStatsDTO getAdminStats() {
        DashboardStatsDTO stats = new DashboardStatsDTO();
        
        // User statistics
        stats.setTotalUsers(userService.getTotalUserCount());
        stats.setCustomerCount(userService.getCustomerCount());
        stats.setAdminCount(userService.getAdminCount());
        stats.setTellerCount(userService.getTellerCount());
        
        // Account statistics
        List<Account> allAccounts = accountRepository.findAll();
        stats.setTotalAccounts(allAccounts.size());
        stats.setCheckingAccounts(allAccounts.stream()
                .filter(account -> account.getAccountType() == Account.AccountType.CHECKING)
                .count());
        stats.setSavingsAccounts(allAccounts.stream()
                .filter(account -> account.getAccountType() == Account.AccountType.SAVINGS)
                .count());
        
        // Balance calculations
        BigDecimal totalBalance = allAccounts.stream()
                .map(Account::getBalance)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        stats.setTotalBalance(totalBalance);
        
        if (!allAccounts.isEmpty()) {
            stats.setAverageBalance(totalBalance.divide(
                    BigDecimal.valueOf(allAccounts.size()), 2, BigDecimal.ROUND_HALF_UP));
        } else {
            stats.setAverageBalance(BigDecimal.ZERO);
        }
        
        // Transaction statistics
        List<Transaction> allTransactions = transactionRepository.findAll();
        stats.setRecentTransactions(allTransactions.size());
        
        // Transaction type breakdown
        stats.setDepositsCount(allTransactions.stream()
                .filter(tx -> tx.getType() == Transaction.TransactionType.DEPOSIT)
                .count());
        stats.setWithdrawalsCount(allTransactions.stream()
                .filter(tx -> tx.getType() == Transaction.TransactionType.WITHDRAW)
                .count());
        stats.setTransfersCount(allTransactions.stream()
                .filter(tx -> tx.getType() == Transaction.TransactionType.TRANSFER)
                .count());
        
        // Transaction amounts
        stats.setTotalDeposits(allTransactions.stream()
                .filter(tx -> tx.getType() == Transaction.TransactionType.DEPOSIT)
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add));
        stats.setTotalWithdrawals(allTransactions.stream()
                .filter(tx -> tx.getType() == Transaction.TransactionType.WITHDRAW)
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add));
        stats.setTotalTransfers(allTransactions.stream()
                .filter(tx -> tx.getType() == Transaction.TransactionType.TRANSFER)
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add));
        
        // Recent activity (last 30 days)
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        List<Transaction> recentTransactions = transactionRepository.findByTimestampAfter(thirtyDaysAgo);
        
        stats.setRecentDeposits(recentTransactions.stream()
                .filter(tx -> tx.getType() == Transaction.TransactionType.DEPOSIT)
                .count());
        stats.setRecentWithdrawals(recentTransactions.stream()
                .filter(tx -> tx.getType() == Transaction.TransactionType.WITHDRAW)
                .count());
        stats.setRecentTransfers(recentTransactions.stream()
                .filter(tx -> tx.getType() == Transaction.TransactionType.TRANSFER)
                .count());
        
        // Largest transaction
        stats.setLargestTransaction(allTransactions.stream()
                .map(Transaction::getAmount)
                .max(BigDecimal::compareTo)
                .orElse(BigDecimal.ZERO));
        
        return stats;
    }

    public DashboardStatsDTO getTellerStats() {
        // Teller sees customer-focused statistics
        DashboardStatsDTO stats = new DashboardStatsDTO();
        
        stats.setCustomerCount(userService.getCustomerCount());
        
        List<Account> allAccounts = accountRepository.findAll();
        stats.setTotalAccounts(allAccounts.size());
        
        BigDecimal totalBalance = allAccounts.stream()
                .map(Account::getBalance)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        stats.setTotalBalance(totalBalance);
        
        // Recent transactions (last 7 days for teller view)
        LocalDateTime sevenDaysAgo = LocalDateTime.now().minusDays(7);
        List<Transaction> recentTransactions = transactionRepository.findByTimestampAfter(sevenDaysAgo);
        stats.setRecentTransactions(recentTransactions.size());
        
        return stats;
    }

    public DashboardStatsDTO getCustomerStats(String username) {
        DashboardStatsDTO stats = new DashboardStatsDTO();
        
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
        
        List<Account> userAccounts = accountRepository.findByUserId(user.getId());
        stats.setTotalAccounts(userAccounts.size());
        
        BigDecimal totalBalance = userAccounts.stream()
                .map(Account::getBalance)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        stats.setTotalBalance(totalBalance);
        
        // Customer's recent transactions (last 30 days)
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        List<Transaction> userTransactions = transactionRepository.findByUserAccountsAndTimestampAfter(
                userAccounts, thirtyDaysAgo);
        stats.setRecentTransactions(userTransactions.size());
        
        // Additional customer-specific data
        Map<String, Object> additionalData = new HashMap<>();
        additionalData.put("accountNumbers", userAccounts.stream()
                .map(Account::getAccountNumber)
                .toList());
        stats.setAdditionalData(additionalData);
        
        return stats;
    }
}