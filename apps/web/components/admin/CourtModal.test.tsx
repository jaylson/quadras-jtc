import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CourtModal from './CourtModal';
import type { Court } from '@/lib/db/schema';

describe('CourtModal (Validação)', () => {
  const mockSave = vi.fn();
  const mockClose = vi.fn();

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('deve desabilitar o botão de salvar se o nome estiver vazio (RF-16)', () => {
    render(<CourtModal onSave={mockSave} onClose={mockClose} />);

    // Por padrão o nome é vazio na criação
    const saveBtn = screen.getByRole('button', { name: /criar quadra/i });
    expect(saveBtn).toBeDisabled();

    // Digita um nome
    const inputName = screen.getByLabelText(/nome da quadra/i);
    fireEvent.change(inputName, { target: { value: 'Quadra 1' } });
    expect(saveBtn).not.toBeDisabled();

    // Apaga o nome
    fireEvent.change(inputName, { target: { value: '   ' } });
    expect(saveBtn).toBeDisabled();
  });

  it('deve exibir erro inline (RF-02 adaptado) ao tentar enviar com nome vazio e falhar no submit', () => {
    render(<CourtModal onSave={mockSave} onClose={mockClose} />);
    
    // O botão está disabled, mas se forçarmos o form submit:
    const form = screen.getByRole('dialog').querySelector('form');
    fireEvent.submit(form!);

    expect(screen.getByText('Nome da quadra é obrigatório')).toBeInTheDocument();
    expect(mockSave).not.toHaveBeenCalled();
  });

  it('deve chamar onSave com os dados ao preencher corretamente', () => {
    render(<CourtModal onSave={mockSave} onClose={mockClose} />);
    
    const inputName = screen.getByLabelText(/nome da quadra/i);
    fireEvent.change(inputName, { target: { value: 'Quadra 2' } });

    const form = screen.getByRole('dialog').querySelector('form');
    fireEvent.submit(form!);

    expect(mockSave).toHaveBeenCalledTimes(1);
    expect(mockSave).toHaveBeenCalledWith({
      name: 'Quadra 2',
      type: 'coberta',
      surface: 'saibro',
      usageMinutesDry: 60,
      usageMinutesRain: 60,
      intervalMinutes: 15,
      deactivateStart: null,
      deactivateEnd: null
    });
  });

  it('deve popular os campos se isEdit for verdadeiro (RF-09)', () => {
    const mockCourt: Court = {
      id: 1,
      name: 'Minha Quadra',
      type: 'descoberta',
      surface: 'hard',
      usageMinutesDry: 45,
      usageMinutesRain: 0,
      intervalMinutes: 10,
      intervalCleanMinutes: 5,
      active: true,
      deactivateStart: null,
      deactivateEnd: null,
      description: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    render(<CourtModal court={mockCourt} onSave={mockSave} onClose={mockClose} />);

    expect(screen.getByDisplayValue('Minha Quadra')).toBeInTheDocument();
    expect(screen.getByDisplayValue('45')).toBeInTheDocument(); // usageDry
    expect(screen.getByRole('button', { name: /salvar alterações/i })).not.toBeDisabled();
  });
});
