package com.example.banking_system.controller;

import com.example.banking_system.dto.*;
import com.example.banking_system.service.TransactionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transactions")
@Tag(name = "Transaction Management", description = "Transaction management APIs")
@SecurityRequirement(name = "bearerAuth")
public class TransactionController {
    
    private final TransactionService transactionService;
    
    public TransactionController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }
    
    @PostMapping("/deposit")
    @Operation(summary = "Deposit money", description = "Deposit money to an account")
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('ADMIN')")
    public ResponseEntity<?> deposit(@Valid @RequestBody DepositRequest request) {
        try {
            TransactionResponse transaction = transactionService.deposit(request);
            return ResponseEntity.ok(transaction);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse(e.getMessage()));
        }
    }
    
    @PostMapping("/withdraw")
    @Operation(summary = "Withdraw money", description = "Withdraw money from an account")
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('ADMIN')")
    public ResponseEntity<?> withdraw(@Valid @RequestBody WithdrawRequest request) {
        try {
            TransactionResponse transaction = transactionService.withdraw(request);
            return ResponseEntity.ok(transaction);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse(e.getMessage()));
        }
    }
    
    @PostMapping("/transfer")
    @Operation(summary = "Transfer money", description = "Transfer money between accounts")
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('ADMIN')")
    public ResponseEntity<?> transfer(@Valid @RequestBody TransferRequest request) {
        try {
            TransactionResponse transaction = transactionService.transfer(request);
            return ResponseEntity.ok(transaction);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse(e.getMessage()));
        }
    }
    
    @GetMapping("/account/{accountId}")
    @Operation(summary = "Get account transactions", description = "Get all transactions for a specific account")
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('ADMIN')")
    public ResponseEntity<?> getAccountTransactions(@PathVariable Long accountId) {
        try {
            List<TransactionResponse> transactions = transactionService.getAccountTransactions(accountId);
            return ResponseEntity.ok(transactions);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse(e.getMessage()));
        }
    }
    
    @GetMapping("/my-transactions")
    @Operation(summary = "Get my transactions", description = "Get all transactions for the authenticated user")
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('ADMIN')")
    public ResponseEntity<?> getMyTransactions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "timestamp") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        try {
            Sort sort = sortDir.equalsIgnoreCase("desc") ? 
                Sort.by(sortBy).descending() : 
                Sort.by(sortBy).ascending();
            
            Pageable pageable = PageRequest.of(page, size, sort);
            Page<TransactionResponse> transactions = transactionService.getUserTransactions(pageable);
            return ResponseEntity.ok(transactions);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse(e.getMessage()));
        }
    }
    
    @GetMapping("/reference/{referenceNumber}")
    @Operation(summary = "Get transaction by reference", description = "Get transaction details by reference number")
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('ADMIN')")
    public ResponseEntity<?> getTransactionByReference(@PathVariable String referenceNumber) {
        try {
            TransactionResponse transaction = transactionService.getTransactionByReference(referenceNumber);
            return ResponseEntity.ok(transaction);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse(e.getMessage()));
        }
    }
}