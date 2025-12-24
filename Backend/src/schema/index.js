import { gql } from "apollo-server-express";

export default gql`
    scalar Upload

    type User {
        id: ID!
        email: String!
        username: String!
        role: String!
        fullName: String
        profilePicture: String
        bio: String
        isActive: Boolean!
        isOnline: Boolean!
        lastSeen: String!
        lastActiveAt: String!
        lastLogin: String!
        createdAt: String!
        updatedAt: String!
        projects: [Project!]
        notifications: [Notification!]
        tasks: [Task!]
        stats: UserStats!
    }

    type UserStats {
        id: Int!
        userId: Int!
        unreadNotificationsCount: Int!
        completedTasksCount: Int!
        pendingTasksCount: Int!
        overdueTasksCount: Int!
        totalProjectsCount: Int!
        totalTasksCount: Int!
        totalCommentsCount: Int!
        totalAttachmentsCount: Int!
        totalLogsCount: Int!
        totalNotificationsCount: Int!
        totalMembersCount: Int!
        totalTasksAssigned: Int!
        totalTasksCreated: Int!
        totalTasksCompleted: Int!
        totalTasksPending: Int!
        totalTasksOverdue: Int!
        totalTasksInProgress: Int!
        totalTasksArchived: Int!
        totalTasksDeleted: Int!
        totalTasksUnassigned: Int!
        user: User!
    }

    type Project {
        id: ID!
        name: String!
        description: String
        dueDate: String
        status: String!
        createdAt: String!
        updatedAt: String!
        owner: User!
        members: [User!]!
        tasks: [Task!]!
        comments: [Comment!]!
        attachments: [String!]!
        analytics: ProjectAnalytics
    }

    type ProjectAnalytics {
        totalTasks: Int!
        completedTasks: Int!
        pendingTasks: Int!
        inProgressTasks: Int!
        overdueTasks: Int!
        totalMembers: Int!
        totalComments: Int!
        totalTimeSpent: Int!
        avgTaskCompletionTime: Float
        productivityScore: Float
        completionRate: Float!
        lastUpdated: String!
    }

    type Task {
        id: ID!
        title: String!
        description: String
        dueDate: String
        status: TaskStatus!
        priority: String
        attachments: [String!]!
        createdAt: String!
        updatedAt: String!
        projectId: String!
        assignedTo: User
        comments: [TaskComment!]!
    }

    type TaskComment {
        userId: User!
        text: String!
        createdAt: String!
    }

    type TaskMetrics {
        taskId: String!
        title: String!
        status: String!
        timeSpent: Int!
        priority: String
        createdAt: String!
        updatedAt: String!
        completedAt: String
        dueDate: String
        assignee: User
    }

    enum TaskStatus {
        todo
        in_progress
        done
    }

    type Log {
        id: ID!
        action: String!
        createdAt: String!
        project: Project!
    }

    type Notification {
        id: ID!
        content: String!
        seen: Boolean!
        createdAt: String!
        user: User!
    }

    type Comment {
        id: ID!
        text: String!
        createdAt: String!
        author: User!
        task: Task
        project: Project
    }

    # Input types
    input ProjectInput {
        name: String!
        description: String
        dueDate: String
        status: String
    }

    input TaskInput {
        title: String!
        description: String
        dueDate: String
        status: TaskStatus
        priority: String
        projectId: String!
        assignedTo: String
    }

    input CommentInput {
        text: String!
        taskId: String!
        projectId: String
    }

    input NotificationInput {
        content: String!
        userId: String
    }

    # Response types
    type MutationResponse {
        success: Boolean!
        message: String!
    }

    type Query {
        # User queries
        me: User
        getUserStats(userId: ID): UserStats

        # Project queries - MongoDB
        getProjects: [Project!]!
        getProject(projectId: ID!): Project
        
        # Project analytics - Prisma
        getProjectAnalytics(projectId: ID!): ProjectAnalytics
        
        # Task queries - MongoDB
        getTasks(projectId: ID!): [Task!]!
        
        # Task analytics - Prisma
        getTaskAnalytics(projectId: ID!): [TaskMetrics!]!
        
        # Comment queries - MongoDB
        getTaskComments(taskId: ID!): [Comment!]!
        
        # Notification queries - MongoDB
        getNotifications: [Notification!]!
    }

    type Mutation {
        # Project mutations
        createProject(input: ProjectInput!): Project!
        updateProject(projectId: ID!, input: ProjectInput!): Project!
        deleteProject(projectId: ID!): MutationResponse!
        addProjectMember(projectId: ID!, userId: ID!): Project!

        # Task mutations
        createTask(input: TaskInput!): Task!
        updateTask(taskId: ID!, input: TaskInput!): Task!
        deleteTask(taskId: ID!): MutationResponse!
        assignTask(taskId: ID!, userId: ID!): Task!

        # Comment mutations
        createComment(input: CommentInput!): Comment!
        deleteComment(commentId: ID!): MutationResponse!

        # Notification mutations
        createNotification(input: NotificationInput!): Notification!
        markNotificationAsSeen(notificationId: ID!): Notification!

        # File upload
        uploadAttachment(taskId: ID!, file: Upload!): Task!
    }
`;
