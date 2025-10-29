package com.example.banking_system.controller;

import com.example.banking_system.dto.DashboardStatsDTO;
import com.example.banking_system.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
@Tag(name = "Dashboard", description = "Dashboard statistics and analytics")
@SecurityRequirement(name = "bearer-jwt")
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

    @GetMapping("/admin-stats")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get admin dashboard statistics", description = "Retrieve comprehensive system statistics for admin dashboard")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved admin statistics"),
        @ApiResponse(responseCode = "403", description = "Access denied - admin only")
    })
    public ResponseEntity<DashboardStatsDTO> getAdminStats() {
        DashboardStatsDTO stats = dashboardService.getAdminStats();
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/teller-stats")
    @PreAuthorize("hasRole('TELLER') or hasRole('ADMIN')")
    @Operation(summary = "Get teller dashboard statistics", description = "Retrieve statistics relevant for teller operations")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved teller statistics"),
        @ApiResponse(responseCode = "403", description = "Access denied - teller or admin only")
    })
    public ResponseEntity<DashboardStatsDTO> getTellerStats() {
        DashboardStatsDTO stats = dashboardService.getTellerStats();
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/customer-stats")
    @PreAuthorize("hasRole('CUSTOMER')")
    @Operation(summary = "Get customer dashboard statistics", description = "Retrieve personal statistics for customer dashboard")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved customer statistics"),
        @ApiResponse(responseCode = "403", description = "Access denied - customer only")
    })
    public ResponseEntity<DashboardStatsDTO> getCustomerStats(Authentication authentication) {
        String username = authentication.getName();
        DashboardStatsDTO stats = dashboardService.getCustomerStats(username);
        return ResponseEntity.ok(stats);
    }
}