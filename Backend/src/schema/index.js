const { gql } = require("apollo-server-express");

module.exports = gql`
    type User {
        id: ID!
        email: String!
        username: String!
        role: String!
        projects: [Project!]
        notifications: [Notification!]
    }

    type Project {
        id: ID!
        name: String!
        createdAt: String!
        logs: [Log!]
    }

    type Task {
        id: ID!
        title: String!
        dueDate: String
        status: String
        attachments: [String]
        project: Project!
        createdAt: String!
        updatedAt: String!
        description: String
        comments: [Comment!]
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
        addTask(projectId: ID!, title: String!): Task!
        uploadAttachment(taskId: ID!, file: Upload!): Task!
        markNotificationSeen(id: ID!): Notification!
        addComment(taskId: ID!, content: String!): Comment!
        deleteComment(id: ID!): Boolean!
        updateProject(id: ID!, name: String!): Project!
        deleteProject(id: ID!): Boolean!
        markTaskComplete(id: ID!): Task!
        markTaskIncomplete(id: ID!): Task!
        assignTaskToUser(taskId: ID!, userId: ID!): Task!
        unassignTaskFromUser(taskId: ID!): Task!
        updateTaskStatus(taskId: ID!, status: String!): Task!
        updateTaskDueDate(taskId: ID!, dueDate: String!): Task!
        updateTaskTitle(taskId: ID!, title: String!): Task!
        updateTaskDescription(taskId: ID!, description: String!): Task!
        addTaskAttachment(taskId: ID!, file: Upload!): Task!
        removeTaskAttachment(taskId: ID!, attachmentUrl: String!): Task!
        assignTaskToProject(taskId: ID!, projectId: ID!): Task!
        unassignTaskFromProject(taskId: ID!): Task!
        createNotification(content: String!): Notification!
        markNotificationAsSeen(id: ID!): Notification!
        createTask(projectId: ID!, title: String!, description: String, dueDate: String): Task!
        updateTask(id: ID!, title: String, description: String, dueDate: String, status: String): Task!
        deleteTask(id: ID!): Boolean!
    }
`;
