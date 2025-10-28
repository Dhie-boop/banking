package com.example.banking_system.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.example.banking_system.entity.User;
import com.example.banking_system.entity.Role;
import com.example.banking_system.repository.UserRepository;
import com.example.banking_system.repository.RoleRepository;

import java.util.Set;

@Configuration
public class DataSeeder {

    @Bean
    CommandLineRunner initDatabase(UserRepository userRepository, RoleRepository roleRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            // Create default roles
            if (roleRepository.count() == 0) {
                Role adminRole = new Role();
                adminRole.setName(Role.RoleName.ADMIN);
                roleRepository.save(adminRole);
                
                Role customerRole = new Role();
                customerRole.setName(Role.RoleName.CUSTOMER);
                roleRepository.save(customerRole);
                
                Role tellerRole = new Role();
                tellerRole.setName(Role.RoleName.TELLER);
                roleRepository.save(tellerRole);
                
                System.out.println("✅ Default roles created (ADMIN, CUSTOMER, TELLER)!");
            }
            
            // Create initial admin user only (for production setup)
            if (userRepository.count() == 0) {
                Role adminRole = roleRepository.findByName(Role.RoleName.ADMIN)
                    .orElseThrow(() -> new RuntimeException("Admin role not found"));
                
                // Create initial system admin
                User admin = new User();
                admin.setUsername("sysadmin");
                admin.setPassword(passwordEncoder.encode("BankAdmin2025!"));
                admin.setEmail("admin@bankingsystem.com");
                admin.setFirstName("System");
                admin.setLastName("Administrator");
                admin.setEnabled(true);
                admin.setRoles(Set.of(adminRole));
                userRepository.save(admin);
                
                System.out.println("✅ Initial system administrator created!");
                System.out.println("   Username: sysadmin");
                System.out.println("   Password: BankAdmin2025!");
                System.out.println("   Email: admin@bankingsystem.com");
                System.out.println("   NOTE: Additional admin/teller accounts must be created through admin panel.");
            }
        };
    }
}