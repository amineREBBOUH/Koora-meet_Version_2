const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { sendVerificationEmail, sendResetPasswordEmail } = require('../utils/emailService');

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password, nom, prenom, equipe, ville, photo } = req.body;

    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'Email already exists' });

    const verificationToken = crypto.randomBytes(32).toString('hex');
    user = new User({ email, password, nom, prenom, equipe, ville, photo, verificationToken });
    await user.save();

    try {
      await sendVerificationEmail(email, verificationToken);
    } catch (err) {
      console.error("Email sending failed", err);
    }

    res.status(201).json({ message: 'Inscription réussie ! Veuillez vérifier votre e-mail pour activer votre compte.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // --- MOCK ACCOUNT FALLBACK (FOR PRESENTATION) ---
  // We do this BEFORE any DB call to avoid timeouts
  if (email && email.trim().toLowerCase() === 'test@koora.com' && password === 'admin2030') {
    const mockUser = {
      id: 'mock-123',
      nom: 'Test',
      prenom: 'Admin',
      email: 'test@koora.com',
      equipe: 'Maroc',
      role: 'user'
    };
    const token = jwt.sign({ id: mockUser.id }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
    return res.json({ token, user: mockUser, message: "Connecté via mode secours" });
  }
  // ------------------------------------------------

  try {
    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    if (!user.isVerified && email !== 'test@koora.com') {
      return res.status(401).json({ message: 'Veuillez vérifier votre e-mail avant de vous connecter.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, nom: user.nom, prenom: user.prenom, email, equipe: user.equipe, ville: user.ville, photo: user.photo, role: user.role } });
  } catch (err) {
    console.error("Login Error:", err.message);
    res.status(500).json({ message: err.message });
  }
});

// Verify Email
router.get('/verify/:token', async (req, res) => {
  try {
    const user = await User.findOne({ verificationToken: req.params.token });
    if (!user) return res.status(400).json({ message: 'Lien d\'activation invalide ou expiré.' });

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    res.json({ message: 'Compte activé avec succès ! Vous pouvez maintenant vous connecter.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Forgot Password
router.post('/forgot-password', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(404).json({ message: 'Aucun compte trouvé avec cet e-mail.' });

    const token = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    await sendResetPasswordEmail(user.email, token);
    res.json({ message: 'Un e-mail de réinitialisation a été envoyé.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Reset Password
router.post('/reset-password/:token', async (req, res) => {
  try {
    const user = await User.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) return res.status(400).json({ message: 'Lien invalide ou expiré.' });

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Mot de passe mis à jour avec succès.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get current user (Verify token)
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token provided' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

module.exports = router;
