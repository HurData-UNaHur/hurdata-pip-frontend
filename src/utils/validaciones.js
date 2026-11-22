/*
 * Reglas de correo y contraseña de los formularios de acceso. El backend aplica las mismas
 * (app/api/validaciones.py): acá se repiten solo para avisar mientras la persona escribe.
 * El login NO usa estas reglas: ahí solo se pide que los campos no estén vacíos.
 */

export const DOMINIO_INSTITUCIONAL = '@unahur.edu.ar';
const EMAIL_INSTITUCIONAL = /^[a-z0-9][a-z0-9._%+-]*@unahur\.edu\.ar$/;

export const normalizarEmail = (valor) => valor.trim().toLowerCase();

export const validarEmailInstitucional = (valor) => {
  const email = normalizarEmail(valor);
  if (!email) return 'Ingresá tu correo institucional.';
  if (!email.includes('@')) return 'Al correo le falta el @.';
  if (!email.endsWith(DOMINIO_INSTITUCIONAL)) return `Usá tu correo institucional (${DOMINIO_INSTITUCIONAL}).`;
  if (!EMAIL_INSTITUCIONAL.test(email)) return 'El correo no tiene un formato válido.';
  return '';
};

export const validarNombre = (valor) => {
  const nombre = valor.trim();
  if (!nombre) return 'Ingresá tu nombre.';
  if (nombre.length < 3) return 'El nombre debe tener al menos 3 caracteres.';
  return '';
};

// Contraseña nueva: se muestra como checklist mientras se escribe
export const REGLAS_PASSWORD = [
  { id: 'largo', texto: 'Entre 8 y 72 caracteres', cumple: (p) => p.length >= 8 && p.length <= 72 },
  { id: 'mayuscula', texto: 'Una mayúscula', cumple: (p) => /[A-Z]/.test(p) },
  { id: 'minuscula', texto: 'Una minúscula', cumple: (p) => /[a-z]/.test(p) },
  { id: 'numero', texto: 'Un número', cumple: (p) => /\d/.test(p) },
  { id: 'simbolo', texto: 'Un símbolo (por ejemplo ! # $ %)', cumple: (p) => /[^A-Za-z0-9\s]|_/.test(p) },
];

export const validarPasswordNueva = (valor) => {
  if (!valor) return 'Ingresá una contraseña.';
  return REGLAS_PASSWORD.every((r) => r.cumple(valor)) ? '' : 'La contraseña no cumple todos los requisitos.';
};

export const validarConfirmacion = (valor, original) => {
  if (!valor) return 'Repetí la contraseña.';
  return valor === original ? '' : 'Las contraseñas no coinciden.';
};

// El código tiene 8 letras y números; se acepta con o sin guion y en minúsculas
export const normalizarCodigo = (valor) => valor.toUpperCase().replace(/[^A-Z0-9]/g, '');

export const validarCodigo = (valor) => {
  if (!valor.trim()) return 'Ingresá el código que te dieron.';
  return normalizarCodigo(valor).length === 8 ? '' : 'El código tiene 8 letras y números (por ejemplo K7M2-9QXP).';
};
