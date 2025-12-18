import { useState, useEffect } from 'react';
import { Search, Filter } from 'lucide-react';
import { eventAPI } from '../services/api';
import EventCard from '../components/EventCard';
import './Home.css';

const CATEGORIES = ['all', 'conference', 'workshop', 'social', 'sports', 'music', 'tech', 'other'];

const Home = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [showUpcoming, setShowUpcoming] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, [category, showUpcoming]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const params = {
        category: category !== 'all' ? category : undefined,
        upcoming: showUpcoming ? 'true' : undefined
      };
      const response = await eventAPI.getAll(params);
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = events.filter(event =>
    event.title.toLowerCase().includes(search.toLowerCase()) ||
    event.description.toLowerCase().includes(search.toLowerCase()) ||
    event.location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="home">
      <div className="home-header">
        <h1>Discover Events</h1>
        <p>Find and join amazing events happening around you</p>
      </div>

      <div className="filters-section">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search events..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="filter-controls">
          <div className="category-filter">
            <Filter size={18} />
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <label className="toggle-label">
            <input
              type="checkbox"
              checked={showUpcoming}
              onChange={(e) => setShowUpcoming(e.target.checked)}
            />
            <span>Upcoming only</span>
          </label>
        </div>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="no-events">
          <h3>No events found</h3>
          <p>Try adjusting your filters or check back later</p>
        </div>
      ) : (
        <div className="events-grid">
          {filteredEvents.map(event => (
            <EventCard key={event._id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;

