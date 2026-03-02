/* 
   SCHEMA CONTEXT FILE 
   Generated: 2026-02-10 
   Tables: registrations, courses, enterprises, organizations 
*/

--- TABLE: registrations ---
/*
  Note: This table contains user registration and status data.
  Key columns for rewiring: first_name, last_name, status, organization_id, enterprise_id.
*/
id                   | int             | NO         |           
canvas_user_id       | mediumint       | YES        |           
canvasstate          | varchar(20)     | NO         |           
first_name           | varchar(100)    | NO         |           
last_name            | varchar(100)    | NO         |           
email                | varchar(100)    | NO         |           
role                 | enum('','faculty','staff') | NO         |           
enterprise           | varchar(100)    | NO         |           
enterprise_id        | smallint        | YES        |           
organization         | varchar(100)    | NO         |           
organization_id      | smallint        | YES        |           
status               | enum('submitter','active','enrollee','completer','review','expired','locked','inactive') | NO         | submitter 
course_id            | mediumint       | YES        |           
review_course_id     | mediumint       | NO         |           
reenroll_course_id   | mediumint       | NO         |           
cohort               | varchar(7)      | NO         |           
year                 | varchar(10)     | YES        |           
invited_date         | datetime        | YES        |           
enrolled_date        | datetime        | YES        |           
certificate_date     | datetime        | YES        |           
earner_date          | datetime        | YES        |           
created_at           | timestamp       | YES        | CURRENT_TIMESTAMP
updated_at           | timestamp       | YES        | CURRENT_TIMESTAMP
previous_courses     | varchar(100)    | NO         |           
quiz_completion_status | json            | YES        |           
missing_quizzes      | json            | YES        |           
is_inactive          | tinyint         | NO         |           

--- TABLE: courses ---
/*
  Note: Maps internal cohorts to Canvas Course IDs and individual Quiz IDs.
*/
id                   | int             | NO         |           
course_id            | mediumint       | NO         |           
enterprise_id        | int             | YES        |           
cohort               | varchar(8)      | NO         |           
year                 | varchar(10)     | NO         |           
course_title         | varchar(255)    | NO         |           
open_date            | date            | NO         |           
close_date           | date            | NO         |           
overview_of_document_accessibility_id | varchar(255)    | YES        |           
images_id            | varchar(255)    | YES        |           
hyperlinks_id        | varchar(255)    | YES        |           
contrast_color_reliance_id | varchar(255)    | YES        |           
optimizing_writing_id | varchar(255)    | YES        |           
exam_1_id            | varchar(255)    | YES        |           
headings_in_word_id  | varchar(255)    | YES        |           
optimizing_powerpoint_presentations_id | varchar(255)    | YES        |           
lists_columns_id     | varchar(255)    | YES        |           
tables_id            | varchar(255)    | YES        |           
exam_2_id            | varchar(255)    | YES        |           
evaluating_accessibility_id | varchar(255)    | YES        |           
practicing_evaluation_repair_id | varchar(255)    | YES        |           
creating_pdfs_id     | varchar(255)    | YES        |           
exam_3_id            | varchar(255)    | YES        |           
introduction_to_optimizing_pdfs_id | varchar(255)    | YES        |           
checking_accessibility_id | varchar(255)    | YES        |           
reading_order_tool_id | varchar(255)    | YES        |           
content_order_and_tags_order_id | varchar(255)    | YES        |           
exam_4_id            | varchar(255)    | YES        |           
tou_quiz_id          | varchar(255)    | YES        |           
total_quiz_points    | int             | YES        | 0         

--- TABLE: enterprises ---
id                   | int             | NO         |           
name                 | varchar(255)    | NO         |           
description          | text            | YES        |           
canvas_enterprise_id | int             | YES        |           
status               | enum('active','inactive') | YES        | active    
created_at           | timestamp       | YES        | CURRENT_TIMESTAMP
updated_at           | timestamp       | YES        | CURRENT_TIMESTAMP

--- TABLE: organizations ---
id                   | int             | NO         |           
name                 | varchar(255)    | NO         |           
type                 | enum('enterprise','org','district') | NO         |           
parent_id            | int             | YES        |           
canvas_org_id        | int             | YES        |           
created_at           | timestamp       | YES        | CURRENT_TIMESTAMP
updated_at           | timestamp       | YES        | CURRENT_TIMESTAMP
enterprise_id        | int             | NO         |           
