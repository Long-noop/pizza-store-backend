# Pizza Store Backend

## Introduction
Welcome to the Pizza Store Backend project! This backend service manages a pizza store's operations, including order processing and inventory management, with a MySQL database hosted on Amazon RDS.

## Technologies Used
- **Backend**: Node.js
- **Database**: MySQL (Amazon RDS)

## Features
- **Order Management**: Create, update, and delete orders.
- **Inventory Management**: Manage inventory items including adding and updating pizzas.
- **User Authentication**: Secure login and signup functionality.

## Getting Started

### Prerequisites
Before you begin, ensure you have the following installed:
- Node.js
- npm (Node Package Manager)
- MySQL Workbench (for database management)

### Installation
1. **Clone the repository**:
   ```bash
   git clone https://github.com/Long-noop/pizza-store-backend.git
   
Install the dependencies:

bash
npm install

Configuration
Set Up Database:

Ensure your Amazon RDS MySQL instance is up and running.

Update the database configuration in your config.js file with your RDS endpoint, username, and password.

Example config.js:

javascript
module.exports = {
  host: "your-rds-endpoint",
  user: "your-username",
  password: "your-password",
  database: "your-database-name"
};

Running the Project
Start the server:

npm start
The backend server will start and connect to your MySQL database on Amazon RDS.
