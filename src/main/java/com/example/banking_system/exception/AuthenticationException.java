package com.example.banking_system.exception;

/**
 * Exception thrown when there are authentication related errors
 */
public class AuthenticationException extends BankingException {
    
    public AuthenticationException(String message) {
        super(message, "AUTHENTICATION_FAILED", 401);
    }
    
    public static AuthenticationException invalidCredentials() {
        return new AuthenticationException("Invalid username or password");
    }
    
    public static AuthenticationException userNotEnabled() {
        return new AuthenticationException("User account is disabled");
    }
    
    public static AuthenticationException invalidToken() {
        return new AuthenticationException("Invalid or expired JWT token");
    }
}