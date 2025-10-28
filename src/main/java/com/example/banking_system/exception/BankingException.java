package com.example.banking_system.exception;

/**
 * Base exception class for all banking system related exceptions
 */
public class BankingException extends RuntimeException {
    
    private final String errorCode;
    private final int httpStatus;
    
    public BankingException(String message) {
        super(message);
        this.errorCode = "BANKING_ERROR";
        this.httpStatus = 400;
    }
    
    public BankingException(String message, String errorCode) {
        super(message);
        this.errorCode = errorCode;
        this.httpStatus = 400;
    }
    
    public BankingException(String message, String errorCode, int httpStatus) {
        super(message);
        this.errorCode = errorCode;
        this.httpStatus = httpStatus;
    }
    
    public BankingException(String message, Throwable cause) {
        super(message, cause);
        this.errorCode = "BANKING_ERROR";
        this.httpStatus = 400;
    }
    
    public BankingException(String message, String errorCode, Throwable cause) {
        super(message, cause);
        this.errorCode = errorCode;
        this.httpStatus = 400;
    }
    
    public String getErrorCode() {
        return errorCode;
    }
    
    public int getHttpStatus() {
        return httpStatus;
    }
}