package com.example.banking_system.service;

import com.example.banking_system.entity.Role;
import com.example.banking_system.entity.User;
import com.example.banking_system.exception.UserNotFoundException;
import com.example.banking_system.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("id", id.toString()));
    }

    public User updateUser(Long id, User userDetails) {
        User existingUser = getUserById(id);
        
        // Update allowed fields (don't update password, username, or roles here)
        if (userDetails.getFirstName() != null) {
            existingUser.setFirstName(userDetails.getFirstName());
        }
        if (userDetails.getLastName() != null) {
            existingUser.setLastName(userDetails.getLastName());
        }
        if (userDetails.getEmail() != null) {
            existingUser.setEmail(userDetails.getEmail());
        }
        if (userDetails.getPhoneNumber() != null) {
            existingUser.setPhoneNumber(userDetails.getPhoneNumber());
        }
        
        return userRepository.save(existingUser);
    }

    public void deleteUser(Long id) {
        User user = getUserById(id);
        
        // Check if user has accounts (prevent deletion if they do)
        if (!user.getAccounts().isEmpty()) {
            throw new RuntimeException("Cannot delete user with existing accounts. Close accounts first.");
        }
        
        userRepository.delete(user);
    }

    public void toggleUserStatus(Long id) {
        User user = getUserById(id);
        user.setEnabled(!user.isEnabled());
        userRepository.save(user);
    }

    public List<User> getAllCustomers() {
        return userRepository.findAll().stream()
                .filter(user -> user.getRoles().stream()
                        .anyMatch(role -> role.getName() == Role.RoleName.CUSTOMER))
                .collect(Collectors.toList());
    }

    public List<User> getAllAdmins() {
        return userRepository.findAll().stream()
                .filter(user -> user.getRoles().stream()
                        .anyMatch(role -> role.getName() == Role.RoleName.ADMIN))
                .collect(Collectors.toList());
    }

    public List<User> getAllTellers() {
        return userRepository.findAll().stream()
                .filter(user -> user.getRoles().stream()
                        .anyMatch(role -> role.getName() == Role.RoleName.TELLER))
                .collect(Collectors.toList());
    }

    public long getTotalUserCount() {
        return userRepository.count();
    }

    public long getCustomerCount() {
        return getAllCustomers().size();
    }

    public long getAdminCount() {
        return getAllAdmins().size();
    }

    public long getTellerCount() {
        return getAllTellers().size();
    }
}