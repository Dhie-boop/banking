package com.example.banking_system.controller;

import com.example.banking_system.dto.JwtResponse;
import com.example.banking_system.dto.LoginRequest;
import com.example.banking_system.dto.MessageResponse;
import com.example.banking_system.dto.RegisterRequest;
import com.example.banking_system.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication", description = "Authentication management APIs")
public class AuthController {
    
    private final AuthService authService;
    
    public AuthController(AuthService authService) {
        this.authService = authService;
    }
    
    @PostMapping("/login")
    @Operation(
        summary = "User login", 
        description = "Authenticate user with username and password, returns JWT token for subsequent API calls"
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200", 
            description = "Login successful",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = JwtResponse.class),
                examples = @ExampleObject(
                    value = "{\"token\":\"eyJhbGciOiJIUzUxMiJ9...\",\"type\":\"Bearer\",\"username\":\"john_doe\",\"email\":\"john@example.com\",\"roles\":[\"CUSTOMER\"]}"
                )
            )
        ),
        @ApiResponse(
            responseCode = "401", 
            description = "Invalid credentials",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = MessageResponse.class),
                examples = @ExampleObject(
                    value = "{\"message\":\"Invalid username or password\"}"
                )
            )
        )
    })
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            JwtResponse jwtResponse = authService.authenticateUser(loginRequest);
            return ResponseEntity.ok(jwtResponse);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: Invalid username or password!"));
        }
    }
    
    @PostMapping("/register")
    @Operation(
        summary = "User registration", 
        description = "Register a new user account with username, email, and password. Default role is CUSTOMER."
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200", 
            description = "Registration successful",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = MessageResponse.class),
                examples = @ExampleObject(
                    value = "{\"message\":\"User registered successfully!\"}"
                )
            )
        ),
        @ApiResponse(
            responseCode = "400", 
            description = "Registration failed - username or email already exists",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = MessageResponse.class),
                examples = @ExampleObject(
                    value = "{\"message\":\"Error: Username is already taken!\"}"
                )
            )
        )
    })
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegisterRequest registerRequest) {
        try {
            authService.registerUser(registerRequest);
            return ResponseEntity.ok(new MessageResponse("User registered successfully!"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse(e.getMessage()));
        }
    }
    
    @GetMapping("/check-username")
    @Operation(summary = "Check username availability", description = "Check if username is available")
    public ResponseEntity<?> checkUsername(@RequestParam String username) {
        boolean exists = authService.existsByUsername(username);
        if (exists) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Username is already taken!"));
        }
        return ResponseEntity.ok(new MessageResponse("Username is available"));
    }
    
    @GetMapping("/check-email")
    @Operation(summary = "Check email availability", description = "Check if email is available")
    public ResponseEntity<?> checkEmail(@RequestParam String email) {
        boolean exists = authService.existsByEmail(email);
        if (exists) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Email is already in use!"));
        }
        return ResponseEntity.ok(new MessageResponse("Email is available"));
    }
}