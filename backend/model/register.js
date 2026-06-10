import mongoose from 'mongoose';


const registerSchema = new mongoose.Schema({
    name: { 
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    Password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        required: true,
        enum: ['admin', 'teacher', 'student'],
        default: 'student', // Default role set to 'student'
    },
    // Additional fields for Student
    grade: {
        type: String,
        required: false,
    },
    studentId: {
        type: String,
        required: false,
        unique: true,
        sparse: true, // Allows null values for unique index
    },
    // Additional fields for Teacher
    subject: {
        type: String,
        required: false,
    },
    teacherId: {
        type: String,
        required: false,
        unique: true,
        sparse: true,
    },
    // Additional fields for Admin
    adminLevel: {
        type: String,
        enum: ['super', 'regular'],
        default: 'regular',
        required: false,
    },
}, { timestamps: true });

const register = mongoose.model('register', registerSchema);

export default register;