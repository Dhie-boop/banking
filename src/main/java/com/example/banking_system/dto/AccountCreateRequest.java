package com.example.banking_system.dto;

import com.example.banking_system.entity.Account;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AccountCreateRequest {
    
    @NotNull(message = "Account type is required")
    private Account.AccountType accountType;
    
    private String description;
}