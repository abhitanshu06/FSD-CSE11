# API Tester Signup and Login API

## Start the API

From this folder, install dependencies and start the server:

```powershell
npm install
npm start
```

The API listens on `http://localhost:3001`. Keep this terminal open. The Vite frontend proxies `/api` requests to this server.

## Test with PowerShell

Create an account (use a new email address each time):

```powershell
$signup = Invoke-RestMethod -Method Post -Uri http://localhost:3001/api/auth/signup -ContentType "application/json" -Body (@{ name = "Demo User"; email = "demo@example.com"; password = "DemoPass123!" } | ConvertTo-Json)
$signup
```

Log in and save the returned token:

```powershell
$login = Invoke-RestMethod -Method Post -Uri http://localhost:3001/api/auth/login -ContentType "application/json" -Body (@{ email = "demo@example.com"; password = "DemoPass123!" } | ConvertTo-Json)
$login
```

Use the token to get the current account:

```powershell
Invoke-RestMethod -Method Get -Uri http://localhost:3001/api/auth/me -Headers @{ Authorization = "Bearer $($login.token)" }
```

Check that a wrong password is rejected:

```powershell
try {
  Invoke-RestMethod -Method Post -Uri http://localhost:3001/api/auth/login -ContentType "application/json" -Body (@{ email = "demo@example.com"; password = "wrong-password" } | ConvertTo-Json)
} catch {
  $_.ErrorDetails.Message
}
```

## Routes

- `GET /api/health` checks that the API is running.
- `POST /api/auth/signup` accepts `name`, `email`, and `password`.
- `POST /api/auth/login` accepts `email` and `password` and returns a one-hour bearer token.
- `GET /api/auth/me` returns the account for a valid bearer token.

Users are saved in `users.json`, so they remain after the server restarts. Passwords are stored as bcrypt hashes, never as plain text. The fallback JWT secret is for local development only; set `JWT_SECRET` to a long random value before deploying. For production, use a database and an HttpOnly cookie or another secure token strategy.