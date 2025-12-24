-- Drop duplicate tables that now live in MongoDB
DROP TABLE IF EXISTS "Comment" CASCADE;
DROP TABLE IF EXISTS "Log" CASCADE;
DROP TABLE IF EXISTS "Project" CASCADE;

-- Update ProjectMember to use MongoDB ObjectId strings
ALTER TABLE "ProjectMember" ALTER COLUMN "projectId" TYPE TEXT;

-- Update TaskMetrics to use MongoDB ObjectId strings  
ALTER TABLE "TaskMetrics" ALTER COLUMN "taskId" TYPE TEXT;
ALTER TABLE "TaskMetrics" ALTER COLUMN "projectId" TYPE TEXT;
