const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { Op } = require("sequelize");
const sendResetEmail = require("../utils/sendResetEmail");

const isValidEmail = (email = "") => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// REGISTER
exports.register = async (req, res) => {
  try {
    const { name, email, phone, address, password } = req.body;

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "Please enter a valid email address" });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      phone,
      address,
      password: hashedPassword,
    });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role,
      },
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "Please enter a valid email address" });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: "Email is not registered" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Password is incorrect" });
    }

    // 👇 Define admin emails
    const adminEmails = [
      "limbanibhargavmaheshbhai@gmail.com",
      "jayjalarampackaging1@gmail.com"
    ];

    // 👇 Decide role dynamically
    const role = adminEmails.includes(email) ? "admin" : "customer";

    const token = jwt.sign(
      { id: user.id, role: role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: role
      }
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      role: user.role,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { name, email, phone, address } = req.body;

    if (email && !isValidEmail(email)) {
      return res.status(400).json({ message: "Please enter a valid email address" });
    }

    if (email && email !== user.email) {
      const existingUser = await User.findOne({ where: { email } });

      if (existingUser && existingUser.id !== user.id) {
        return res.status(400).json({ message: "Email already in use" });
      }
    }

    await user.update({
      name: name ?? user.name,
      email: email ?? user.email,
      phone: phone ?? user.phone,
      address: address ?? user.address,
    });

    res.json({
      message: "Profile updated successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getCustomers = async (req, res) => {
  try {
    const customers = await User.findAll({
      where: { role: "customer" },
      attributes: ["id", "name", "email", "phone", "address", "createdAt"],
      order: [["createdAt", "DESC"]],
    });

    res.json(customers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getCustomerDetails = async (req, res) => {
  try {
    const Order = require("../models/Order");
    const Product = require("../models/Product");

    const customer = await User.findOne({
      where: {
        id: req.params.id,
        role: "customer",
      },
      attributes: ["id", "name", "email", "phone", "address", "createdAt"],
      include: [
        {
          model: Order,
          include: [Product],
        },
      ],
      order: [[Order, "createdAt", "DESC"]],
    });

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    res.json(customer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "Please enter a valid email address" });
    }

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: "Email is not registered" });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetExpiry = new Date(Date.now() + 15 * 60 * 1000);
    const frontendBaseUrl = process.env.CLIENT_URL || "http://localhost:3000";
    const resetLink = `${frontendBaseUrl}/reset-password/${resetToken}`;

    await user.update({
      reset_password_token: resetToken,
      reset_password_expires: resetExpiry,
    });

    await sendResetEmail({
      to: user.email,
      name: user.name,
      resetLink,
    });

    res.json({ message: `Password reset link sent to ${user.email}` });
  } catch (error) {
    if (error.message === "SMTP email settings are missing") {
      return res.status(500).json({
        message: "Please add your real Gmail App Password in server/.env for SMTP_PASS",
      });
    }

    if (error.code === "EAUTH") {
      return res.status(500).json({
        message: "Gmail login failed. Check SMTP_USER and Gmail App Password in server/.env",
      });
    }

    res.status(500).json({ message: "Unable to send reset email right now" });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password || password.trim().length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const user = await User.findOne({
      where: {
        reset_password_token: token,
        reset_password_expires: {
          [Op.gt]: new Date(),
        },
      },
    });

    if (!user) {
      return res.status(400).json({ message: "Reset link is invalid or expired" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await user.update({
      password: hashedPassword,
      reset_password_token: null,
      reset_password_expires: null,
    });

    res.json({ message: "Password reset successfully" });
  } catch (error) {
    res.status(500).json({ message: "Unable to reset password right now" });
  }
};

    // // 🔥 ADMIN CONDITION ADDED HERE
    // if (user.role !== "admin") {
    //   return res.status(403).json({
    //     message: "Access denied. Admin only."
    //   });
    // }
