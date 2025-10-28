package com.example.banking_system.service;

import com.example.banking_system.dto.JwtResponse;
import com.example.banking_system.dto.LoginRequest;
import com.example.banking_system.dto.RegisterRequest;
import com.example.banking_system.entity.Role;
import com.example.banking_system.entity.User;
import com.example.banking_system.exception.UserAlreadyExistsException;
import com.example.banking_system.exception.UserNotFoundException;
import com.example.banking_system.repository.RoleRepository;
import com.example.banking_system.repository.UserRepository;
import com.example.banking_system.security.JwtUtil;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;

@Service
@Transactional
public class AuthService {
    
    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    
    public AuthService(AuthenticationManager authenticationManager,
                      UserRepository userRepository,
                      RoleRepository roleRepository,
                      PasswordEncoder passwordEncoder,
                      JwtUtil jwtUtil) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }
    
    public JwtResponse authenticateUser(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));
        
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        String jwt = jwtUtil.generateToken(userDetails);
        
        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new UserNotFoundException("username", userDetails.getUsername()));
        
        String roleName = user.getRoles().iterator().next().getName().name();
        
        return new JwtResponse(jwt, user.getId(), user.getUsername(), user.getEmail(), roleName);
    }
    
    public User registerUser(RegisterRequest registerRequest) {
        // Check if username exists
        if (userRepository.existsByUsername(registerRequest.getUsername())) {
            throw UserAlreadyExistsException.username(registerRequest.getUsername());
        }
        
        // Check if email exists
        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            throw UserAlreadyExistsException.email(registerRequest.getEmail());
        }
        
        // Create new user
        User user = new User();
        user.setUsername(registerRequest.getUsername());
        user.setEmail(registerRequest.getEmail());
        user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
        user.setFirstName(registerRequest.getFirstName());
        user.setLastName(registerRequest.getLastName());
        user.setPhoneNumber(registerRequest.getPhoneNumber());
        user.setEnabled(true);
        
        // Set default role as CUSTOMER
        Role customerRole = roleRepository.findByName(Role.RoleName.CUSTOMER)
                .orElseThrow(() -> new RuntimeException("Error: Customer role not found - please contact system administrator"));
        
        user.setRoles(Set.of(customerRole));
        
        return userRepository.save(user);
    }
    
    public boolean existsByUsername(String username) {
        return userRepository.existsByUsername(username);
    }
    
    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }
}