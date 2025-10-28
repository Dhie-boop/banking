Goal: Build a responsive, modern Banking System frontend using React (Vite + TypeScript) and TailwindCSS.
The frontend should connect to Spring Boot backend APIs for authentication, user data, and transactions.

Design Style: Clean, modern, banking-grade interface with light theme, deep blue primary color (#1E40AF), subtle gray backgrounds (#F9FAFB), rounded cards, shadows, and smooth transitions.

Core Pages / Dashboards:

Login Page

Simple, centered login card with the bank’s logo, input fields for email/password, and “Sign In” button.

Responsive layout that looks elegant on both mobile and desktop.

Register Page

Clean signup form with fields for name, email, phone number, password, confirm password.

Customer Dashboard

Sidebar navigation with options: Dashboard, My Accounts, Transactions, Transfer, Profile, Logout.

Top navbar showing user profile and balance summary.

Main section showing:

Account summary cards (Account No., Balance, Account Type)

Recent transactions table

Quick transfer form (Recipient, Amount, Note)

Admin Dashboard

Sidebar with links: Overview, Customers, Accounts, Transactions, Approvals, Settings.

Overview section with analytics cards (Total Customers, Total Balance, Active Accounts)

Tables for customer management.

Teller Dashboard

Sidebar links: Customers, Transactions, Deposits, Withdrawals, Profile.

Simple transaction form for cash deposits and withdrawals.

Profile Page

Card layout showing user info, editable form for updating profile.

UI Components to Include:

Sidebar with active state highlight.

Navbar with search, notification bell, and user avatar dropdown.

Reusable card components for stats (e.g., Total Balance, Income, Expenses).

Reusable table component for transactions.

Modal component for creating new transfers.

Toast notifications for success/errors.

Libraries to Use:

axios for API calls

react-router-dom for navigation

react-icons for icons

react-toastify for notifications

Expected Outcome:

Fully responsive, role-based dashboards for Admin, Teller, and Customer.

Each component organized in src/components/ and pages in src/pages/.

Routes managed from App.tsx with protected routes for logged-in users.

Use Tailwind utility classes for consistent spacing, font sizes, and colors.

Bonus (Optional Enhancements):

Dark mode toggle.

Chart.js or Recharts integration for transaction analytics.

Animated transitions using Framer Motion

NOTE: Have created all the files in the SRC folder.