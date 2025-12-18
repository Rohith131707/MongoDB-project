import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Upload, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { eventAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './EventForm.css';

const API_URL = import.meta.env.VITE_API_URL || '';
const CATEGORIES = ['conference', 'workshop', 'social', 'sports', 'music', 'tech', 'other'];

const EditEvent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const fetchEvent = async () => {
    try {
      const response = await eventAPI.getOne(id);
      const event = response.data;

      if (event.creator._id !== user._id) {
        toast.error('Not authorized to edit this event');
        navigate('/');
        return;
      }

      const eventDate = new Date(event.date);
      const localDate = eventDate.toISOString().slice(0, 16);

      setFormData({
        title: event.title,
        description: event.description,
        date: localDate,
        location: event.location,
        capacity: event.capacity,
        category: event.category,
        image: null
      });

      if (event.image) {
        setImagePreview(`${API_URL}${event.image}`);
      }
    } catch (error) {
      toast.error('Event not found');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

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
    setSaving(true);

    try {
      await eventAPI.update(id, formData);
      toast.success('Event updated successfully!');
      navigate(`/events/${id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update event');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="event-form-container">
      <div className="event-form-card">
        <h1>Edit Event</h1>
        <p>Update your event details</p>

        <form onSubmit={handleSubmit} className="event-form">
          <div className="form-group">
            <label className="form-label">Event Title *</label>
            <input type="text" name="title" className="form-input" value={formData.title} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label className="form-label">Description *</label>
            <textarea name="description" className="form-input" value={formData.description} onChange={handleChange} required rows={4} />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Date & Time *</label>
              <input type="datetime-local" name="date" className="form-input" value={formData.date} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">Capacity *</label>
              <input type="number" name="capacity" className="form-input" value={formData.capacity} onChange={handleChange} required min={1} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Location *</label>
              <input type="text" name="location" className="form-input" value={formData.location} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select name="category" className="form-input" value={formData.category} onChange={handleChange}>
                {CATEGORIES.map(cat => (<option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Event Image</label>
            {imagePreview ? (
              <div className="image-preview">
                <img src={imagePreview} alt="Preview" />
                <button type="button" onClick={removeImage} className="remove-image"><X size={18} /></button>
              </div>
            ) : (
              <label className="image-upload">
                <Upload size={24} /><span>Click to upload image</span><small>Max 5MB</small>
                <input type="file" accept="image/*" onChange={handleImageChange} hidden />
              </label>
            )}
          </div>

          <div className="form-actions">
            <button type="button" onClick={() => navigate(-1)} className="btn btn-secondary">Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditEvent;

