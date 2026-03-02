# Canvas invitation: Join Code vs Get Started — research summary

**Issue (from dev team):** The invitation email forces users to the **Join Code** registration flow they cannot complete. Previously, new accounts saw a **Get Started** blue button → create password → then into the course.

**Date:** 2026-02-26

---

## 1. Expected vs actual flow

| Expected (previous behavior) | Actual (current) |
|------------------------------|-------------------|
| Invitation email → **Get Started** button → Accept → **Create My Account** → set password & timezone → Register → course access | Invitation email → user is sent to **Join Code** flow → cannot complete (no join code to enter) |

---

## 2. Likely causes (from research)

### A. Course self-enrollment (join code) is enabled

- **What it is:** In Canvas, **self-enrollment** is a separate path from **invitation** enrollment. When self-enrollment is on, the course can show a join-code/secret-URL flow.
- **Where:** Course Settings → Course Details → **“Let students self-enroll by sharing with them a secret URL or code”**.
- **Why it fits:** If this is checked, the link in the invitation email may be taking users to the **self-enrollment (join code)** page instead of the **accept-invitation / create-password** flow. That would match “invitation email forces them to Join Code.”
- **References:** [Enable course self-enrollment (join code)](https://community.canvaslms.com/t5/Instructor-Guide/How-do-I-enable-course-self-enrollment-with-a-join-code-or/ta-p/830), [Enrollment options](https://community.canvaslms.com/t5/Admin-Guide/What-user-enrollment-and-registration-options-are-available-in-Canvas/ta-p/256).

**Action:** For the affected course(s) (e.g. 2912, 2915), have an admin/instructor open **Course Settings → Course Details** and **uncheck** “Let students self-enroll by sharing with them a secret URL or code.” Save. Then new invitations should use the normal “Get Started” / create-password flow.

---

### B. Account-level self-enrollment

- Self-enrollment must be **enabled at the account level** before a course can use it. If it was recently turned on at the account, courses could have started showing the join-code flow.
- **Action:** Account admin checks **Account Settings** and confirms whether self-enrollment is enabled and whether that’s desired for these courses. If not, disable at account (and ensure it’s off at course level per (A)).

---

### C. Known Canvas behavior: “Join code when one isn’t needed”

- Community reports some users being **asked for a join code** even when the course isn’t using one; behavior can be inconsistent (e.g. only some students).
- **Workaround reported:** Remove the user from the course and re-add them (re-send invitation).
- **Reference:** [Student can't log in - asked for join code when one isn't needed](https://community.canvaslms.com/t5/Canvas-Question-Forum/Student-can-t-log-in-asked-for-join-code-when-one-isn-t-needed/m-p/578246).

**Action:** If (A) and (B) are already correct, try unenrolling the affected user and re-enrolling (invited, notify) to get a fresh invitation; if it still happens, escalate to Canvas/Instructure support as a possible platform bug.

---

### D. API / code side (our payload is already correct)

- Our code creates the user with `skip_registration: false`, `force_self_registration: false` and enrolls with `enrollment_state: 'invited'`, `notify: true`. That is the standard “send invitation / Get Started” pattern.
- So the problem is **not** “we’re sending the wrong enrollment type.” The issue is almost certainly **course/account configuration** (self-enrollment/join code) or **Canvas routing** of the invitation link.

---

## 3. Recommended order of checks

1. **Course(s):** Uncheck **“Let students self-enroll by sharing with them a secret URL or code”** in Course Settings → Course Details for the relevant course(s).
2. **Account:** Confirm account-level self-enrollment settings and disable if not needed for these courses.
3. **Re-invite:** For already-invited users who hit the join-code screen, remove from course and re-add (re-send invitation) and have them use the new email link only.
4. **If it persists:** Treat as Canvas bug; contact Instructure support with course ID, user ID, and “invitation email leads to Join Code flow instead of Get Started / create password.”

---

## 4. References

- [Accept an email invitation to join a Canvas course (student)](https://community.canvaslms.com/t5/Student-Guide/How-do-I-accept-an-email-invitation-to-join-a-Canvas-course/ta-p/1563) — describes Get Started → Create My Account → password flow.
- [Enable course self-enrollment with join code or secret URL](https://community.canvaslms.com/t5/Instructor-Guide/How-do-I-enable-course-self-enrollment-with-a-join-code-or/ta-p/830) — course-level setting.
- [Self-enrollment in an account (admin)](https://community.canvaslms.com/t5/Admin-Guide/How-do-I-enable-self-enrollment-in-an-account-and-allow-students/ta-p/122) — account-level setting.
- [Student asked for join code when one isn’t needed](https://community.canvaslms.com/t5/Canvas-Question-Forum/Student-can-t-log-in-asked-for-join-code-when-one-isn-t-needed/m-p/578246) — community report of join-code prompt when not expected.
