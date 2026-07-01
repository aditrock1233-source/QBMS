========================================================================
           QUESTION BANK MANAGEMENT SYSTEM (QBMS) - README
========================================================================

Welcome to the Question Bank Management System (QBMS), a comprehensive,
automated exam prep, question management, and paper generation platform
built for academic institutions.

This README provides a thorough, detailed overview of the system, its
architecture, features, role permissions, and how to get started.

------------------------------------------------------------------------
1. OVERVIEW & GOALS
------------------------------------------------------------------------
QBMS is designed to replace manual, error-prone question paper creation
with a structured, role-based, AI-enhanced workflow. The system maintains
a centralized database of categorized questions (by subject, topic, 
difficulty level, Bloom's taxonomy) and provides automated or semi-automated
generation of randomized, distinct paper sets (Set A, Set B, Set C, etc.)
ready for distribution as professionally formatted PDFs.

------------------------------------------------------------------------
2. KEY USER ROLES & PERMISSIONS
------------------------------------------------------------------------
The platform implements granular role-based access control (RBAC) across
five distinct user roles:

- STUDENT
  * Can self-register on the landing portal.
  * Credentials (password and email link) are automatically generated
    and sent to their registered Gmail ID.
  * Can log in using generated credentials to practice interactive mock 
    quizzes.
  * Can view the department-wide Student Leaderboard ranking peers by 
    quiz performance.

- FACULTY
  * Can manually create and contribute questions to the Pending queue.
  * Can view revision histories and check the status of their submissions.
  * Can generate question papers (manual selection or AI assisted).
  * Receives in-app notification alerts when their submissions are 
    approved, rejected, or marked for review.

- HEAD OF DEPARTMENT (HOD)
  * Can review, approve, or reject pending questions in the queue.
  * Can mark questions or papers for review, appending feedback comments
    which are automatically routed to the author, other HODs, and Admins.
  * Can perform bulk approvals of multiple questions in a single click.

- EXAM CELL
  * Can list, view details of, and download approved question papers.
  * Has the authority to generate question papers manually or using AI.
  * Can flag/mark papers and questions for review with specific comments.

- ADMINISTRATOR (ADMIN)
  * Possesses full system moderation privileges.
  * Can manage academic departments, user registrations, and roles.
  * Can approve, reject, or delete questions and papers.
  * Has advanced bulk capabilities to approve, reject (with feedback),
    or permanently delete multiple questions in one click.

------------------------------------------------------------------------
3. CORE FEATURES & RECENT UPGRADES
------------------------------------------------------------------------

* AUTOMATED CREDENTIALS VIA GMAIL
  During registration, students and faculty enter their emails and are 
  redirected to the login page. The system auto-generates secure, random
  passwords and dispatches them directly to the user's email via Gmail.

* DEDUPLICATED MULTIPLE AI SETS
  When generating multiple sets (e.g. Set A, Set B, Set C) using the AI 
  (Gemini API), the backend keeps track of question titles generated in 
  previous sets, instructing the Gemini model to avoid overlaps. This 
  ensures each set contains completely distinct questions. A robust 
  fallback simulation index offset is used if the API key is missing.

* REFINED 3-COLUMN EXAM PDF LAYOUT
  Question papers generated as PDFs are designed to match standard exam 
  sheets:
  - Formatted Header: Institution name and department.
  - Candidate Box: Designated area for Roll Number, Set Label, Marks, 
    and Date.
  - Clean Column Partitioning:
    * Left Column: Question number.
    * Center Column: Question statement, code blocks, and MCQ options.
    * Right Column: Marks in brackets (e.g., [10]).
  - Ruled Design: Horizontal underlines and double separators.
  - Page-Break Auditing: Automatically pushes titles/options to the 
    next page if they exceed the page bounds, avoiding orphans.
  - Dynamic Footers: Automatically adds page ranges ("Page X of Y").

* EXAM CELL REVIEW CHANNEL
  Exam Cell users can review pending questions and papers and submit 
  them for revision. Adding review comments sets the status of the item 
  to 'Review', notifying the author (Faculty) and sending notification 
  alerts to HODs and Admins.

------------------------------------------------------------------------
4. TECH STACK & SYSTEM ARCHITECTURE
------------------------------------------------------------------------
QBMS is structured as a decoupled client-server architecture:

BACKEND (Node.js & Express)
- Database: MongoDB via Mongoose.
- Document Generation: PDFKit for streaming custom A4 PDF papers.
- AI Integration: @google/generative-ai SDK.
- Notifications: In-app logging and nodemailer-based SMTP transport.

FRONTEND (React)
- Routing: React Router DOM with protected route wrappers.
- State: Context API (Auth, Theme).
- Styling: Custom vanilla CSS with dark mode variables.

------------------------------------------------------------------------
5. SETUP & INSTALLATION
------------------------------------------------------------------------

PREREQUISITES:
- Node.js (v16+)
- MongoDB running locally or a MongoDB Atlas URI

BACKEND INSTALLATION:
1. Navigate to the backend directory:
   cd backend
2. Install dependencies:
   npm install
3. Configure your environmental variables in backend/.env:
   * PORT = 5000
   * MONGO_URI = your_mongodb_connection_string
   * JWT_SECRET = your_jwt_token_secret
   * EMAIL_USER = your_gmail_id@gmail.com
   * EMAIL_PASS = your_google_app_password
   * GEMINI_API_KEY = your_gemini_api_key (optional fallback active)
4. Start the dev server:
   npm run dev

FRONTEND INSTALLATION:
1. Navigate to the frontend directory:
   cd ../frontend
2. Install dependencies:
   npm install
3. Start the React dev server:
   npm start

------------------------------------------------------------------------
6. VERIFICATION & SYSTEM INTEGRITY
------------------------------------------------------------------------
- Frontend builds compile cleanly with zero errors:
  "npm run build" creates optimized static bundles.
- Backend routing and controller operations are syntax-checked:
  "node -c" ensures no lexical/logical declaration compile issues.
- Notifications and mail loops run asynchronously without clogging 
  request-response loops.
========================================================================
