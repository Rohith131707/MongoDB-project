const Event = require('../models/Event');
const mongoose = require('mongoose');

// @desc    Get all events
// @route   GET /api/events
// @access  Public
const getEvents = async (req, res) => {
  try {
    const { search, category, upcoming } = req.query;
    let query = {};

    // Search filter
    if (search) {
      query.$text = { $search: search };
    }

    // Category filter
    if (category && category !== 'all') {
      query.category = category;
    }

    // Upcoming events filter
    if (upcoming === 'true') {
      query.date = { $gte: new Date() };
    }

    const events = await Event.find(query)
      .populate('creator', 'name email')
      .populate('attendees', 'name email')
      .sort({ date: 1 });

    res.json(events);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get single event
// @route   GET /api/events/:id
// @access  Public
const getEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('creator', 'name email')
      .populate('attendees', 'name email');

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json(event);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Create event
// @route   POST /api/events
// @access  Private
const createEvent = async (req, res) => {
  try {
    const { title, description, date, location, capacity, category } = req.body;
    
    const eventData = {
      title,
      description,
      date,
      location,
      capacity: parseInt(capacity),
      category: category || 'other',
      creator: req.user._id,
      image: req.file ? `/uploads/${req.file.filename}` : ''
    };

    const event = await Event.create(eventData);
    const populatedEvent = await Event.findById(event._id)
      .populate('creator', 'name email');

    res.status(201).json(populatedEvent);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private (owner only)
const updateEvent = async (req, res) => {
  try {
    let event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check ownership
    if (event.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this event' });
    }

    const updateData = { ...req.body };
    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    }

    event = await Event.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    }).populate('creator', 'name email').populate('attendees', 'name email');

    res.json(event);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete event
// @route   DELETE /api/events/:id  
// @access  Private (owner only)
const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check ownership
    if (event.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this event' });
    }

    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getEvents, getEvent, createEvent, updateEvent, deleteEvent };

