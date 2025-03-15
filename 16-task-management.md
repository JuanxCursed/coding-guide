# SOP - Standard Operating Procedure: Task Management

## Story Point Estimation Guide (Fibonacci Scale)

| Story Points | Time Estimate | Complexity | Uncertainty |
|--------------|--------------|------------|-------------|
| 1 | A few minutes | Very simple, well-understood | Almost no risk |
| 2 | Up to an hour | Simple, clearly defined | Minimal risk |
| 3 | A few hours | Moderately complex | Some unknowns |
| 5 | A a day | Complex with multiple parts | Significant unknowns |
| 8 | Several days | Very complex, multiple systems | High level of uncertainty |
| 13 | One week | Extremely complex, multiple integrations | Very high uncertainty or dependencies |

*Note: Tasks with 8 or 13 points should be broken down into smaller tasks.*

## 1. Objective

Establish guidelines and standardize the task flow in any project, ensuring clarity in responsibilities, efficiency in delivery, and code quality.

## 2. Application

This procedure applies to all those involved in software development, including:
- Frontend and Backend Developers
- QA (Quality Assurance)
- Tech Leads
- Product Owners
- Project Managers

## 3. Definitions

| Term | Definition |
|------|-----------|
| Task | Unit of work representing a feature, fix, or improvement |
| PR (Pull Request) | Request to integrate code from one branch to another |
| Code Review | Process of code review by other developers |
| QA | Quality Assurance - Professional responsible for testing and quality assurance |
| Branch | Code branching for isolated feature development |
| Merge | Process of integrating code from one branch to another |

## 4. Responsibilities

| Role | Responsibilities |
|-------|------------------|
| Developer | Implement tasks according to specifications, review code from other developers, fix identified issues |
| Tech Lead | Review code, ensure technical standards are followed, support developers in problem-solving |
| QA | Test implemented features, identify problems, and report inconsistencies |
| Product Owner | Prioritize tasks, clarify requirements, and validate deliveries from a business perspective |
| Project Manager | Coordinate workflow, ensure deadlines are met, facilitate communication between stakeholders |

## 5. Task Flow

### 5.1 Task Stages

#### 5.1.1 Backlog

**Description:** Tasks that are being prepared and are not yet ready to be worked on.

**Rules:**
- **ATTENTION:** Do not start work on tasks at this stage without prior authorization
- Always ask before picking up a task from this stage
- Request clear definitions if the task is not well specified
- Before moving to To Do, the task must have:
  - Alignment between project manager, client, and developers regarding scope and expectations
  - Assigned module or milestone
  - Appropriate tags for categorization
  - Story points estimation (using the Fibonacci scale provided above)
  - Detailed description including:
    - Clear objective of the task
    - Acceptance criteria
    - Technical considerations or constraints
    - Dependencies on other tasks or systems
    - UI/UX specifications or mockups (if applicable)

**Responsible:** Product Owner, Tech Lead, Assigned Developer

**Criteria to Move:** The task must have clear requirements, be estimated, tagged, associated with a milestone, and prioritized

#### 5.1.2 To Do

**Description:** Tasks ready to be worked on.

**Rules:**
- Can be started by the developer assigned to the task
- Always observe priorities
- If there is no priority marking, consider it as medium priority
- When picking up a task, move it to "In Progress"

**Responsible:** Developers

**Criteria to Move:** Assigned developer is available to execute the task

#### 5.1.3 In Progress

**Description:** Tasks that are being actively developed. (The developer is actively working on the task, limited to 1 task per developer at a time)

**Rules:**
- Keep the task status updated
- Communicate impediments as quickly as possible
- Create branches following the pattern: `[TASK-ID]` (originating from the development branch)
- For tasks with subtasks:
  - The parent task will have its own branch
  - Child task branches will branch off from the parent branch
  - Each child task must complete its own code review and testing cycle individually
  - Child tasks must be merged back to the parent branch when completed
  - Only after all subtasks are completed should the parent branch be submitted for PR to development
  - The parent task requires a final comprehensive code review and more extensive testing before being merged
  - The parent task PR must include a summary of all subtasks completed and their respective testing results
- Make frequent commits with clear messages
- When ready for review, follow the guidelines in the [Pull Requests documentation](06-pull-requests.md) for:
  - Creating a detailed PR description
  - Adding screenshots of changes
  - Filling out the WWW (What, Why, Which problem solved)
  - Documenting steps to test
  - Defining validation criteria

**Responsible:** Developers

**Criteria to Move:** Development completed, unit tests passing, and PR created according to the established guidelines

#### 5.1.4 Code Review

**Description:** Tasks with implemented code awaiting review.

**Rules:**
- **ATTENTION:** Code reviews are a PRIORITY
- It's not necessary to wait for the Tech Lead to move to Testing
- **Requirement:** 2 approvals are sufficient to move to Testing
- **IMPORTANT:** The task should go to Testing ON THE SAME DAY
- **Necessary Action:** Push other devs to do the review as soon as possible

**Responsible:** Developers, Tech Lead

**Criteria to Move:** 2 approvals on the PR

#### 5.1.5 Changes Requested

**Description:** Tasks that need adjustments after code review.

**Rules:**
- **MAXIMUM PRIORITY** - Stop anything you are doing to resolve
- Typically requires minutes or at most an hour of effort
- NEVER leave tasks stuck at this stage
- After resolving, notify whoever requested the changes and move back to Code Review stage

**Responsible:** Developers

**Criteria to Move:** All requested changes have been implemented

#### 5.1.6 Testing

**Description:** Tasks ready to be validated by QA.

**Rules:**
- Maximum priority for QA
- Should be tested and moved quickly
- **Necessary Action:** If your task is here, follow up with QA at least 4x per day until the task is approved or rejected
- Provide test environments or clear instructions for reproduction

**Responsible:** QA, Developers

**Criteria to Move:** All tests passed without issues

#### 5.1.7 Approved

**Description:** Tasks validated by QA and ready to be integrated.

**Rules:**
- Can be merged to the main branch (or feature branch)
- After merging, move to "Ready to Deploy"
- Keep the branch updated with the main to avoid conflicts

**Responsible:** Developers

**Criteria to Move:** PR successfully merged

#### 5.1.8 Ready to Deploy

**Description:** Integrated tasks ready to be deployed to production.

**Rules:**
- **ATTENTION:** Only the Tech Lead or person responsible for the project takes over from here
- Alignment with the client may be necessary
- Tasks at this stage are grouped for releases

**Responsible:** Tech Lead, Project Manager

**Criteria to Move:** Successful production deployment

#### 5.1.9 Done

**Description:** Tasks completely finished and available in production.

**Rules:**
- Verify that the functionality is operating correctly in production
- Document lessons learned, if applicable
- Celebrate achievements! 🎉 Pizza time!

**Responsible:** Everyone