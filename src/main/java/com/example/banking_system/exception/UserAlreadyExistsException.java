package com.example.banking_system.exception;

/**
 * Exception thrown when a user already exists (duplicate username/email)
 */
public class UserAlreadyExistsException extends BankingException {
    
    public UserAlreadyExistsException(String message) {
        super(message, "USER_ALREADY_EXISTS", 409);
    }
    
    public static UserAlreadyExistsException username(String username) {
        return new UserAlreadyExistsException("Username '" + username + "' is already taken");
    }
    
    public static UserAlreadyExistsException email(String email) {
        return new UserAlreadyExistsException("Email '" + email + "' is already registered");
    }
}