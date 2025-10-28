# Banking System - AI Coding Instructions

## Project Overview
This is a Spring Boot 3.5.7 banking system using Java 21. The project is currently in a skeleton state with missing core components that need to be implemented.

## Architecture & Structure

### Technology Stack
- **Spring Boot 3.5.7** with Java 21
- **Database**: PostgreSQL (production), H2 (development/testing)
- **Security**: Spring Security with role-based access
- **ORM**: Spring Data JPA with validation
- **Build**: Maven with wrapper (`./mvnw`)
- **Boilerplate**: Lombok annotations

### Package Structure
Follow this established pattern:
```
com.example.banking_system/
├── entity/          # JPA entities (missing - needs User, Account, Transaction)
├── repository/      # Spring Data JPA repositories (missing - needs UserRepository)
├── service/         # Business logic layer (missing)
├── controller/      # REST controllers (missing)
├── config/          # Configuration classes (DataSeeder exists)
└── dto/             # Data transfer objects (missing)
```

### Critical Missing Components
The project currently fails to compile due to missing:
1. `User` entity (referenced in DataSeeder)
2. `UserRepository` interface (referenced in DataSeeder)
3. Core banking entities (Account, Transaction)
4. Service and controller layers

## Development Workflows

### Build & Run
```bash
# Compile and check for errors
./mvnw clean compile

# Run application (after fixing compilation errors)
./mvnw spring-boot:run

# Run tests
./mvnw test
```

### Database Setup
- **Development**: H2 in-memory database (auto-configured)
- **Production**: PostgreSQL (configure in application.properties)
- **Data Seeding**: `DataSeeder.java` creates admin user on first run
  - Username: `admin`
  - Password: `admin123` (BCrypt encoded)

## Project-Specific Conventions

### Entity Design Patterns
Based on the DataSeeder, expect this pattern for User entity:
```java
@Entity
public class User {
    private String username;
    private String password;  // BCrypt encoded
    private String email;
    private String role;      // Role-based security (ADMIN, USER, etc.)
    // Use Lombok @Data, @Entity, @Id, @GeneratedValue
}
```

### Security Configuration
- Uses Spring Security with password encoding
- Role-based access control (DataSeeder creates ADMIN role)
- Password encoder bean is already injected in DataSeeder

### Repository Pattern
- Use Spring Data JPA interfaces
- Follow naming: `EntityNameRepository extends JpaRepository<EntityName, IdType>`
- The UserRepository is expected to have standard CRUD + `count()` method

### Configuration Approach
- Use `@Configuration` classes in `config/` package
- `@Bean` methods for infrastructure setup (see DataSeeder pattern)
- CommandLineRunner pattern for initialization logic

## Development Priorities

### Immediate Tasks (to fix compilation)
1. Create `User` entity with fields matching DataSeeder usage
2. Create `UserRepository` interface extending JpaRepository
3. Add basic `PasswordEncoder` configuration bean

### Core Banking Domain
When implementing banking features, follow this domain model:
- **User**: Authentication and user management
- **Account**: Bank accounts (checking, savings) with balance
- **Transaction**: Money transfers between accounts
- **Security**: Role-based access (ADMIN can manage all, USER can access own accounts)

### Error Handling
- Use Spring Boot's validation annotations
- Implement proper exception handling for banking operations
- Consider transaction rollback for failed money transfers

## Integration Points
- Database connection via Spring Data JPA auto-configuration
- Security integration through Spring Security
- Web layer will use Spring MVC controllers
- Testing uses Spring Boot Test with security test support

## Development Commands
```bash
# Start development with auto-reload
./mvnw spring-boot:run -Dspring.profiles.active=dev

# Check dependencies
./mvnw dependency:tree

# Generate project info
./mvnw help:effective-pom
```

When implementing new features, prioritize fixing the compilation errors first, then follow the established Spring Boot patterns shown in the existing configuration.