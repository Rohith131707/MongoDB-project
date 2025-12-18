const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent
} = require('../controllers/eventController');
const { joinEvent, leaveEvent, getMyRsvps, getMyEvents } = require('../controllers/rsvpController');
const { protect, optionalAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Validation middleware
const eventValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('date').notEmpty().withMessage('Date is required'),
  body('location').trim().notEmpty().withMessage('Location is required'),
  body('capacity')
    .isInt({ min: 1 })
    .withMessage('Capacity must be at least 1')
];

// Public routes
router.get('/', optionalAuth, getEvents);
router.get('/my-rsvps', protect, getMyRsvps);
router.get('/my-events', protect, getMyEvents);
router.get('/:id', optionalAuth, getEvent);

// Protected routes
router.post('/', protect, upload.single('image'), createEvent);
router.put('/:id', protect, upload.single('image'), updateEvent);
router.delete('/:id', protect, deleteEvent);

// RSVP routes
router.post('/:id/rsvp', protect, joinEvent);
router.delete('/:id/rsvp', protect, leaveEvent);

module.exports = router;

