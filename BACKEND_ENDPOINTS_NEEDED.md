## Missing Backend Endpoints

Based on the frontend implementation, the following endpoints need to be added to the backend:

### 🔐 Authentication & User Management

#### **Email Verification** (Priority: HIGH)
```
POST /api/auth/verify-email
Body: { token: string }
Response: { message: string, user: User }

POST /api/auth/resend-verification
Body: { email: string }
Response: { message: string }
```

#### **Password Reset** (Priority: HIGH)
```
POST /api/auth/forgot-password
Body: { email: string }
Response: { message: string }

POST /api/auth/reset-password
Body: { token: string, password: string }
Response: { message: string }
```

#### **User Onboarding** (Priority: MEDIUM)
```
POST /api/user/complete-onboarding
Body: { role: string, teamName?: string, preferences?: object }
Response: { user: User }

GET /api/user/onboarding-status
Response: { completed: boolean, step: number }
```

### 👥 Team & User Management

#### **User Search & Invite** (Priority: MEDIUM)
```
GET /api/users/search?q=searchTerm
Response: { users: User[] }

POST /api/users/invite
Body: { email: string, role: string, projectId?: string }
Response: { invitation: Invitation }
```

#### **Get All Users** (Priority: MEDIUM)
```
GET /api/users
Query: ?page=1&limit=10&role=admin
Response: { users: User[], total: number, page: number }
```

### ⚙️ User Settings & Preferences

#### **User Settings** (Priority: MEDIUM)
```
GET /api/user/settings
Response: { settings: Settings }

PUT /api/user/settings
Body: { notifications: boolean, theme: string, language: string }
Response: { settings: Settings }
```

#### **Notification Preferences** (Priority: LOW)
```
GET /api/user/notification-preferences
Response: { preferences: NotificationPreferences }

PUT /api/user/notification-preferences
Body: { email: boolean, push: boolean, inApp: boolean }
Response: { preferences: NotificationPreferences }
```

### 📊 Enhanced Analytics

#### **User Statistics** (Priority: LOW)
```
GET /api/user/stats
Response: { 
  totalTasks: number,
  completedTasks: number,
  activeProjects: number,
  productivity: number 
}
```

### 🔔 Notifications (Polling-based)

#### **Unread Count** (Priority: MEDIUM)
```
GET /api/notifications/unread-count
Response: { count: number }
```

#### **Mark All as Read** (Priority: LOW)
```
PUT /api/notifications/mark-all-read
Response: { message: string }
```

#### **Delete Notification** (Priority: LOW)
```
DELETE /api/notifications/:id
Response: { message: string }
```

---

## Implementation Priority

### Phase 1 (Essential - Week 1)
1. ✅ Password Reset (forgot-password, reset-password)
2. ✅ Email Verification (verify-email, resend-verification)
3. ✅ User Search (GET /users/search)

### Phase 2 (Important - Week 2)
4. User Onboarding (complete-onboarding, onboarding-status)
5. Get All Users with pagination (GET /users)
6. User Settings (GET/PUT /user/settings)
7. Unread Notifications Count (GET /notifications/unread-count)

### Phase 3 (Nice to Have - Week 3)
8. ✅ User Invite System (POST /users/invite)
9. ✅ Notification Preferences (GET/PUT /user/notification-preferences)
10. ✅ User Statistics (GET /user/stats)
11. ✅ Mark all notifications as read (PUT /notifications/mark-all-read)
12. ✅ Delete notification (DELETE /notifications/:id)

---

## Database Schema Updates Needed

### Users Table
```prisma
model User {
  // Existing fields...
  emailVerified   Boolean   @default(false)
  verificationToken String?
  resetPasswordToken String?
  resetPasswordExpires DateTime?
  onboardingCompleted Boolean @default(false)
  onboardingStep Int @default(0)
  settings Json? // For user preferences
}
```

### Invitations Table (New)
```prisma
model Invitation {
  id String @id @default(uuid())
  email String
  role String
  projectId String?
  invitedBy String
  status String @default("pending") // pending, accepted, expired
  token String @unique
  expiresAt DateTime
  createdAt DateTime @default(now())
}
```

---

## Notes

- All existing endpoints in `auth.routes.js`, `user.routes.js`, `project.routes.js`, `task.routes.js`, `notification.routes.js` are already covered in the frontend
- The notification system is polling-based (no WebSocket) as requested
- Rate limiting should be applied to authentication endpoints
- Email service integration will be needed for verification and password reset
- Consider using libraries like `nodemailer` for email sending
