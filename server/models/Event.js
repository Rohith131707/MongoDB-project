const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide event title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide event description'],
    maxlength: [2000, 'Description cannot be more than 2000 characters']
  },
  date: {
    type: Date,
    required: [true, 'Please provide event date']
  },
  location: {
    type: String,
    required: [true, 'Please provide event location'],
    trim: true
  },
  capacity: {
    type: Number,
    required: [true, 'Please provide event capacity'],
    min: [1, 'Capacity must be at least 1']
  },
  image: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    enum: ['conference', 'workshop', 'social', 'sports', 'music', 'tech', 'other'],
    default: 'other'
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  attendees: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for available spots
eventSchema.virtual('availableSpots').get(function() {
  return this.capacity - this.attendees.length;
});

// Virtual for checking if event is full
eventSchema.virtual('isFull').get(function() {
  return this.attendees.length >= this.capacity;
});

// Index for searching
eventSchema.index({ title: 'text', description: 'text', location: 'text' });

module.exports = mongoose.model('Event', eventSchema);

