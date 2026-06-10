import express from 'express';
import  sendMail  from '../nodemailer/gmail.js';
import { authenticateRole } from '../middleware/middleware.js';
const router = express.Router();
import  {registeruser,login,updateuser, deleteone}  from '../controller/student.js';

router.post('/register', registeruser);  
router.post('/login', login);   
router.put('/update/:id', updateuser);
router.get('/delete/:id', deleteone);
router.post('/sendMail', sendMail);  
// Routes with role-based authentication
router.get('/admin-only', authenticateRole('admin'), (req, res) => {
    res.status(200).json({ message: 'Welcome Admin!' });
});

router.get('/teacher-only', authenticateRole('teacher'), (req, res) => {
    res.status(200).json({ message: 'Welcome Teacher!' });
});

router.get('/student-only', authenticateRole('student'), (req, res) => {
    res.status(200).json({ message: 'Welcome Student!' });
});

export default router;
