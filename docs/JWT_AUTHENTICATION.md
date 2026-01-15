# JWT Authentication Configuration

## Tổng quan

Project đã được cấu hình với **JWT (JSON Web Token) Authentication** để bảo mật các API endpoints.

## Cấu trúc

### 1. Configuration Files

**appsettings.json**
```json
{
  "JwtSettings": {
    "SecretKey": "[configure-in-environment-file-min-32-chars]",
    "Issuer": "SystemDesignPlayground",
    "Audience": "SystemDesignPlaygroundClient",
    "ExpirationMinutes": 60
  }
}
```

**appsettings.Development.json**
```json
{
  "JwtSettings": {
    "SecretKey": "SystemDesignPlayground-Dev-Secret-Key-Must-Be-At-Least-32-Characters-Long",
    "ExpirationMinutes": 1440
  }
}
```

### 2. Components

#### a) JwtTokenService (`Auth/JwtTokenService.cs`)
Service sử dụng **Primary Constructor** để generate và validate JWT tokens:

```csharp
public class JwtTokenService(IConfiguration configuration)
{
    string GenerateToken(string userId, string email, IEnumerable<string>? roles)
    ClaimsPrincipal? ValidateToken(string token)
    string? GetUserIdFromToken(string token)
}
```

#### b) UnauthorizedResponseMiddleware (`Middleware/UnauthorizedResponseMiddleware.cs`)
Middleware bắt lỗi **401 Unauthorized** và trả về JSON response chuẩn:

```json
{
  "StatusCode": 401,
  "Message": "Unauthorized access. Please provide a valid authentication token.",
  "Timestamp": "2026-01-15T10:00:00Z",
  "Path": "/api/auth/me"
}
```

#### c) AuthEndpoints (`Endpoints/AuthEndpoints.cs`)
Minimal API endpoints cho authentication:

- **POST** `/api/auth/login` - Generate token
- **GET** `/api/auth/me` - Get current user (protected)
- **POST** `/api/auth/validate` - Validate token

### 3. Program.cs Configuration

```csharp
// JWT Authentication
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options => { ... });

builder.Services.AddAuthorization();
builder.Services.AddSingleton<JwtTokenService>();

// Middleware pipeline
app.UseUnauthorizedResponse();
app.UseAuthentication();
app.UseAuthorization();
```

## Cách sử dụng

### 1. Generate Token

**Request:**
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "demo123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "email": "admin@example.com",
  "expiresAt": "2026-01-16T10:00:00Z"
}
```

### 2. Sử dụng Token trong Request

**Header:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Example:**
```http
GET /api/auth/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. Protect Endpoint với [Authorize]

```csharp
// Method 1: Attribute
group.MapGet("/protected", [Authorize] (HttpContext context) => 
{
    var userId = context.User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;
    return Results.Ok(new { UserId = userId });
});

// Method 2: RequireAuthorization()
group.MapGet("/protected", (HttpContext context) => 
{
    return Results.Ok("Protected data");
})
.RequireAuthorization();

// Method 3: Role-based
group.MapGet("/admin", [Authorize(Roles = "Admin")] () => 
{
    return Results.Ok("Admin only");
});
```

## Token Structure

### JWT Claims
```json
{
  "sub": "user-id-guid",
  "email": "user@example.com",
  "jti": "unique-token-id",
  "iat": 1736938800,
  "role": ["User", "Admin"],
  "exp": 1736942400,
  "iss": "SystemDesignPlayground",
  "aud": "SystemDesignPlaygroundClient"
}
```

### Token Validation Parameters
- ✅ **ValidateIssuer**: Kiểm tra Issuer
- ✅ **ValidateAudience**: Kiểm tra Audience
- ✅ **ValidateLifetime**: Kiểm tra thời gian hết hạn
- ✅ **ValidateIssuerSigningKey**: Kiểm tra chữ ký
- ✅ **ClockSkew = Zero**: Không cho phép lệch thời gian

## Error Responses

### 401 Unauthorized (No Token)
```json
{
  "StatusCode": 401,
  "Message": "Unauthorized access. Token is missing or invalid.",
  "Timestamp": "2026-01-15T10:00:00Z"
}
```

### 401 Unauthorized (Invalid Token)
```json
{
  "StatusCode": 401,
  "Message": "Unauthorized access. Token is missing or invalid.",
  "Timestamp": "2026-01-15T10:00:00Z"
}
```

### 401 Unauthorized (Expired Token)
Response headers contain:
```
Token-Expired: true
```

## Testing

### Using auth-tests.http

1. **Generate Token:**
   ```http
   POST https://localhost:7146/api/auth/login
   Content-Type: application/json
   
   { "email": "admin@example.com", "password": "demo123" }
   ```

2. **Copy token từ response**

3. **Test protected endpoint:**
   ```http
   GET https://localhost:7146/api/auth/me
   Authorization: Bearer {your-token-here}
   ```

### Using Swagger/Scalar UI

1. Mở https://localhost:7146/scalar/v1
2. Click vào endpoint `/api/auth/login`
3. Execute với credentials: `{ "email": "admin@example.com", "password": "demo123" }`
4. Copy token
5. Click **Authorize** button (🔒)
6. Nhập: `Bearer {token}`
7. Test protected endpoints

## Production Checklist

- [ ] Thay đổi **SecretKey** trong Production (min 32 characters)
- [ ] Sử dụng **Environment Variables** hoặc **Azure Key Vault** để lưu SecretKey
- [ ] Giảm **ExpirationMinutes** xuống 15-60 phút
- [ ] Implement **Refresh Token** mechanism
- [ ] Add **Token Blacklist** cho logout
- [ ] Enable **HTTPS** only
- [ ] Implement **Rate Limiting** cho login endpoint
- [ ] Add **Logging** cho authentication failures
- [ ] Implement **Real User Database** thay vì mock

## Best Practices

✅ **DO:**
- Store token securely (HttpOnly cookies hoặc secure storage)
- Validate token signature
- Check token expiration
- Use HTTPS only
- Implement refresh token
- Log authentication events

❌ **DON'T:**
- Store token in localStorage (XSS vulnerability)
- Share token publicly
- Use weak secret keys
- Skip token validation
- Set very long expiration time
- Expose secret key in client-side code

## Troubleshooting

### "JWT SecretKey is not configured"
**Solution:** Kiểm tra `appsettings.json` có chứa `JwtSettings:SecretKey`

### Token validation failed
**Solution:** 
1. Check token format (Bearer prefix)
2. Verify token not expired
3. Confirm SecretKey matches

### 401 but token is valid
**Solution:**
1. Check middleware order (UseAuthentication before UseAuthorization)
2. Verify endpoint has [Authorize] attribute
3. Check claims match requirements

## References

- [Microsoft JWT Documentation](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/jwt)
- [JWT.io](https://jwt.io) - Token debugger
- [OWASP JWT Security](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html)
