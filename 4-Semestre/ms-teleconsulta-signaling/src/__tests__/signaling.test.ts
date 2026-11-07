import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { AddressInfo } from 'net';
import { io as Client, Socket as ClientSocket } from 'socket.io-client';
import { httpServer } from '../server';
import { roomManager } from '../services/roomManager';
import {
  RoomParticipant,
  UserConnectedPayload,
  RoomFullPayload,
  PeerMediaToggledPayload,
  UserDisconnectedPayload
} from '../types/signaling';

describe('Hub de Sinalização WebRTC — ms-teleconsulta-signaling (SPEC-16.2)', () => {
  let port: number;
  const activeSockets: ClientSocket[] = [];

  beforeAll(async () => {
    await new Promise<void>((resolve) => {
      httpServer.listen(0, () => {
        const addr = httpServer.address() as AddressInfo;
        port = addr.port;
        resolve();
      });
    });
  });

  afterAll(async () => {
    activeSockets.forEach((s) => {
      if (s.connected) s.disconnect();
    });
    await new Promise<void>((resolve) => {
      httpServer.close(() => resolve());
    });
  });

  beforeEach(() => {
    roomManager.clearAll();
  });

  function createClient(): Promise<ClientSocket> {
    return new Promise((resolve) => {
      const socket = Client(`http://localhost:${port}`, {
        transports: ['websocket'],
        forceNew: true
      });
      activeSockets.push(socket);
      socket.on('connect', () => {
        resolve(socket);
      });
    });
  }

  it('TC-SIG-01: deve permitir ao médico ingressar na sala e receber lista vazia de participantes anteriores', async () => {
    const doctorSocket = await createClient();

    const roomUsersPromise = new Promise<RoomParticipant[]>((resolve) => {
      doctorSocket.on('room-users', (users) => resolve(users));
    });

    doctorSocket.emit('join-room', {
      appointmentId: 'consulta-01',
      userId: 'medico-alan-turing',
      userRole: 'MEDICO',
      userName: 'Dr. Alan Turing'
    });

    const users = await roomUsersPromise;
    expect(users).toEqual([]);
    expect(roomManager.getParticipants('consulta-01').length).toBe(1);
    expect(roomManager.getParticipants('consulta-01')[0].userName).toBe('Dr. Alan Turing');
  });

  it('TC-SIG-02: deve notificar o médico quando a paciente ingressar e entregar a lista para a paciente', async () => {
    const doctorSocket = await createClient();
    const patientSocket = await createClient();

    // 1. Médico entra na sala
    await new Promise<void>((resolve) => {
      doctorSocket.emit('join-room', {
        appointmentId: 'consulta-02',
        userId: 'medico-alan-turing',
        userRole: 'MEDICO',
        userName: 'Dr. Alan Turing'
      });
      doctorSocket.once('room-users', () => resolve());
    });

    // 2. Paciente entra na mesma sala
    const doctorReceivedUserConnected = new Promise<UserConnectedPayload>((resolve) => {
      doctorSocket.once('user-connected', (data) => resolve(data));
    });

    const patientReceivedRoomUsers = new Promise<RoomParticipant[]>((resolve) => {
      patientSocket.once('room-users', (users) => resolve(users));
    });

    patientSocket.emit('join-room', {
      appointmentId: 'consulta-02',
      userId: 'paciente-dona-maria',
      userRole: 'PACIENTE',
      userName: 'Dona Maria'
    });

    const [userConnectedEvent, roomUsers] = await Promise.all([
      doctorReceivedUserConnected,
      patientReceivedRoomUsers
    ]);

    // O médico foi notificado da entrada da Dona Maria
    expect(userConnectedEvent.userId).toBe('paciente-dona-maria');
    expect(userConnectedEvent.userName).toBe('Dona Maria');
    expect(userConnectedEvent.userRole).toBe('PACIENTE');

    // A paciente recebeu a lista contendo o médico
    expect(roomUsers.length).toBe(1);
    expect(roomUsers[0].userId).toBe('medico-alan-turing');
    expect(roomUsers[0].userName).toBe('Dr. Alan Turing');
    expect(roomUsers[0].socketId).toBe(doctorSocket.id);

    expect(roomManager.getParticipants('consulta-02').length).toBe(2);
  });

  it('TC-SIG-03: deve bloquear o terceiro participante quando a sala atingir 2 pessoas (RN-SIG-02)', async () => {
    const doctorSocket = await createClient();
    const patientSocket = await createClient();
    const intruderSocket = await createClient();

    // 1. Entra o médico
    await new Promise<void>((resolve) => {
      doctorSocket.emit('join-room', {
        appointmentId: 'consulta-03',
        userId: 'med-1',
        userRole: 'MEDICO',
        userName: 'Dr. Alan'
      });
      doctorSocket.once('room-users', () => resolve());
    });

    // 2. Entra a paciente
    await new Promise<void>((resolve) => {
      patientSocket.emit('join-room', {
        appointmentId: 'consulta-03',
        userId: 'pac-1',
        userRole: 'PACIENTE',
        userName: 'Dona Maria'
      });
      patientSocket.once('room-users', () => resolve());
    });

    // 3. Terceiro tenta entrar
    const roomFullPromise = new Promise<RoomFullPayload>((resolve) => {
      intruderSocket.once('room-full', (data) => resolve(data));
    });

    intruderSocket.emit('join-room', {
      appointmentId: 'consulta-03',
      userId: 'intruso-3',
      userRole: 'PACIENTE',
      userName: 'Usuário Excedente'
    });

    const roomFullEvent = await roomFullPromise;
    expect(roomFullEvent.appointmentId).toBe('consulta-03');
    expect(roomFullEvent.message).toContain('limite máximo de 2 participantes');
    expect(roomManager.getParticipants('consulta-03').length).toBe(2);
  });

  it('TC-SIG-04 & 05: deve rotear SDP Offer e SDP Answer entre o médico e a paciente', async () => {
    const doctorSocket = await createClient();
    const patientSocket = await createClient();

    await new Promise<void>((resolve) => {
      doctorSocket.emit('join-room', {
        appointmentId: 'consulta-04',
        userId: 'med-1',
        userRole: 'MEDICO',
        userName: 'Dr. Alan'
      });
      doctorSocket.once('room-users', () => resolve());
    });

    await new Promise<void>((resolve) => {
      patientSocket.emit('join-room', {
        appointmentId: 'consulta-04',
        userId: 'pac-1',
        userRole: 'PACIENTE',
        userName: 'Dona Maria'
      });
      patientSocket.once('room-users', () => resolve());
    });

    // Médico envia Offer para Paciente
    const mockOfferSdp = { type: 'offer', sdp: 'v=0\r\no=ActiveAge 12345...' };
    const offerPromise = new Promise<{ fromSocketId: string; sdp: unknown }>((resolve) => {
      patientSocket.once('offer', (data) => resolve(data));
    });

    doctorSocket.emit('offer', {
      toSocketId: patientSocket.id,
      sdp: mockOfferSdp
    });

    const receivedOffer = await offerPromise;
    expect(receivedOffer.fromSocketId).toBe(doctorSocket.id);
    expect(receivedOffer.sdp).toEqual(mockOfferSdp);

    // Paciente responde com Answer para Médico
    const mockAnswerSdp = { type: 'answer', sdp: 'v=0\r\no=ActiveAge 67890...' };
    const answerPromise = new Promise<{ fromSocketId: string; sdp: unknown }>((resolve) => {
      doctorSocket.once('answer', (data) => resolve(data));
    });

    patientSocket.emit('answer', {
      toSocketId: doctorSocket.id,
      sdp: mockAnswerSdp
    });

    const receivedAnswer = await answerPromise;
    expect(receivedAnswer.fromSocketId).toBe(patientSocket.id);
    expect(receivedAnswer.sdp).toEqual(mockAnswerSdp);
  });

  it('TC-SIG-06: deve rotear ICE Candidates entre os participantes', async () => {
    const doctorSocket = await createClient();
    const patientSocket = await createClient();

    await new Promise<void>((resolve) => {
      doctorSocket.emit('join-room', {
        appointmentId: 'consulta-05',
        userId: 'med-1',
        userRole: 'MEDICO',
        userName: 'Dr. Alan'
      });
      doctorSocket.once('room-users', () => resolve());
    });

    await new Promise<void>((resolve) => {
      patientSocket.emit('join-room', {
        appointmentId: 'consulta-05',
        userId: 'pac-1',
        userRole: 'PACIENTE',
        userName: 'Dona Maria'
      });
      patientSocket.once('room-users', () => resolve());
    });

    const mockCandidate = { candidate: 'candidate:1 1 UDP 2130706431 192.168.1.1 50000 typ host', sdpMid: '0' };
    const candidatePromise = new Promise<{ fromSocketId: string; candidate: unknown }>((resolve) => {
      patientSocket.once('ice-candidate', (data) => resolve(data));
    });

    doctorSocket.emit('ice-candidate', {
      toSocketId: patientSocket.id,
      candidate: mockCandidate
    });

    const receivedCandidate = await candidatePromise;
    expect(receivedCandidate.fromSocketId).toBe(doctorSocket.id);
    expect(receivedCandidate.candidate).toEqual(mockCandidate);
  });

  it('TC-SIG-07: deve propagar evento toggle-media (mute de áudio / vídeo desligado)', async () => {
    const doctorSocket = await createClient();
    const patientSocket = await createClient();

    await new Promise<void>((resolve) => {
      doctorSocket.emit('join-room', {
        appointmentId: 'consulta-06',
        userId: 'med-1',
        userRole: 'MEDICO',
        userName: 'Dr. Alan'
      });
      doctorSocket.once('room-users', () => resolve());
    });

    await new Promise<void>((resolve) => {
      patientSocket.emit('join-room', {
        appointmentId: 'consulta-06',
        userId: 'pac-1',
        userRole: 'PACIENTE',
        userName: 'Dona Maria'
      });
      patientSocket.once('room-users', () => resolve());
    });

    const mediaTogglePromise = new Promise<PeerMediaToggledPayload>((resolve) => {
      doctorSocket.once('peer-media-toggled', (data) => resolve(data));
    });

    patientSocket.emit('toggle-media', {
      appointmentId: 'consulta-06',
      mediaType: 'audio',
      enabled: false
    });

    const mediaEvent = await mediaTogglePromise;
    expect(mediaEvent.socketId).toBe(patientSocket.id);
    expect(mediaEvent.mediaType).toBe('audio');
    expect(mediaEvent.enabled).toBe(false);
  });

  it('TC-SIG-08 & 09: deve notificar o par sobre a desconexão e desalocar a sala após o esvaziamento', async () => {
    const doctorSocket = await createClient();
    const patientSocket = await createClient();

    await new Promise<void>((resolve) => {
      doctorSocket.emit('join-room', {
        appointmentId: 'consulta-07',
        userId: 'med-1',
        userRole: 'MEDICO',
        userName: 'Dr. Alan'
      });
      doctorSocket.once('room-users', () => resolve());
    });

    await new Promise<void>((resolve) => {
      patientSocket.emit('join-room', {
        appointmentId: 'consulta-07',
        userId: 'pac-1',
        userRole: 'PACIENTE',
        userName: 'Dona Maria'
      });
      patientSocket.once('room-users', () => resolve());
    });

    expect(roomManager.getParticipants('consulta-07').length).toBe(2);

    // 1. Paciente desconecta
    const disconnectPromise = new Promise<UserDisconnectedPayload>((resolve) => {
      doctorSocket.once('user-disconnected', (data) => resolve(data));
    });

    patientSocket.disconnect();

    const disconnectEvent = await disconnectPromise;
    expect(disconnectEvent.userId).toBe('pac-1');
    expect(disconnectEvent.userName).toBe('Dona Maria');
    expect(roomManager.getParticipants('consulta-07').length).toBe(1);

    // 2. Médico desconecta
    doctorSocket.disconnect();
    // A sala deve ser completamente desalocada da memória (RN-SIG-04)
    await new Promise((r) => setTimeout(r, 50));
    expect(roomManager.getParticipants('consulta-07').length).toBe(0);
  });
});
