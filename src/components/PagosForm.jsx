import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

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
  const [success, setSuccess] = useState(false);
  const [focused, setFocused] = useState(null);
  const [cardFlipped, setCardFlipped] = useState(false);

  useEffect(() => {
    const data = sessionStorage.getItem('reservacionData');
    if (data) {
      setReservacionData(JSON.parse(data));
    } else {
      setReservacionData({
        name: 'Ana Martínez',
        email: 'ana@ejemplo.com',
        countryCode: '+52',
        tel: '443 123 4567',
        fechaLlegada: '2025-08-10',
        fechaSalida: '2025-08-14',
        numeroPersonas: 2,
        roomPreference: '202',
      });
    }
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
    setFormData(prev => ({ ...prev, [name]: v }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const validateForm = () => {
    const e = {};
    if (!formData.cardNumber || formData.cardNumber.length !== 16) e.cardNumber = 'El número debe tener 16 dígitos';
    if (!formData.cardName.trim()) e.cardName = 'El nombre del titular es requerido';
    if (!formData.expiryDate || formData.expiryDate.length !== 5) e.expiryDate = 'Formato MM/YY requerido';
    if (!formData.cvv || formData.cvv.length < 3) e.cvv = 'CVV de 3 o 4 dígitos';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }

    setLoading(true);

    try {
      // 🔄 Simulación del pago (aquí irá la pasarela real después)
      await new Promise(r => setTimeout(r, 2200));

      // ✅ Pago exitoso: ahora sí hacemos el INSERT en Supabase
      const { error: insertError } = await supabase
        .from('reservas')
        .insert([
          {
            nombre_cliente: reservacionData.name,
            correo: reservacionData.email,
            telefono: `${reservacionData.countryCode}${reservacionData.tel}`,
            fecha_entrada: reservacionData.fechaLlegada,
            fecha_salida: reservacionData.fechaSalida,
            personas: reservacionData.numeroPersonas,
            habitacion: reservacionData.roomPreference,
          }
        ]);

      if (insertError) throw insertError;

      setLoading(false);
      setSuccess(true);
      sessionStorage.removeItem('reservacionData');
      setTimeout(() => { window.location.href = '/'; }, 4000);

    } catch (err) {
      console.error(err);
      setLoading(false);
      setErrors({ submit: 'Error al procesar el pago. Intenta nuevamente.' });
    }
  };

  const cardType = detectCard(formData.cardNumber);
  const displayNumber = formData.cardNumber
    ? formData.cardNumber.replace(/(\d{4})/g, '$1 ').trim().padEnd(19, '·')
    : '···· ···· ···· ····';

  if (!reservacionData) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#f4f1eb' }}>
      <div style={{ width: 40, height: 40, border: '3px solid #1a4d2e', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (success) return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=Jost:wght@300;400;500&display=swap');
        @keyframes fadeUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes scaleIn { from { transform: scale(0.7); opacity: 0; } to { transform: scale(1); opacity: 1; } }
      `}</style>
      <main style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f0ede6 0%, #e8e2d5 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', fontFamily: "'Jost', sans-serif" }}>
        <div style={{ maxWidth: 520, width: '100%', textAlign: 'center', animation: 'fadeUp .7s ease both' }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, #1a4d2e, #4f7942)', margin: '0 auto 2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'scaleIn .5s .3s ease both', boxShadow: '0 12px 32px rgba(26,77,46,.35)' }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '2.8rem', fontWeight: 600, color: '#1a2e1a', margin: '0 0 1rem', lineHeight: 1.1 }}>¡Reservación Confirmada!</h2>
          <p style={{ color: '#5a6b5a', fontSize: '1.05rem', fontWeight: 300, lineHeight: 1.7, margin: '0 0 .6rem' }}>Tu pago ha sido procesado exitosamente.</p>
          <p style={{ color: '#5a6b5a', fontSize: '1.05rem', fontWeight: 300, lineHeight: 1.7, margin: '0 0 2rem' }}>Recibirás un correo de confirmación en breve.</p>
          <div style={{ height: 2, background: 'linear-gradient(to right, transparent, #c9a96e, transparent)', margin: '2rem auto', width: '60%' }} />
          <p style={{ color: '#9aaa9a', fontSize: '.85rem', letterSpacing: '.05em', textTransform: 'uppercase' }}>Redirigiendo en unos momentos…</p>
        </div>
      </main>
    </>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,400&family=Jost:wght@300;400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes shimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes cardGlow { 0%,100% { box-shadow: 0 20px 60px rgba(26,77,46,.25), 0 8px 20px rgba(0,0,0,.15); } 50% { box-shadow: 0 24px 70px rgba(26,77,46,.35), 0 8px 24px rgba(0,0,0,.2); } }

        .pagos-root { min-height: 100vh; background: #f5f2ec; font-family: 'Jost', sans-serif; }
        .pagos-root::before { content: ''; position: fixed; inset: 0; background: radial-gradient(ellipse at 20% 20%, rgba(79,121,66,.06) 0%, transparent 60%), radial-gradient(ellipse at 80% 80%, rgba(201,169,110,.07) 0%, transparent 60%); pointer-events: none; }

        .pagos-inner { max-width: 960px; margin: 0 auto; padding: 3rem 1.5rem; display: grid; grid-template-columns: 1fr 1fr; gap: 2.5rem; align-items: start; }
        @media (max-width: 700px) { .pagos-inner { grid-template-columns: 1fr; } }

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

        .submit-btn { width: 100%; padding: 1rem 2rem; font-family: 'Cormorant Garamond', serif; font-size: 1.2rem; font-weight: 600; letter-spacing: .06em; color: white; background: linear-gradient(135deg, #1a4d2e 0%, #4f7942 100%); border: none; border-radius: 12px; cursor: pointer; transition: transform .15s, box-shadow .15s, opacity .15s; box-shadow: 0 6px 20px rgba(26,77,46,.35); margin-top: .5rem; position: relative; overflow: hidden; }
        .submit-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 10px 28px rgba(26,77,46,.4); }
        .submit-btn:active:not(:disabled) { transform: translateY(0); }
        .submit-btn:disabled { opacity: .75; cursor: not-allowed; }
        .submit-btn::before { content: ''; position: absolute; inset: 0; background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,.1) 50%, transparent 100%); background-size: 200% auto; animation: shimmer 2.5s linear infinite; }
        .submit-btn-inner { display: flex; align-items: center; justify-content: center; gap: .6rem; position: relative; z-index: 1; }
        .spinner { width: 18px; height: 18px; border: 2px solid rgba(255,255,255,.4); border-top-color: white; border-radius: 50%; animation: spin .7s linear infinite; }

        .secure-badges { display: flex; align-items: center; justify-content: center; gap: 1.5rem; margin-top: 1.2rem; }
        .secure-badge { display: flex; align-items: center; gap: .35rem; font-size: .7rem; color: #9aaa9a; font-weight: 400; letter-spacing: .04em; }

        .page-header { text-align: center; padding: 2.5rem 1.5rem 0; animation: fadeUp .5s ease both; }
        .page-logo { font-family: 'Cormorant Garamond', serif; font-size: 1.05rem; letter-spacing: .25em; color: #1a4d2e; text-transform: uppercase; font-weight: 400; margin-bottom: .4rem; }
        .page-sep { width: 60px; height: 1px; background: linear-gradient(to right, transparent, #c9a96e, transparent); margin: .5rem auto; }
      `}</style>

      <main className="pagos-root">
        <div className="page-header">
          <p className="page-logo">✦ Hotel Quinta Dalam ✦</p>
          <div className="page-sep" />
        </div>

        <div className="pagos-inner">
          <div className="left-col">
            <div className="card-visual">
              <div className={`card-inner${cardFlipped ? ' flipped' : ''}`}>
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
                <div className="card-face card-back">
                  <div className="card-magnetic" />
                  <div style={{ padding: '0 1.2rem 1.4rem' }}>
                    <div className="card-cvv-band">
                      <span className="card-cvv-label">CVV</span>
                      <span className="card-cvv-dots">{'•'.repeat(formData.cvv.length || 3)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

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
                ['Llegada', new Date(reservacionData.fechaLlegada).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })],
                ['Salida', new Date(reservacionData.fechaSalida).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })],
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

          <div className="right-col">
            <h1 className="form-title">Información<br/>de Pago</h1>
            <p className="form-subtitle">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              Datos encriptados
            </p>

            <div className="form-card">
              <div>
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

                  <div className="field-group">
                    <label className="field-label">CVV</label>
                    <input
                      type="text"
                      name="cvv"
                      className={`field-input${errors.cvv ? ' has-error' : ''}`}
                      placeholder="···"
                      value={formData.cvv}
                      onChange={handleInputChange}
                      onFocus={() => { setFocused('cvv'); setCardFlipped(true); }}
                      onBlur={() => { setFocused(null); setCardFlipped(false); }}
                      maxLength="4"
                      inputMode="numeric"
                      autoComplete="cc-csc"
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
                      <><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>Confirmar Pago</>
                    )}
                  </span>
                </button>
              </div>
            </div>

            <div className="secure-badges">
              <span className="secure-badge">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                Pago Seguro
              </span>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}