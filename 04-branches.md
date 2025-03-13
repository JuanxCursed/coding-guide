# Branches

## Branch Structure

We adopt a branch structure that facilitates parallel development and continuous integration. The main branches are:

- **main**: The primary branch that reflects the stable state of the code in production.
- **development**: The development branch where integrations occur before being merged into `main`.
- **[Ticket ID]**: Branches for developing specific features or fixes, named after the corresponding ticket ID.

## Branch Naming

We use a ticket-based convention to name branches, facilitating traceability and identifying the purpose of each branch.

- **Development Branches**: `[TICKET_ID]`
  
  **Examples:**
  - `DRPT-18`
  - `ABC-1`
  - `EDCBA-123`
  - `AIF-4`

## Workflow

We adopt a simplified workflow focused on using the ticket system. The workflow follows these steps:

1. **Branch Creation**:
   - Create a branch from `development` with the name corresponding to the ticket ID.
   - **Example**:
     ```bash
     git checkout development
     git checkout -b DRPT-18
     ```

2. **Development**:
   - Perform development on the created branch.
   - Make commits following the message convention that includes the ticket ID.

3. **Pull Request**:
   - Upon completing development, create a Pull Request (PR) pointing to the `development` branch.
   - Follow the code review guidelines before merging.

4. **Merging**:
   - After PR approval and continuous integration verification, merge into `development`.
