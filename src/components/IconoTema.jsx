import { Moon, Sun } from 'lucide-react';

/*
 * Ícono del botón de cambio de tema: luna en modo claro (pasar a oscuro),
 * sol en modo oscuro (pasar a claro).
 *
 *   sobreVerde: el botón está sobre un fondo verde → la luna va en blanco.
 */
export default function IconoTema({ theme, sobreVerde = false, size = 18 }) {
  return theme === 'light'
    ? <Moon size={size} color={sobreVerde ? '#ffffff' : '#334155'} aria-hidden="true" />
    : <Sun size={size} color="#fbbf24" aria-hidden="true" />;
}
