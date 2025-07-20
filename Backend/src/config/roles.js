// Centralized role and permission definitions
module.exports = {
    roles: ['admin', 'manager', 'user', 'viewer'],
    permissions: {
        upload: ['admin', 'manager'],
        report: ['admin', 'manager'],
        notify: ['admin', 'manager', 'user'],
        register: ['admin', 'manager'],
        view: ['admin', 'manager', 'user', 'viewer'],
        deleteUser: ['admin'],
        updateProfile: ['user', 'manager'],
        addComment: ['user', 'manager'],
        viewDashboard: ['viewer'],
        // Add more permissions as needed
    }
};
