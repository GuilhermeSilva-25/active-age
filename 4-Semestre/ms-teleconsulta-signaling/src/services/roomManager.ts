import { RoomParticipant } from '../types/signaling';

export class RoomManager {
  private rooms: Map<string, RoomParticipant[]> = new Map();
  private socketToRoom: Map<string, string> = new Map();
  private readonly MAX_PARTICIPANTS_PER_ROOM = 2;

  /**
   * Registra a entrada de um participante em uma sala de teleconsulta.
   * Aplica a regra de negócio de no máximo 2 participantes por consulta médica.
   */
  public joinRoom(
    appointmentId: string,
    participant: RoomParticipant
  ): {
    success: boolean;
    error?: string;
    existingParticipants: RoomParticipant[];
  } {
    if (!appointmentId || !participant.socketId || !participant.userId) {
      return {
        success: false,
        error: 'Dados obrigatórios para ingresso na sala ausentes.',
        existingParticipants: []
      };
    }

    const currentParticipants = this.rooms.get(appointmentId) || [];

    // Se o socket já estiver registrado nesta sala, retorna idempotente
    const alreadyPresent = currentParticipants.find(
      (p) => p.socketId === participant.socketId
    );
    if (alreadyPresent) {
      return {
        success: true,
        existingParticipants: currentParticipants.filter(
          (p) => p.socketId !== participant.socketId
        )
      };
    }

    // Regra de segurança: Limite de 2 participantes (Médico e Paciente/Cuidador)
    if (currentParticipants.length >= this.MAX_PARTICIPANTS_PER_ROOM) {
      return {
        success: false,
        error: 'A sala de teleconsulta já atingiu o limite máximo de 2 participantes ativos.',
        existingParticipants: []
      };
    }

    const existingCopy = [...currentParticipants];
    currentParticipants.push(participant);
    this.rooms.set(appointmentId, currentParticipants);
    this.socketToRoom.set(participant.socketId, appointmentId);

    return {
      success: true,
      existingParticipants: existingCopy
    };
  }

  /**
   * Remove o participante da sala quando este sai voluntariamente ou desconecta.
   */
  public leaveRoom(socketId: string): {
    appointmentId?: string;
    removedParticipant?: RoomParticipant;
    remainingCount: number;
  } {
    const appointmentId = this.socketToRoom.get(socketId);
    if (!appointmentId) {
      return { remainingCount: 0 };
    }

    this.socketToRoom.delete(socketId);
    const currentParticipants = this.rooms.get(appointmentId) || [];
    const removedParticipant = currentParticipants.find(
      (p) => p.socketId === socketId
    );
    const updatedParticipants = currentParticipants.filter(
      (p) => p.socketId !== socketId
    );

    if (updatedParticipants.length === 0) {
      this.rooms.delete(appointmentId);
    } else {
      this.rooms.set(appointmentId, updatedParticipants);
    }

    return {
      appointmentId,
      removedParticipant,
      remainingCount: updatedParticipants.length
    };
  }

  /**
   * Retorna os participantes ativos de uma consulta.
   */
  public getParticipants(appointmentId: string): RoomParticipant[] {
    return this.rooms.get(appointmentId) || [];
  }

  /**
   * Obtém a sala associada a um socket.
   */
  public getRoomBySocketId(socketId: string): string | undefined {
    return this.socketToRoom.get(socketId);
  }

  /**
   * Limpa todas as salas (para isolamento em testes).
   */
  public clearAll(): void {
    this.rooms.clear();
    this.socketToRoom.clear();
  }
}

export const roomManager = new RoomManager();
