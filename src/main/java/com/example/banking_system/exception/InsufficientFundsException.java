package com.example.banking_system.exception;

import java.math.BigDecimal;

/**
 * Exception thrown when there are insufficient funds for a transaction
 */
public class InsufficientFundsException extends BankingException {
    
    public InsufficientFundsException(String message) {
        super(message, "INSUFFICIENT_FUNDS", 400);
    }
    
    public InsufficientFundsException(BigDecimal available, BigDecimal requested) {
        super(String.format("Insufficient funds. Available: $%.2f, Requested: $%.2f", 
              available, requested), "INSUFFICIENT_FUNDS", 400);
    }
    
    public InsufficientFundsException(String accountNumber, BigDecimal available, BigDecimal requested) {
        super(String.format("Insufficient funds in account %s. Available: $%.2f, Requested: $%.2f", 
              accountNumber, available, requested), "INSUFFICIENT_FUNDS", 400);
    }
}