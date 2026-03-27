-- Role types at project level
CREATE TYPE user_role AS ENUM ('owner', 'participant', 'viewer');

-- Task priority levels
CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high');

-- Invitation status
CREATE TYPE invitation_status AS ENUM ('pending', 'accepted', 'expired');

CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    username VARCHAR(30) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE projects (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_by BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE project_members (
    project_id BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role user_role NOT NULL,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (project_id, user_id)
);

-- Index for queries by user (e.g., "all projects for a user")
CREATE INDEX idx_project_members_user_id ON project_members(user_id);

CREATE TABLE workflow_stages (
    id BIGSERIAL PRIMARY KEY,
    project_id BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    stage_order INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (project_id, stage_order),   -- no duplicate order within a project
    UNIQUE (project_id, name)            -- optional: prevent duplicate stage names
);

-- Index for fast retrieval of stages per project in order
CREATE INDEX idx_workflow_stages_project_order ON workflow_stages(project_id, stage_order);

CREATE TABLE tasks (
    id BIGSERIAL PRIMARY KEY,
    project_id BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    stage_id BIGINT NOT NULL REFERENCES workflow_stages(id) ON DELETE RESTRICT, -- prevent deletion of stage with tasks
    title VARCHAR(255) NOT NULL,
    description TEXT,
    assigned_to BIGINT REFERENCES users(id) ON DELETE SET NULL,
    priority task_priority NOT NULL DEFAULT 'medium',
    due_date DATE,
    created_by BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    position INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (stage_id, position)   -- ensure unique ordering within a stage
);

-- Indexes for performance
CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_tasks_stage_id ON tasks(stage_id);
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_tasks_due_date ON tasks(due_date) WHERE due_date IS NOT NULL; -- for overdue queries
CREATE INDEX idx_tasks_project_stage ON tasks(project_id, stage_id); -- for dashboard counts
CREATE INDEX idx_tasks_stage_position ON tasks(stage_id, position); -- for ordered retrieval

CREATE TABLE comments (
    id BIGSERIAL PRIMARY KEY,
    task_id BIGINT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_comments_task_id ON comments(task_id);
CREATE INDEX idx_comments_user_id ON comments(user_id);

CREATE TABLE invitations (
    id BIGSERIAL PRIMARY KEY,
    project_id BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    role user_role NOT NULL,   -- only 'participant' or 'viewer' in practice
    invited_by BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    status invitation_status DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '7 days',
    UNIQUE (project_id, email, status)  -- prevent duplicate pending invitations
);

CREATE INDEX idx_invitations_token ON invitations(token);
CREATE INDEX idx_invitations_project_email ON invitations(project_id, email);

