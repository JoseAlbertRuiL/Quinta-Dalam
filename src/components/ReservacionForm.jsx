import { useState, useEffect } from 'react';

export default function ReservacionForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    countryCode: '+52',
    tel: '',
    fechaLlegada: '',
    fechaSalida: '',
    numeroPersonas: 1,
    roomPreference: '',
    terms: false,
  });

  const [errors, setErrors] = useState({});

  // Lee los parámetros de la URL y pre-rellena el formulario
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const checkinDate = params.get('fecha-check-in');
    const checkoutDate = params.get('fecha-check-out');
    const personas = params.get('personas');

    if (checkinDate || checkoutDate || personas) {
      setFormData(prev => ({
        ...prev,
        fechaLlegada: checkinDate || prev.fechaLlegada,
        fechaSalida: checkoutDate || prev.fechaSalida,
        numeroPersonas: personas ? (personas === '5' ? 5 : parseInt(personas)) : prev.numeroPersonas,
      }));
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const validationForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es necesario';
    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$/.test(formData.name)) {
      newErrors.name = 'Nombre incorrecto, ingresa solo letras y espacios';
    }

    // Validacion de correo
    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(formData.email)) {
      newErrors.email = 'El correo que intenta ingresar no tiene un formato correcto';
    }

    // validacion de numero telefonico
    if (!formData.tel.trim()) { // validacion para que el campo no este vacio
      newErrors.tel = 'El teléfono es requerido';
    } else if (!/^[0-9]{10}$/.test(formData.tel)) {
      newErrors.tel = 'El numero telefonico debe tener 10 digitos';
    }

    // Validar fechas
    if (!formData.fechaLlegada) {
      newErrors.fechaLlegada = 'Se necesita una fecha de llegada';
    }

    if (!formData.fechaSalida) {
      newErrors.fechaSalida = 'Se necesita una fecha de salida';
    }

    if (formData.fechaLlegada && formData.fechaSalida) {
      if (new Date(formData.fechaSalida) <= new Date(formData.fechaLlegada)) {
        newErrors.fechaSalida = 'La fecha de salida tiene que ser despues de la fecha de llegada';
      }
    }

    // Validar número de personas
    if (!formData.numeroPersonas || formData.numeroPersonas < 1 || formData.numeroPersonas > 5) {
      newErrors.numeroPersonas = 'Debes seleccionar un número de personas válido (1-5)';
    }

    // Validar habitación
    if (!formData.roomPreference) {
      newErrors.roomPreference = 'Debes seleccionar una habitación';
    }

    // Validar términos
    if (!formData.terms) {
      newErrors.terms = 'Debes aceptar los términos y condiciones';
    }

    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const newErrors = validationForm();
    
    if (Object.keys(newErrors).length === 0) { //si no hay errores en el llenado del formulario se guardan los datos y se redirige a la pagina de pagos
      sessionStorage.setItem('reservacionData', JSON.stringify(formData));
      window.location.href = '/pagos';
    } else {
      setErrors(newErrors);
    }
  };

  return (
    <main className="pagina-reservaciones">
      <link rel="stylesheet" href="/css/reservaciones.css" />
      <section>
        <header>
          <h2>Reservaciones</h2>
        </header>
        <div>
          <p>
            ¡Bienvenido! ¿Estás listo para reservar un espacio donde se sienta y
            se viva Michoacán de verdad?
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <fieldset id="informacion-personal">
            <legend>Información Personal</legend>
            
            <div>
              <label>
                Nombre:
                <input
                  type="text"
                  name="name"
                  placeholder="Nombre del anfitrión"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </label>
              {errors.name && <span className="error">{errors.name}</span>}
            </div>

            <div>
              <label>
                Email:
                <input
                  type="email"
                  name="email"
                  placeholder="Correo del anfitrión"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </label>
              {errors.email && <span className="error">{errors.email}</span>}
            </div>

            <div>
              <label htmlFor="tel">Número telefónico:</label>
              <div className="phone-input-group">
                <select
                  name="countryCode"
                  value={formData.countryCode}
                  onChange={handleInputChange}
                  aria-label="Código de país"
                >
                  <option value="+52">🇲🇽 (+52)</option>
                  <option value="+1">🇺🇸 (+1)</option>
                  <option value="+1">🇨🇦 (+1)</option>
                  <option value="+34">🇪🇸 (+34)</option>
                  <option value="+57">🇨🇴 (+57)</option>
                  <option value="+54">🇦🇷 (+54)</option>
                  <option value="+51">🇵🇪 (+51)</option>
                  <option value="+56">🇨🇱 (+56)</option>
                  <option value="+55">🇧🇷 (+55)</option>
                  <option value="+44">🇬🇧 (+44)</option>
                  <option value="+33">🇫🇷 (+33)</option>
                  <option value="+49">🇩🇪 (+49)</option>
                  <option value="+39">🇮🇹 (+39)</option>
                  <option value="+81">🇯🇵 (+81)</option>
                  <option value="+86">🇨🇳 (+86)</option>
                  <option value="+91">🇮🇳 (+91)</option>
                  <option value="+7">🇷🇺 (+7)</option>
                  <option value="+61">🇦🇺 (+61)</option>
                  <option value="+82">🇰🇷 (+82)</option>
                  <option value="+58">🇻🇪 (+58)</option>
                  <option value="+593">🇪🇨 (+593)</option>
                  <option value="+502">🇬🇹 (+502)</option>
                  <option value="+53">🇨🇺 (+53)</option>
                  <option value="+591">🇧🇴 (+591)</option>
                  <option value="+1">🇩🇴 (+1)</option>
                  <option value="+504">🇭🇳 (+504)</option>
                  <option value="+595">🇵🇾 (+595)</option>
                  <option value="+503">🇸🇻 (+503)</option>
                  <option value="+505">🇳🇮 (+505)</option>
                  <option value="+506">🇨🇷 (+506)</option>
                  <option value="+507">🇵🇦 (+507)</option>
                  <option value="+598">🇺🇾 (+598)</option>
                  <option value="+1">🇵🇷 (+1)</option>
                  <option value="+351">🇵🇹 (+351)</option>
                  <option value="+31">🇳🇱 (+31)</option>
                  <option value="+41">🇨🇭 (+41)</option>
                  <option value="+46">🇸🇪 (+46)</option>
                  <option value="+32">🇧🇪 (+32)</option>
                  <option value="+43">🇦🇹 (+43)</option>
                  <option value="+90">🇹🇷 (+90)</option>
                  <option value="+972">🇮🇱 (+972)</option>
                  <option value="+20">🇪🇬 (+20)</option>
                  <option value="+27">🇿🇦 (+27)</option>
                  <option value="+234">🇳🇬 (+234)</option>
                  <option value="+966">🇸🇦 (+966)</option>
                  <option value="+971">🇦🇪 (+971)</option>
                  <option value="+65">🇸🇬 (+65)</option>
                  <option value="+64">🇳🇿 (+64)</option>
                  <option value="+353">🇮🇪 (+353)</option>
                  <option value="+30">🇬🇷 (+30)</option>
                </select>
                <input
                  type="tel"
                  name="tel"
                  placeholder="4431234567"
                  value={formData.tel}
                  onChange={handleInputChange}
                  maxLength="10"
                  required
                />
              </div>
              {errors.tel && <span className="error">{errors.tel}</span>}
            </div>
          </fieldset>

          <fieldset id="informacion-reservacion">
            <legend>Información de la Reservación</legend>
            
            <div>
              <label>
                Fecha de llegada:
                <input
                  type="date"
                  name="fechaLlegada"
                  value={formData.fechaLlegada}
                  onChange={handleInputChange}
                  required
                />
              </label>
              {errors.fechaLlegada && <span className="error">{errors.fechaLlegada}</span>}
            </div>

            <div>
              <label>
                Fecha de salida:
                <input
                  type="date"
                  name="fechaSalida"
                  value={formData.fechaSalida}
                  onChange={handleInputChange}
                  required
                />
              </label>
              {errors.fechaSalida && <span className="error">{errors.fechaSalida}</span>}
            </div>

            <div>
              <label>
                Número de personas:
                <input
                  type="number"
                  name="numeroPersonas"
                  value={formData.numeroPersonas}
                  onChange={handleInputChange}
                  min="1"
                  max="5"
                  required
                />
              </label>
              {errors.numeroPersonas && <span className="error">{errors.numeroPersonas}</span>}
            </div>

            <div>
              <label htmlFor="room-preference">Selecciona tu Habitación*:</label>
              <select
                id="room-preference"
                name="roomPreference"
                value={formData.roomPreference}
                onChange={handleInputChange}
                required
              >
                <option value="">Selecciona una habitación</option>
                <optgroup label="Planta Baja (Serie 100)">
                  <option value="101">101: Tzintzunzan</option>
                  <option value="102">102: Paracho</option>
                  <option value="103">103: Yunuen</option>
                  <option value="104">104: Patzcuaro</option>
                  <option value="105">105: Coeneo</option>
                  <option value="106">106: Janitzio</option>
                </optgroup>
                <optgroup label="Planta Alta (Serie 200)">
                  <option value="201">201: Suite Quencio</option>
                  <option value="202">202: Morelia</option>
                  <option value="203">203: Tacambaro</option>
                  <option value="204">204: Uruapan</option>
                  <option value="205">205: Tlalpujahua</option>
                  <option value="206">206: Cuitzeo</option>
                  <option value="207">207: Cuanajo</option>
                </optgroup>
              </select>
              {errors.roomPreference && <span className="error">{errors.roomPreference}</span>}
            </div>

            <div>
              <label htmlFor="terms">
                ¿Aceptas la
                <a href="/privacidad" target="_blank" rel="noopener noreferrer">
                  Política de Privacidad
                </a>
                {' '}y los
                <a href="/tyc" target="_blank" rel="noopener noreferrer">
                  Términos y Condiciones
                </a>
                ?
              </label>
              <input
                type="checkbox"
                id="terms"
                name="terms"
                checked={formData.terms}
                onChange={handleInputChange}
                required
              />
              {errors.terms && <span className="error">{errors.terms}</span>}
            </div>
          </fieldset>

          <button type="submit">Reservar</button>
          <br />
          <small>*: Sujeto a disponibilidad</small>
        </form>
      </section>
    </main>
  );
}
