package com.example.banking_system.dto;

import com.example.banking_system.entity.Account;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AccountResponse {
    
    private Long id;
    private String accountNumber;
    private BigDecimal balance;
    private Account.AccountType accountType;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private String ownerName;
    private Long userId;
    private String username;
    private String email;
    
    public AccountResponse(Account account) {
        this.id = account.getId();
        this.accountNumber = account.getAccountNumber();
        this.balance = account.getBalance();
        this.accountType = account.getAccountType();
        this.isActive = account.getIsActive();
        this.createdAt = account.getCreatedAt();
        this.ownerName = account.getUser().getUsername();
        this.userId = account.getUser().getId();
        this.username = account.getUser().getUsername();
        this.email = account.getUser().getEmail();
    }
}