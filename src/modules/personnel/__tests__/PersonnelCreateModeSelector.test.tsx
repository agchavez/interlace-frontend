/**
 * Tests para PersonnelCreateModeSelector
 *
 * Para ejecutar los tests instala primero las dependencias:
 *   npm install --save-dev vitest @vitest/coverage-v8 @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
 *
 * Y agrega en vite.config.ts:
 *   test: { globals: true, environment: 'jsdom', setupFiles: ['./src/test/setup.ts'] }
 *
 * Luego ejecuta: npx vitest run src/modules/personnel/__tests__
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material';
import { PersonnelCreateModeSelector } from '../components/PersonnelCreateModeSelector';

const theme = createTheme();

function renderSelector(props: Partial<React.ComponentProps<typeof PersonnelCreateModeSelector>> = {}) {
  const defaultProps = {
    open: true,
    onClose: vi.fn(),
    onModeSelect: vi.fn(),
    ...props,
  };
  return render(
    <ThemeProvider theme={theme}>
      <PersonnelCreateModeSelector {...defaultProps} />
    </ThemeProvider>
  );
}

describe('PersonnelCreateModeSelector', () => {
  it('muestra las 4 opciones de creación cuando está abierto', () => {
    renderSelector();
    expect(screen.getByText('Solo Personal')).toBeInTheDocument();
    expect(screen.getByText('Vincular Usuario Existente')).toBeInTheDocument();
    expect(screen.getByText('Crear Usuario Nuevo')).toBeInTheDocument();
    expect(screen.getByText('Carga Masiva')).toBeInTheDocument();
  });

  it('la opción Carga Masiva tiene la descripción correcta', () => {
    renderSelector();
    expect(
      screen.getByText(/Registrar múltiples empleados a la vez desde una plantilla Excel/i)
    ).toBeInTheDocument();
  });

  it('no muestra el dialog cuando open=false', () => {
    renderSelector({ open: false });
    expect(screen.queryByText('Solo Personal')).not.toBeInTheDocument();
  });

  it('llama onModeSelect con "personnel_only" al hacer clic en Solo Personal', () => {
    const onModeSelect = vi.fn();
    renderSelector({ onModeSelect });
    fireEvent.click(screen.getByText('Solo Personal'));
    expect(onModeSelect).toHaveBeenCalledWith('personnel_only');
  });

  it('llama onModeSelect con "existing_user" al hacer clic en Vincular Usuario Existente', () => {
    const onModeSelect = vi.fn();
    renderSelector({ onModeSelect });
    fireEvent.click(screen.getByText('Vincular Usuario Existente'));
    expect(onModeSelect).toHaveBeenCalledWith('existing_user');
  });

  it('llama onModeSelect con "new_user" al hacer clic en Crear Usuario Nuevo', () => {
    const onModeSelect = vi.fn();
    renderSelector({ onModeSelect });
    fireEvent.click(screen.getByText('Crear Usuario Nuevo'));
    expect(onModeSelect).toHaveBeenCalledWith('new_user');
  });

  it('llama onModeSelect con "bulk_upload" al hacer clic en Carga Masiva', () => {
    const onModeSelect = vi.fn();
    renderSelector({ onModeSelect });
    fireEvent.click(screen.getByText('Carga Masiva'));
    expect(onModeSelect).toHaveBeenCalledWith('bulk_upload');
  });

  it('llama onClose al hacer clic en el botón de cerrar', () => {
    const onClose = vi.fn();
    renderSelector({ onClose });
    const closeBtn = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalled();
  });
});
