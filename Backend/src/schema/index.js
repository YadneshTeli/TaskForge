const { gql } = require("apollo-server-express");

module.exports = gql`
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
    }

    type Project {
        id: ID!
        name: String!
        description: String!
        dueDate: String!
        status: String!
        createdAt: String!
        updatedAt: String!
        owner: User!
        members: [User!]
        tasks: [Task!]
        logs: [Log!]
        comments: [Comment!]
        attachments: [String!]
        metrics: ProjectMetrics!
    }

    type ProjectMetrics {
        tasksCount: Int!
        completedTasksCount: Int!
        pendingTasksCount: Int!
        overdueTasksCount: Int!
        progress: Float!
    }

    type Task {
        id: ID!
        title: String!
        description: String
        dueDate: String
        status: String
        priority: String
        labels: [String]
        tags: [String]
        attachments: [String]
        reminders: [String]
        recurring: String!
        createdAt: String!
        updatedAt: String!
        project: Project!
        createdBy: User!
        assignedTo: User
        subtasks: [Task!]
        dependencies: [Task!]
        comments: [Comment!]
        custom: TaskCustom!
        metrics: TaskMetrics!
    }

    type TaskCustom {
        fields: [CustomField!]
        statuses: [CustomStatus!]
        priorities: [CustomPriority!]
        labels: [CustomLabel!]
        tags: [CustomTag!]
        assignees: [CustomAssignee!]
        projects: [CustomProject!]
        reminders: [CustomReminder!]
        recurring: [CustomRecurring!]
    }

    type TaskMetrics {
        commentsCount: Int!
        attachmentsCount: Int!
        subtasksCount: Int!
        dependenciesCount: Int!
        remindersCount: Int!
        recurringCount: Int!
        customFieldsCount: Int!
        customStatusesCount: Int!
        customPrioritiesCount: Int!
        customLabelsCount: Int!
        customTagsCount: Int!
        customAssigneesCount: Int!
        customProjectsCount: Int!
        customRemindersCount: Int!
        customRecurringCount: Int!
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
        content: String!
        createdAt: String!
        author: User!
        task: Task
        project: Project
    }

    type CustomField {
        id: ID!
        name: String!
        value: String!
    }

    type CustomStatus {
        id: ID!
        name: String!
    }

    type CustomPriority {
        id: ID!
        level: String!
    }

    type CustomLabel {
        id: ID!
        name: String!
    }

    type CustomTag {
        id: ID!
        name: String!
    }

    type CustomAssignee {
        id: ID!
        user: User!
    }

    type CustomProject {
        id: ID!
        name: String!
    }

    type CustomReminder {
        id: ID!
        time: String!
    }

    type CustomRecurring {
        id: ID!
        pattern: String!
    }

    type Query {
        me: User
        getProjects: [Project!]
        getTasks(projectId: ID!): [Task!]
        getNotifications: [Notification!]
        getProjectLogs(projectId: ID!): [Log!]
        getTaskComments(taskId: ID!): [Comment!]
    }

    type Mutation {
        createProject(name: String!): Project!
        updateProject(id: ID!, name: String!): Project!
        deleteProject(id: ID!): Boolean!

        createTask(projectId: ID!, title: String!, description: String, dueDate: String): Task!
        updateTask(id: ID!, title: String, description: String, dueDate: String, status: String): Task!
        deleteTask(id: ID!): Boolean!

        markTaskComplete(id: ID!): Task!
        markTaskIncomplete(id: ID!): Task!

        assignTaskToUser(taskId: ID!, userId: ID!): Task!
        unassignTaskFromUser(taskId: ID!): Task!

        updateTaskStatus(taskId: ID!, status: String!): Task!
        updateTaskDueDate(taskId: ID!, dueDate: String!): Task!
        updateTaskTitle(taskId: ID!, title: String!): Task!
        updateTaskDescription(taskId: ID!, description: String!): Task!

        assignTaskToProject(taskId: ID!, projectId: ID!): Task!
        unassignTaskFromProject(taskId: ID!): Task!

        addTaskAttachment(taskId: ID!, file: Upload!): Task!
        removeTaskAttachment(taskId: ID!, attachmentUrl: String!): Task!

        uploadAttachment(taskId: ID!, file: Upload!): Task!

        createNotification(content: String!): Notification!
        markNotificationAsSeen(id: ID!): Notification!

        addComment(taskId: ID!, content: String!): Comment!
        deleteComment(id: ID!): Boolean!
    }
`;
