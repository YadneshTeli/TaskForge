const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const Project = require('../models/project.model');
const Task = require('../models/task.model');
const Comment = require('../models/comment.model');

function formatTasksTable(tasks) {
    let table = 'Title           | Status    | Due Date\n';
    table += '-------------------------------------\n';
    tasks.forEach(task => {
        table += `${task.title.padEnd(15)}| ${task.status.padEnd(10)}| ${task.dueDate ? task.dueDate.toLocaleDateString() : ''}\n`;
    });
    return table;
}

function formatMembersTable(members) {
    let table = 'Username        | Email\n';
    table += '-----------------------------\n';
    members.forEach(member => {
        table += `${member.username.padEnd(15)}| ${member.email}\n`;
    });
    return table;
}

function formatCommentsTable(comments) {
    let table = 'Content         | Created At\n';
    table += '-------------------------------------\n';
    comments.forEach(comment => {
        table += `${comment.text.padEnd(15)}| ${comment.createdAt.toLocaleDateString()}\n`;
    });
    return table;
}

// Service for handling report generation
module.exports = {
    async generateReport({ projectId, format = 'pdf' }) {
        // Fetch project and related data from DB
        const project = await Project.findById(projectId)
            .populate('tasks')
            .populate('members')
            .populate('comments')
            .lean();
            
        if (!project) throw new Error('Project not found');

        if (format === 'pdf') {
            // Generate PDF report
            const reportPath = path.join(__dirname, '../../reports', `project_${projectId}_report.pdf`);
            const doc = new PDFDocument();
            doc.pipe(fs.createWriteStream(reportPath));

            doc.fontSize(20).text(`Project Report: ${project.name}`, { align: 'center' });
            doc.moveDown();
            doc.fontSize(12).text(`Description: ${project.description}`);
            doc.text(`Due Date: ${project.dueDate}`);
            doc.text(`Status: ${project.status}`);
            doc.moveDown();

            doc.fontSize(16).text('Tasks:', { underline: true });
            doc.fontSize(10).text(formatTasksTable(project.tasks));
            doc.moveDown();

            doc.fontSize(16).text('Members:', { underline: true });
            doc.fontSize(10).text(formatMembersTable(project.members));
            doc.moveDown();

            doc.fontSize(16).text('Comments:', { underline: true });
            doc.fontSize(10).text(formatCommentsTable(project.comments));

            doc.end();
            return reportPath;
        } else if (format === 'csv') {
            // Generate CSV report
            let csv = `Project Name,${project.name}\nDescription,${project.description || ''}\nDue Date,${project.dueDate ? project.dueDate.toLocaleDateString() : ''}\nStatus,${project.status}\n`;
            csv += '\nTasks:\n';
            csv += 'Title,Status,DueDate\n';
            project.tasks.forEach(task => {
                csv += `${task.title},${task.status},${task.dueDate ? task.dueDate.toLocaleDateString() : ''}\n`;
            });
            csv += '\nMembers:\n';
            csv += 'Username,Email\n';
            project.members.forEach(member => {
                csv += `${member.username},${member.email}\n`;
            });
            csv += '\nComments:\n';
            csv += 'Text,CreatedAt\n';
            project.comments.forEach(comment => {
                csv += `${comment.text},${comment.createdAt.toLocaleDateString()}\n`;
            });
            const reportPath = path.join(__dirname, '../../reports', `project_${projectId}_report.csv`);
            await fs.promises.writeFile(reportPath, csv);
            return reportPath;
        } else {
            throw new Error('Unsupported report format');
        }
    }
};
