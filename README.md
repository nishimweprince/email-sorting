# AI Email Sorting Application

![Backend Coverage](./badges/backend-coverage.svg)
![Frontend Coverage](./badges/frontend-coverage.svg)

An AI-powered email sorting application that automatically categorizes and summarizes emails using Claude AI, with automated unsubscribe functionality.

## Features

- **Google OAuth Authentication** - Secure login with Gmail account
- **Automatic Email Categorization** - AI categorizes emails based on custom categories
- **Email Summarization** - AI-generated summaries for quick reading
- **Email Archiving** - Automatically archives processed emails in Gmail
- **Bulk Operations** - Delete or unsubscribe from multiple emails at once
- **AI-Powered Unsubscribe** - Automated unsubscribe using Playwright and Claude AI
- **Category Management** - Create and manage custom email categories
- **Real-time Sync** - Manually trigger email sync from Gmail

## Technology Stack

### Frontend
- React 19 with TypeScript
- Vite 7
- React Router
- Axios
- Context API for state management

### Backend
- Node.js with Express.js
- TypeScript
- PostgreSQL with Prisma ORM
- Passport.js for Google OAuth
- Gmail API for email integration
- Anthropic Claude API (claude-sonnet-4-20250514)
- Playwright for web automation

## Project Structure

```
email-sorting/
├── email-sorting-be/       # Backend application
│   ├── src/
│   │   ├── config/         # Configuration files
│   │   ├── controllers/    # Request handlers
│   │   ├── middleware/     # Express middleware
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   ├── types/          # TypeScript types
│   │   ├── utils/          # Utility functions
│   │   └── server.ts       # Main server file
│   ├── prisma/
│   │   └── schema.prisma   # Database schema
│   └── package.json
│
└── email-sorting-fe/       # Frontend application
    ├── src/
    │   ├── components/     # React components
    │   ├── contexts/       # React contexts
    │   ├── pages/          # Page components
    │   ├── types/          # TypeScript types
    │   ├── utils/          # Utility functions
    │   └── App.tsx         # Main app component
    └── package.json
```

## Setup Instructions

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- Google Cloud Console account (for OAuth)
- Anthropic API key

### 1. Clone the Repository

```bash
git clone <repository-url>
cd email-sorting
```

### 2. Backend Setup

```bash
cd email-sorting-be

# Install dependencies
npm install

# Create .env file
cp .env.example .env
```

Edit `.env` with your credentials:

```env
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:5173

DATABASE_URL=postgresql://user:password@localhost:5432/email_sorting

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3001/api/auth/google/callback

ANTHROPIC_API_KEY=your_anthropic_api_key

SESSION_SECRET=your_random_session_secret
ENCRYPTION_KEY=your_32_character_encryption_key
```

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Build TypeScript
npm run build

# Start development server
npm run dev
```

### 3. Frontend Setup

```bash
cd email-sorting-fe

# Install dependencies
npm install

# Create .env file
cp .env.example .env
```

Edit `.env`:

```env
VITE_API_URL=http://localhost:3001
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

```bash
# Start development server
npm run dev
```

The application will be available at `http://localhost:5173`

### 4. Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Gmail API
4. Configure OAuth consent screen
5. Create OAuth 2.0 credentials (Web application)
6. Add authorized redirect URIs:
   - `http://localhost:3001/api/auth/google/callback` (development)
   - `https://your-backend.render.com/api/auth/google/callback` (production)
7. Add test user: `webshookeng@gmail.com`
8. Copy Client ID and Client Secret to your `.env` files

## Deployment

### Deploy Database (Render PostgreSQL)

1. Go to [Render.com](https://render.com/)
2. Create new PostgreSQL database
3. Copy the internal connection string
4. Run migrations: `npx prisma migrate deploy`

### Deploy Backend (Render)

1. Create new Web Service on Render
2. Connect your GitHub repository
3. Configure:
   - **Build Command**: `cd email-sorting-be && npm install && npm run build`
   - **Start Command**: `cd email-sorting-be && npm start`
   - **Environment**: Node
4. Add environment variables (from `.env`)
5. Deploy

### Deploy Frontend (Vercel)

1. Install Vercel CLI: `npm install -g vercel`
2. Run from project root: `cd email-sorting-fe && vercel`
3. Follow prompts
4. Add environment variables in Vercel dashboard
5. Deploy: `vercel --prod`

### Post-Deployment

1. Update Google OAuth redirect URIs with production URLs
2. Update `FRONTEND_URL` in backend environment variables
3. Update `VITE_API_URL` in frontend environment variables
4. Test OAuth flow with test user

## API Endpoints

### Authentication
- `GET /api/auth/google` - Initiate Google OAuth
- `GET /api/auth/google/callback` - OAuth callback
- `GET /api/auth/user` - Get current user
- `POST /api/auth/logout` - Logout

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

### Emails
- `GET /api/emails` - Get all emails (with filters)
- `GET /api/emails/:id` - Get single email
- `GET /api/emails/category/:categoryId` - Get emails by category
- `DELETE /api/emails/:id` - Delete email
- `POST /api/emails/bulk-delete` - Bulk delete

### Processing
- `POST /api/process/sync` - Sync emails from Gmail
- `POST /api/process/categorize` - Categorize email
- `POST /api/process/unsubscribe` - Unsubscribe from email
- `POST /api/process/bulk-unsubscribe` - Bulk unsubscribe

## Usage Guide

1. **Login**: Click "Sign in with Google" and authorize the application
2. **Sync Emails**: Click "Sync Emails" button to import from Gmail (50 at a time)
3. **View Categories**: Browse emails by category in the sidebar
4. **View Email**: Click on an email to see full details and AI summary
5. **Create Category**: Click "+ Add" in sidebar to create custom categories
6. **Bulk Operations**:
   - Check emails you want to process
   - Use "Delete" or "Unsubscribe" buttons in the action bar
7. **Individual Actions**: Open email detail view to delete or unsubscribe

## Features in Detail

### AI Categorization
Emails are automatically categorized using Claude AI based on your category descriptions. The AI analyzes:
- Email subject
- Sender information
- Email body content
- Category descriptions

### AI Summarization
Each email receives a concise 2-3 sentence summary highlighting:
- Main purpose
- Key information
- Action items or deadlines

### AI-Powered Unsubscribe
The system uses Playwright and Claude AI to:
1. Navigate to unsubscribe page
2. Take screenshot
3. Analyze page with Claude AI
4. Execute unsubscribe actions automatically
5. Confirm unsubscription

## Environment Variables Reference

### Backend
| Variable | Description | Required |
|----------|-------------|----------|
| `NODE_ENV` | Environment (development/production) | Yes |
| `PORT` | Server port | Yes |
| `FRONTEND_URL` | Frontend URL for CORS | Yes |
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | Yes |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | Yes |
| `GOOGLE_CALLBACK_URL` | OAuth callback URL | Yes |
| `ANTHROPIC_API_KEY` | Claude API key | Yes |
| `SESSION_SECRET` | Express session secret | Yes |
| `ENCRYPTION_KEY` | Token encryption key | Yes |

### Frontend
| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_API_URL` | Backend API URL | Yes |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth client ID | Yes |

## Troubleshooting

### OAuth Issues
- Ensure test user is added in Google Cloud Console
- Check redirect URIs match exactly
- Verify credentials are correct

### Database Issues
- Check DATABASE_URL connection string
- Run migrations: `npx prisma migrate deploy`
- Verify database is accessible

### Email Sync Issues
- Check Gmail API is enabled
- Verify OAuth scopes include Gmail access
- Check token encryption/decryption

### Unsubscribe Issues
- Ensure Playwright is installed correctly
- Check Claude API key is valid
- Some websites may have anti-bot measures

## Security Considerations

- OAuth tokens are encrypted before storage
- Session secrets should be strong and unique
- Use HTTPS in production
- CORS is configured for specific origins
- Input validation on all endpoints
- SQL injection protection via Prisma

## Performance Optimization

- Email processing in batches of 50
- Database indexes on frequently queried fields
- Caching for category lookups
- Pagination for large email lists

## Testing

This project includes comprehensive testing for both backend and frontend applications.

### Backend Testing

The backend uses **Jest** for unit and integration testing with the following coverage:
- Integration tests for API endpoints
- Unit tests for services, controllers, and utilities
- Test coverage reporting with badges

**Run Backend Tests:**

```bash
cd email-sorting-be

# Run all tests with coverage
npm test

# Run tests in watch mode
npm run test:watch

# Run only integration tests
npm run test:integration

# Run only unit tests
npm run test:unit

# Generate coverage badge
npm run test:badge
```

**Backend Test Structure:**
```
email-sorting-be/
├── tests/
│   ├── setup.ts                    # Test configuration and mocks
│   ├── integration/                # Integration tests
│   │   └── auth.test.ts           # API integration tests
│   ├── unit/                      # Unit tests
│   │   ├── controllers/           # Controller tests
│   │   ├── services/              # Service tests
│   │   └── utils/                 # Utility tests
│   └── utils/
│       └── test-helpers.ts        # Test utilities and factories
```

**Key Testing Features:**
- Mocked Prisma client for database operations
- Comprehensive controller testing with authentication scenarios
- Service layer testing with edge cases
- 100% coverage on critical utilities (encryption, auth controller)

### Frontend Testing

The frontend uses **Vitest** for unit/integration tests and **Playwright** for E2E testing:
- Component tests with React Testing Library
- Context and hook testing
- E2E tests for critical user flows
- Test coverage reporting with badges

**Run Frontend Tests:**

```bash
cd email-sorting-fe

# Run all tests with coverage
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Run E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui

# Generate coverage badge
npm run test:badge
```

**Frontend Test Structure:**
```
email-sorting-fe/
├── src/tests/
│   ├── setup.ts                   # Test configuration
│   ├── components/                # Component tests
│   │   └── Button.test.tsx       # UI component tests
│   ├── utils/                     # Utility tests
│   │   ├── api.test.ts           # API utility tests
│   │   └── cn.test.ts            # Class name utility tests
│   └── App.test.tsx              # Main app tests
├── e2e/                          # E2E tests
│   └── login.spec.ts             # Login flow E2E test
└── playwright.config.ts          # Playwright configuration
```

**Key Testing Features:**
- 100% coverage on UI components (Button, Card, Input, Badge)
- Context and state management testing
- Mock setup for external API calls
- E2E tests for authentication flows
- Vitest with jsdom for fast component testing

### Test Coverage Badges

Coverage badges are automatically generated and saved as SVG files in the `badges/` directory:
- `backend-coverage.svg` - Backend test coverage
- `frontend-coverage.svg` - Frontend test coverage

Badges are color-coded based on coverage percentage:
- 🟢 Green: ≥80%
- 🟡 Yellow: 60-79%
- 🟠 Orange: 40-59%
- 🔴 Red: <40%

### CI/CD Integration

To integrate tests into your CI/CD pipeline:

```yaml
# Example GitHub Actions workflow
- name: Run Backend Tests
  run: |
    cd email-sorting-be
    npm install
    npm run test:ci

- name: Run Frontend Tests
  run: |
    cd email-sorting-fe
    npm install
    npm test

- name: Run E2E Tests
  run: |
    cd email-sorting-fe
    npx playwright install
    npm run test:e2e
```

### Testing Best Practices

1. **Integration Tests**: Focus on testing API endpoints without external service dependencies
2. **Unit Tests**: Test individual functions, components, and utilities in isolation
3. **E2E Tests**: Test critical user flows like authentication and email management
4. **Mock External Services**: Use mocks for Gmail API, Claude API, and database operations
5. **Test Coverage**: Aim for high coverage on critical paths and business logic

### Expanding Tests

To add more tests:

1. **Backend**: Add test files in `tests/unit/` or `tests/integration/`
2. **Frontend**: Add test files in `src/tests/` with `.test.ts` or `.test.tsx` extension
3. **E2E**: Add test files in `e2e/` with `.spec.ts` extension
4. Follow existing test patterns and use provided test helpers

## License

ISC

## Support

For issues and questions, please open an issue on GitHub.

---

**Built with Claude AI assistance**
