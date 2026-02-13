# Cursor Pro Resource Guide & Project Configuration
**Project:** Online Courses App (PHP/MySQL/Canvas)
**Last Updated:** February 10, 2026

## Part 1: Resource Breakdown

### 1. Always Free & Unlimited (Base Subscription)
These features are core to the subscription and never incur extra costs.

* **Unlimited Tab Completions:**
    * Standard AI-powered inline code suggestions.
    * **Workflow Tip:** Rely on this for writing standard PHP boilerplate, MySQL queries, and HTML structure.
* **Unlimited "Auto" Mode:**
    * Automatically routes simpler queries to cost-efficient models.
    * **Nuance:** Subject to fair-use throttling during high network congestion.

### 2. The $20 Monthly Credit Pool (Premium Usage)
Used for manual selection of frontier models. Covers approximately:
* **~225 requests** using **Claude Sonnet 4.5**
* **~500 requests** using **GPT-5.2**
* **~550 requests** using **Gemini 3 Pro**

### 3. High-Resource Features (Cost Warning)
* **Composer 1.5 (Agentic Mode):**
    * Highly compute-heavy. Use this *only* for multi-file logic (e.g., tracing a variable from `register.php` through to `phpenrolluser.php`).
    * **Tip:** Leverage **"Thinking Tokens"** for deep reasoning during the Database Rewiring phase.
    * **Risk:** Drains hidden rate limits quickly, forcing you into paid usage.
* **Max Mode (Long Context):**
    * Required for contexts >200k tokens (up to 1M tokens for Claude 4.5). Avoid using this unless you need to load the entire database schema and multiple legacy PHP files simultaneously.

---

## Part 2: .cursorrules (Copy this to your project root)

```text
# Cursor AI Rules & Behavior Settings
# Context: Mature PHP/MySQL Application (Online Courses & Otter Dashboard)

# 1. RESPONSE STYLE & EFFICIENCY
- BE CONCISE. Output code or answers directly. No conversational filler.
- PREFER TARGETED EDITS. Do not rewrite entire PHP files. Use unified diffs or specific function replacements to save tokens.
- PRESERVE LEGACY PATTERNS. Match the existing coding style (even if older PHP versions) unless explicitly asked to refactor.

# 2. CRITICAL PROJECT CONSTRAINTS (STRICT)
- NO-TOUCH UI POLICY: Do not modify HTML structure, Bootstrap classes, or CSS unless explicitly instructed. The UI must remain pixel-perfect for regression testing.
- DATABASE REWIRING: When working on `db.php` or `NewDatabaseService`, prioritize checking column names (e.g., `first_name` vs `name`, `organization_id` vs string storage).
- OTTER SUB-SYSTEM: Be aware that `/otter` files function as a distinct sub-system with enterprise-specific configs.

# 3. TECH STACK STANDARDS
- Language: PHP (Target 8.4+; Vanilla/Legacy compatibility required).
- Database: MySQL / MariaDB (Prioritize PDO over mysqli).
- Integration: Canvas LMS API (REST).
- Frontend: Bootstrap (Legacy).

# 4. MODEL OPTIMIZATION STRATEGY
- Routine Logic (Auto Mode): Use for simple SQL queries, array manipulations, or commenting.
- Complex Architecture (Composer/GPT-5): Use for:
    - Mapping `UnifiedDatabase` logic.
    - Debugging Canvas API responses in `phpenrolluser.php`.
    - Tracing variables across `cron_daily.php` and `registrations.php`.

# 5. CODE QUALITY GATES
- Database Safety: Ensure all new SQL queries use prepared statements or the existing `Database` class methods to prevent injection.
- Schema Awareness: If writing SQL, verify if the target table uses the old schema or the new "rewired" schema.
- Error Handling: Wrap external Canvas API calls in try/catch blocks.

Part 3: Cost-Saving Workflow & Best Practices
Given that your application relies on a "Rewiring" phase (Database Schema changes) and large Canvas API integrations, here is how to avoid wasting tokens:

1. The "Schema Reference" Strategy (Crucial for Rewiring)
Instead of pasting db.php and registrations.php into the chat every time you need a query (which wastes thousands of tokens per request):

Action: Run a schema dump or DESCRIBE on your key tables (registrations, courses, enterprises) and save it to a file named .cursor/context/schema_context.sql.

Workflow: When asking SQL questions, just type @.cursor/context/schema_context.sql.

Benefit: This provides the AI with the exact column names (solving the first_name vs name confusion) without the cost of processing PHP logic files.

2. Leverage "Notepads" for Persistence
Use the Cursor **Notepads** feature to store the E2E Functional Mapping and Project Overview. This keeps high-level goals in context across multiple turns without re-reading large documentation files.

3. Isolate the "Otter" Context
The /otter directory is a distinct sub-system.

Workflow: When working on Enterprise Reporting flows, do not @reference the root index.php or unrelated root files.

Targeting: Only reference otter/dashboard.php and otter/login.php. This keeps the context window small and prevents "Max Mode" charges.

3. Handle Canvas API Logs Efficiently
Canvas API JSON responses can be massive (5MB+).

Risk: Pasting a full API log will instantly burn through your fast-request quota.

Workflow: Truncate the JSON to one representative object (e.g., a single student enrollment record) before pasting it into the chat for debugging.

4. Strict "UI Preservation" Prompting
Since you have a "No-Touch UI" policy:

Workflow: Start every UI-related request with: "Logic only - keep HTML/Classes unchanged."

Why: This prevents the model from burning tokens on "improving" your Bootstrap layout or rewriting CSS, which you would have to discard anyway to pass regression testing.

5. Batch Your "Rewiring" Requests
Instead of asking "Fix the name column in this file," then "Fix the name column in that file":

Workflow: Use Composer (Agent) mode once.

Prompt: "Scan registrations.php, phpenrolluser.php, and db.php. Identify all instances where first_name is used and propose a unified change to name based on the new schema."

Benefit: One expensive request is cheaper than 15 small back-and-forth corrections.