package com.example.banking_system.dto;

import com.example.banking_system.entity.Role;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class AdminUserRequest extends RegisterRequest {
    private Role.RoleName role = Role.RoleName.CUSTOMER;
}
