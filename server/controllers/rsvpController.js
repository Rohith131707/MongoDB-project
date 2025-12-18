const Event = require('../models/Event');
const mongoose = require('mongoose');

/**
 * RSVP Controller with Concurrency Handling
 * 
 * Strategy: MongoDB Atomic Operations with $addToSet and Array Size Check
 * 
 * The RSVP join operation uses findOneAndUpdate with atomic operators to:
 * 1. Check capacity in the same query condition (prevents race conditions)
 * 2. Use $addToSet to prevent duplicate RSVPs
 * 3. Use $expr with $lt to compare array length against capacity atomically
 * 
 * This ensures that even if multiple users try to RSVP for the last spot
 * simultaneously, only one will succeed because the capacity check and
 * attendee addition happen in a single atomic operation.
 */

// @desc    Join event (RSVP)
// @route   POST /api/events/:id/rsvp
// @access  Private
const joinEvent = async (req, res) => {
  try {
    const eventId = req.params.id;
    const userId = req.user._id;

    // First, check if user is already an attendee
    const existingEvent = await Event.findById(eventId);
    if (!existingEvent) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (existingEvent.attendees.includes(userId)) {
      return res.status(400).json({ message: 'You have already RSVPed to this event' });
    }

    // ATOMIC OPERATION: Add user only if capacity not reached
    // This is the key to preventing race conditions!
    // The query checks capacity AND adds user in a single atomic operation
    const updatedEvent = await Event.findOneAndUpdate(
      {
        _id: eventId,
        // Atomic capacity check: only match if attendees array length < capacity
        $expr: { $lt: [{ $size: '$attendees' }, '$capacity'] },
        // Also ensure user is not already in attendees (double check)
        attendees: { $ne: userId }
      },
      {
        // $addToSet ensures no duplicates even if check above somehow fails
        $addToSet: { attendees: userId }
      },
      {
        new: true,
        runValidators: true
      }
    ).populate('creator', 'name email').populate('attendees', 'name email');

    if (!updatedEvent) {
      // Re-fetch to determine the actual reason for failure
      const currentEvent = await Event.findById(eventId);
      
      if (!currentEvent) {
        return res.status(404).json({ message: 'Event not found' });
      }
      
      if (currentEvent.attendees.includes(userId)) {
        return res.status(400).json({ message: 'You have already RSVPed to this event' });
      }
      
      if (currentEvent.attendees.length >= currentEvent.capacity) {
        return res.status(400).json({ message: 'Event is at full capacity' });
      }
      
      return res.status(400).json({ message: 'Unable to RSVP. Please try again.' });
    }

    res.json({
      message: 'Successfully RSVPed to event',
      event: updatedEvent
    });
  } catch (error) {
    console.error('RSVP Join Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Leave event (Cancel RSVP)
// @route   DELETE /api/events/:id/rsvp
// @access  Private
const leaveEvent = async (req, res) => {
  try {
    const eventId = req.params.id;
    const userId = req.user._id;

    // Atomic remove from attendees
    const updatedEvent = await Event.findOneAndUpdate(
      {
        _id: eventId,
        attendees: userId // Only match if user is an attendee
      },
      {
        $pull: { attendees: userId }
      },
      {
        new: true
      }
    ).populate('creator', 'name email').populate('attendees', 'name email');

    if (!updatedEvent) {
      const event = await Event.findById(eventId);
      if (!event) {
        return res.status(404).json({ message: 'Event not found' });
      }
      return res.status(400).json({ message: 'You are not RSVPed to this event' });
    }

    res.json({
      message: 'Successfully cancelled RSVP',
      event: updatedEvent
    });
  } catch (error) {
    console.error('RSVP Leave Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get user's RSVPs
// @route   GET /api/events/my-rsvps
// @access  Private
const getMyRsvps = async (req, res) => {
  try {
    const events = await Event.find({ attendees: req.user._id })
      .populate('creator', 'name email')
      .populate('attendees', 'name email')
      .sort({ date: 1 });

    res.json(events);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get user's created events
// @route   GET /api/events/my-events
// @access  Private
const getMyEvents = async (req, res) => {
  try {
    const events = await Event.find({ creator: req.user._id })
      .populate('creator', 'name email')
      .populate('attendees', 'name email')
      .sort({ date: -1 });

    res.json(events);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { joinEvent, leaveEvent, getMyRsvps, getMyEvents };

