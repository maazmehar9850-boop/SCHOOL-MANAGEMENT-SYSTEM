import register from "../model/register.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const sanitizeUser = (user) => {
  const obj = user.toObject ? user.toObject() : { ...user };
  delete obj.Password;
  return obj;
};

const generateToken = (user) => {
  const payload = {
    id: user._id,
    email: user.email,
    role: user.role,
    name: user.name,
  };
  const secretKey = process.env.JWT_SECRET;
  if (!secretKey) {
    throw new Error("JWT_SECRET is not configured");
  }
  return jwt.sign(payload, secretKey, { expiresIn: "8h" });
};

export const registeruser = async (req, res) => {
  try {
    const { name, email, Password, role, bio, subject, experience, phone } = req.body;

    const existing = await register.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(Password, 10);
    const saveuser = await register.create({
      name,
      email: email.toLowerCase(),
      Password: hashedPassword,
      role: role || "student",
      bio: bio || "",
      subject: subject || "",
      experience: experience || "",
      phone: phone || "",
    });

    const token = generateToken(saveuser);
    return res.status(201).json({
      message: "User registered successfully",
      token,
      role: saveuser.role,
      User: sanitizeUser(saveuser),
    });
  } catch (error) {
    console.error("Error registering user:", error);
    if (error.code === 11000) {
      return res.status(409).json({ message: "Email already registered" });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
};

/** Public signup — student or teacher only (no admin elevation) */
export const signupUser = async (req, res) => {
  try {
    const { name, email, Password, role } = req.body;
    const safeRole = role === "teacher" ? "teacher" : "student";

    const existing = await register.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(Password, 10);
    const saveuser = await register.create({
      name,
      email: email.toLowerCase(),
      Password: hashedPassword,
      role: safeRole,
    });

    const token = generateToken(saveuser);
    return res.status(201).json({
      message: "Account created successfully",
      token,
      role: saveuser.role,
      User: sanitizeUser(saveuser),
    });
  } catch (error) {
    console.error("Error signing up:", error);
    if (error.code === 11000) {
      return res.status(409).json({ message: "Email already registered" });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, Password } = req.body;
    const user = await register.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isPasswordMatch = await bcrypt.compare(Password, user.Password);
    if (!isPasswordMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = generateToken(user);
    return res.status(200).json({
      message: "Login successful",
      token,
      role: user.role,
      User: sanitizeUser(user),
    });
  } catch (error) {
    console.error("Error logging in:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updateuser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, Password, role, bio, subject, experience, phone } = req.body;

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email.toLowerCase();
    if (bio !== undefined) updateData.bio = bio;
    if (subject !== undefined) updateData.subject = subject;
    if (experience !== undefined) updateData.experience = experience;
    if (phone !== undefined) updateData.phone = phone;

    if (Password) {
      updateData.Password = await bcrypt.hash(Password, 10);
    }

    if (role && ["admin", "teacher", "student"].includes(role)) {
      updateData.role = role;
    }

    const updatedUser = await register
      .findByIdAndUpdate(id, updateData, { new: true })
      .select("-Password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ message: "User updated successfully", User: updatedUser });
  } catch (error) {
    console.error("Error updating user:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await register.findById(req.user.id).select("-Password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json({ User: user });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updateMe = async (req, res) => {
  try {
    const { name, email, Password, bio, subject, experience, phone } = req.body;
    const updateData = {};

    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email.toLowerCase();
    if (bio !== undefined) updateData.bio = bio;
    if (subject !== undefined) updateData.subject = subject;
    if (experience !== undefined) updateData.experience = experience;
    if (phone !== undefined) updateData.phone = phone;

    if (Password) {
      updateData.Password = await bcrypt.hash(Password, 10);
    }

    const updatedUser = await register
      .findByIdAndUpdate(req.user.id, updateData, { new: true })
      .select("-Password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ message: "Profile updated successfully", User: updatedUser });
  } catch (error) {
    console.error("Error updating profile:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteone = async (req, res) => {
  try {
    const deletedUser = await register.findByIdAndDelete(req.params.id);
    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getStudents = async (req, res) => {
  try {
    const students = await register.find({ role: "student" }).select("-Password");
    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({ message: "Error fetching students", error: error.message });
  }
};

export const getStudentById = async (req, res) => {
  try {
    const student = await register.findById(req.params.id).select("-Password");
    if (!student || student.role !== "student") {
      return res.status(404).json({ message: "Student not found" });
    }
    res.status(200).json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getTeachers = async (req, res) => {
  try {
    const teachers = await register.find({ role: "teacher" }).select("-Password");
    res.status(200).json(teachers);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};
