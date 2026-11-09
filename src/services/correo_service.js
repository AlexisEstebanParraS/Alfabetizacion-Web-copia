// Servicio externo (EF5): correo de bienvenida mediante la API de Resend.
// Si no hay RESEND_API_KEY en el .env, el envío se omite sin afectar el registro.

const URL_RESEND = 'https://api.resend.com/emails';
const TIEMPO_MAXIMO_MS = 5000;

const escaparHtml = (texto) => String(texto)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

/**
 * Envía el correo de bienvenida. Nunca lanza error: devuelve { enviado, motivo }
 * para que una falla del proveedor no impida registrarse.
 */
export const enviarCorreoBienvenida = async ({ nombre, email }) => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { enviado: false, motivo: 'RESEND_API_KEY no configurada' };

  try {
    const respuesta = await fetch(URL_RESEND, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.CORREO_REMITENTE || 'Municipio Fácil <onboarding@resend.dev>',
        to: [email],
        subject: 'Bienvenido a Municipio Fácil',
        html: `<p>Hola ${escaparHtml(nombre)},</p>
               <p>Tu cuenta fue creada. Ya puedes practicar trámites municipales paso a paso.</p>`,
      }),
      signal: AbortSignal.timeout(TIEMPO_MAXIMO_MS),
    });

    if (!respuesta.ok) {
      console.warn(`⚠️ Correo de bienvenida no enviado (HTTP ${respuesta.status})`);
      return { enviado: false, motivo: `HTTP ${respuesta.status}` };
    }
    return { enviado: true };
  } catch (error) {
    console.warn('⚠️ Correo de bienvenida no enviado:', error.name);
    return { enviado: false, motivo: error.name };
  }
};
