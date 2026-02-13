# Online Courses - Business Logic & State Specification
**Status:** Implementation Specification
**Last Updated:** February 10, 2026

## 1. System Statuses

### A. Course Statuses
| Status | Description |
| :--- | :--- |
| **Closed** | Course has ended; no further activity allowed. |
| **Pending** | Course created but not yet open for registration. |
| **Open** | Active course accepting registrations. |
| **Review** | Specialized cohort for certificate earners. |

### B. User Statuses (The Lifecycle)
| Status | Criteria | Description |
| :--- | :--- | :--- |
| **submitter** | Form submitted / Invited | Has been invited to a course but has not yet accepted in Canvas. |
| **active** | Accepted Canvas Invite | `login_id` returned by Canvas API; has NOT completed ToU quiz. |
| **enrollee** | Completed ToU Quiz | ToU quiz score = 1. `enrolleddate` is set. |
| **completer** | Module Mastery | Score of >= 1 on every Quiz and Exam for Modules 1 - 14. |
| **review** | Certificate Earner | 100% on all quizzes AND >= 80% on all exams. Invited to Review cohort. |
| **expired** | Course Ended | Participant was in an ended course (Strike applied). |
| **locked** | 3 Strikes Rule | Participant attempted to register after 3 previous course entries. |

---

## 2. Registration Logic

### A. The "Three Strikes" Rule
*   **Strike Trigger**: When a user in status `active`, `enrollee`, or `completer` is in a cohort that expires, they receive a strike and their status changes to `expired`.
*   **1st Strike**: Informed this is their 2nd registration; 1 self-registration left.
*   **2nd Strike**: Informed this is their 3rd registration; status changed to `locked`.
*   **Locked**: Must contact advisor (CCC) or redirected to Reenrollment cohort.

### B. Programming Workflow (On Form Submission)
1. **Check Existence**: Query `registrations` by email.
2. **New User**: 
    - Create Canvas User -> Save `canvas_user_id`.
    - Enroll in requested cohort -> Send welcome email.
    - Set `status = submitter` and `invited_date`.
3. **Existing User**:
    - **If `status = submitter`**:
        - If new course: Remove old (inactive), enroll new, update `course_id`, update `invited_date`.
        - If same course: Check Canvas API for `login_id`. If found, set `status = active`.
    - **If `status = review` / `active` / `enrollee` / `completer`**:
        - Show URL/Login instructions.
        - If new course: Provide option to switch. If chosen, move grades via API, set `status = submitter`.
    - **If `status = expired`**:
        - If 3 `previous_courses`: Set `status = locked`.
        - Else: Move grades to new course, enroll, set `status = submitter`, append `course_id` to `previous_courses`.

---

## 3. Automation (Cron Processes)

### Daily Cron Execution Order
1. **Acceptance Sync**: For `submitter`, check Canvas API. If `login_id` exists -> Set `status = active`.
2. **Metadata Push**: Push `role` and `organization` to Canvas custom fields.
3. **Grade Sync**: For `active|enrollee|completer`, fetch quiz/exam scores and save to table in JSON format.
    - *Constraint*: Check quizzes in order. Stop at first unsubmitted quiz.
4. **Status Promotion**:
    - `active` -> `enrollee`: If ToU quiz score = 1. Set `enrolleddate`.
    - `enrollee` -> `completer`: If Quiz 4 score >= 1.
    - `completer` -> `review`: If (Sum of relevant quizzes = 93) AND (Exams 1-4 scores >= 8).
        - Set `earnerdate`.
        - Enroll/Invite to Review cohort.

---

## 4. Database Requirements

### A. Tracked Date Fields
- `created_at`: Original registration date.
- `enrolleddate`: ToU quiz completion date.
- `earnerdate`: Certificate earned date (status -> review).
- `certificatesent`: Date certificate was sent to the organization.

### B. Course Mapping
The `courses` table must map `course_id` to the following assignment names:
- Overview of Document Accessibility
- Images
- Hyperlinks
- Contrast & Color Reliance
- Optimizing Writing
- Exam 1
- Headings in Word
- Optimizing PowerPoint Presentations
- Lists & Columns
- Tables
- Exam 2
- Evaluating Accessibility
- Practicing Evaluation & Repair
- Creating PDFs
- Exam 3
- Introduction to Optimizing PDFs
- Checking Accessibility
- Reading Order Tool
- Content Order and Tags Order
- Exam 4

---

## 5. Reenrollment & Exceptions

### Reenrollment Cohorts
- **Locked Users**: Redirected to self-enroll in unmonitored reenrollment cohorts.
- **Notification**: Email sent to `accessibledocs@webaim.org`.
- **Payment (CCC)**: User pays $25 fee via landing page link.
- **Payment (CSU)**: Enterprise pays; Facilitator tracks pool/billing.

### Manual Overrides
- Facilitators can manually change status from `locked` -> `earner` upon notification.
- Facilitators can trigger manual CoC (Certificate of Completion) generation.
