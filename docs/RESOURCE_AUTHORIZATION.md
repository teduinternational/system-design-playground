# Resource-based Authorization with Policies

## Tổng quan

Hệ thống sử dụng **Resource-based Authorization** với **Authorization Policies** để phân quyền truy cập resources dựa trên ownership và roles.

## Architecture

### 1. Components

```
Auth/
├── Requirements/
│   └── OwnerRequirement.cs          # Requirement để check ownership
├── Handlers/
│   └── OwnerAuthorizationHandler.cs # Handler xử lý OwnerRequirement
└── JwtTokenService.cs
```

### 2. IOwnable Interface

Tất cả resources cần check ownership phải implement `IOwnable`:

```csharp
public interface IOwnable
{
    string OwnerId { get; }
}

// Example
public class DiagramResource : IOwnable
{
    public required string Id { get; init; }
    public required string OwnerId { get; init; } // User ID của owner
}
```

## Configuration

### Program.cs

```csharp
// Register Authorization Policies
builder.Services.AddAuthorization(options =>
{
    // Policy: Kiểm tra user có phải Owner của resource
    options.AddPolicy("OwnerOnly", policy => 
        policy.Requirements.Add(new OwnerRequirement()));
    
    // Policy: Kiểm tra Admin role
    options.AddPolicy("AdminOnly", policy => 
        policy.RequireRole("Admin"));
    
    // Policy: Chỉ cần authenticated
    options.AddPolicy("AuthenticatedUser", policy => 
        policy.RequireAuthenticatedUser());
});

// Register Authorization Handlers
builder.Services.AddSingleton<IAuthorizationHandler, OwnerAuthorizationHandler>();
```

## Usage

### Method 1: Manual Authorization Check (Recommended for Resource-based)

```csharp
group.MapGet("/{id}", async (
    string id,
    HttpContext context,
    IAuthorizationService authService) =>
{
    // 1. Lấy resource từ database
    var resource = await GetResourceFromDb(id);
    
    if (resource == null)
        return Results.NotFound();
    
    // 2. Check authorization với policy "OwnerOnly"
    var authResult = await authService.AuthorizeAsync(
        context.User,    // Current user
        resource,        // Resource to check (must implement IOwnable)
        "OwnerOnly"      // Policy name
    );
    
    // 3. Handle result
    if (!authResult.Succeeded)
    {
        return Results.Forbid(); // 403 Forbidden
    }
    
    return Results.Ok(resource);
});
```

### Method 2: [Authorize] Attribute (For Role/Policy without Resource)

```csharp
// Admin only endpoint
group.MapGet("/admin", [Authorize(Policy = "AdminOnly")] () =>
{
    return Results.Ok("Admin data");
});

// Any authenticated user
group.MapGet("/profile", [Authorize(Policy = "AuthenticatedUser")] () =>
{
    return Results.Ok("User profile");
});
```

### Method 3: RequireAuthorization() Extension

```csharp
group.MapGet("/admin-data", () =>
{
    return Results.Ok("Admin data");
})
.RequireAuthorization("AdminOnly");
```

## Authorization Flow

```
1. Request → JWT Bearer Token
                ↓
2. Authentication (ValidateToken)
                ↓
3. Extract Claims (sub, email, roles)
                ↓
4. Authorization Policy Check
   ├─→ OwnerOnly: Check resource.OwnerId == user.sub
   ├─→ AdminOnly: Check user.HasRole("Admin")
   └─→ AuthenticatedUser: Check user.IsAuthenticated
                ↓
5. AuthorizationResult
   ├─→ Succeeded: 200 OK
   ├─→ Failed (No auth): 401 Unauthorized
   └─→ Failed (No permission): 403 Forbidden
```

## OwnerAuthorizationHandler Logic

```csharp
protected override Task HandleRequirementAsync(
    AuthorizationHandlerContext context,
    OwnerRequirement requirement,
    IOwnable resource)
{
    // 1. Lấy userId từ claims
    var userId = context.User.FindFirst("sub")?.Value;
    
    if (string.IsNullOrEmpty(userId))
        return Task.CompletedTask; // Fail
    
    // 2. So sánh userId với resource.OwnerId
    if (resource.OwnerId == userId)
    {
        context.Succeed(requirement); // Pass
    }
    
    return Task.CompletedTask; // Fail nếu không match
}
```

## Testing

### 1. Login và lấy token

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "owner@example.com",
  "password": "demo123"
}

Response:
{
  "token": "eyJhbGciOi...",
  "email": "owner@example.com"
}
```

### 2. Access resource (Owner)

```http
GET /api/resources/diagram-123
Authorization: Bearer eyJhbGciOi...

Response 200:
{
  "id": "diagram-123",
  "name": "My Diagram",
  "ownerId": "user-guid-from-token",
  "createdAt": "2026-01-15T10:00:00Z"
}
```

### 3. Access resource (Not Owner)

```http
GET /api/resources/diagram-456
Authorization: Bearer eyJhbGciOi... (different user)

Response 403 Forbidden:
{
  "title": "Forbidden",
  "detail": "You do not have permission to access this resource.",
  "status": 403
}
```

## Response Codes

| Code | Meaning | Scenario |
|------|---------|----------|
| **200** | OK | User is owner/has permission |
| **401** | Unauthorized | No token or invalid token |
| **403** | Forbidden | Valid token but not owner/no permission |
| **404** | Not Found | Resource doesn't exist |

## Best Practices

### ✅ DO:

1. **Always validate resource existence first**
   ```csharp
   var resource = await db.GetResourceAsync(id);
   if (resource == null) return Results.NotFound();
   ```

2. **Use IOwnable interface for consistency**
   ```csharp
   public class MyResource : IOwnable
   {
       public string OwnerId { get; init; }
   }
   ```

3. **Return 403 for authorization failures**
   ```csharp
   if (!authResult.Succeeded)
       return Results.Forbid(); // or Results.Problem with 403
   ```

4. **Inject IAuthorizationService for resource checks**
   ```csharp
   async (IAuthorizationService authService) => { ... }
   ```

5. **Use descriptive policy names**
   ```csharp
   options.AddPolicy("DiagramOwnerOnly", ...);
   options.AddPolicy("AdminOrOwner", ...);
   ```

### ❌ DON'T:

1. **Don't expose OwnerId in public responses** (if sensitive)
2. **Don't skip authorization checks** for "trusted" endpoints
3. **Don't use [Authorize] alone** for resource-based checks
4. **Don't return 401** when user is authenticated but not authorized (use 403)
5. **Don't forget to check resource nullability**

## Advanced Scenarios

### 1. Multiple Requirements (AND logic)

```csharp
options.AddPolicy("AdminOrOwner", policy =>
{
    policy.RequireAssertion(context =>
        context.User.IsInRole("Admin") ||
        // Custom owner check
    );
});
```

### 2. Custom Claims-based Policy

```csharp
options.AddPolicy("PremiumUser", policy =>
    policy.RequireClaim("subscription", "premium"));
```

### 3. Combined Policies

```csharp
group.MapGet("/premium-diagram/{id}", async (...) =>
{
    // Check multiple policies
    var ownerCheck = await authService.AuthorizeAsync(user, resource, "OwnerOnly");
    var premiumCheck = await authService.AuthorizeAsync(user, "PremiumUser");
    
    if (!ownerCheck.Succeeded || !premiumCheck.Succeeded)
        return Results.Forbid();
    
    return Results.Ok(resource);
});
```

### 4. Hierarchical Authorization

```csharp
public class TeamAuthorizationHandler : AuthorizationHandler<OwnerRequirement, ITeamResource>
{
    protected override Task HandleRequirementAsync(...)
    {
        // Check if user is owner OR team member
        if (resource.OwnerId == userId || resource.TeamMemberIds.Contains(userId))
        {
            context.Succeed(requirement);
        }
        return Task.CompletedTask;
    }
}
```

## Integration with Existing Endpoints

### Example: DiagramEndpoints

```csharp
// GET /api/diagrams/{id} - Get diagram (Owner only)
group.MapGet("/{id}", async (
    Guid id,
    IAuthorizationService authService,
    HttpContext context,
    IDiagramRepository repo) =>
{
    var diagram = await repo.GetByIdAsync(id);
    if (diagram == null) return Results.NotFound();
    
    // Check authorization
    var authResult = await authService.AuthorizeAsync(
        context.User,
        diagram, // Diagram must implement IOwnable
        "OwnerOnly"
    );
    
    if (!authResult.Succeeded)
        return Results.Forbid();
    
    return Results.Ok(diagram);
});

// PUT /api/diagrams/{id} - Update diagram (Owner only)
group.MapPut("/{id}", async (
    Guid id,
    UpdateDiagramDto dto,
    IAuthorizationService authService,
    HttpContext context,
    IDiagramRepository repo) =>
{
    var diagram = await repo.GetByIdAsync(id);
    if (diagram == null) return Results.NotFound();
    
    var authResult = await authService.AuthorizeAsync(
        context.User, diagram, "OwnerOnly");
    
    if (!authResult.Succeeded)
        return Results.Forbid();
    
    // Update logic
    await repo.UpdateAsync(diagram);
    return Results.NoContent();
});
```

## Troubleshooting

### Issue: Always returns 403 even for owner

**Solution:**
- Check if resource implements `IOwnable`
- Verify `OwnerId` value matches `user.sub` claim
- Debug: Log userId and OwnerId values

```csharp
Console.WriteLine($"UserId: {userId}, OwnerId: {resource.OwnerId}");
```

### Issue: 401 instead of 403

**Solution:**
- Ensure `UseAuthentication()` comes before `UseAuthorization()`
- Check token is valid and not expired

### Issue: Policy not found

**Solution:**
- Verify policy name matches exactly (case-sensitive)
- Ensure policy is registered in `AddAuthorization()`

## References

- [Microsoft Authorization Docs](https://learn.microsoft.com/en-us/aspnet/core/security/authorization/introduction)
- [Resource-based Authorization](https://learn.microsoft.com/en-us/aspnet/core/security/authorization/resourcebased)
- [Policy-based Authorization](https://learn.microsoft.com/en-us/aspnet/core/security/authorization/policies)
