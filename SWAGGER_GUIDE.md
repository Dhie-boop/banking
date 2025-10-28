# Swagger Documentation Access

Once the application is running, you can access the Swagger documentation at:

## Swagger UI
- **URL**: http://localhost:8080/swagger-ui.html
- **Interactive API Testing**: Test all endpoints directly from the browser
- **JWT Authentication**: Use the "Authorize" button to add JWT token

## API Documentation JSON
- **URL**: http://localhost:8080/api-docs
- **Raw OpenAPI specification in JSON format**

## How to Use

1. **Start the application**: `./mvnw spring-boot:run`

2. **Access Swagger UI**: Open http://localhost:8080/swagger-ui.html in your browser

3. **Register a user**: Use the `/api/auth/register` endpoint

4. **Login**: Use the `/api/auth/login` endpoint to get JWT token

5. **Authorize**: Click the "Authorize" button and enter: `Bearer <your-jwt-token>`

6. **Test APIs**: All endpoints are now available for testing with proper authentication

## Features Implemented

✅ **Interactive API Documentation**
✅ **JWT Authentication UI** 
✅ **Request/Response Examples**
✅ **Parameter Documentation**
✅ **Security Schema Configuration**
✅ **Organized by API Groups**

## API Groups Available

- **Authentication**: Login/Register endpoints
- **Account Management**: Account creation and management
- **Transaction Management**: Banking operations (deposit/withdraw/transfer)
- **Admin Management**: Administrative functions (ADMIN role required)