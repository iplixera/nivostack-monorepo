# Data Cleanup Feature

## Overview
The Data Cleanup feature provides administrators with comprehensive tools to manage and delete project data from the DevBridge dashboard.

## Location
**Settings → Data Cleanup Tab**

## Features

### Individual Data Type Deletion
Delete specific data types with granular control:

1. **Delete All Devices** (📱)
   - Removes all device registrations
   - Clears debug mode settings
   - Deletes device metadata

2. **Delete All API Traces** (📡)
   - Removes all HTTP request/response traces
   - Clears request/response bodies
   - Deletes headers and metadata

3. **Delete All Logs** (📝)
   - Removes all application logs
   - Includes debug, info, and error logs

4. **Delete All Sessions** (🔄)
   - Removes all session records
   - Deletes session events and metadata

5. **Delete All Crashes** (💥)
   - Removes all crash reports
   - Deletes stack traces and crash metadata

6. **Delete All Screens** (🖥️)
   - Clears screen tracking data from sessions
   - Resets screen flow, entry/exit screens
   - Updates screenCount to 0

### Nuclear Option
**Delete Everything** (☢️)
- Deletes ALL data types in a single operation
- Irreversible action requiring double confirmation
- Includes: devices, traces, logs, sessions, crashes, and screen data

## Security Features

### Multi-Level Confirmation
1. **First Dialog**: Warning with description of consequences
2. **Second Prompt**: Requires typing exact confirmation text
   - Individual deletions: Type "DELETE"
   - Nuclear option: Type "DELETE EVERYTHING"

### Authorization
- User authentication required via Bearer token
- Project ownership validation
- Only project owner can delete data

### Data Integrity
- Transaction-based deletions ensure consistency
- Foreign key constraints respected
- Rollback on errors

## API Endpoint

**DELETE** `/api/cleanup`

### Request Body
```json
{
  "projectId": "string",
  "type": "devices" | "traces" | "logs" | "sessions" | "crashes" | "screens" | "all"
}
```

### Response
```json
{
  "success": true,
  "message": "Deleted X item(s)",
  "deletedCount": 123,
  "type": "traces"
}
```

### Error Response
```json
{
  "error": "Unauthorized | Project not found | Invalid type"
}
```

## Technical Implementation

### Database Schema Considerations
- **Sessions**: Contains embedded screen data (screenFlow, entryScreen, exitScreen)
- **Foreign Keys**: 
  - Logs and ApiTraces reference Session with `onDelete: SetNull`
  - Session and Device reference Project with `onDelete: Cascade`

### Deletion Order (for "all" type)
1. Sessions (first, as logs/traces can survive without sessions)
2. Logs
3. API Traces
4. Crashes
5. Devices (last, as other tables may reference it)

### Transaction Handling
All deletions use Prisma transactions to ensure:
- Atomic operations (all or nothing)
- Data consistency
- Proper error handling and rollback

## Usage Example

### From Dashboard
1. Navigate to Project → Settings → Data Cleanup
2. Choose data type to delete
3. Confirm deletion twice
4. Page refreshes automatically after successful deletion

### Programmatically
```typescript
const response = await fetch('/api/cleanup', {
  method: 'DELETE',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    projectId: 'proj_123',
    type: 'traces'
  })
});

const result = await response.json();
console.log(result.message); // "Deleted 145 API trace(s)"
```

## Best Practices

### Before Deleting
1. **Export data** if needed for historical analysis
2. **Verify project** - ensure you're in the correct project
3. **Consider impact** - some data may be referenced by other features
4. **Backup database** before large deletions (especially "all")

### When to Use
- **Development/Testing**: Clean up test data regularly
- **Privacy Compliance**: Remove user data upon request (GDPR, CCPA)
- **Performance**: Clear old data to improve query performance
- **Storage Management**: Free up database space

### When NOT to Use
- ⚠️ **Production data** without backup
- ⚠️ **Active debugging** - you may lose valuable traces
- ⚠️ **Compliance audits** - data may be required for audit trails

## Rollback
**There is NO rollback.** All deletions are permanent. Always:
1. Double-check before confirming
2. Export data if recovery might be needed
3. Maintain database backups for disaster recovery

## Monitoring
All cleanup operations are logged in:
- Server logs (console output)
- Vercel deployment logs
- Can be extended to audit log table (future enhancement)

## Future Enhancements
- [ ] Selective deletion with filters (date range, device ID, etc.)
- [ ] Soft delete with retention period
- [ ] Export before delete option
- [ ] Audit log table for cleanup operations
- [ ] Scheduled cleanup jobs
- [ ] Confirmation via email for nuclear option

## Version History
- **v1.5.0** (2025-12-21) - Initial release
  - Individual data type deletion
  - Nuclear option (delete all)
  - Double confirmation system
  - Transaction-based deletions

## Related Documentation
- [Dashboard Optimization](./DASHBOARD_OPTIMIZATION.md)
- [Performance Optimization](./PERFORMANCE_OPTIMIZATION.md)
- [Developer Guide](./DEVELOPER_GUIDE.md)

