package com.example.banking_system.controller;

import com.example.banking_system.dto.AccountCreateRequest;
import com.example.banking_system.dto.AccountResponse;
import com.example.banking_system.dto.MessageResponse;
import com.example.banking_system.service.AccountService;
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
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/accounts")
@Tag(name = "Account Management", description = "Account management APIs")
@SecurityRequirement(name = "bearerAuth")
public class AccountController {
    
    private final AccountService accountService;
    
    public AccountController(AccountService accountService) {
        this.accountService = accountService;
    }
    
    @PostMapping("/create")
    @Operation(
        summary = "Create new account", 
        description = "Create a new bank account for the authenticated user. Account number is auto-generated."
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200", 
            description = "Account created successfully",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = AccountResponse.class),
                examples = @ExampleObject(
                    value = "{\"id\":1,\"accountNumber\":\"ACC1730128800001\",\"accountType\":\"SAVINGS\",\"balance\":0.00,\"createdAt\":\"2025-10-28T17:00:00\"}"
                )
            )
        ),
        @ApiResponse(
            responseCode = "400", 
            description = "Invalid account creation request",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = MessageResponse.class)
            )
        ),
        @ApiResponse(
            responseCode = "401", 
            description = "Unauthorized - JWT token required",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = MessageResponse.class)
            )
        )
    })
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('ADMIN')")
    public ResponseEntity<?> createAccount(@Valid @RequestBody AccountCreateRequest request) {
        try {
            AccountResponse account = accountService.createAccount(request);
            return ResponseEntity.ok(account);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse(e.getMessage()));
        }
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Get account by ID", description = "Get account information by account ID")
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('ADMIN')")
    public ResponseEntity<?> getAccount(@PathVariable Long id) {
        try {
            AccountResponse account = accountService.getAccountById(id);
            return ResponseEntity.ok(account);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse(e.getMessage()));
        }
    }
    
    @GetMapping("/user/{userId}")
    @Operation(summary = "Get user accounts", description = "Get all active accounts for a specific user")
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('ADMIN')")
    public ResponseEntity<?> getUserAccounts(@PathVariable Long userId) {
        try {
            List<AccountResponse> accounts = accountService.getUserAccounts(userId);
            return ResponseEntity.ok(accounts);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse(e.getMessage()));
        }
    }
    
    @GetMapping("/my-accounts")
    @Operation(summary = "Get my accounts", description = "Get all active accounts for the authenticated user")
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('ADMIN')")
    public ResponseEntity<?> getMyAccounts() {
        try {
            List<AccountResponse> accounts = accountService.getMyAccounts();
            return ResponseEntity.ok(accounts);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse(e.getMessage()));
        }
    }
    
    @GetMapping
    @Operation(summary = "Get all accounts", description = "Get all accounts in the system (admin and teller only)")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TELLER')")
    public ResponseEntity<?> getAllAccounts() {
        try {
            List<AccountResponse> accounts = accountService.getAllAccounts();
            return ResponseEntity.ok(accounts);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse(e.getMessage()));
        }
    }
    
    @PutMapping("/{id}/deactivate")
    @Operation(summary = "Deactivate account", description = "Deactivate an account (only if balance is zero)")
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('ADMIN')")
    public ResponseEntity<?> deactivateAccount(@PathVariable Long id) {
        try {
            AccountResponse account = accountService.deactivateAccount(id);
            return ResponseEntity.ok(account);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse(e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete account", description = "Permanently delete an account (admin only, zero balance required)")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteAccount(@PathVariable Long id) {
        try {
            accountService.deleteAccount(id);
            return ResponseEntity.ok(new MessageResponse("Account deleted successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse(e.getMessage()));
        }
    }
}