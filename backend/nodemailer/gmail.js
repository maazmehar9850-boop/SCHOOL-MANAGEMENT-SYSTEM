import node from 'nodemailer';

export const transporter = node.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,  
    auth: {
    user: "maazmehar9850@gmail.com",
    pass: "swwt crtn wwvt pjxt"
    }
});

const mailOptions = {
    from: "maazmehar9850@gmail.com",
    to: "buttsalar786@gmail.com",
    subject: "Test Email from Node.js",
    text: "This is a test email sent using Nodemailer and Gmail."
};

const sendMail = () => {
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {console.error('Error sending email:', error);   
        } else {console.log('Email sent successfully:', info.response);
        }   
    });
};

 export default sendMail;   
    
 