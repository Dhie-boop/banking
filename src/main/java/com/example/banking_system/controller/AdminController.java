package com.example.banking_system.controller;

import com.example.banking_system.dto.MessageResponse;
import com.example.banking_system.dto.RegisterRequest;
import com.example.banking_system.dto.TransactionResponse;
import com.example.banking_system.entity.Role;
import com.example.banking_system.entity.Transaction;
import com.example.banking_system.entity.User;
import com.example.banking_system.repository.TransactionRepository;
import com.example.banking_system.repository.UserRepository;
import com.example.banking_system.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@Tag(name = "Admin Management", description = "Administrative APIs - ADMIN role required")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TransactionRepository transactionRepository;
    
    @Autowired
    private AuthService authService;

    @GetMapping("/users")
    @Operation(
        summary = "Get all users", 
        description = "Retrieve paginated list of all users in the system. Admin access required."
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200", 
            description = "Users retrieved successfully",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = Page.class)
            )
        ),
        @ApiResponse(
            responseCode = "403", 
            description = "Access denied - ADMIN role required",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = MessageResponse.class)
            )
        )
    })
    public ResponseEntity<Page<UserSummary>> getAllUsers(
        @Parameter(description = "Pagination parameters") Pageable pageable) {
        Page<User> users = userRepository.findAll(pageable);
        Page<UserSummary> userSummaries = users.map(user -> new UserSummary(
            user.getId(),
            user.getUsername(),
            user.getEmail(),
            user.getRoles().iterator().next().getName().name(),
            user.isEnabled(),
            user.getCreatedAt(),
            user.getAccounts().size()
        ));
        
        return ResponseEntity.ok(userSummaries);
    }

    /**
     * Get user by ID - Admin only
     */
    @GetMapping("/users/{userId}")
    public ResponseEntity<UserDetails> getUserById(@PathVariable Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

        UserDetails userDetails = new UserDetails(
            user.getId(),
            user.getUsername(),
            user.getEmail(),
            user.getRoles().iterator().next().getName().name(),
            user.isEnabled(),
            user.getCreatedAt(),
            user.getUpdatedAt(),
            user.getAccounts().stream()
                .map(account -> new AccountSummary(
                    account.getId(),
                    account.getAccountNumber(),
                    account.getAccountType().name(),
                    account.getBalance(),
                    account.getCreatedAt()
                ))
                .collect(Collectors.toList())
        );

        return ResponseEntity.ok(userDetails);
    }

    /**
     * Get all transactions - Admin only
     */
    @GetMapping("/transactions")
    public ResponseEntity<Page<TransactionResponse>> getAllTransactions(Pageable pageable) {
        Page<Transaction> transactions = transactionRepository.findAll(pageable);
        Page<TransactionResponse> transactionResponses = transactions.map(TransactionResponse::new);

        return ResponseEntity.ok(transactionResponses);
    }

    /**
     * Get transactions by user ID - Admin only
     */
    @GetMapping("/users/{userId}/transactions")
    public ResponseEntity<Page<TransactionResponse>> getTransactionsByUserId(
            @PathVariable Long userId, 
            Pageable pageable) {
        
        // Verify user exists
        userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

        Page<Transaction> transactions = transactionRepository.findUserTransactions(userId, pageable);
        
        Page<TransactionResponse> transactionResponses = transactions.map(TransactionResponse::new);

        return ResponseEntity.ok(transactionResponses);
    }

    /**
     * Enable/Disable user - Admin only
     */
    @PutMapping("/users/{userId}/status")
    public ResponseEntity<MessageResponse> updateUserStatus(
            @PathVariable Long userId,
            @RequestBody UserStatusRequest request) {
        
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

        user.setEnabled(request.isEnabled());
        userRepository.save(user);

        String status = request.isEnabled() ? "enabled" : "disabled";
        return ResponseEntity.ok(new MessageResponse("User " + user.getUsername() + " has been " + status));
    }

    // Inner classes for DTOs
    public static class UserSummary {
        private Long id;
        private String username;
        private String email;
        private String role;
        private boolean enabled;
        private java.time.LocalDateTime createdAt;
        private int accountCount;

        public UserSummary(Long id, String username, String email, String role, 
                          boolean enabled, java.time.LocalDateTime createdAt, int accountCount) {
            this.id = id;
            this.username = username;
            this.email = email;
            this.role = role;
            this.enabled = enabled;
            this.createdAt = createdAt;
            this.accountCount = accountCount;
        }

        // Getters
        public Long getId() { return id; }
        public String getUsername() { return username; }
        public String getEmail() { return email; }
        public String getRole() { return role; }
        public boolean isEnabled() { return enabled; }
        public java.time.LocalDateTime getCreatedAt() { return createdAt; }
        public int getAccountCount() { return accountCount; }
    }

    public static class UserDetails {
        private Long id;
        private String username;
        private String email;
        private String role;
        private boolean enabled;
        private java.time.LocalDateTime createdAt;
        private java.time.LocalDateTime updatedAt;
        private List<AccountSummary> accounts;

        public UserDetails(Long id, String username, String email, String role, boolean enabled,
                          java.time.LocalDateTime createdAt, java.time.LocalDateTime updatedAt,
                          List<AccountSummary> accounts) {
            this.id = id;
            this.username = username;
            this.email = email;
            this.role = role;
            this.enabled = enabled;
            this.createdAt = createdAt;
            this.updatedAt = updatedAt;
            this.accounts = accounts;
        }

        // Getters
        public Long getId() { return id; }
        public String getUsername() { return username; }
        public String getEmail() { return email; }
        public String getRole() { return role; }
        public boolean isEnabled() { return enabled; }
        public java.time.LocalDateTime getCreatedAt() { return createdAt; }
        public java.time.LocalDateTime getUpdatedAt() { return updatedAt; }
        public List<AccountSummary> getAccounts() { return accounts; }
    }

    public static class AccountSummary {
        private Long id;
        private String accountNumber;
        private String accountType;
        private java.math.BigDecimal balance;
        private java.time.LocalDateTime createdAt;

        public AccountSummary(Long id, String accountNumber, String accountType,
                             java.math.BigDecimal balance, java.time.LocalDateTime createdAt) {
            this.id = id;
            this.accountNumber = accountNumber;
            this.accountType = accountType;
            this.balance = balance;
            this.createdAt = createdAt;
        }

        // Getters
        public Long getId() { return id; }
        public String getAccountNumber() { return accountNumber; }
        public String getAccountType() { return accountType; }
        public java.math.BigDecimal getBalance() { return balance; }
        public java.time.LocalDateTime getCreatedAt() { return createdAt; }
    }

    @PostMapping("/create-admin")
    @Operation(
        summary = "Create admin user", 
        description = "Create a new admin user. Only existing admins can create new admin accounts."
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200", 
            description = "Admin user created successfully",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = MessageResponse.class)
            )
        ),
        @ApiResponse(
            responseCode = "400", 
            description = "Username or email already exists",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = MessageResponse.class)
            )
        )
    })
    public ResponseEntity<?> createAdminUser(@RequestBody RegisterRequest registerRequest) {
        try {
            authService.createAdminUser(registerRequest, Role.RoleName.ADMIN);
            return ResponseEntity.ok(new MessageResponse("Admin user created successfully!"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse(e.getMessage()));
        }
    }
    
    @PostMapping("/create-teller")
    @Operation(
        summary = "Create teller user", 
        description = "Create a new teller user. Only existing admins can create new teller accounts."
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200", 
            description = "Teller user created successfully",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = MessageResponse.class)
            )
        ),
        @ApiResponse(
            responseCode = "400", 
            description = "Username or email already exists",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = MessageResponse.class)
            )
        )
    })
    public ResponseEntity<?> createTellerUser(@RequestBody RegisterRequest registerRequest) {
        try {
            authService.createAdminUser(registerRequest, Role.RoleName.TELLER);
            return ResponseEntity.ok(new MessageResponse("Teller user created successfully!"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse(e.getMessage()));
        }
    }

    public static class UserStatusRequest {
        private boolean enabled;

        public boolean isEnabled() { return enabled; }
        public void setEnabled(boolean enabled) { this.enabled = enabled; }
    }
}