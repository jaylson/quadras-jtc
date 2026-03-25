import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import BlockModal from './BlockModal';
import type { Court } from '@/lib/db/schema';

describe('BlockModal (Validação)', () => {
  const mockSave = vi.fn();
  const mockClose = vi.fn();
  const mockDelete = vi.fn();

  const mockCourts: Court[] = [
    { id: 1, name: 'Quadra 1', type: 'coberta', surface: 'saibro', usageMinutesDry: 60, usageMinutesRain: 60, intervalMinutes: 15, intervalCleanMinutes: 5, active: true, createdAt: new Date(), updatedAt: new Date(), description: null, deactivateStart: null, deactivateEnd: null },
    { id: 2, name: 'Quadra 2', type: 'descoberta', surface: 'hard', usageMinutesDry: 60, usageMinutesRain: 0, intervalMinutes: 10, intervalCleanMinutes: 5, active: true, createdAt: new Date(), updatedAt: new Date(), description: null, deactivateStart: null, deactivateEnd: null },
  ];

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('deve desabilitar o botão de salvar se faltar título (RF-15)', () => {
    render(<BlockModal courts={mockCourts} onSave={mockSave} onClose={mockClose} />);

    const saveBtn = screen.getByRole('button', { name: /criar trava/i });
    expect(saveBtn).toBeDisabled();

    // Selecionar quadra mas manter titulo vazio
    const courtBtn = screen.getByRole('button', { name: /quadra 1/i });
    fireEvent.click(courtBtn);

    expect(saveBtn).toBeDisabled();
  });

  it('deve desabilitar se tiver título mas não tiver quadras (RF-15)', () => {
    render(<BlockModal courts={mockCourts} onSave={mockSave} onClose={mockClose} />);

    const saveBtn = screen.getByRole('button', { name: /criar trava/i });

    // Preencher título
    const titleInput = screen.getByLabelText(/título \*/i);
    fireEvent.change(titleInput, { target: { value: 'Manutenção' } });

    expect(saveBtn).toBeDisabled();
  });

  it('deve habilitar se tiver título e ao menos uma quadra', () => {
    render(<BlockModal courts={mockCourts} onSave={mockSave} onClose={mockClose} />);

    const saveBtn = screen.getByRole('button', { name: /criar trava/i });

    const titleInput = screen.getByLabelText(/título \*/i);
    fireEvent.change(titleInput, { target: { value: 'Manutenção' } });

    const courtBtn = screen.getByRole('button', { name: /quadra 1/i });
    fireEvent.click(courtBtn);

    expect(saveBtn).not.toBeDisabled();
    
    // Testa submit
    const form = screen.getByRole('dialog').querySelector('form');
    fireEvent.submit(form!);

    expect(mockSave).toHaveBeenCalledTimes(1);
    expect(mockSave).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Manutenção',
      courtIds: [1]
    }));
  });

  it('deve exibir confirmação antes de excluir (RF-18)', () => {
    const mockBlock = { id: 1, title: 'Bloqueio', category: 'manutencao', recurring: 'nenhuma', date: '2026-03-25', startTime: '10:00', endTime: '12:00', courtIds: [1], notes: null } as any;

    render(<BlockModal block={mockBlock} courts={mockCourts} onSave={mockSave} onClose={mockClose} onDelete={mockDelete} />);

    const btnDelete = screen.getByRole('button', { name: /excluir/i });
    fireEvent.click(btnDelete); // primeiro clique só mostra "Confirmar"

    expect(mockDelete).not.toHaveBeenCalled();
    expect(screen.getByText('Confirmar exclusão?')).toBeInTheDocument();

    const btnConfirmDelete = screen.getByRole('button', { name: /sim, excluir/i });
    fireEvent.click(btnConfirmDelete);

    expect(mockDelete).toHaveBeenCalledTimes(1);
  });
});
