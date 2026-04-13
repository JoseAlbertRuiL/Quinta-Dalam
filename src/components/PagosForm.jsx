import { useState, useEffect } from 'react';

const cardIcons = {
  visa: (
    <svg viewBox="0 0 48 48" width="38" height="24" fill="none">
      <rect width="48" height="48" rx="6" fill="#1A1F71"/>
      <path d="M19.5 30H16l2.2-12h3.5L19.5 30zm12.8-11.7c-.7-.3-1.8-.6-3.1-.6-3.4 0-5.8 1.8-5.8 4.3 0 1.9 1.7 2.9 3 3.5 1.3.6 1.7 1 1.7 1.6 0 .8-1 1.2-2 1.2-1.3 0-2-.2-3.1-.7l-.4-.2-.5 2.9c.8.4 2.3.7 3.8.7 3.6 0 5.9-1.8 5.9-4.4 0-1.5-.9-2.6-2.9-3.5-1.2-.6-1.9-1-1.9-1.6 0-.6.6-1.1 2-1.1 1.1 0 1.9.2 2.5.5l.3.1.5-2.7zm8.8-.3h-2.6c-.8 0-1.4.2-1.8 1l-4.9 11h3.5s.6-1.5.7-1.9h4.2c.1.4.4 1.9.4 1.9H44L41.1 18zm-4.1 7.7c.3-.7 1.3-3.5 1.3-3.5s.3-.7.4-1.2l.2 1.1s.6 2.9.8 3.6h-2.7zM15 18l-3.4 8.2-.4-1.8C10.5 22.3 8.7 20.5 7 19.5L10.1 30h3.6L19.1 18H15z" fill="white"/>
    </svg>
  ),
  mastercard: (
    <svg viewBox="0 0 48 48" width="38" height="24">
      <rect width="48" height="48" rx="6" fill="#252525"/>
      <circle cx="19" cy="24" r="10" fill="#EB001B"/>
      <circle cx="29" cy="24" r="10" fill="#F79E1B"/>
      <path d="M24 16.3a10 10 0 0 1 0 15.4A10 10 0 0 1 24 16.3z" fill="#FF5F00"/>
    </svg>
  ),
  amex: (
    <svg viewBox="0 0 48 48" width="38" height="24">
      <rect width="48" height="48" rx="6" fill="#2557D6"/>
      <text x="50%" y="60%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold" fontFamily="Arial">AMEX</text>
    </svg>
  ),
};

function detectCard(num) {
  if (/^4/.test(num)) return 'visa';
  if (/^5[1-5]/.test(num)) return 'mastercard';
  if (/^3[47]/.test(num)) return 'amex';
  return null;
}

export default function PagosForm() {
  const [reservacionData, setReservacionData] = useState(null);
  const [formData, setFormData] = useState({ cardNumber: '', cardName: '', expiryDate: '', cvv: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(null);
  const [cardFlipped, setCardFlipped] = useState(false);

  useEffect(() => {
    // ↓ Intentar leer datos al montar (por si ya existen en sessionStorage)
    const readData = () => {
      const data = sessionStorage.getItem('reservacionData');
      if (data) {
        setReservacionData(JSON.parse(data));
      }
    };

    readData();

    // ↓ Escuchar el evento que dispara reservaciones.astro cuando el usuario envía el formulario
    // Esto es necesario porque client:only="react" monta el componente al cargar la página,
    // antes de que el usuario llene y envíe el formulario de reservación.
    document.addEventListener('pagos:datosListos', readData);
    return () => document.removeEventListener('pagos:datosListos', readData);
  }, []);

  const nights = reservacionData
    ? Math.max(1, Math.round((new Date(reservacionData.fechaSalida) - new Date(reservacionData.fechaLlegada)) / 86400000))
    : 0;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let v = value;
    if (name === 'cardNumber') v = value.replace(/\D/g, '').slice(0, 16);
    if (name === 'expiryDate') {
      v = value.replace(/\D/g, '');
      if (v.length >= 2) v = v.slice(0, 2) + '/' + v.slice(2, 4);
    }
    if (name === 'cvv') v = value.replace(/\D/g, '').slice(0, 4);
    // ↓ Forzar MAYÚSCULAS en el nombre del titular (compatibilidad con proveedores)
    if (name === 'cardName') v = value.toUpperCase();
    setFormData(prev => ({ ...prev, [name]: v }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const validateForm = () => {
    const e = {};
    if (!formData.cardNumber || formData.cardNumber.length !== 16) e.cardNumber = 'El número debe tener 16 dígitos';
    if (!formData.cardName.trim()) e.cardName = 'El nombre del titular es requerido';

    // ↓ Validación de fecha de caducidad
    if (!formData.expiryDate || formData.expiryDate.length !== 5) {
      e.expiryDate = 'Formato MM/YY requerido';
    } else {
      const [monthStr, yearStr] = formData.expiryDate.split('/');
      const month = parseInt(monthStr, 10);
      const year = parseInt(yearStr, 10);

      if (month < 1 || month > 12) {
        e.expiryDate = 'Mes inválido (01-12)';
      } else {
        // ↓ Comparar contra la fecha actual para detectar tarjetas vencidas
        const now = new Date();
        const currentMonth = now.getMonth() + 1; // getMonth() es 0-indexed
        const currentYear = now.getFullYear() % 100; // Obtener los últimos 2 dígitos

        if (year < currentYear || (year === currentYear && month < currentMonth)) {
          e.expiryDate = 'La tarjeta ha expirado';
        }
      }
    }

    if (!formData.cvv || formData.cvv.length < 3) e.cvv = 'CVV de 3 o 4 dígitos';
    return e;
  };

  // ↓ Función para volver al formulario de reservación (Paso 1)
  const handleVolver = () => {
    document.dispatchEvent(new CustomEvent('pagos:volver'));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
    setLoading(true);
    try {
      // ─── 1. Enviar datos de reservación al backend Supabase ────────────────
      // Los datos de tarjeta (cardNumber, cvv, etc.) son solo para UI/validación
      // local — nunca se envían al servidor (no tenemos procesador de pagos real).
      // Lo que sí persiste: los datos de la reserva obtenidos del sessionStorage.
      const payload = {
        nombre_cliente: reservacionData.name,
        correo:         reservacionData.email,
        telefono:       `${reservacionData.countryCode} ${reservacionData.tel}`,
        // roomPreference viene como "101: Tzintzunzan" — lo enviamos completo
        habitacion:     reservacionData.roomPreference,
        fecha_entrada:  reservacionData.fechaLlegada,
        fecha_salida:   reservacionData.fechaSalida,
        personas:       Number(reservacionData.numeroPersonas) || null,
      };

      const response = await fetch('/api/reservaciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      // ─── 2. Manejar errores del backend ───────────────────────────────────
      if (!response.ok) {
        // Caso especial: habitación ya ocupada (409 Conflict)
        if (response.status === 409 && result.codigo === 'HABITACION_NO_DISPONIBLE') {
          setLoading(false);
          setErrors({
            submit: result.detalles?.mensaje
              ?? 'Esta habitación ya está reservada en esas fechas. Por favor elige otras fechas u otra habitación.',
          });
          return;
        }

        // Otros errores del servidor (422, 500, etc.)
        const mensajeError = result.detalles?.join(' ') ?? result.error ?? 'Error al procesar la reservación.';
        setLoading(false);
        setErrors({ submit: mensajeError });
        return;
      }

      // ─── 3. Éxito: limpiar sessionStorage y redirigir ─────────────────────
      sessionStorage.removeItem('reservacionData');
      window.location.href = '/exito';

    } catch (err) {
      console.error('[PagosForm] Error de red:', err);
      setLoading(false);
      setErrors({ submit: 'Error de conexión. Verifica tu internet e intenta nuevamente.' });
    }
  };

  const cardType = detectCard(formData.cardNumber);
  const displayNumber = formData.cardNumber
    ? formData.cardNumber.replace(/(\d{4})/g, '$1 ').trim().padEnd(19, '·')
    : '···· ···· ···· ····';

  // ↓ Sin datos de reservación: mostrar mensaje con botón para volver al Paso 1
  if (!reservacionData) return (
    <>
      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
      <div style={{ minHeight: '40vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', fontFamily: "'Jost', sans-serif" }}>
        <div style={{ maxWidth: 480, width: '100%', textAlign: 'center', animation: 'fadeUp .6s ease both' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, #c9a96e, #dbc28e)', margin: '0 auto 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(201,169,110,.3)' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          </div>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.8rem', fontWeight: 700, color: '#1a2e1a', margin: '0 0 .75rem' }}>Datos no encontrados</h2>
          <p style={{ color: '#5a6b5a', fontSize: '1rem', fontWeight: 500, lineHeight: 1.7, margin: '0 0 1.5rem' }}>
            Por favor, completa primero tu información personal y de reservación.
          </p>
          <button
            onClick={handleVolver}
            style={{ padding: '.75rem 2rem', fontFamily: "'Jost', sans-serif", fontSize: '1.05rem', fontWeight: 600, color: 'white', background: 'linear-gradient(135deg, #1a4d2e, #4f7942)', border: 'none', borderRadius: 10, cursor: 'pointer', boxShadow: '0 6px 20px rgba(26, 77, 46, 0.35)', transition: 'transform 0.35s ease, box-shadow 0.35s ease, filter 0.35s ease' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 28px rgba(26, 77, 46, 0.4)'; e.currentTarget.style.filter = 'brightness(1.12)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(26, 77, 46, 0.35)'; e.currentTarget.style.filter = 'brightness(1)'; }}
            onMouseDown={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
            onMouseUp={e => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
          >
            ← Volver al formulario
          </button>
        </div>
      </div>
    </>
  );


  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; }

        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes shimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
        @keyframes pulse-ring { 0% { box-shadow: 0 0 0 0 rgba(26,77,46,.3); } 70% { box-shadow: 0 0 0 10px rgba(26,77,46,0); } 100% { box-shadow: 0 0 0 0 rgba(26,77,46,0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes flip { from { transform: rotateY(0deg); } to { transform: rotateY(180deg); } }
        @keyframes unflip { from { transform: rotateY(180deg); } to { transform: rotateY(0deg); } }
        @keyframes cardGlow { 0%,100% { box-shadow: 0 20px 60px rgba(26,77,46,.25), 0 8px 20px rgba(0,0,0,.15); } 50% { box-shadow: 0 24px 70px rgba(26,77,46,.35), 0 8px 24px rgba(0,0,0,.2); } }

        .pagos-root { min-height: auto; background: transparent; font-family: 'Jost', sans-serif; padding: 2rem 0; }
        .pagos-root::before { content: ''; position: fixed; inset: 0; background: radial-gradient(ellipse at 20% 20%, rgba(79,121,66,.06) 0%, transparent 60%), radial-gradient(ellipse at 80% 80%, rgba(201,169,110,.07) 0%, transparent 60%); pointer-events: none; z-index: -1; }

        .pagos-inner { max-width: 960px; margin: 0 auto; padding: 1rem 1.5rem 3rem; display: grid; grid-template-columns: 1fr 1fr; gap: 2.5rem; align-items: start; }
        @media (max-width: 700px) { .pagos-inner { grid-template-columns: 1fr; } }

        /* LEFT COLUMN */
        .left-col { animation: fadeUp .6s .1s ease both; }

        .card-visual { perspective: 1000px; margin-bottom: 1.8rem; }
        .card-inner { position: relative; width: 100%; padding-top: 56.25%; transition: transform .6s; transform-style: preserve-3d; }
        .card-inner.flipped { transform: rotateY(180deg); }
        .card-face { position: absolute; inset: 0; border-radius: 18px; padding: 1.6rem; backface-visibility: hidden; -webkit-backface-visibility: hidden; }
        .card-front { background: linear-gradient(135deg, #1a3a2a 0%, #2d5a3d 40%, #3d7a52 70%, #4f9468 100%); color: white; display: flex; flex-direction: column; justify-content: space-between; animation: cardGlow 4s ease-in-out infinite; box-shadow: 0 20px 60px rgba(26,77,46,.3); }
        .card-back { background: linear-gradient(135deg, #2a2a2a, #1a1a1a); transform: rotateY(180deg); display: flex; flex-direction: column; justify-content: flex-end; overflow: hidden; }

        .card-chip { width: 42px; height: 32px; background: linear-gradient(135deg, #d4a84b, #f0cc7a, #c19030); border-radius: 6px; position: relative; }
        .card-chip::after { content: ''; position: absolute; inset: 4px; background: repeating-linear-gradient(0deg, rgba(0,0,0,.15) 0px, rgba(0,0,0,.15) 1px, transparent 1px, transparent 5px), repeating-linear-gradient(90deg, rgba(0,0,0,.15) 0px, rgba(0,0,0,.15) 1px, transparent 1px, transparent 5px); border-radius: 3px; }
        .card-number-display { font-size: 1.35rem; letter-spacing: .18em; font-weight: 300; font-family: 'Courier New', monospace; text-shadow: 0 1px 3px rgba(0,0,0,.3); }
        .card-holder-label { font-size: .6rem; letter-spacing: .15em; text-transform: uppercase; opacity: .6; margin-bottom: .25rem; }
        .card-holder-name { font-size: .95rem; letter-spacing: .08em; font-weight: 400; text-transform: uppercase; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .card-expiry { text-align: right; }
        .card-type-badge { width: 50px; }
        .card-magnetic { height: 44px; background: linear-gradient(180deg, #111, #2a2a2a, #111); margin: 1.4rem -1.6rem; }
        .card-cvv-band { background: rgba(255,255,255,.9); border-radius: 4px; padding: .4rem .8rem; display: flex; align-items: center; gap: .75rem; margin: 0 .3rem; }
        .card-cvv-label { font-size: .65rem; color: #888; letter-spacing: .1em; text-transform: uppercase; }
        .card-cvv-dots { font-family: 'Courier New', monospace; color: #333; font-size: 1rem; letter-spacing: .15em; flex: 1; text-align: right; }

        /* SUMMARY CARD */
        .summary-card { background: white; border-radius: 16px; padding: 1.8rem; box-shadow: 0 2px 20px rgba(0,0,0,.06); border: 1px solid rgba(0,0,0,.06); }
        .summary-header { display: flex; align-items: center; gap: .75rem; margin-bottom: 1.4rem; padding-bottom: 1.1rem; border-bottom: 1px solid #ebe8e0; }
        .summary-icon { width: 36px; height: 36px; border-radius: 10px; background: linear-gradient(135deg, #1a4d2e, #4f7942); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .summary-title { font-family: 'Cormorant Garamond', serif; font-size: 1.3rem; font-weight: 600; color: #1a2e1a; }
        .summary-row { display: flex; justify-content: space-between; align-items: baseline; padding: .45rem 0; font-size: .875rem; }
        .summary-label { color: #8a9a8a; font-weight: 400; letter-spacing: .02em; }
        .summary-value { color: #2a3a2a; font-weight: 500; text-align: right; max-width: 55%; }
        .summary-divider { height: 1px; background: #f0ece4; margin: .8rem 0; }
        .summary-nights { display: flex; justify-content: space-between; align-items: center; padding: .7rem 1rem; background: linear-gradient(135deg, #f0f7f0, #e8f3e8); border-radius: 10px; margin-top: .8rem; }
        .nights-label { font-family: 'Cormorant Garamond', serif; font-size: 1.05rem; color: #1a4d2e; font-style: italic; }
        .nights-badge { background: linear-gradient(135deg, #1a4d2e, #4f7942); color: white; padding: .3rem .8rem; border-radius: 20px; font-size: .8rem; font-weight: 500; letter-spacing: .04em; }

        /* RIGHT COLUMN */
        .right-col { animation: fadeUp .6s .25s ease both; }
        .form-title { font-family: 'Cormorant Garamond', serif; font-size: 2.2rem; font-weight: 600; color: #1a2e1a; margin-bottom: .35rem; line-height: 1.1; }
        .form-subtitle { color: #8a9a8a; font-size: .9rem; font-weight: 300; letter-spacing: .03em; margin-bottom: 2rem; display: flex; align-items: center; gap: .4rem; }
        .form-subtitle svg { color: #4f7942; }

        .form-card { background: white; border-radius: 20px; padding: 2rem; box-shadow: 0 4px 30px rgba(0,0,0,.07); border: 1px solid rgba(0,0,0,.05); }
        .field-group { margin-bottom: 1.3rem; }
        .field-label { font-size: .72rem; font-weight: 600; color: #6a7a6a; letter-spacing: .1em; text-transform: uppercase; display: block; margin-bottom: .5rem; }
        .field-wrapper { position: relative; }
        .field-input { width: 100%; padding: .8rem 1rem; font-family: 'Jost', sans-serif; font-size: .95rem; font-weight: 400; color: #1a2e1a; background: #fafaf8; border: 1.5px solid #e0ddd6; border-radius: 10px; outline: none; transition: border-color .2s, background .2s, box-shadow .2s; }
        .field-input::placeholder { color: #c0bdb5; }
        .field-input:focus { border-color: #1a4d2e; background: white; box-shadow: 0 0 0 3px rgba(26,77,46,.08); }
        .field-input.has-error { border-color: #c0392b; background: #fff8f8; }
        .field-input.card-number-input { padding-right: 3.5rem; font-family: 'Courier New', monospace; font-size: 1rem; letter-spacing: .12em; }
        .card-type-indicator { position: absolute; right: .8rem; top: 50%; transform: translateY(-50%); display: flex; align-items: center; }
        .field-error { font-size: .75rem; color: #c0392b; margin-top: .35rem; display: flex; align-items: center; gap: .3rem; }
        .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        .form-divider { display: flex; align-items: center; gap: 1rem; margin: 1.5rem 0; }
        .form-divider::before, .form-divider::after { content: ''; flex: 1; height: 1px; background: #ebe8e0; }
        .form-divider-text { font-size: .7rem; color: #b0b0a8; letter-spacing: .1em; text-transform: uppercase; white-space: nowrap; }

        /* ↓ Animación suave como en exito.astro */
        .submit-btn { width: 100%; padding: 1rem 2rem; font-family: 'Jost', sans-serif; font-size: 1.1rem; font-weight: 600; letter-spacing: 0.5px; color: white; background: linear-gradient(135deg, #1a4d2e 0%, #4f7942 100%); border: none; border-radius: 8px; cursor: pointer; transition: transform 0.35s ease, box-shadow 0.35s ease, filter 0.35s ease; box-shadow: 0 6px 20px rgba(26, 77, 46, 0.35); margin-top: .5rem; position: relative; overflow: hidden; }
        .submit-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 10px 28px rgba(26, 77, 46, 0.4); filter: brightness(1.12); }
        .submit-btn:active:not(:disabled) { transform: translateY(0); }
        .submit-btn:disabled { opacity: .75; cursor: not-allowed; }
        .submit-btn::before { content: ''; position: absolute; inset: 0; background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,.08) 50%, transparent 100%); background-size: 200% auto; animation: shimmer 3s linear infinite; }
        .submit-btn-inner { display: flex; align-items: center; justify-content: center; gap: .6rem; position: relative; z-index: 1; }
        .spinner { width: 18px; height: 18px; border: 2px solid rgba(255,255,255,.4); border-top-color: white; border-radius: 50%; animation: spin .7s linear infinite; }

        .page-header { text-align: center; padding: 1rem 1.5rem 0; animation: fadeUp .5s ease both; }
        .page-logo { font-family: 'Cormorant Garamond', serif; font-size: 1.05rem; letter-spacing: .25em; color: #1a4d2e; text-transform: uppercase; font-weight: 400; margin-bottom: .4rem; }
        .page-sep { width: 60px; height: 1px; background: linear-gradient(to right, transparent, #c9a96e, transparent); margin: .5rem auto; }

        /* ↓ Animación suave parecida para el botón de regresar */
        .back-btn { display: inline-flex; align-items: center; gap: .4rem; padding: .5rem 1rem; font-family: 'Jost', sans-serif; font-size: .85rem; font-weight: 600; color: #5a6a5a; background: white; border: 1.5px solid #d8d4cc; border-radius: 8px; cursor: pointer; transition: transform 0.35s ease, box-shadow 0.35s ease, background 0.35s ease; margin-bottom: 1rem; box-shadow: 0 2px 8px rgba(0,0,0,.04); }
        .back-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(0,0,0,.08); background: #fdfdfc; }
        .back-btn:active { transform: translateY(0); }
      `}</style>

      <main className="pagos-root">
        <div className="page-header">
          <p className="page-logo">✦ Hotel Quinta Dalam ✦</p>
          <div className="page-sep" />
        </div>

        <div className="pagos-inner">
          {/* LEFT: Card Preview + Summary */}
          <div className="left-col">
            <div className="card-visual">
              <div className={`card-inner${cardFlipped ? ' flipped' : ''}`}>
                {/* Front */}
                <div className="card-face card-front">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div className="card-chip" />
                    {cardType && <div className="card-type-badge">{cardIcons[cardType]}</div>}
                  </div>
                  <div className="card-number-display">{displayNumber}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div>
                      <div className="card-holder-label">Titular</div>
                      <div className="card-holder-name">{formData.cardName || 'NOMBRE APELLIDO'}</div>
                    </div>
                    <div className="card-expiry">
                      <div className="card-holder-label">Vence</div>
                      <div style={{ fontFamily: "'Courier New',monospace", fontSize: '.95rem', letterSpacing: '.08em' }}>{formData.expiryDate || 'MM/YY'}</div>
                    </div>
                  </div>
                </div>
                {/* Back */}
                <div className="card-face card-back">
                  <div className="card-magnetic" />
                  <div style={{ padding: '0 1.2rem 1.4rem' }}>
                    <div className="card-cvv-band">
                      <span className="card-cvv-label">CVV</span>
                      <span className="card-cvv-dots">
                        {formData.cvv.length > 0 ? '•'.repeat(formData.cvv.length) : <span style={{ opacity: 0.35, letterSpacing: '.08em', fontSize: '.75rem', fontStyle: 'italic' }}>CVV</span>}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Reservation Summary */}
            <div className="summary-card">
              <div className="summary-header">
                <div className="summary-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                </div>
                <span className="summary-title">Resumen de Reservación</span>
              </div>
              {[
                ['Huésped', reservacionData.name],
                ['Correo', reservacionData.email],
                ['Teléfono', `${reservacionData.countryCode} ${reservacionData.tel}`],
                ['Llegada', new Date(reservacionData.fechaLlegada + 'T00:00:00').toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })],
                ['Salida', new Date(reservacionData.fechaSalida + 'T00:00:00').toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })],
                ['Personas', reservacionData.numeroPersonas],
                ['Habitación', reservacionData.roomPreference],
              ].map(([label, value], i) => (
                <div key={i}>
                  <div className="summary-row">
                    <span className="summary-label">{label}</span>
                    <span className="summary-value">{value}</span>
                  </div>
                  {i < 6 && <div className="summary-divider" />}
                </div>
              ))}
              <div className="summary-nights">
                <span className="nights-label">Estancia total</span>
                <span className="nights-badge">{nights} {nights === 1 ? 'noche' : 'noches'}</span>
              </div>
            </div>
          </div>

          {/* RIGHT: Payment Form */}
          <div className="right-col">
            {/* ↓ Botón para volver al formulario de reservación */}
            <button type="button" className="back-btn" onClick={handleVolver}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
              Volver a Reservación
            </button>
            <h1 className="form-title">Información<br/>de Pago</h1>
            <p className="form-subtitle">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              Datos encriptados
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '.3rem', marginLeft: '.6rem', paddingLeft: '.6rem', borderLeft: '1px solid #e0ddd6' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                Pago Seguro
              </span>
            </p>

            <div className="form-card">
              <div onSubmit={handleSubmit}>
                {/* Card Number */}
                <div className="field-group">
                  <label className="field-label">Número de Tarjeta</label>
                  <div className="field-wrapper">
                    <input
                      type="text"
                      name="cardNumber"
                      className={`field-input card-number-input${errors.cardNumber ? ' has-error' : ''}`}
                      placeholder="1234  5678  9012  3456"
                      value={formData.cardNumber.replace(/(\d{4})/g, '$1 ').trim()}
                      onChange={handleInputChange}
                      onFocus={() => setFocused('cardNumber')}
                      onBlur={() => setFocused(null)}
                      maxLength="19"
                      inputMode="numeric"
                    />
                    {cardType && <div className="card-type-indicator">{cardIcons[cardType]}</div>}
                  </div>
                  {errors.cardNumber && <p className="field-error"><svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>{errors.cardNumber}</p>}
                </div>

                {/* Card Name — solo mayúsculas */}
                <div className="field-group">
                  <label className="field-label">Nombre del Titular</label>
                  <input
                    type="text"
                    name="cardName"
                    className={`field-input${errors.cardName ? ' has-error' : ''}`}
                    placeholder="Nombre del Titular"
                    value={formData.cardName}
                    onChange={handleInputChange}
                    onFocus={() => setFocused('cardName')}
                    onBlur={() => setFocused(null)}
                    autoComplete="cc-name"
                    style={{ textTransform: 'uppercase', letterSpacing: '.06em' }}
                  />
                  {errors.cardName && <p className="field-error"><svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>{errors.cardName}</p>}
                </div>

                <div className="two-col">
                  <div className="field-group">
                    <label className="field-label">Vencimiento</label>
                    <input
                      type="text"
                      name="expiryDate"
                      className={`field-input${errors.expiryDate ? ' has-error' : ''}`}
                      placeholder="MM / YY"
                      value={formData.expiryDate}
                      onChange={handleInputChange}
                      onFocus={() => setFocused('expiryDate')}
                      onBlur={() => setFocused(null)}
                      maxLength="5"
                      inputMode="numeric"
                      autoComplete="cc-exp"
                    />
                    {errors.expiryDate && <p className="field-error" style={{ fontSize: '.7rem' }}>{errors.expiryDate}</p>}
                  </div>

                  {/* ↓ CVV censurado: type=password con fuente de puntos elegantes */}
                  <div className="field-group">
                    <label className="field-label">CVV</label>
                    <input
                      type="password"
                      name="cvv"
                      className={`field-input${errors.cvv ? ' has-error' : ''}`}
                      placeholder="•••"
                      value={formData.cvv}
                      onChange={handleInputChange}
                      onFocus={() => { setFocused('cvv'); setCardFlipped(true); }}
                      onBlur={() => { setFocused(null); setCardFlipped(false); }}
                      maxLength="4"
                      inputMode="numeric"
                      autoComplete="cc-csc"
                      style={{ letterSpacing: '.2em', fontFamily: 'Courier New, monospace' }}
                    />
                    {errors.cvv && <p className="field-error" style={{ fontSize: '.7rem' }}>{errors.cvv}</p>}
                  </div>
                </div>

                {errors.submit && (
                  <div style={{ background: '#fff0f0', border: '1px solid #fcc', borderRadius: 8, padding: '.75rem 1rem', marginBottom: '1rem', fontSize: '.85rem', color: '#c0392b' }}>
                    {errors.submit}
                  </div>
                )}

                <div className="form-divider"><span className="form-divider-text">Aceptamos</span></div>
                <div style={{ display: 'flex', gap: '.75rem', justifyContent: 'center', marginBottom: '1.4rem' }}>
                  {Object.values(cardIcons).map((icon, i) => (
                    <div key={i} style={{ padding: '4px 8px', background: '#f5f5f5', borderRadius: 6, display: 'flex', alignItems: 'center', border: '1px solid #e8e8e8' }}>{icon}</div>
                  ))}
                </div>

                <button type="button" className="submit-btn" disabled={loading} onClick={handleSubmit}>
                  <span className="submit-btn-inner">
                    {loading ? (
                      <><div className="spinner" />Procesando pago…</>
                    ) : (
                      <><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>Reservar Ahora</>
                    )}
                  </span>
                </button>
              </div>
            </div>


          </div>
        </div>
      </main>
    </>
  );
}