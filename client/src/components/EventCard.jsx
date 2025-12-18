import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users } from 'lucide-react';
import { format } from 'date-fns';
import './EventCard.css';

const API_URL = import.meta.env.VITE_API_URL || '';

const EventCard = ({ event }) => {
  const imageUrl = event.image 
    ? `${API_URL}${event.image}` 
    : 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=200&fit=crop';

  const attendeeCount = event.attendees?.length || 0;
  const availableSpots = event.capacity - attendeeCount;
  const isFull = availableSpots <= 0;

  const getCategoryColor = (category) => {
    const colors = {
      conference: '#6366f1',
      workshop: '#10b981',
      social: '#f59e0b',
      sports: '#ef4444',
      music: '#8b5cf6',
      tech: '#3b82f6',
      other: '#6b7280'
    };
    return colors[category] || colors.other;
  };

  return (
    <Link to={`/events/${event._id}`} className="event-card">
      <div className="event-image-container">
        <img src={imageUrl} alt={event.title} className="event-image" />
        <span 
          className="event-category"
          style={{ backgroundColor: getCategoryColor(event.category) }}
        >
          {event.category}
        </span>
        {isFull && <span className="event-full-badge">Full</span>}
      </div>
      <div className="event-content">
        <h3 className="event-title">{event.title}</h3>
        <p className="event-description">{event.description}</p>
        
        <div className="event-meta">
          <div className="meta-item">
            <Calendar size={16} />
            <span>{format(new Date(event.date), 'MMM d, yyyy • h:mm a')}</span>
          </div>
          <div className="meta-item">
            <MapPin size={16} />
            <span>{event.location}</span>
          </div>
          <div className="meta-item">
            <Users size={16} />
            <span>{attendeeCount}/{event.capacity} attendees</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default EventCard;

