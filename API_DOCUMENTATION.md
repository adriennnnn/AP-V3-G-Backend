# API Documentation - Backend AP

## Base URL
```
http://localhost:3000
```

## Authentication
Most endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### Authentication (`/auth`)

#### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "username": "username",
  "role": "user"
}
```

#### Register User with Referral
```http
POST /auth/register?ref=REFERRAL_CODE
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "username": "username",
  "role": "user"
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Get Profile
```http
GET /auth/profile
Authorization: Bearer <token>
```

#### Refresh Token
```http
POST /auth/refresh
Authorization: Bearer <token>
```

#### Logout
```http
POST /auth/logout
Authorization: Bearer <token>
```

### Users (`/users`)

#### Get All Users (Admin/Author only)
```http
GET /users
GET /users?role=admin
Authorization: Bearer <token>
```

#### Get User Profile
```http
GET /users/profile
Authorization: Bearer <token>
```

#### Get User by ID (Admin/Author only)
```http
GET /users/:id
Authorization: Bearer <token>
```

#### Create User (Admin only)
```http
POST /users
Content-Type: application/json
Authorization: Bearer <token>

{
  "email": "user@example.com",
  "password": "password123",
  "username": "username",
  "role": "user"
}
```

#### Register with Referral
```http
POST /users/register-with-referral
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "username": "username",
  "referralCode": "ABC12345"
}
```

#### Update Profile
```http
PATCH /users/profile
Content-Type: application/json
Authorization: Bearer <token>

{
  "username": "newusername",
  "email": "newemail@example.com"
}
```

#### Update User (Admin only)
```http
PATCH /users/:id
Content-Type: application/json
Authorization: Bearer <token>

{
  "username": "newusername",
  "role": "author"
}
```

#### Change User Role (Admin only)
```http
PATCH /users/:id/change-role
Content-Type: application/json
Authorization: Bearer <token>

{
  "role": "admin"
}
```

#### Delete User (Admin only)
```http
DELETE /users/:id
Authorization: Bearer <token>
```

#### Get Affiliate Dashboard (Subscriber/Author/Admin only)
```http
GET /users/affiliate/dashboard
Authorization: Bearer <token>
```

#### Get Referral Link (Subscriber/Author/Admin only)
```http
GET /users/referral-link
Authorization: Bearer <token>
```

### Articles (`/articles`)

#### Get All Articles
```http
GET /articles
GET /articles?search=keyword
GET /articles?author=authorName
Authorization: Bearer <token> (optional)
```

#### Get Published Articles
```http
GET /articles/published
GET /articles/published?search=keyword
GET /articles/published?author=authorName
```

#### Get My Articles (Author/Admin only)
```http
GET /articles/my-articles
Authorization: Bearer <token>
```

#### Get Article by ID
```http
GET /articles/:id
Authorization: Bearer <token> (optional)
```

#### Create Article (Author/Admin only)
```http
POST /articles
Content-Type: application/json
Authorization: Bearer <token>

{
  "title": "Article Title",
  "content": "Article content...",
  "published": false
}
```

#### Update Article (Author/Admin only)
```http
PATCH /articles/:id
Content-Type: application/json
Authorization: Bearer <token>

{
  "title": "Updated Title",
  "content": "Updated content...",
  "published": true
}
```

#### Publish Article (Author/Admin only)
```http
PATCH /articles/:id/publish
Authorization: Bearer <token>
```

#### Unpublish Article (Author/Admin only)
```http
PATCH /articles/:id/unpublish
Authorization: Bearer <token>
```

#### Delete Article (Author/Admin only)
```http
DELETE /articles/:id
Authorization: Bearer <token>
```

### Stripe Subscriptions (`/subscriptions`)

#### Create Subscription
```http
POST /subscriptions/create
Content-Type: application/json
Authorization: Bearer <token>

{
  "plan": "basic",
  "paymentMethodId": "pm_card_visa"
}
```

#### Cancel Subscription
```http
POST /subscriptions/cancel
Authorization: Bearer <token>
```

#### Pause Subscription
```http
POST /subscriptions/pause
Authorization: Bearer <token>
```

#### Resume Subscription
```http
POST /subscriptions/resume
Authorization: Bearer <token>
```

#### Get Subscription Status
```http
GET /subscriptions/status
Authorization: Bearer <token>
```

#### Create Payment Intent
```http
POST /subscriptions/payment-intent
Content-Type: application/json
Authorization: Bearer <token>

{
  "amount": 999,
  "currency": "eur"
}
```

### Affiliate System (`/affiliate`)

#### Get Affiliate Dashboard
```http
GET /affiliate/dashboard
Authorization: Bearer <token>
```

#### Get Referral Tree
```http
GET /affiliate/referral-tree
Authorization: Bearer <token>
```

#### Calculate Commission (Subscriber/Author/Admin only)
```http
POST /affiliate/calculate-commission
Content-Type: application/json
Authorization: Bearer <token>

{
  "userId": "user-uuid",
  "amount": 29.99
}
```

#### Distribute Commission (Admin only)
```http
POST /affiliate/distribute-commission
Content-Type: application/json
Authorization: Bearer <token>

{
  "userId": "user-uuid",
  "amount": 29.99
}
```

### Affiliates Management (`/affiliates`)

#### Get All Affiliates (Admin/Author only)
```http
GET /affiliates
GET /affiliates?status=approved
Authorization: Bearer <token>
```

#### Get Affiliate by ID (Admin/Author only)
```http
GET /affiliates/:id
Authorization: Bearer <token>
```

#### Create Affiliate (Admin/Author only)
```http
POST /affiliates
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "Affiliate Name",
  "email": "affiliate@example.com",
  "phone": "+1234567890",
  "description": "Affiliate description",
  "website": "https://example.com",
  "commissionRate": 10.5
}
```

#### Update Affiliate (Admin/Author only)
```http
PATCH /affiliates/:id
Content-Type: application/json
Authorization: Bearer <token>

{
  "status": "approved",
  "commissionRate": 15.0
}
```

#### Assign Manager (Admin/Author only)
```http
PATCH /affiliates/:id/assign-manager
Content-Type: application/json
Authorization: Bearer <token>

{
  "managerId": "manager-uuid"
}
```

#### Update Earnings (Admin/Author only)
```http
PATCH /affiliates/:id/update-earnings
Content-Type: application/json
Authorization: Bearer <token>

{
  "amount": 150.00
}
```

#### Delete Affiliate (Admin only)
```http
DELETE /affiliates/:id
Authorization: Bearer <token>
```

### Subscriptions Management (`/subscriptions`)

#### Get All Subscriptions (Admin/Author only)
```http
GET /subscriptions
GET /subscriptions?status=active
GET /subscriptions?type=premium
GET /subscriptions?userId=user-uuid
Authorization: Bearer <token>
```

#### Get My Subscriptions
```http
GET /subscriptions/my-subscriptions
Authorization: Bearer <token>
```

#### Get Subscription by ID (Admin/Author only)
```http
GET /subscriptions/:id
Authorization: Bearer <token>
```

#### Create Subscription (Admin/Author only)
```http
POST /subscriptions
Content-Type: application/json
Authorization: Bearer <token>

{
  "type": "premium",
  "price": 29.99,
  "startDate": "2024-01-01T00:00:00Z",
  "endDate": "2024-02-01T00:00:00Z",
  "description": "Premium subscription",
  "autoRenew": true,
  "userId": "user-uuid"
}
```

#### Update Subscription (Admin/Author only)
```http
PATCH /subscriptions/:id
Content-Type: application/json
Authorization: Bearer <token>

{
  "status": "active",
  "autoRenew": false
}
```

#### Cancel Subscription (Admin/Author only)
```http
PATCH /subscriptions/:id/cancel
Authorization: Bearer <token>
```

#### Renew Subscription (Admin/Author only)
```http
PATCH /subscriptions/:id/renew
Authorization: Bearer <token>
```

#### Check Expired Subscriptions (Admin/Author only)
```http
GET /subscriptions/check-expired
Authorization: Bearer <token>
```

#### Delete Subscription (Admin only)
```http
DELETE /subscriptions/:id
Authorization: Bearer <token>
```

### Application Info (`/`)

#### Health Check
```http
GET /health
```

#### Application Info
```http
GET /info
```

## User Roles Hierarchy

- **ADMIN**: Full access to all features
- **AUTHOR**: Can create and manage articles, manage affiliates and subscriptions
- **SUBSCRIBER**: Can read all articles, create referral links, view affiliate dashboard
- **USER**: Basic user with limited access (can only register and take subscriptions)

Each higher role inherits all permissions from lower roles.

## Subscription Plans

### Basic Plan
- Price: €9.99/month
- Features: Basic access to articles

### Standard Plan
- Price: €19.99/month
- Features: Standard access to articles + affiliate features

### Premium Plan
- Price: €39.99/month
- Features: Full access to all content + advanced affiliate features

## Affiliate Commission Structure

### Direct Referrals
- 30% commission for < 10 direct referrals
- 40% commission for ≥ 10 direct referrals

### Indirect Referrals (Second Level)
- 5% commission for < 5 affiliates each
- 10% commission for ≥ 5 affiliates each

## Data Models

### User
```typescript
{
  id: string;
  email: string;
  username: string;
  role: UserRole;
  referralCode: string;
  referredBy: string;
  totalEarnings: number;
  pendingEarnings: number;
  directReferrals: number;
  indirectReferrals: number;
  createdAt: Date;
  updatedAt: Date;
}
```

### Article
```typescript
{
  id: string;
  title: string;
  content: string;
  published: boolean;
  author: User;
  createdAt: Date;
  updatedAt: Date;
}
```

### Affiliate
```typescript
{
  id: string;
  name: string;
  email: string;
  phone: string;
  description?: string;
  website?: string;
  status: AffiliateStatus;
  commissionRate: number;
  totalEarnings: number;
  assignedManager?: User;
  createdAt: Date;
  updatedAt: Date;
}
```

### Subscription
```typescript
{
  id: string;
  type: SubscriptionType;
  status: SubscriptionStatus;
  price: number;
  startDate: Date;
  endDate: Date;
  description?: string;
  autoRenew: boolean;
  user: User;
  createdAt: Date;
  updatedAt: Date;
}
```

## Error Responses

All endpoints return consistent error responses:

```json
{
  "statusCode": 400,
  "message": "Error message",
  "error": "Bad Request"
}
```

Common HTTP status codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `500`: Internal Server Error

## Setup Instructions

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   ```bash
   cp env.example .env
   # Edit .env with your database and Stripe credentials
   ```

3. **Setup Stripe plans:**
   ```bash
   node scripts/setup-stripe.js
   ```

4. **Run database migrations:**
   ```bash
   npm run migration:run
   ```

5. **Start the application:**
   ```bash
   npm run start:dev
   ```
