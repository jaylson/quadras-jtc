import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getEffectiveUsage, getCourtStatus, getNextAvailableSlot } from './courts';
import type { Court, Reservation } from '@/lib/db/schema';

describe('courts util', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // 2026-03-25 10:00:00
    vi.setSystemTime(new Date('2026-03-25T10:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const mockCourt: Court = {
    id: 1,
    name: 'Quadra 1',
    description: null,
    type: 'descoberta',
    surface: 'saibro',
    active: true,
    usageMinutesDry: 60,
    usageMinutesRain: 0,
    intervalMinutes: 10,
    intervalCleanMinutes: 5,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  describe('getEffectiveUsage (RN-09)', () => {
    it('deve retornar usageMinutesDry quando não estiver chovendo', () => {
      const usage = getEffectiveUsage(mockCourt, false);
      expect(usage).toBe(60);
    });

    it('deve retornar usageMinutesRain quando estiver chovendo', () => {
      const usage = getEffectiveUsage(mockCourt, true);
      expect(usage).toBe(0);
    });

    it('deve retornar tempo reduzido em chuva para quadras cobertas', () => {
      const coveredCourt: Court = { ...mockCourt, type: 'coberta', usageMinutesRain: 45 };
      const usage = getEffectiveUsage(coveredCourt, true);
      expect(usage).toBe(45);
    });
  });

  describe('getCourtStatus (RN-01, RN-02, RN-03)', () => {
    it('deve retornar "inativa" se a quadra não estiver ativa', () => {
      const inactiveCourt = { ...mockCourt, active: false };
      const status = getCourtStatus(inactiveCourt, [], false);
      expect(status).toBe('inativa');
    });

    it('deve retornar "bloqueada-chuva" se chovendo, descoberta e usageMinutesRain é 0', () => {
      const status = getCourtStatus(mockCourt, [], true);
      expect(status).toBe('bloqueada-chuva');
    });

    it('deve retornar "em-uso" se houver reserva ativa agora', () => {
      const activeReservation = {
        id: 1,
        courtId: 1,
        userId: null,
        startTime: new Date('2026-03-25T09:30:00Z'),
        endTime: new Date('2026-03-25T10:30:00Z'),
        status: 'ativa',
        gameType: 'simples',
        code: '1234',
        createdAt: new Date(),
        updatedAt: new Date()
      } as Reservation;

      const status = getCourtStatus(mockCourt, [activeReservation], false);
      expect(status).toBe('em-uso');
    });

    it('deve retornar "disponivel" se não houver reserva ativa e não bloqueada', () => {
      const pastReservation = {
        id: 1,
        courtId: 1,
        userId: null,
        startTime: new Date('2026-03-25T08:00:00Z'),
        endTime: new Date('2026-03-25T09:00:00Z'),
        status: 'concluída',
        gameType: 'simples',
        code: '1234',
        createdAt: new Date(),
        updatedAt: new Date()
      } as Reservation;

      const status = getCourtStatus(mockCourt, [pastReservation], false);
      expect(status).toBe('disponivel');
    });
  });

  describe('getNextAvailableSlot (RN-06)', () => {
    it('sem reservas: arredonda "now" para o próximo múltiplo de 5', () => {
      // now é 10:00
      const slot = getNextAvailableSlot(mockCourt, [], false);
      expect(slot.toISOString()).toBe('2026-03-25T10:00:00.000Z');
      
      // se now fosse 10:02
      vi.setSystemTime(new Date('2026-03-25T10:02:00Z'));
      const slot2 = getNextAvailableSlot(mockCourt, [], false);
      expect(slot2.toISOString()).toBe('2026-03-25T10:05:00.000Z');
    });

    it('com reserva ativa, adiciona o intervalMinutes no lastEnd', () => {
      // Mockcourt tem intervalMinutes = 10
      const reservations = [
        {
          id: 1,
          courtId: 1,
          userId: null,
          startTime: new Date('2026-03-25T10:30:00Z'),
          endTime: new Date('2026-03-25T11:30:00Z'),
          status: 'ativa',
          gameType: 'simples',
          code: '1234',
          createdAt: new Date(),
          updatedAt: new Date()
        } as Reservation
      ];

      const slot = getNextAvailableSlot(mockCourt, reservations, false);
      // Fim em 11:30 + 10 min = 11:40
      expect(slot.toISOString()).toBe('2026-03-25T11:40:00.000Z');
    });

    it('adiciona (5 - remainder) se não for múltiplo de 5 o final', () => {
      // Fim em 11:33, interval 10 -> 11:43 -> arredonda pra 11:45
      const reservations = [
        {
          id: 1,
          courtId: 1,
          userId: null,
          startTime: new Date('2026-03-25T10:33:00Z'),
          endTime: new Date('2026-03-25T11:33:00Z'),
          status: 'ativa',
          gameType: 'simples',
          code: '1234',
          createdAt: new Date(),
          updatedAt: new Date()
        } as Reservation
      ];

      const slot = getNextAvailableSlot(mockCourt, reservations, false);
      expect(slot.toISOString()).toBe('2026-03-25T11:45:00.000Z');
    });

    it('ignora reservas "concluída"', () => {
      const reservations = [
        {
          id: 1,
          courtId: 1,
          userId: null,
          startTime: new Date('2026-03-25T10:30:00Z'),
          endTime: new Date('2026-03-25T11:30:00Z'),
          status: 'concluída',
          gameType: 'simples',
          code: '1234',
          createdAt: new Date(),
          updatedAt: new Date()
        } as Reservation
      ];

      // Como o array de ativas cai em vazio, calcula a partir de "now" (10:00)
      const slot = getNextAvailableSlot(mockCourt, reservations, false);
      expect(slot.toISOString()).toBe('2026-03-25T10:00:00.000Z');
    });
  });
});
