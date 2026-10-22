import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import PDFDocument from 'pdfkit';
import { PrismaClient } from '@prisma/client';
import Project from '../models/project.model.js';
import Task from '../models/task.model.js';
import Comment from '../models/comment.model.js';

const prisma = new PrismaClient();

// Get current directory in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Ensure reports directory exists
const reportsDir = path.join(__dirname, '../../reports');
if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
}

function formatTasksTable(tasks = []) {
    let table = 'Title           | Status    | Due Date\n';
    table += '-------------------------------------\n';
    tasks.forEach(task => {
        const title = (task.title || '').padEnd(15);
        const status = (task.status || '').padEnd(10);
        const dueDate = task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '';
        table += `${title}| ${status}| ${dueDate}\n`;
    });
    return table;
}

function formatMembersTable(members = []) {
    let table = 'Username        | Email\n';
    table += '-----------------------------\n';
    members.forEach(member => {
        const username = (member.username || '').padEnd(15);
        table += `${username}| ${member.email || ''}\n`;
    });
    return table;
}

function formatCommentsTable(comments = []) {
    let table = 'Content         | Created At\n';
    table += '-------------------------------------\n';
    comments.forEach(comment => {
        const text = (comment.content || comment.text || '').padEnd(15);
        const createdAt = comment.createdAt ? new Date(comment.createdAt).toLocaleDateString() : '';
        table += `${text}| ${createdAt}\n`;
    });
    return table;
}

// Service for handling report generation
export default {
    async generateReport({ projectId, format = 'pdf' }) {
        // Fetch project from MongoDB
        const project = await Project.findById(projectId).lean();
        if (!project) throw new Error('Project not found');

        const [tasks, comments, members] = await Promise.all([
            Task.find({ projectId }).lean(),
            Comment.find({ projectId }).lean(),
            project.members?.length > 0
                ? prisma.user.findMany({
                    where: { id: { in: project.members } },
                    select: { id: true, username: true, email: true }
                })
                : Promise.resolve([])
        ]);

        if (format === 'pdf') {
            // Generate PDF report
            const reportPath = path.join(reportsDir, `project_${projectId}_report.pdf`);
            const doc = new PDFDocument();
            doc.pipe(fs.createWriteStream(reportPath));

            doc.fontSize(20).text(`Project Report: ${project.name}`, { align: 'center' });
            doc.moveDown();
            doc.fontSize(12).text(`Description: ${project.description || ''}`);
            doc.text(`Due Date: ${project.dueDate ? new Date(project.dueDate).toLocaleDateString() : 'N/A'}`);
            doc.text(`Status: ${project.status}`);
            doc.moveDown();

            doc.fontSize(16).text('Tasks:', { underline: true });
            doc.fontSize(10).text(formatTasksTable(tasks));
            doc.moveDown();

            doc.fontSize(16).text('Members:', { underline: true });
            doc.fontSize(10).text(formatMembersTable(members));
            doc.moveDown();

            doc.fontSize(16).text('Comments:', { underline: true });
            doc.fontSize(10).text(formatCommentsTable(comments));

            doc.end();
            return reportPath;
        } else if (format === 'csv') {
            // Generate CSV report
            let csv = `Project Name,${project.name}\nDescription,${project.description || ''}\nDue Date,${project.dueDate ? new Date(project.dueDate).toLocaleDateString() : ''}\nStatus,${project.status}\n`;
            csv += '\nTasks:\n';
            csv += 'Title,Status,DueDate\n';
            tasks.forEach(task => {
                csv += `${task.title},${task.status},${task.dueDate ? new Date(task.dueDate).toLocaleDateString() : ''}\n`;
            });
            csv += '\nMembers:\n';
            csv += 'Username,Email\n';
            members.forEach(member => {
                csv += `${member.username},${member.email}\n`;
            });
            csv += '\nComments:\n';
            csv += 'Text,CreatedAt\n';
            comments.forEach(comment => {
                csv += `${comment.content || comment.text || ''},${comment.createdAt ? new Date(comment.createdAt).toLocaleDateString() : ''}\n`;
            });
            const reportPath = path.join(reportsDir, `project_${projectId}_report.csv`);
            await fs.promises.writeFile(reportPath, csv);
            return reportPath;
        } else {
            throw new Error('Unsupported report format');
        }
    }
};
