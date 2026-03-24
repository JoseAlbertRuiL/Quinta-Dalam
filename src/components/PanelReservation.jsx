import { useState } from 'react';

export default function PanelReservation() {
  const [formData, setFormData] = useState({
    checkin: '',
    checkout: '',
    personas: '2',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Crear los parámetros de query
    const params = new URLSearchParams();
    if (formData.checkin) params.append('fecha-check-in', formData.checkin);
    if (formData.checkout) params.append('fecha-check-out', formData.checkout);
    if (formData.personas) params.append('personas', formData.personas);

    // Navegar a la página de reservaciones con los parámetros
    window.location.href = `/reservaciones?${params.toString()}`;
  };

  return (
    <section id="panel-reservacion" className="reservation-bar">
      <form onSubmit={handleSubmit} className="reservation-form">
        <div className="input-group">
          <label htmlFor="fecha-check-in">
            <i className="fa-solid fa-calendar-days"></i>
            <span>Check-in</span>
          </label>
          <input 
            type="date" 
            id="fecha-check-in" 
            name="checkin" 
            value={formData.checkin}
            onChange={handleInputChange}
            required 
          />
        </div>

        <div className="input-group">
          <label htmlFor="fecha-check-out">
            <i className="fa-solid fa-person-walking-luggage"></i>
            <span>Check-out</span>
          </label>
          <input 
            type="date" 
            id="fecha-check-out" 
            name="checkout" 
            value={formData.checkout}
            onChange={handleInputChange}
            required 
          />
        </div>

        <div className="input-group">
          <label htmlFor="personas">
            <i className="fa-solid fa-users"></i>
            <span>Huéspedes</span>
          </label>
          <select 
            id="personas" 
            name="personas" 
            value={formData.personas}
            onChange={handleInputChange}
          >
            <option value="1">1 Persona</option>
            <option value="2">2 Personas</option>
            <option value="3">3 Personas</option>
            <option value="4">4 Personas</option>
            <option value="5+">5 Personas</option>
          </select>
        </div>

        <button type="submit" className="search-btn">
          <i className="fa-solid fa-magnifying-glass"></i>
          <span>Buscar</span>
        </button>
      </form>

      <style>{`
        .reservation-bar {
          background: var(--color-white);
          padding: 1rem;
          border-radius: 12px;
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
          max-width: 1000px;
          margin: -2rem auto 2rem;
          position: relative;
          z-index: 10;
          border: 4px solid var(--color-accent);
        }

        .reservation-form {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1.5rem;
          flex-wrap: wrap;
        }

        .input-group {
          flex: 1;
          min-width: 150px;
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .input-group label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--color-primary);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .input-group label i {
          background: none !important;
          box-shadow: none !important;
          width: auto !important;
          height: auto !important;
          color: var(--color-accent) !important;
          font-size: 0.9rem !important;
        }

        .input-group input,
        .input-group select {
          padding: 0.6rem;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-family: inherit;
          font-size: 0.95rem;
          color: var(--color-dark);
          outline: none;
          transition: var(--transition);
        }

        .input-group input:focus,
        .input-group select:focus {
          border-color: var(--color-primary);
          box-shadow: 0 0 0 2px rgba(26, 77, 46, 0.1);
        }

        .search-btn {
          background: var(--color-primary);
          color: var(--color-white);
          border: none;
          padding: 1rem 2.5rem;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.8rem;
          transition: var(--transition);
          height: 100%;
          align-self: flex-end;
        }

        .search-btn i {
          background: none !important;
          box-shadow: none !important;
          color: inherit !important;
          width: auto !important;
          height: auto !important;
        }

        .search-btn:hover {
          background: var(--color-secondary);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        @media (max-width: 768px) {
          .reservation-bar {
            margin: 1rem;
          }
          .reservation-form {
            flex-direction: column;
            align-items: stretch;
          }
          .search-btn {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </section>
  );
}
