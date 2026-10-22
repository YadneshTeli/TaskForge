import { gql } from "apollo-server-express";

export default gql`
    scalar Upload

    type User {
        id: ID!
        email: String!
        username: String!
        role: String!
        fullName: String
        firstName: String
        lastName: String
        profilePicture: String
        bio: String
        isActive: Boolean!
        isOnline: Boolean!
        lastSeen: String
        lastActiveAt: String
        lastLogin: String
        createdAt: String!
        updatedAt: String!
        projects: [Project!]
        notifications: [Notification!]
        tasks: [Task!]
        stats: UserStats
    }

    type UserStats {
        id: Int
        userId: Int!
        unreadNotificationsCount: Int
        completedTasksCount: Int
        pendingTasksCount: Int
        overdueTasksCount: Int
        totalProjectsCount: Int
        totalTasksCount: Int
        totalCommentsCount: Int
        totalAttachmentsCount: Int
        totalLogsCount: Int
        totalNotificationsCount: Int
        totalMembersCount: Int
        totalTasksAssigned: Int
        totalTasksCreated: Int!
        totalTasksCompleted: Int!
        totalTasksPending: Int
        totalTasksOverdue: Int
        totalTasksInProgress: Int!
        totalTasksArchived: Int
        totalTasksDeleted: Int
        totalTasksUnassigned: Int
        totalProjectsOwned: Int
        totalProjectsJoined: Int
        totalCommentsPosted: Int
        totalTimeSpent: Int
        avgTaskCompletionTime: Float
        avgCompletionTime: Float
        averageCompletionTime: Float
        productivityScore: Float
        totalTasks: Int
        completedTasks: Int
        pendingTasks: Int
        overdueTasks: Int
        lastActivityAt: String
        lastActiveAt: String
        createdAt: String
        updatedAt: String
        user: User
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
        projectId: String
        totalTasks: Int!
        completedTasks: Int!
        pendingTasks: Int!
        inProgressTasks: Int!
        overdueTasks: Int!
        totalMembers: Int!
        totalComments: Int!
        totalTimeSpent: Int!
        avgTaskCompletionTime: Float
        averageCompletionTime: Float
        productivityScore: Float
        teamProductivity: Float
        completionRate: Float!
        lastUpdated: String!
        createdAt: String
        updatedAt: String
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
        id: ID
        user: User
        userId: User
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
        project: Project
    }

    type Notification {
        id: ID!
        title: String
        message: String
        content: String!
        type: String
        seen: Boolean!
        isRead: Boolean!
        userId: String
        taskId: String
        projectId: String
        createdAt: String!
        updatedAt: String
        user: User
    }

    type Comment {
        id: ID!
        text: String!
        content: String
        createdAt: String!
        author: User!
        task: Task
        project: Project
    }

    # Input types
    input ProjectInput {
        name: String
        description: String
        dueDate: String
        status: String
        addMemberIds: [String!]
        removeMemberIds: [String!]
    }

    input CreateProjectInput {
        name: String!
        description: String
        dueDate: String
        status: String
    }

    input UpdateProjectInput {
        name: String
        description: String
        dueDate: String
        status: String
        addMemberIds: [String!]
        removeMemberIds: [String!]
    }

    input TaskInput {
        title: String
        description: String
        dueDate: String
        status: String
        priority: String
        projectId: String
        assignedTo: String
        attachments: [String!]
    }

    input CreateTaskInput {
        title: String!
        description: String
        dueDate: String
        status: String
        priority: String
        projectId: String!
        assignedTo: String
    }

    input UpdateTaskInput {
        title: String
        description: String
        dueDate: String
        status: String
        priority: String
        projectId: String
        assignedTo: String
        attachments: [String!]
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
        count: Int
    }

    type Query {
        # User queries
        me: User
        getUserStats(userId: ID): UserStats
        userStats(userId: ID!): UserStats

        # Project queries - MongoDB
        getProjects: [Project!]!
        projects: [Project!]!
        getProject(projectId: ID!): Project
        
        # Project analytics - Prisma
        getProjectAnalytics(projectId: ID!): ProjectAnalytics
        projectAnalytics(projectId: ID!): ProjectAnalytics
        
        # Task queries - MongoDB
        getTasks(projectId: ID): [Task!]!
        tasks(projectId: ID): [Task!]!
        
        # Task analytics - Prisma
        getTaskAnalytics(projectId: ID!): [TaskMetrics!]!
        taskMetrics(taskId: ID!): TaskMetrics
        
        # Comment queries - MongoDB
        getTaskComments(taskId: ID!): [Comment!]!
        
        # Notification queries - Prisma
        getNotifications: [Notification!]!
        notifications: [Notification!]!
    }

    type Mutation {
        # Project mutations
        createProject(input: ProjectInput!): Project!
        updateProject(projectId: ID, id: ID, input: ProjectInput!): Project!
        deleteProject(projectId: ID, id: ID): MutationResponse!
        addProjectMember(projectId: ID!, userId: ID!): Project!

        # Task mutations
        createTask(input: TaskInput!): Task!
        updateTask(taskId: ID, id: ID, input: TaskInput!): Task!
        deleteTask(taskId: ID, id: ID): MutationResponse!
        assignTask(taskId: ID!, userId: ID!): Task!

        # Comment mutations
        createComment(input: CommentInput!): Comment!
        addComment(taskId: ID!, text: String!): Task!
        deleteComment(commentId: ID!): MutationResponse!

        # Notification mutations
        createNotification(input: NotificationInput!): Notification!
        markNotificationAsSeen(notificationId: ID!): Notification!
        markNotificationAsRead(id: ID!): Notification!
        markAllNotificationsAsRead: MutationResponse!
        deleteNotification(id: ID!): MutationResponse!

        # File upload
        uploadAttachment(taskId: ID!, file: Upload!): Task!
    }
`;
