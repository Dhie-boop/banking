User & Authentication Module

Entities: User, Role

APIs:

POST /api/auth/register

POST /api/auth/login

Implementation:

Secure password with BCryptPasswordEncoder

Generate JWT on successful login

Restrict access based on roles (ADMIN/CUSTOMER)


Account Management Module

Entities: Account

id, accountNumber, balance, accountType, user, createdAt

APIs:

POST /api/accounts/create – Create account

GET /api/accounts/{id} – Get account info

GET /api/accounts/user/{userId} – User’s accounts



Transaction Module

Entities: Transaction

id, amount, type (DEPOSIT/WITHDRAW/TRANSFER), sourceAccount, targetAccount, timestamp

APIs:

POST /api/transactions/deposit

POST /api/transactions/withdraw

POST /api/transactions/transfer

GET /api/transactions/account/{accountId}

Logic:

Handle atomic updates using @Transactional

Validate sufficient funds before withdrawal/transfer


Admin Module

APIs:

GET /api/admin/users – List all users

GET /api/admin/transactions – View all transactions

Access: Restricted to role ADMIN