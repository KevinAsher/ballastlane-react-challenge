# Pokemon Challenge - Laravel Backend

This is the Laravel API backend for the Pokemon Challenge application, built according to the PRD requirements.

## Architecture Overview

The backend serves as a proxy layer between the React frontend and the PokeAPI, providing:

- **Session-based authentication** with admin/admin credentials
- **Caching layer** for PokeAPI responses (24-hour TTL)
- **RESTful API endpoints** for Pokemon data
- **Rate limiting** on login attempts
- **CORS support** for SPA integration

## Key Features

### Authentication
- Cookie-based session authentication using Laravel Sanctum
- Hardcoded admin/admin credentials for demo purposes
- Rate limiting on login attempts (5 attempts per IP)
- HttpOnly cookies for security

### Pokemon Data Management
- Proxies requests to PokeAPI (https://pokeapi.co/api/v2)
- Caches Pokemon data in local database for performance
- Expands ability details with effect text
- Supports search by name substring
- Pagination for large result sets

### Caching Strategy
- Server-side: File cache with 24-hour TTL
- Database caching for Pokemon records
- Efficient name indexing for search functionality

## API Endpoints

### Authentication
- `POST /api/login` - Login with username/password
- `POST /api/logout` - Logout and clear session
- `GET /api/me` - Get current authenticated user
- `GET /sanctum/csrf-cookie` - Get CSRF token for forms

### Pokemon
- `GET /api/pokemon` - Search/list Pokemon with pagination
  - Query params: `name` (search), `page`, `pageSize`
- `GET /api/pokemon/{identifier}` - Get detailed Pokemon data
  - Supports both name and ID lookup

## Database Schema

### Pokemon Table
- `name` - Pokemon name
- `slug` - URL-friendly name
- `types` - JSON array of type names
- `sprite_url` - Front default sprite URL
- `data` - Full PokeAPI response (JSON)

### Standard Laravel Tables
- `users` - User accounts (admin user seeded)
- `sessions` - Session storage
- `cache` - File cache storage
- `failed_jobs`, `jobs` - Queue management

## Setup Instructions

### Prerequisites
- Docker and Docker Compose (for Laravel Sail)
- Or PHP 8.4+, MySQL, Composer

### Installation

1. **Install dependencies:**
   ```bash
   composer install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

3. **Update .env for frontend integration:**
   ```env
   APP_URL=http://localhost:8000
   SANCTUM_STATEFUL_DOMAINS=localhost:5173,localhost:3000,127.0.0.1:5173,127.0.0.1:3000
   SESSION_DOMAIN=
   SESSION_SAME_SITE=lax
   ```

4. **Start with Sail (recommended):**
   ```bash
   ./vendor/bin/sail up -d
   ```

5. **Run migrations and seeders:**
   ```bash
   ./vendor/bin/sail artisan migrate
   ./vendor/bin/sail artisan db:seed
   ```

### Alternative Setup (without Sail)
1. Configure database connection in `.env`
2. Run `php artisan serve`
3. Ensure MySQL is running
4. Run migrations and seeders

## Authentication Flow

1. Frontend calls `GET /sanctum/csrf-cookie` to get CSRF token
2. Frontend submits `POST /api/login` with `username: admin, password: admin`
3. Backend sets HttpOnly session cookie
4. All subsequent requests include cookies automatically
5. Protected routes verify session via custom middleware

## CORS Configuration

The backend uses Laravel's built-in CORS functionality configured in `config/cors.php`:
- **Paths**: `api/*`, `sanctum/csrf-cookie`
- **Origins**: `localhost:5173`, `localhost:3000`, `127.0.0.1:5173`, `127.0.0.1:3000`
- **Credentials**: `true` (for cookies)
- **Methods**: All methods allowed
- **Headers**: All headers allowed

## Performance Optimizations

### Caching
- PokeAPI responses cached for 24 hours
- Pokemon name index cached to avoid repeated API calls
- Ability details cached separately
- Laravel's built-in cache system with file driver

### Database
- Indexes on `name` for fast lookups
- JSON columns for flexible data storage
- Efficient search queries with LIKE operations

### API Optimization
- Lazy loading of Pokemon details on demand
- Bulk seeding of initial 50 Pokemon for faster startup
- Expansion of related data (abilities) server-side

## Error Handling

- Network errors logged and gracefully handled
- 404 responses for non-existent Pokemon
- Rate limiting with user-friendly messages
- Validation errors with detailed field messages

## Security Considerations

- HttpOnly cookies prevent XSS attacks
- CSRF protection on all forms
- Rate limiting on authentication endpoints
- Input validation on all endpoints
- Secure CORS configuration

## Development Commands

```bash
# Code formatting
./vendor/bin/pint

# Route listing
./vendor/bin/sail artisan route:list

# Clear caches
./vendor/bin/sail artisan cache:clear

# Database reset
./vendor/bin/sail artisan migrate:fresh --seed

# Tinker (PHP REPL)
./vendor/bin/sail artisan tinker
```

## Production Considerations

1. **Environment Configuration:**
   - Set `APP_ENV=production`
   - Set `APP_DEBUG=false`
   - Use Redis for caching and sessions
   - Configure proper CORS domains

2. **Security:**
   - Replace hardcoded credentials with proper user management
   - Use environment variables for sensitive configuration
   - Implement proper rate limiting
   - Use HTTPS in production

3. **Performance:**
   - Use Redis for caching and sessions
   - Configure queue workers for background jobs
   - Optimize database queries
   - Consider CDN for static assets

## Testing

The backend includes basic test structure. To run tests:

```bash
./vendor/bin/sail artisan test
```

## Architecture Decisions

1. **Session-based Auth**: Chosen over token-based for simplicity and security with HttpOnly cookies
2. **Proxy Pattern**: All frontend requests go through Laravel for caching and rate limiting
3. **JSON Storage**: Pokemon data stored as JSON for flexibility while maintaining relational benefits
4. **File Cache**: Simple and effective for demo; Redis recommended for production
5. **Custom Middleware**: CORS and auth middleware for fine-grained control
