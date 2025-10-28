package com.example.banking_system.exception;

/**
 * Exception thrown when access is forbidden
 */
public class AccessDeniedException extends BankingException {
    
    public AccessDeniedException(String message) {
        super(message, "ACCESS_DENIED", 403);
    }
    
    public static AccessDeniedException insufficientRole() {
        return new AccessDeniedException("Insufficient role permissions for this operation");
    }
    
    public static AccessDeniedException accountOwnership() {
        return new AccessDeniedException("You can only access your own accounts");
    }
    
    public static AccessDeniedException adminRequired() {
        return new AccessDeniedException("Admin role required for this operation");
    }
}