import register from "../model/register.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';


export const registeruser = async (req, res) => {
    try {
        const { name, email, Password, role } = req.body;

        if (!name || !email || !Password) {
            return res.status(400).json({ message: 'all fields are required' });
        }

        const hashedPassword = await bcrypt.hash(Password, 10);
        try { 
            console.log('Hashed Password:', hashedPassword);
        } catch (hashError) {
            console.error('Error hashing password:', hashError);
            return res.status(500).json({ message: 'Internal server error' });
        }

        const saveuser = new register({
            name,
            email,
            Password: hashedPassword,
            role: role ||  'student', // Default role set to 'student'
        });
        await saveuser.save();
        const token =generateToken(saveuser);
        return res.status(200).json({ message: 'user registered successfully', token, User: saveuser });
        

    } catch (error) {
        console.error('Error registering user:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }};

    const comparePassword = async (inputPassword, storedHashedPassword) => {
        try {
            const isMatch = await bcrypt.compare(inputPassword, storedHashedPassword);
            return isMatch;
        } catch (error) {
            throw error;
        }
    };

 const generateToken = (user) => {
    const payload = {
        id: user._id,
        email: user.email,
        role: user.role, // Include role in the token payload
    };
    const secretKey = process.env.JWT_SECRET || 'your_secret_key'; // Use environment variable for secret key
    const options = { expiresIn: '1h' }; // Extend token expiration time to 1 hour
    return jwt.sign(payload, secretKey, options);
};




export const login = async (req, res) => {
    try {
        const { email, Password } = req.body;
        if (!email || !Password) {
            return res.status(400).json({ message: 'all fields are required' });
        }   
        const user = await register.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        const isPasswordMatch = await comparePassword(Password, user.Password);
        if (!isPasswordMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        const token = generateToken(user);
        return res.status(200).json({ message: 'Login successful', token, User: user });    
    } catch (error) {
        console.error('Error logging in:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }};


export const updateuser = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, Password } = req.body; 
        const updatedUser = await register.findByIdAndUpdate(
            id,
            { name, email, Password },
            { new: true }
        );  
        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        return res.status(200).json({ message: 'User updated successfully', User: updatedUser });
    } catch (error) {
        console.error('Error updating user:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }}; 

      export const loginone = async (req, res) => {
        try {
            const { email, Password } = req.body;
            if (!email || !Password) {
                return res.status(400).json({ message: 'all fields are required' });
            }
            const user = await register.findOne({ email, Password });
            if (!user) {
                return res.status(401).json({ message: 'Invalid email or password' });
            }

            return res.status(200).json({ message: 'Login successful', User: user });
        } catch (error) {
            console.error('Error logging in:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }};

        export const updateone = async (req, res) => {
            try {
                const { id } = req.params;
                const { name, email, Password } = req.body;
                const updatedUser = await register.findByIdAndUpdate(
                    id,
                    { name, email, Password },
                    { new: true }
                );
                if (!updatedUser) {
                    return res.status(404).json({ message: 'User not found' });
                }
                return res.status(200).json({ message: 'User updated successfully', User: updatedUser });
            } catch (error) {
                console.error('Error updating user:', error);
                return res.status(500).json({ message: 'Internal server error' });
            }};

            export const deleteone = async (req, res) => {
                try {
                    const { id } = req.params;
                    const deletedUser = await register.findByIdAndDelete(id);
                    if (!deletedUser) {
                        return res.status(404).json({ message: 'User not found' });
                    }
                    return res.status(200).json({ message: 'User deleted successfully' });
                } catch (error) {
                    console.error('Error deleting user:', error);
                    return res.status(500).json({ message: 'Internal server error' });
                }};



