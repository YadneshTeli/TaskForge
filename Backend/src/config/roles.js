// Centralized role and permission definitions
const roles = ['admin', 'manager', 'user', 'viewer'];

const permissions = {
    upload: ['admin', 'manager'],
    report: ['admin', 'manager'],
    notify: ['admin', 'manager', 'user'],
    register: ['admin', 'manager'],
    view: ['admin', 'manager', 'user', 'viewer'],
    deleteUser: ['admin'],
    updateProfile: ['admin', 'manager', 'user'],
    addComment: ['admin', 'manager', 'user'],
    viewDashboard: ['admin', 'manager', 'user', 'viewer'],
};

export { roles, permissions };
export default { roles, permissions };
