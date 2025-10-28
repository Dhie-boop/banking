package com.example.banking_system.service;

import com.example.banking_system.dto.*;
import com.example.banking_system.entity.Account;
import com.example.banking_system.entity.Transaction;
import com.example.banking_system.entity.User;
import com.example.banking_system.repository.AccountRepository;
import com.example.banking_system.repository.TransactionRepository;
import com.example.banking_system.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class TransactionService {
    
    private final TransactionRepository transactionRepository;
    private final AccountRepository accountRepository;
    private final UserRepository userRepository;
    private final AccountService accountService;
    
    public TransactionService(TransactionRepository transactionRepository,
                             AccountRepository accountRepository,
                             UserRepository userRepository,
                             AccountService accountService) {
        this.transactionRepository = transactionRepository;
        this.accountRepository = accountRepository;
        this.userRepository = userRepository;
        this.accountService = accountService;
    }
    
    @Transactional
    public TransactionResponse deposit(DepositRequest request) {
        // Find target account
        Account targetAccount = accountService.findByAccountNumber(request.getAccountNumber());
        
        // Verify user owns the account or is admin
        User currentUser = getCurrentUser();
        if (!targetAccount.getUser().getId().equals(currentUser.getId()) && !isAdmin()) {
            throw new RuntimeException("Access denied: You can only deposit to your own accounts");
        }
        
        // Verify account is active
        if (!targetAccount.getIsActive()) {
            throw new RuntimeException("Cannot deposit to inactive account");
        }
        
        // Create transaction
        Transaction transaction = new Transaction();
        transaction.setAmount(request.getAmount());
        transaction.setType(Transaction.TransactionType.DEPOSIT);
        transaction.setTargetAccount(targetAccount);
        transaction.setDescription(request.getDescription() != null ? request.getDescription() : "Deposit");
        transaction.setStatus(Transaction.TransactionStatus.PENDING);
        
        try {
            // Update account balance
            BigDecimal newBalance = targetAccount.getBalance().add(request.getAmount());
            targetAccount.setBalance(newBalance);
            accountRepository.save(targetAccount);
            
            // Complete transaction
            transaction.setStatus(Transaction.TransactionStatus.COMPLETED);
            Transaction savedTransaction = transactionRepository.save(transaction);
            
            return new TransactionResponse(savedTransaction);
        } catch (Exception e) {
            transaction.setStatus(Transaction.TransactionStatus.FAILED);
            transactionRepository.save(transaction);
            throw new RuntimeException("Deposit failed: " + e.getMessage());
        }
    }
    
    @Transactional
    public TransactionResponse withdraw(WithdrawRequest request) {
        // Find source account
        Account sourceAccount = accountService.findByAccountNumber(request.getAccountNumber());
        
        // Verify user owns the account or is admin
        User currentUser = getCurrentUser();
        if (!sourceAccount.getUser().getId().equals(currentUser.getId()) && !isAdmin()) {
            throw new RuntimeException("Access denied: You can only withdraw from your own accounts");
        }
        
        // Verify account is active
        if (!sourceAccount.getIsActive()) {
            throw new RuntimeException("Cannot withdraw from inactive account");
        }
        
        // Check sufficient funds
        if (sourceAccount.getBalance().compareTo(request.getAmount()) < 0) {
            throw new RuntimeException("Insufficient funds");
        }
        
        // Create transaction
        Transaction transaction = new Transaction();
        transaction.setAmount(request.getAmount());
        transaction.setType(Transaction.TransactionType.WITHDRAW);
        transaction.setSourceAccount(sourceAccount);
        transaction.setDescription(request.getDescription() != null ? request.getDescription() : "Withdrawal");
        transaction.setStatus(Transaction.TransactionStatus.PENDING);
        
        try {
            // Update account balance
            BigDecimal newBalance = sourceAccount.getBalance().subtract(request.getAmount());
            sourceAccount.setBalance(newBalance);
            accountRepository.save(sourceAccount);
            
            // Complete transaction
            transaction.setStatus(Transaction.TransactionStatus.COMPLETED);
            Transaction savedTransaction = transactionRepository.save(transaction);
            
            return new TransactionResponse(savedTransaction);
        } catch (Exception e) {
            transaction.setStatus(Transaction.TransactionStatus.FAILED);
            transactionRepository.save(transaction);
            throw new RuntimeException("Withdrawal failed: " + e.getMessage());
        }
    }
    
    @Transactional
    public TransactionResponse transfer(TransferRequest request) {
        // Validate source and target accounts are different
        if (request.getSourceAccountNumber().equals(request.getTargetAccountNumber())) {
            throw new RuntimeException("Source and target accounts cannot be the same");
        }
        
        // Find accounts
        Account sourceAccount = accountService.findByAccountNumber(request.getSourceAccountNumber());
        Account targetAccount = accountService.findByAccountNumber(request.getTargetAccountNumber());
        
        // Verify user owns the source account or is admin
        User currentUser = getCurrentUser();
        if (!sourceAccount.getUser().getId().equals(currentUser.getId()) && !isAdmin()) {
            throw new RuntimeException("Access denied: You can only transfer from your own accounts");
        }
        
        // Verify both accounts are active
        if (!sourceAccount.getIsActive() || !targetAccount.getIsActive()) {
            throw new RuntimeException("Cannot transfer to/from inactive accounts");
        }
        
        // Check sufficient funds
        if (sourceAccount.getBalance().compareTo(request.getAmount()) < 0) {
            throw new RuntimeException("Insufficient funds");
        }
        
        // Create transaction
        Transaction transaction = new Transaction();
        transaction.setAmount(request.getAmount());
        transaction.setType(Transaction.TransactionType.TRANSFER);
        transaction.setSourceAccount(sourceAccount);
        transaction.setTargetAccount(targetAccount);
        transaction.setDescription(request.getDescription() != null ? request.getDescription() : "Transfer");
        transaction.setStatus(Transaction.TransactionStatus.PENDING);
        
        try {
            // Update account balances atomically
            BigDecimal sourceNewBalance = sourceAccount.getBalance().subtract(request.getAmount());
            BigDecimal targetNewBalance = targetAccount.getBalance().add(request.getAmount());
            
            sourceAccount.setBalance(sourceNewBalance);
            targetAccount.setBalance(targetNewBalance);
            
            accountRepository.save(sourceAccount);
            accountRepository.save(targetAccount);
            
            // Complete transaction
            transaction.setStatus(Transaction.TransactionStatus.COMPLETED);
            Transaction savedTransaction = transactionRepository.save(transaction);
            
            return new TransactionResponse(savedTransaction);
        } catch (Exception e) {
            transaction.setStatus(Transaction.TransactionStatus.FAILED);
            transactionRepository.save(transaction);
            throw new RuntimeException("Transfer failed: " + e.getMessage());
        }
    }
    
    public List<TransactionResponse> getAccountTransactions(Long accountId) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new RuntimeException("Account not found"));
        
        // Verify user owns the account or is admin
        User currentUser = getCurrentUser();
        if (!account.getUser().getId().equals(currentUser.getId()) && !isAdmin()) {
            throw new RuntimeException("Access denied: You can only view transactions for your own accounts");
        }
        
        List<Transaction> transactions = transactionRepository.findBySourceAccountIdOrTargetAccountId(accountId, accountId);
        return transactions.stream()
                .map(TransactionResponse::new)
                .toList();
    }
    
    public Page<TransactionResponse> getUserTransactions(Pageable pageable) {
        User currentUser = getCurrentUser();
        Page<Transaction> transactions = transactionRepository.findUserTransactions(currentUser.getId(), pageable);
        return transactions.map(TransactionResponse::new);
    }
    
    public TransactionResponse getTransactionByReference(String referenceNumber) {
        Transaction transaction = transactionRepository.findByReferenceNumber(referenceNumber)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));
        
        // Verify user is involved in the transaction or is admin
        User currentUser = getCurrentUser();
        boolean isUserInvolved = (transaction.getSourceAccount() != null && 
                transaction.getSourceAccount().getUser().getId().equals(currentUser.getId())) ||
                (transaction.getTargetAccount() != null && 
                transaction.getTargetAccount().getUser().getId().equals(currentUser.getId()));
        
        if (!isUserInvolved && !isAdmin()) {
            throw new RuntimeException("Access denied: You can only view your own transactions");
        }
        
        return new TransactionResponse(transaction);
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