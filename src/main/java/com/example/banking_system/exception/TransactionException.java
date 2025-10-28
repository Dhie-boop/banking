package com.example.banking_system.exception;

/**
 * Exception thrown when a transaction fails
 */
public class TransactionException extends BankingException {
    
    public TransactionException(String message) {
        super(message, "TRANSACTION_FAILED", 400);
    }
    
    public TransactionException(String message, Throwable cause) {
        super(message, "TRANSACTION_FAILED", cause);
    }
    
    public static TransactionException invalidAmount() {
        return new TransactionException("Transaction amount must be greater than zero");
    }
    
    public static TransactionException selfTransfer() {
        return new TransactionException("Cannot transfer to the same account");
    }
    
    public static TransactionException processingFailed(String reason) {
        return new TransactionException("Transaction processing failed: " + reason);
    }
}