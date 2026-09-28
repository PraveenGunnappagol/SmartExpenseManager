## Smart Expense Manager

A personal finance management system built using **C++17, Crow, and MySQL**, with a web-based interface for tracking income, expenses, budgets, savings goals, and financial insights.

## Features

* User registration and login
* Session-based authentication
* Add and manage income and expenses
* Categorize transactions
* Monthly budget management
* Savings goal management
* Category-wise expense analysis
* Transaction history
* Financial dashboard
* Spending trend analysis
* Unusual spending detection
* Savings rate and balance calculations
* Financial reports
* CSV and PDF report export
* Persistent data storage using MySQL
* REST API using C++ and Crow
* Interactive dashboard charts using Chart.js
* Responsive web-based interface

## Technologies Used

* **C++17** – Backend and application logic
* **Crow** – REST API and HTTP web framework
* **MySQL 8** – Relational database
* **MySQL Connector/C++** – Database connectivity
* **HTML5** – Frontend structure
* **CSS3** – Styling and responsive design
* **JavaScript** – Frontend functionality and API communication
* **Chart.js** – Data visualization
* **CMake** – Build system

## Architecture

```text
                    Frontend
              HTML / CSS / JavaScript
                        │
                   HTTP / JSON
                        ↓
               C++ / Crow REST API
                        │
                        ↓
              Business Logic / Managers
                        │
                        ↓
                  MySQL Database
```

The frontend communicates with the C++ backend through HTTP requests and JSON data. Crow handles the REST API and routing, while the backend business logic processes transactions, budgets, analytics, and other operations before interacting with the MySQL database.

## Project Structure

```text
SmartExpenseManager/
│
├── backend/
│   ├── include/
│   │   ├── api/
│   │   ├── database/
│   │   ├── managers/
│   │   ├── models/
│   │   └── utils/
│   │
│   ├── src/
│   │   ├── api/
│   │   ├── database/
│   │   ├── managers/
│   │   ├── models/
│   │   └── utils/
│   │
│   └── CMakeLists.txt
│
├── frontend/
│   ├── css/
│   ├── js/
│   └── *.html
│
├── database/
│   ├── schema.sql
│   └── sample_data.sql
│
├── CMakeLists.txt
├── .gitignore
└── README.md
```

## Requirements

Before running the project, install:

* **Visual Studio / MSVC** with C++17 support
* **CMake**
* **MySQL 8**
* **MySQL Connector/C++**
* **Crow C++ Web Framework**
* **vcpkg**
* **VS Code** (recommended)
* **Live Server extension for VS Code**

## Database Setup

### 1. Start MySQL Server

Make sure your MySQL Server is running.

### 2. Create the database

Open MySQL Workbench or the MySQL command line and run:

```sql
CREATE DATABASE smart_expense_manager;
```

### 3. Create the tables

Execute:

```text
database/schema.sql
```

### 4. Optional sample data

To populate the database with sample records, execute:

```text
database/sample_data.sql
```

## Configuration

The backend requires a MySQL connection with the following information:

```text
Host: localhost
Port: 33060
Database: smart_expense_manager
Username: root
```

**Do not commit real database passwords or other credentials to GitHub.**

Use your local configuration for the MySQL password.

## Build the Backend

Open the project in VS Code and open the terminal in the project root:

```text
SmartExpenseManager/
```

Configure the project:

```cmd
cmake -S . -B build-release
```

Build the project:

```cmd
cmake --build build-release --config Release
```

After a successful build, run the generated backend executable.

The backend API runs locally on:

```text
http://localhost:18080
```

## Run the Frontend

Open the `frontend` folder in VS Code.

Right-click:

```text
frontend/index.html
```

and select:

**Open with Live Server**

The frontend will normally be available at:

```text
http://127.0.0.1:5500
```

Make sure the C++ backend is running before using features that require database access.

## Application Workflow

```text
User
 │
 ↓
Web Interface
 │
 ↓
Crow REST API
 │
 ↓
C++ Business Logic
 │
 ├── User Management
 ├── Transaction Management
 ├── Budget Management
 ├── Savings Goals
 └── Financial Analytics
 │
 ↓
MySQL Database
```

## Key Modules

### User Management

Handles user registration, login, and session-based authentication.

### Transaction Management

Allows users to record and manage income and expense transactions.

### Budget Management

Allows users to create and monitor monthly budgets.

### Savings Goals

Helps users create and track financial savings targets.

### Financial Analytics

Provides category-wise spending analysis, spending trends, balance calculations, and savings-related insights.

### Reports

Generates financial reports that can be exported in **CSV and PDF** formats.

## Purpose

Finora was developed to demonstrate practical implementation of:

* Object-Oriented Programming in C++
* REST API development
* MySQL database management
* SQL and relational database concepts
* C++ and database integration
* Frontend-backend communication
* CMake-based project configuration
* Financial data analysis and visualization

## Future Enhancements

* Mobile application
* Cloud deployment
* Automated recurring transactions
* Advanced financial analytics
* Multi-currency support
* Online banking integration
* Cloud-based data synchronization

## Author

**Praveen Gunnappagol**

GitHub:
https://github.com/PraveenGunnappagol
