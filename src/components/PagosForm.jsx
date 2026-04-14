import React, { useState, useEffect } from 'react';

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

  useEffect(() => {
    const load = () => {
      const raw = sessionStorage.getItem('reservacionData');
      if (raw) setReservacionData(JSON.parse(raw));
    };
    load();
    document.addEventListener('pagos:datosListos', load);
    return () => document.removeEventListener('pagos:datosListos', load);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let v = value;
    if (name === 'cardNumber') v = value.replace(/\D/g, '').slice(0, 16);
    if (name === 'expiryDate') {
      v = value.replace(/\D/g, '');
      if (v.length >= 2) v = v.slice(0, 2) + '/' + v.slice(2, 4);
    }
    if (name === 'cvv') v = value.replace(/\D/g, '').slice(0, 4);
    if (name === 'cardName') v = value.toUpperCase();
    setFormData(prev => ({ ...prev, [name]: v }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const validate = () => {
    const e = {};
    if (!formData.cardNumber || formData.cardNumber.length !== 16) e.cardNumber = 'El número debe tener 16 dígitos';
    if (!formData.cardName || !formData.cardName.trim()) e.cardName = 'Nombre requerido';
    if (!formData.expiryDate || formData.expiryDate.length !== 5) e.expiryDate = 'Formato MM/YY';
    if (!formData.cvv || formData.cvv.length < 3) e.cvv = 'CVV inválido';
    return e;
  };

  const handleVolver = () => document.dispatchEvent(new CustomEvent('pagos:volver'));

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    if (!reservacionData) { setErrors({ submit: 'Datos de reservación faltantes' }); return; }
    setLoading(true);
    try {
      const payload = {
        nombre_cliente: reservacionData.name,
        correo: reservacionData.email,
        telefono: `${reservacionData.countryCode || ''} ${reservacionData.tel || ''}`.trim(),
        habitacion: reservacionData.roomPreference,
        fecha_entrada: reservacionData.fechaLlegada,
        fecha_salida: reservacionData.fechaSalida,
        personas: Number(reservacionData.numeroPersonas) || null,
      };
      const res = await fetch('/api/reservaciones', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setLoading(false);
        setErrors({ submit: body.error || body.message || 'Error al procesar la reservación' });
        return;
      }
      // On success redirect to confirmation
      window.location.href = '/exito';
    } catch (err) {
      console.error(err);
      setLoading(false);
      setErrors({ submit: 'Error de conexión. Intenta nuevamente.' });
    }
  };

  if (!reservacionData) return (
    <div style={{ padding: 20, textAlign: 'center' }}>
      <p>Datos no encontrados. Completa la reservación primero.</p>
      <button onClick={handleVolver} style={{ padding: '8px 14px' }}>← Volver</button>
    </div>
  );

  const cardType = detectCard(formData.cardNumber);

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 12 }}>
      <h3>Pago</h3>
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 10 }}>
        <div>
          <label>Nombre en la tarjeta</label>
          <input name="cardName" value={formData.cardName} onChange={handleChange} />
          {errors.cardName && <div style={{ color: 'red' }}>{errors.cardName}</div>}
        </div>
        <div>
          <label>Número de tarjeta</label>
          <input name="cardNumber" value={formData.cardNumber} onChange={handleChange} />
          {cardType && <small style={{ marginLeft: 8 }}>{cardType.toUpperCase()}</small>}
          {errors.cardNumber && <div style={{ color: 'red' }}>{errors.cardNumber}</div>}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ flex: 1 }}>
            <label>Vence (MM/YY)</label>
            <input name="expiryDate" value={formData.expiryDate} onChange={handleChange} />
            {errors.expiryDate && <div style={{ color: 'red' }}>{errors.expiryDate}</div>}
          </div>
          <div style={{ width: 120 }}>
            <label>CVV</label>
            <input name="cvv" value={formData.cvv} onChange={handleChange} />
            {errors.cvv && <div style={{ color: 'red' }}>{errors.cvv}</div>}
          </div>
        </div>

        {errors.submit && <div style={{ color: 'red' }}>{errors.submit}</div>}

        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" onClick={handleVolver} style={{ padding: '10px 14px' }}>Volver</button>
          <button type="submit" disabled={loading} style={{ padding: '10px 14px' }}>{loading ? 'Procesando…' : 'Pagar'}</button>
        </div>
      </form>
    </div>
  );
}
