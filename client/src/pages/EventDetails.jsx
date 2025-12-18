import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Calendar, MapPin, Users, User, Edit, Trash2, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { eventAPI, rsvpAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './EventDetails.css';

const API_URL = import.meta.env.VITE_API_URL || '';

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rsvpLoading, setRsvpLoading] = useState(false);

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const fetchEvent = async () => {
    try {
      const response = await eventAPI.getOne(id);
      setEvent(response.data);
    } catch (error) {
      toast.error('Event not found');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const isOwner = user && event?.creator?._id === user._id;
  const isAttending = user && event?.attendees?.some(a => a._id === user._id);
  const isFull = event?.attendees?.length >= event?.capacity;
  const availableSpots = event ? event.capacity - (event.attendees?.length || 0) : 0;

  const handleRSVP = async () => {
    if (!user) {
      toast.error('Please login to RSVP');
      navigate('/login');
      return;
    }

    setRsvpLoading(true);
    try {
      if (isAttending) {
        await rsvpAPI.leave(id);
        toast.success('RSVP cancelled');
      } else {
        await rsvpAPI.join(id);
        toast.success('Successfully RSVPed!');
      }
      fetchEvent();
    } catch (error) {
      toast.error(error.response?.data?.message || 'RSVP failed');
    } finally {
      setRsvpLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    
    try {
      await eventAPI.delete(id);
      toast.success('Event deleted');
      navigate('/');
    } catch (error) {
      toast.error('Failed to delete event');
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (!event) return null;

  const imageUrl = event.image 
    ? `${API_URL}${event.image}` 
    : 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=400&fit=crop';

  return (
    <div className="event-details">
      <Link to="/" className="back-link">
        <ArrowLeft size={20} />
        Back to events
      </Link>

      <div className="event-details-card">
        <div className="event-details-image">
          <img src={imageUrl} alt={event.title} />
          <span className="event-category-badge">{event.category}</span>
        </div>

        <div className="event-details-content">
          <div className="event-details-header">
            <h1>{event.title}</h1>
            {isOwner && (
              <div className="owner-actions">
                <Link to={`/edit-event/${id}`} className="btn btn-secondary">
                  <Edit size={18} /> Edit
                </Link>
                <button onClick={handleDelete} className="btn btn-danger">
                  <Trash2 size={18} /> Delete
                </button>
              </div>
            )}
          </div>

          <div className="event-meta-grid">
            <div className="meta-card">
              <Calendar size={20} />
              <div>
                <span className="meta-label">Date & Time</span>
                <span className="meta-value">{format(new Date(event.date), 'EEEE, MMMM d, yyyy')}</span>
                <span className="meta-sub">{format(new Date(event.date), 'h:mm a')}</span>
              </div>
            </div>
            <div className="meta-card">
              <MapPin size={20} />
              <div>
                <span className="meta-label">Location</span>
                <span className="meta-value">{event.location}</span>
              </div>
            </div>
            <div className="meta-card">
              <Users size={20} />
              <div>
                <span className="meta-label">Capacity</span>
                <span className="meta-value">{event.attendees?.length || 0} / {event.capacity}</span>
                <span className="meta-sub">{availableSpots} spots left</span>
              </div>
            </div>
            <div className="meta-card">
              <User size={20} />
              <div>
                <span className="meta-label">Organized by</span>
                <span className="meta-value">{event.creator?.name}</span>
              </div>
            </div>
          </div>

          <div className="event-description-section">
            <h3>About this event</h3>
            <p>{event.description}</p>
          </div>

          {!isOwner && (
            <button
              onClick={handleRSVP}
              disabled={rsvpLoading || (isFull && !isAttending)}
              className={`btn btn-rsvp ${isAttending ? 'btn-danger' : 'btn-primary'}`}
            >
              {rsvpLoading ? 'Processing...' : isAttending ? 'Cancel RSVP' : isFull ? 'Event Full' : 'RSVP Now'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventDetails;

