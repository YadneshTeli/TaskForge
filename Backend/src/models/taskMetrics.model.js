// src/models/taskMetrics.model.js
import mongoose from 'mongoose';

const TaskMetricsSchema = new mongoose.Schema({
    commentsCount: { type: Number, default: 0 },
    attachmentsCount: { type: Number, default: 0 },
    subtasksCount: { type: Number, default: 0 },
    dependenciesCount: { type: Number, default: 0 },
    remindersCount: { type: Number, default: 0 },
    recurringCount: { type: Number, default: 0 },
    customFieldsCount: { type: Number, default: 0 },
    customStatusesCount: { type: Number, default: 0 },
    customPrioritiesCount: { type: Number, default: 0 }
});

export default mongoose.model('TaskMetrics', TaskMetricsSchema);
