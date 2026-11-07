import { Server as SocketIOServer, Socket } from 'socket.io';
import {
  JoinRoomPayload,
  OfferPayload,
  AnswerPayload,
  IceCandidatePayload,
  ToggleMediaPayload
} from '../types/signaling';
import { roomManager } from '../services/roomManager';

export function registerSignalingHandlers(io: SocketIOServer): void {
  io.on('connection', (socket: Socket) => {
    /**
     * Ingressar na sala da consulta médica
     */
    socket.on('join-room', (payload: JoinRoomPayload) => {
      const { appointmentId, userId, userRole, userName } = payload || {};

      if (!appointmentId || !userId) {
        socket.emit('room-error', {
          appointmentId: appointmentId || '',
          message: 'Identificador da consulta (appointmentId) e do usuário (userId) são obrigatórios.'
        });
        return;
      }

      const joinResult = roomManager.joinRoom(appointmentId, {
        socketId: socket.id,
        userId,
        userRole: userRole || 'PACIENTE',
        userName: userName || 'Participante'
      });

      if (!joinResult.success) {
        socket.emit('room-full', {
          appointmentId,
          message: joinResult.error || 'A sala de teleconsulta já atingiu o limite de participantes.'
        });
        return;
      }

      // Adiciona o socket ao canal exclusivo do appointmentId
      socket.join(appointmentId);

      // Entrega a lista de usuários que já estavam na sala para o novo participante
      socket.emit('room-users', joinResult.existingParticipants);

      // Notifica os demais participantes da sala sobre o novo participante
      socket.to(appointmentId).emit('user-connected', {
        socketId: socket.id,
        userId,
        userRole: userRole || 'PACIENTE',
        userName: userName || 'Participante'
      });
    });

    /**
     * Encaminha SDP Offer para o par remoto
     */
    socket.on('offer', (payload: OfferPayload) => {
      if (payload?.toSocketId && payload?.sdp) {
        io.to(payload.toSocketId).emit('offer', {
          fromSocketId: socket.id,
          sdp: payload.sdp
        });
      }
    });

    /**
     * Encaminha SDP Answer de volta para o iniciador da oferta
     */
    socket.on('answer', (payload: AnswerPayload) => {
      if (payload?.toSocketId && payload?.sdp) {
        io.to(payload.toSocketId).emit('answer', {
          fromSocketId: socket.id,
          sdp: payload.sdp
        });
      }
    });

    /**
     * Encaminha rotas de rede ICE Candidates descobertas pelo STUN/TURN
     */
    socket.on('ice-candidate', (payload: IceCandidatePayload) => {
      if (payload?.toSocketId && payload?.candidate) {
        io.to(payload.toSocketId).emit('ice-candidate', {
          fromSocketId: socket.id,
          candidate: payload.candidate
        });
      }
    });

    /**
     * Notifica alteração de hardware/mídia (mute de microfone ou câmera desligada)
     */
    socket.on('toggle-media', (payload: ToggleMediaPayload) => {
      if (payload?.appointmentId && payload?.mediaType) {
        socket.to(payload.appointmentId).emit('peer-media-toggled', {
          socketId: socket.id,
          mediaType: payload.mediaType,
          enabled: payload.enabled
        });
      }
    });

    /**
     * Saída voluntária da sala
     */
    socket.on('leave-room', () => {
      handleUserExit(socket);
    });

    /**
     * Desconexão da conexão socket
     */
    socket.on('disconnect', () => {
      handleUserExit(socket);
    });
  });
}

function handleUserExit(socket: Socket): void {
  const result = roomManager.leaveRoom(socket.id);
  if (result.appointmentId && result.removedParticipant) {
    socket.leave(result.appointmentId);
    socket.to(result.appointmentId).emit('user-disconnected', {
      socketId: socket.id,
      userId: result.removedParticipant.userId,
      userName: result.removedParticipant.userName
    });
  }
}
