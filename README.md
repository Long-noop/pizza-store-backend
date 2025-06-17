# Pizza Store Backend

## Introduction
Welcome to the Pizza Store Backend project! This backend service manages a pizza store's operations, including order processing, inventory management, and user authentication, with a MySQL database hosted on Amazon RDS.

## Technologies Used
- **Backend**: ![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
- **Database**: ![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
- **Authentication**: ![JSON Web Tokens](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)
- **Containerization**: ![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
- **Cloud Hosting**: ![AWS EC2](https://img.shields.io/badge/AWS_EC2-FF9900?style=for-the-badge&logo=amazonaws&logoColor=white), ![AWS RDS](https://img.shields.io/badge/AWS_RDS-527FFF?style=for-the-badge&logo=amazonaws&logoColor=white)

## Features
- **Order Management**: Create, update, and delete orders.
- **Inventory Management**: Manage inventory items including adding and updating pizzas and ingredients.
- **User Authentication**: Secure login and signup functionality for customers and employees.
- **Cart Management**: Add, update, and remove items from the cart.
- **Voucher System**: Apply and revoke vouchers and loyalty points for discounts.
- **File Uploads**: Upload images for menus and food items.
- **Store Management**: Manage store details, including address and operating hours.
- **Supplier Management**: Manage suppliers and their provided ingredients.
- **Menu Management**: Add, update, and delete menus and their associated food items.

## Getting Started

### Prerequisites
Before you begin, ensure you have the following installed:
- Node.js
- npm (Node Package Manager)
- MySQL Workbench (for database management)
- Docker (for containerization)

### Installation
1. **Clone the repository**:
   ```bash
   git clone https://github.com/Long-noop/pizza-store-backend.git
   ```

2. **Install the dependencies**:
   ```bash
   npm install
   ```

### Configuration
#### Set Up Database:
Ensure your Amazon RDS MySQL instance is up and running.

Update the database configuration in your `.env` file with your RDS endpoint, username, and password:
```
DB_HOST=your-rds-endpoint
DB_USER=your-username
DB_PASSWORD=your-password
DB_NAME=your-database-name
JWT_SECRET=your-jwt-secret
PORT=8080
```

### Running the Project
Start the server:
```bash
npm start
```
The backend server will start and connect to your MySQL database on Amazon RDS.

## Deployment

### Using Docker
1. **Build the Docker image**:
   ```bash
   docker build -t pizza-backend:1.0 .
   ```

2. **Run the Docker container**:
   ```bash
   docker run -p 8080:80 --env-file .env pizza-backend:1.0
   ```

### Deploying to AWS EC2 and RDS
1. **Set up an EC2 instance**:
   - Launch an EC2 instance with Ubuntu.
   - Install Docker and Docker Compose on the instance.

2. **Set up RDS**:
   - Create an RDS MySQL instance.
   - Configure the security group to allow connections from the EC2 instance.

3. **Deploy the application**:
   - Copy the project files to the EC2 instance.
   - Use the provided `docker-compose.yml` file to start the application:
     ```bash
     docker-compose up -d
     ```

4. **Access the application**:
   - The application will be accessible via the public IP of the EC2 instance on the specified port.
