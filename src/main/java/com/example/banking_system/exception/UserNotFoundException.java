package com.example.banking_system.exception;

/**
 * Exception thrown when a user is not found
 */
public class UserNotFoundException extends BankingException {
    
    public UserNotFoundException(String message) {
        super(message, "USER_NOT_FOUND", 404);
    }
    
    public UserNotFoundException(Long userId) {
        super("User not found with ID: " + userId, "USER_NOT_FOUND", 404);
    }
    
    public UserNotFoundException(String field, String value) {
        super("User not found with " + field + ": " + value, "USER_NOT_FOUND", 404);
    }
}