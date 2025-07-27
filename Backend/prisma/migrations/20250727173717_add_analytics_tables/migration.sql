-- CreateTable
CREATE TABLE "TaskMetrics" (
    "id" SERIAL NOT NULL,
    "taskId" TEXT NOT NULL,
    "projectId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "timeSpent" INTEGER NOT NULL DEFAULT 0,
    "priority" TEXT,
    "assignedTo" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "dueDate" TIMESTAMP(3),

    CONSTRAINT "TaskMetrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserStats" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "totalTasksCreated" INTEGER NOT NULL DEFAULT 0,
    "totalTasksCompleted" INTEGER NOT NULL DEFAULT 0,
    "totalTasksPending" INTEGER NOT NULL DEFAULT 0,
    "totalTasksOverdue" INTEGER NOT NULL DEFAULT 0,
    "totalTasksInProgress" INTEGER NOT NULL DEFAULT 0,
    "totalProjectsOwned" INTEGER NOT NULL DEFAULT 0,
    "totalProjectsJoined" INTEGER NOT NULL DEFAULT 0,
    "totalCommentsPosted" INTEGER NOT NULL DEFAULT 0,
    "totalTimeSpent" INTEGER NOT NULL DEFAULT 0,
    "avgTaskCompletionTime" DOUBLE PRECISION,
    "lastActivityAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserStats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectAnalytics" (
    "id" SERIAL NOT NULL,
    "projectId" INTEGER NOT NULL,
    "totalTasks" INTEGER NOT NULL DEFAULT 0,
    "completedTasks" INTEGER NOT NULL DEFAULT 0,
    "pendingTasks" INTEGER NOT NULL DEFAULT 0,
    "overdueTasks" INTEGER NOT NULL DEFAULT 0,
    "inProgressTasks" INTEGER NOT NULL DEFAULT 0,
    "totalMembers" INTEGER NOT NULL DEFAULT 0,
    "totalComments" INTEGER NOT NULL DEFAULT 0,
    "totalTimeSpent" INTEGER NOT NULL DEFAULT 0,
    "avgTaskCompletionTime" DOUBLE PRECISION,
    "productivityScore" DOUBLE PRECISION,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectAnalytics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserStats_userId_key" ON "UserStats"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectAnalytics_projectId_key" ON "ProjectAnalytics"("projectId");

-- AddForeignKey
ALTER TABLE "TaskMetrics" ADD CONSTRAINT "TaskMetrics_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskMetrics" ADD CONSTRAINT "TaskMetrics_assignedTo_fkey" FOREIGN KEY ("assignedTo") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserStats" ADD CONSTRAINT "UserStats_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectAnalytics" ADD CONSTRAINT "ProjectAnalytics_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
