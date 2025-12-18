import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { eventAPI } from '../services/api';
import './EventForm.css';

const CATEGORIES = ['conference', 'workshop', 'social', 'sports', 'music', 'tech', 'other'];

const CreateEvent = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
    capacity: '',
    category: 'other',
    image: null
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image must be less than 5MB');
        return;
      }
      setFormData({ ...formData, image: file });
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setFormData({ ...formData, image: null });
    setImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await eventAPI.create(formData);
      toast.success('Event created successfully!');
      navigate(`/events/${response.data._id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="event-form-container">
      <div className="event-form-card">
        <h1>Create New Event</h1>
        <p>Fill in the details to create your event</p>

        <form onSubmit={handleSubmit} className="event-form">
          <div className="form-group">
            <label className="form-label">Event Title *</label>
            <input
              type="text"
              name="title"
              className="form-input"
              placeholder="Enter event title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description *</label>
            <textarea
              name="description"
              className="form-input"
              placeholder="Describe your event..."
              value={formData.description}
              onChange={handleChange}
              required
              rows={4}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Date & Time *</label>
              <input
                type="datetime-local"
                name="date"
                className="form-input"
                value={formData.date}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Capacity *</label>
              <input
                type="number"
                name="capacity"
                className="form-input"
                placeholder="Max attendees"
                value={formData.capacity}
                onChange={handleChange}
                required
                min={1}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Location *</label>
              <input
                type="text"
                name="location"
                className="form-input"
                placeholder="Event location"
                value={formData.location}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                name="category"
                className="form-input"
                value={formData.category}
                onChange={handleChange}
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Event Image</label>
            {imagePreview ? (
              <div className="image-preview">
                <img src={imagePreview} alt="Preview" />
                <button type="button" onClick={removeImage} className="remove-image">
                  <X size={18} />
                </button>
              </div>
            ) : (
              <label className="image-upload">
                <Upload size={24} />
                <span>Click to upload image</span>
                <small>Max 5MB (JPG, PNG, GIF)</small>
                <input type="file" accept="image/*" onChange={handleImageChange} hidden />
              </label>
            )}
          </div>

          <div className="form-actions">
            <button type="button" onClick={() => navigate(-1)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEvent;

