# Logistics Management System

A comprehensive **Next.js + TypeScript** frontend and **Node.js + TypeScript** backend logistics management system with role-based access control for Admins, Customers, and Drivers.

![Next.js Login Interface](https://github.com/user-attachments/assets/e6ad08c4-34fd-48c7-9d41-3b89ba7192c6)

## 🏗️ Project Structure

```
logistics-management-system/
├── client/                    # Next.js 15 + TypeScript Frontend
│   ├── src/
│   │   ├── app/              # Next.js App Router pages
│   │   ├── components/       # Reusable React components
│   │   ├── contexts/         # React Context (Auth)
│   │   ├── lib/             # API services and utilities
│   │   └── types/           # TypeScript type definitions
│   ├── package.json         # Frontend dependencies (pnpm)
│   └── tailwind.config.ts   # Tailwind CSS configuration
├── server/                   # Node.js + TypeScript Backend
│   ├── src/
│   │   ├── config/          # Database configuration
│   │   ├── controllers/     # Route handlers
│   │   ├── middleware/      # Custom middleware
│   │   ├── models/          # MongoDB models
│   │   ├── routes/          # API routes
│   │   ├── types/           # TypeScript interfaces
│   │   └── tests/           # Test files
│   ├── dist/                # Compiled JavaScript
│   ├── package.json         # Backend dependencies (pnpm)
│   └── tsconfig.json        # TypeScript configuration
└── README.md                # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- pnpm (v8 or higher)
- MongoDB (v5.0 or higher)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd logistics-management-system
   ```

2. **Install dependencies**
   ```bash
   # Install server dependencies
   cd server
   pnpm install
   
   # Install client dependencies
   cd ../client
   pnpm install
   ```

3. **Environment Setup**
   ```bash
   # Server environment
   cd ../server
   cp .env.example .env
   # Edit .env with your MongoDB URI and JWT secret
   
   # Client environment (optional)
   cd ../client
   echo "NEXT_PUBLIC_API_URL=http://localhost:5000/api" > .env.local
   ```

4. **Start Development Servers**
   ```bash
   # Terminal 1: Start backend server
   cd server
   pnpm run dev
   
   # Terminal 2: Start frontend server
   cd client
   pnpm run dev
   ```

5. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000/api

## 🛠️ Tech Stack

### Frontend (Client)
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety and better developer experience
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client for API calls
- **React Context** - State management for authentication
- **Lucide React** - Modern icon library

### Backend (Server)
- **Node.js** with **Express.js** - RESTful API server
- **TypeScript** - Complete type safety
- **MongoDB** with **Mongoose** - Database and ODM
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **express-validator** - Input validation

## Features

### 🏢 Admin Dashboard
- **User Management**: Create, view, and manage all users (customers and drivers)
- **Delivery Management**: View all deliveries, assign drivers to deliveries
- **Driver Assignment**: Assign available drivers to pending deliveries
- **System Analytics**: Monitor delivery statistics and performance metrics
- **Role-based Access Control**: Full system access and management capabilities

### 👤 Customer Dashboard
- **Delivery Requests**: Create new delivery requests with pickup and delivery addresses
- **Package Details**: Specify package descriptions, weight, and value
- **Delivery Tracking**: Track delivery status in real-time
- **Delivery History**: View all past and current deliveries
- **Status Updates**: Receive notifications on delivery progress

### 🚛 Driver Dashboard
- **Assigned Deliveries**: View all deliveries assigned by admin
- **Status Management**: Update delivery status (Pending → In Transit → Delivered)
- **Route Information**: Access pickup and delivery addresses
- **Customer Contact**: View customer information and contact details
- **Delivery Notes**: Add notes and updates for each delivery

### 🔒 Authentication & Security
- **JWT-based Authentication**: Secure token-based authentication system
- **Role-based Authorization**: Different access levels for admins, customers, and drivers
- **Password Security**: Bcrypt password hashing
- **Input Validation**: Comprehensive server-side validation using express-validator

### 📦 Delivery Management
- **Status Workflow**: Enforced delivery status progression (Pending → In Transit → Delivered)
- **Tracking System**: Unique tracking numbers for each delivery
- **Public Tracking**: Track deliveries using tracking number (no login required)
- **Address Validation**: Comprehensive address validation with zip code format checking
- **Package Details**: Weight, dimensions, value, and description tracking

## Tech Stack

### Backend
- **Node.js** with **Express.js** - RESTful API server
- **MongoDB** with **Mongoose** - Database and ODM
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **express-validator** - Input validation
- **cors** - Cross-origin resource sharing
- **helmet** - Security middleware
- **morgan** - HTTP request logging

### Frontend
- **React** with **TypeScript** - User interface
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls
- **Context API** - State management for authentication
- **Lucide React** - Modern icon library
- **Responsive Design** - Mobile-friendly interface

### Testing
- **Jest** - Unit and integration testing
- **Supertest** - HTTP assertion testing

## Database Schema

### Users Collection
```javascript
{
  name: String,
  email: String (unique, indexed),
  password: String (hashed),
  role: String ['admin', 'customer', 'driver'] (indexed),
  phone: String,
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Deliveries Collection
```javascript
{
  customerId: ObjectId (ref: User, indexed),
  driverId: ObjectId (ref: User, indexed),
  pickupAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  deliveryAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  packageDetails: {
    description: String,
    weight: Number,
    dimensions: {
      length: Number,
      width: Number,
      height: Number
    },
    value: Number
  },
  status: String ['Pending', 'InTransit', 'Delivered'] (indexed),
  estimatedDeliveryDate: Date,
  actualDeliveryDate: Date,
  deliveryNotes: String,
  trackingNumber: String (unique, indexed),
  createdAt: Date (indexed),
  updatedAt: Date
}
```

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/logistics_db
   JWT_SECRET=your_jwt_secret_key_here
   JWT_EXPIRE=7d
   NODE_ENV=development
   ```

4. **Start MongoDB**
   ```bash
   # Using MongoDB service
   sudo systemctl start mongod
   
   # Or using Docker
   docker run -d -p 27017:27017 --name mongodb mongo:latest
   ```

5. **Start the backend server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

   The API will be available at `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration** (optional)
   Create `.env` file in frontend directory:
   ```env
   REACT_APP_API_URL=http://localhost:5000/api
   ```

4. **Start the frontend development server**
   ```bash
   npm start
   ```

   The application will be available at `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user profile

### Users (Admin only)
- `GET /api/users` - Get all users
- `GET /api/users/drivers` - Get all drivers
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Deactivate user

### Deliveries
- `POST /api/deliveries` - Create delivery (Customer)
- `GET /api/deliveries` - Get deliveries (Role-based filtering)
- `GET /api/deliveries/:id` - Get delivery by ID
- `PUT /api/deliveries/:id/assign` - Assign driver (Admin)
- `PUT /api/deliveries/:id/status` - Update status (Driver/Admin)
- `GET /api/deliveries/track/:trackingNumber` - Track delivery (Public)

## Testing

### Run Backend Tests
```bash
cd backend
npm test
```

### Run Frontend Tests
```bash
cd frontend
npm test
```

## Usage Examples

### 1. Register a New User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "Password123",
    "role": "customer",
    "phone": "1234567890"
  }'
```

### 2. Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "Password123"
  }'
```

### 3. Create a Delivery (Customer)
```bash
curl -X POST http://localhost:5000/api/deliveries \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "pickupAddress": {
      "street": "123 Main St",
      "city": "New York",
      "state": "NY",
      "zipCode": "10001"
    },
    "deliveryAddress": {
      "street": "456 Oak Ave",
      "city": "Brooklyn",
      "state": "NY",
      "zipCode": "11201"
    },
    "packageDetails": {
      "description": "Electronics package",
      "weight": 2.5,
      "value": 299.99
    }
  }'
```

### 4. Track a Delivery (Public)
```bash
curl -X GET http://localhost:5000/api/deliveries/track/TRK1234567890
```

## Default User Accounts

For testing purposes, you can create these user accounts:

### Admin Account
- **Email**: admin@logistics.com
- **Password**: Admin123
- **Role**: admin

### Customer Account
- **Email**: customer@example.com
- **Password**: Customer123
- **Role**: customer

### Driver Account
- **Email**: driver@example.com
- **Password**: Driver123
- **Role**: driver

## Performance Optimizations

### Database Indexes
The system includes optimized database indexes for:
- User email (unique)
- User role
- Delivery status
- Delivery customer ID
- Delivery driver ID
- Delivery creation date
- Delivery tracking number (unique)

### API Features
- **Pagination**: All list endpoints support pagination
- **Filtering**: Filter deliveries by status, date, etc.
- **Sorting**: Sort results by relevant fields
- **Field Selection**: Optimize queries by selecting only needed fields

## Security Features

- **Password Hashing**: Bcrypt with salt rounds
- **JWT Tokens**: Secure authentication tokens
- **Input Validation**: Server-side validation for all inputs
- **Role-based Access**: Proper authorization checks
- **CORS Configuration**: Secure cross-origin requests
- **Security Headers**: Helmet.js security middleware
- **Error Handling**: Comprehensive error handling without information leakage

## Development

### Code Structure
```
logistics-management-system/
├── backend/
│   ├── config/          # Database configuration
│   ├── controllers/     # Route handlers
│   ├── middleware/      # Custom middleware
│   ├── models/          # MongoDB models
│   ├── routes/          # API routes
│   ├── tests/           # Test files
│   └── server.js        # Main server file
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── contexts/    # React contexts
│   │   ├── dashboards/  # Role-based dashboards
│   │   ├── pages/       # Page components
│   │   ├── services/    # API services
│   │   └── types/       # TypeScript types
│   └── public/          # Static files
└── README.md
```

### Contributing
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.

## Support

For support and questions, please create an issue in the GitHub repository.