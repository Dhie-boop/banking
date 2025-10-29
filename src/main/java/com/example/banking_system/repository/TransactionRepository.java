package com.example.banking_system.repository;

import com.example.banking_system.entity.Transaction;
import com.example.banking_system.entity.Account;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    
    Optional<Transaction> findByReferenceNumber(String referenceNumber);
    
    List<Transaction> findBySourceAccountIdOrTargetAccountId(Long sourceAccountId, Long targetAccountId);
    
    Page<Transaction> findBySourceAccountOrTargetAccountOrderByTimestampDesc(
            Account sourceAccount, Account targetAccount, Pageable pageable);
    
    @Query("SELECT t FROM Transaction t WHERE " +
           "(t.sourceAccount.id = :accountId OR t.targetAccount.id = :accountId) " +
           "AND t.timestamp BETWEEN :startDate AND :endDate " +
           "ORDER BY t.timestamp DESC")
    List<Transaction> findAccountTransactionsByDateRange(
            @Param("accountId") Long accountId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT t FROM Transaction t WHERE " +
           "t.sourceAccount.user.id = :userId OR t.targetAccount.user.id = :userId " +
           "ORDER BY t.timestamp DESC")
    Page<Transaction> findUserTransactions(@Param("userId") Long userId, Pageable pageable);
    
    List<Transaction> findByTimestampBetweenOrderByTimestampDesc(
            LocalDateTime startDate, LocalDateTime endDate);
    
    // Dashboard specific queries
    List<Transaction> findByTimestampAfter(LocalDateTime timestamp);
    
    @Query("SELECT t FROM Transaction t WHERE " +
           "(t.sourceAccount IN :accounts OR t.targetAccount IN :accounts) " +
           "AND t.timestamp > :timestamp " +
           "ORDER BY t.timestamp DESC")
    List<Transaction> findByUserAccountsAndTimestampAfter(
            @Param("accounts") List<Account> accounts,
            @Param("timestamp") LocalDateTime timestamp);
}