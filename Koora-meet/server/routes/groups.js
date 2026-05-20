const express = require('express');
const router = express.Router();
const Group = require('../models/Group');
const jwt = require('jsonwebtoken');

// Middleware to verify token
const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Auth failed' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Get All Groups
router.get('/', async (req, res) => {
  try {
    const groups = await Group.find().populate('creatorId', 'nom prenom photo');
    res.json(groups);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create Group
router.post('/', auth, async (req, res) => {
  try {
    const { name, description, location, maxParticipants } = req.body;
    const newGroup = new Group({
      name,
      description,
      location,
      maxParticipants,
      creatorId: req.userId,
      participants: [req.userId]
    });
    await newGroup.save();
    res.status(201).json(newGroup);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Join Group
router.post('/:id/join', auth, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    if (group.participants.includes(req.userId)) {
      return res.status(400).json({ message: 'Already a member' });
    }

    if (group.participants.length >= group.maxParticipants) {
      return res.status(400).json({ message: 'Group is full' });
    }

    group.participants.push(req.userId);
    await group.save();
    res.json(group);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
