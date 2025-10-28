package com.example.banking_system.service;

import com.example.banking_system.dto.AccountCreateRequest;
import com.example.banking_system.dto.AccountResponse;
import com.example.banking_system.entity.Account;
import com.example.banking_system.entity.User;
import com.example.banking_system.exception.AccessDeniedException;
import com.example.banking_system.exception.AccountNotFoundException;
import com.example.banking_system.exception.BankingException;
import com.example.banking_system.exception.UserNotFoundException;
import com.example.banking_system.repository.AccountRepository;
import com.example.banking_system.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class AccountService {
    
    private final AccountRepository accountRepository;
    private final UserRepository userRepository;
    
    public AccountService(AccountRepository accountRepository, UserRepository userRepository) {
        this.accountRepository = accountRepository;
        this.userRepository = userRepository;
    }
    
    public AccountResponse createAccount(AccountCreateRequest request) {
        // Get current authenticated user
        User user = getCurrentUser();
        
        // Check if user already has 3 accounts (business rule)
        long accountCount = accountRepository.countActiveAccountsByUserId(user.getId());
        if (accountCount >= 3) {
            throw new RuntimeException("User cannot have more than 3 active accounts");
        }
        
        // Create new account
        Account account = new Account();
        account.setUser(user);
        account.setAccountType(request.getAccountType());
        account.setBalance(BigDecimal.ZERO);
        account.setIsActive(true);
        
        Account savedAccount = accountRepository.save(account);
        return new AccountResponse(savedAccount);
    }
    
    public AccountResponse getAccountById(Long accountId) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new RuntimeException("Account not found"));
        
        // Check if current user owns this account or is admin
        User currentUser = getCurrentUser();
        if (!account.getUser().getId().equals(currentUser.getId()) && !isAdmin()) {
            throw new RuntimeException("Access denied: You can only view your own accounts");
        }
        
        return new AccountResponse(account);
    }
    
    public List<AccountResponse> getUserAccounts(Long userId) {
        // Check if current user is requesting their own accounts or is admin
        User currentUser = getCurrentUser();
        if (!currentUser.getId().equals(userId) && !isAdmin()) {
            throw new RuntimeException("Access denied: You can only view your own accounts");
        }
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        List<Account> accounts = accountRepository.findActiveAccountsByUserId(userId);
        return accounts.stream()
                .map(AccountResponse::new)
                .collect(Collectors.toList());
    }
    
    public List<AccountResponse> getMyAccounts() {
        User currentUser = getCurrentUser();
        List<Account> accounts = accountRepository.findActiveAccountsByUserId(currentUser.getId());
        return accounts.stream()
                .map(AccountResponse::new)
                .collect(Collectors.toList());
    }
    
    public AccountResponse deactivateAccount(Long accountId) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new RuntimeException("Account not found"));
        
        // Check if current user owns this account or is admin
        User currentUser = getCurrentUser();
        if (!account.getUser().getId().equals(currentUser.getId()) && !isAdmin()) {
            throw new RuntimeException("Access denied: You can only deactivate your own accounts");
        }
        
        // Business rule: Cannot deactivate account with non-zero balance
        if (account.getBalance().compareTo(BigDecimal.ZERO) != 0) {
            throw new RuntimeException("Cannot deactivate account with non-zero balance");
        }
        
        account.setIsActive(false);
        Account savedAccount = accountRepository.save(account);
        return new AccountResponse(savedAccount);
    }
    
    public Account findByAccountNumber(String accountNumber) {
        return accountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new RuntimeException("Account not found with number: " + accountNumber));
    }
    
    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Current user not found"));
    }
    
    private boolean isAdmin() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication.getAuthorities().stream()
                .anyMatch(authority -> authority.getAuthority().equals("ROLE_ADMIN"));
    }
}