import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Plus, Users } from 'lucide-react';
import { eventAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import EventCard from '../components/EventCard';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const [myEvents, setMyEvents] = useState([]);
  const [myRsvps, setMyRsvps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('created');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [eventsRes, rsvpsRes] = await Promise.all([
        eventAPI.getMyEvents(),
        eventAPI.getMyRsvps()
      ]);
      setMyEvents(eventsRes.data);
      setMyRsvps(rsvpsRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
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
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Welcome, {user?.name}!</h1>
          <p>Manage your events and RSVPs</p>
        </div>
        <Link to="/create-event" className="btn btn-primary">
          <Plus size={18} />
          Create Event
        </Link>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <Calendar size={24} />
          <div>
            <span className="stat-value">{myEvents.length}</span>
            <span className="stat-label">Events Created</span>
          </div>
        </div>
        <div className="stat-card">
          <Users size={24} />
          <div>
            <span className="stat-value">{myRsvps.length}</span>
            <span className="stat-label">Events Attending</span>
          </div>
        </div>
      </div>

      <div className="dashboard-tabs">
        <button
          className={`tab ${activeTab === 'created' ? 'active' : ''}`}
          onClick={() => setActiveTab('created')}
        >
          My Events ({myEvents.length})
        </button>
        <button
          className={`tab ${activeTab === 'attending' ? 'active' : ''}`}
          onClick={() => setActiveTab('attending')}
        >
          Attending ({myRsvps.length})
        </button>
      </div>

      <div className="dashboard-content">
        {activeTab === 'created' ? (
          myEvents.length === 0 ? (
            <div className="empty-state">
              <Calendar size={48} />
              <h3>No events created yet</h3>
              <p>Create your first event to get started</p>
              <Link to="/create-event" className="btn btn-primary">
                Create Event
              </Link>
            </div>
          ) : (
            <div className="events-grid">
              {myEvents.map(event => (
                <EventCard key={event._id} event={event} />
              ))}
            </div>
          )
        ) : (
          myRsvps.length === 0 ? (
            <div className="empty-state">
              <Users size={48} />
              <h3>No RSVPs yet</h3>
              <p>Browse events and RSVP to ones you're interested in</p>
              <Link to="/" className="btn btn-primary">
                Browse Events
              </Link>
            </div>
          ) : (
            <div className="events-grid">
              {myRsvps.map(event => (
                <EventCard key={event._id} event={event} />
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default Dashboard;

