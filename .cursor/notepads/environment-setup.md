# Environment Setup & Validation Doc
**Project:** Online Courses App / Otter Dashboard
**Last Validated:** February 10, 2026

## 1. The "Lean Six" Extension Kit
These extensions are verified as optimized for this environment (low-bloat, high AI-synergy).

1. **PHP Intelephense** (`bmewburn.vscode-intelephense-client`)
   - *Post-install*: Run "Intelephense: Index workspace" if navigation fails.
2. **SQLTools** (`mtxr.sqltools`)
   - *Post-install*: Hub for database connections.
3. **SQLTools MySQL/MariaDB/TiDB Driver** (`mtxr.sqltools-driver-mysql`)
   - *Post-install*: Required engine for AWS RDS connection.
4. **GitLens** (`eamodio.gitlens`)
   - *Post-install*: Used for "No-Touch UI" line history verification.
5. **Notepads** (`lch.cursor-notepads`)
   - *Post-install*: Sidebar scratchpad for temporary snippets.
6. **REST Client** (`humao.rest-client`)
   - *Post-install*: Used for Canvas API templates (`.http` files).
7. **Todo Tree** (`gruntfuggly.todo-tree`)
   - *Post-install*: Scans for `REWIRE` and `UI-KEEP` tags.

## 2. SQLTools Connection (RDS)
- **Driver**: MySQL
- **Host**: `webaim.cksrc9aw1l51.us-east-2.rds.amazonaws.com`
- **Database**: `onlinecourses`
- **Port**: `3306`
- **User**: `onlinecourses`

## 3. Critical Workspace Settings
Verified settings in `.vscode/settings.json`:
- `php.suggest.basic`: false (Intelephense priority)
- `editor.formatOnSave`: false (No-Touch UI protection)
- `search.exclude`: Includes `vendor`, `node_modules`, `cache`.

## 4. Verification Check
- [ ] Type `// REWIRE:` in any file; check if it appears in the Todo Tree sidebar.
- [ ] Open `canvas_api.http` and verify "Send Request" button appears.
- [ ] Verify `Ctrl+Click` on a function name traces to its definition.
- [ ] Reference `@.cursor/context/schema_context.sql` in Chat to verify AI schema awareness.
