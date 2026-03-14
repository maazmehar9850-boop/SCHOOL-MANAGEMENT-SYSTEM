import express from 'express';
import  sendMail  from '../nodemailer/gmail.js';
const router = express.Router();
import  {registeruser,login,updateuser, deleteone}  from '../controller/student.js';

router.post('/register', registeruser);  
router.post('/login', login);   
router.put('/update/:id', updateuser);
router.get('/delete/:id', deleteone);
router.post('/sendMail', sendMail);  
export default router;  
