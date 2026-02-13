---
description: Deploy to prod-test server environment with automatic cache-busting
allowed-tools: Bash, Read, Write, Edit, Glob, Grep
---

# Deploy to Prod-Test

Deploy the current project to the prod-test server environment.

## What This Does

1. **Updates cache-busting version** - Automatically updates version.php with timestamp and git commit hash
2. **Commits version file** - Commits the updated version file (if changed)
3. **Deploys via rsync** - Syncs files to server using rsync
4. **Sets permissions** - Configures proper file permissions on server
5. **Clears cache** - Removes cached files on server

## Execution

Execute the deployment script:

```bash
cd /Users/a00288946/Projects/onlinecourses-services
bash /Users/a00288946/Agents/onlinecourses-services-resources/scripts/deploy-to-server.sh prod-test
```

## Configuration

The deployment script includes:
- Automatic version.php generation with deployment timestamp and git commit hash
- Pre-deployment validation (SSH, rsync, directory checks)
- User confirmation prompt
- Rsync deployment with appropriate exclusions
- Post-deployment cache clearing
- Environment: `prod-test` - Production test environment (https://webaim.org/onlinecourses-services/)

## Requirements

- SSH access to server configured
- Rsync available on system
- Git repository in clean state (or version file will be committed)

## Post-Deployment

After deployment completes:
1. Verify changes in browser
2. Check CSS version in page source (should match latest deployment)
3. Test functionality
4. Monitor for any errors

---

**Note**: This command deploys to the prod-test environment. For production deployment, use the `production` environment.

