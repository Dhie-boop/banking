package com.example.banking_system.repository;

import com.example.banking_system.entity.Account;
import com.example.banking_system.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AccountRepository extends JpaRepository<Account, Long> {
    
    Optional<Account> findByAccountNumber(String accountNumber);
    
    List<Account> findByUserId(Long userId);
    
    List<Account> findByUser(User user);
    
    List<Account> findByUserAndIsActiveTrue(User user);
    
    boolean existsByAccountNumber(String accountNumber);
    
    @Query("SELECT a FROM Account a WHERE a.user.id = :userId AND a.isActive = true")
    List<Account> findActiveAccountsByUserId(@Param("userId") Long userId);
    
    @Query("SELECT COUNT(a) FROM Account a WHERE a.user.id = :userId AND a.isActive = true")
    Long countActiveAccountsByUserId(@Param("userId") Long userId);
}