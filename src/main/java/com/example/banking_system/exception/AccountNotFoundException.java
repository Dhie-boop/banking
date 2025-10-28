package com.example.banking_system.exception;

/**
 * Exception thrown when an account is not found
 */
public class AccountNotFoundException extends BankingException {
    
    public AccountNotFoundException(Long accountId) {
        super("Account not found with ID: " + accountId, "ACCOUNT_NOT_FOUND", 404);
    }
    
    public AccountNotFoundException(String accountNumber) {
        super("Account not found with number: " + accountNumber, "ACCOUNT_NOT_FOUND", 404);
    }
}