import mongoose from 'mongoose';

const registerSchema = new mongoose.Schema({
    name: { 
        type: String,
        required: true,
    },
    email: {
        type: String,
    
        unique: true,
    },
    Password: {
        type: String,
        required: true,
    },
});

const register = mongoose.model('register', registerSchema);

export default register;