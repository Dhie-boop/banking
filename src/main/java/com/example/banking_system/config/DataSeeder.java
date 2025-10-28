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
                
                System.out.println("✅ Default roles created!");
            }
            
            // Create default admin user
            if (userRepository.count() == 0) {
                Role adminRole = roleRepository.findByName(Role.RoleName.ADMIN)
                    .orElseThrow(() -> new RuntimeException("Admin role not found"));
                
                User admin = new User();
                admin.setUsername("admin");
                admin.setPassword(passwordEncoder.encode("admin123"));
                admin.setEmail("admin@banking.com");
                admin.setFirstName("System");
                admin.setLastName("Administrator");
                admin.setEnabled(true);
                admin.setRoles(Set.of(adminRole));
                userRepository.save(admin);
                
                System.out.println("✅ Default admin user created!");
                System.out.println("   Username: admin");
                System.out.println("   Password: admin123");
            }
        };
    }
}