import { useState, useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

export type WebRTCConnectionStatus =
  | 'idle'
  | 'acquiring'
  | 'waiting'
  | 'connected'
  | 'reconnecting'
  | 'disconnected'
  | 'error';

interface UseWebRTCOptions {
  appointmentId?: string;
  userId?: string;
  userRole?: string;
  userName?: string;
  enabled?: boolean;
}

interface PeerMediaToggledEvent {
  socketId: string;
  mediaType: 'audio' | 'video';
  enabled: boolean;
}

interface UserConnectedEvent {
  socketId: string;
  userId: string;
  userRole: string;
  userName: string;
}

interface RoomParticipant {
  socketId: string;
  userId: string;
  userRole: string;
  userName: string;
}

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
  ],
};

function formatMediaErrorMessage(err: unknown): string {
  if (err instanceof DOMException) {
    if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
      return 'O acesso à câmera e microfone foi bloqueado pelo seu navegador. Por favor, clique no ícone de cadeado 🔒 na barra de endereços do seu navegador e autorize o acesso à Câmera e Microfone.';
    }
    if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
      return 'Nenhum dispositivo de câmera ou microfone foi detectado no seu computador ou celular. Verifique se estão devidamente conectados.';
    }
    if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
      return 'Sua câmera ou microfone já estão em uso por outro aplicativo (Zoom, Teams ou outra aba). Feche outros programas e tente novamente.';
    }
  }
  return 'Não foi possível acessar a câmera ou microfone. Verifique as configurações de mídia do seu navegador.';
}

export function useWebRTC({
  appointmentId,
  userId,
  userRole,
  userName,
  enabled = true,
}: UseWebRTCOptions) {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<WebRTCConnectionStatus>('idle');
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [peerMuted, setPeerMuted] = useState(false);
  const [peerVideoOff, setPeerVideoOff] = useState(false);
  const [peerName, setPeerName] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const socketRef = useRef<Socket | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const remoteSocketIdRef = useRef<string | null>(null);
  const iceCandidatesBufferRef = useRef<RTCIceCandidateInit[]>([]);
  const localStreamRef = useRef<MediaStream | null>(null);

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);

  // Vincula localStream ao elemento de vídeo local
  useEffect(() => {
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  // Vincula remoteStream ao elemento de vídeo remoto
  useEffect(() => {
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  // Limpa candidatos ICE acumulados na fila de buffer
  const drainIceCandidates = useCallback(async (pc: RTCPeerConnection) => {
    while (iceCandidatesBufferRef.current.length > 0) {
      const candidate = iceCandidatesBufferRef.current.shift();
      if (candidate) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch {
          // Candidato expirado ou descartado
        }
      }
    }
  }, []);

  // Criação e configuração do RTCPeerConnection com Resiliência (ICE Restart)
  const createPeerConnection = useCallback(
    (targetSocketId: string): RTCPeerConnection => {
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }

      const pc = new RTCPeerConnection(ICE_SERVERS);
      peerConnectionRef.current = pc;
      remoteSocketIdRef.current = targetSocketId;

      // Adiciona as faixas do stream local à conexão
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => {
          pc.addTrack(track, localStreamRef.current!);
        });
      }

      // Recebimento de stream do par remoto
      pc.ontrack = (event) => {
        if (event.streams && event.streams[0]) {
          setRemoteStream(event.streams[0]);
          setConnectionStatus('connected');
        }
      };

      // Descoberta e envio de rotas ICE Candidates
      pc.onicecandidate = (event) => {
        if (event.candidate && socketRef.current) {
          socketRef.current.emit('ice-candidate', {
            toSocketId: targetSocketId,
            candidate: event.candidate,
          });
        }
      };

      // Monitoramento de alterações de estado de conexão
      pc.onconnectionstatechange = () => {
        switch (pc.connectionState) {
          case 'connected':
            setConnectionStatus('connected');
            break;
          case 'disconnected':
          case 'failed':
            setConnectionStatus('reconnecting');
            break;
          case 'closed':
            setConnectionStatus('disconnected');
            break;
        }
      };

      // Resiliência de Rede: Detecção de queda ICE e tentativa automática de ICE Restart
      pc.oniceconnectionstatechange = async () => {
        if (pc.iceConnectionState === 'failed' || pc.iceConnectionState === 'disconnected') {
          setConnectionStatus('reconnecting');
          if (remoteSocketIdRef.current && socketRef.current) {
            try {
              const offer = await pc.createOffer({ iceRestart: true });
              await pc.setLocalDescription(offer);
              socketRef.current.emit('offer', {
                toSocketId: remoteSocketIdRef.current,
                sdp: offer,
              });
            } catch {
              // Silencioso em caso de tentativa de renegotiate concorrente
            }
          }
        } else if (pc.iceConnectionState === 'connected' || pc.iceConnectionState === 'completed') {
          setConnectionStatus('connected');
        }
      };

      return pc;
    },
    []
  );

  // Inicialização do WebRTC e conexão de sinalização
  useEffect(() => {
    if (!enabled || !appointmentId || !userId) {
      return;
    }

    let isMounted = true;
    setConnectionStatus('acquiring');

    const envSignalingUrl =
      import.meta.env.VITE_SIGNALING_URL ||
      (import.meta.env as unknown as Record<string, string | undefined>)['SIGNALING_URL'];

    const signalingUrl =
      envSignalingUrl ||
      (import.meta.env.PROD
        ? 'https://active-age-signaling.onrender.com'
        : 'http://localhost:3001');

    async function startCall() {
      // 1. Aquisição de Mídia Local (Webcam + Microfone)
      let stream: MediaStream | null = null;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
      } catch (mediaErr) {
        // Fallback: tenta apenas áudio se a câmera estiver ocupada ou bloqueada
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: false,
            audio: true,
          });
          setIsVideoOff(true);
        } catch {
          if (isMounted) {
            setErrorMessage(formatMediaErrorMessage(mediaErr));
            setConnectionStatus('error');
          }
          return;
        }
      }

      if (!isMounted) {
        stream?.getTracks().forEach((t) => t.stop());
        return;
      }

      localStreamRef.current = stream;
      setLocalStream(stream);
      setConnectionStatus('waiting');

      // 2. Conexão ao Servidor de Sinalização Socket.io
      const socket = io(signalingUrl, {
        transports: ['websocket', 'polling'],
        forceNew: true,
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
      });
      socketRef.current = socket;

      socket.on('connect', () => {
        socket.emit('join-room', {
          appointmentId,
          userId,
          userRole: userRole || 'PACIENTE',
          userName: userName || 'Participante',
        });
      });

      // Reconexão automática em caso de oscilação momentânea do Wi-Fi
      socket.on('reconnect', () => {
        if (!isMounted) return;
        setConnectionStatus('waiting');
        socket.emit('join-room', {
          appointmentId,
          userId,
          userRole: userRole || 'PACIENTE',
          userName: userName || 'Participante',
        });
      });

      // Lista de participantes que já estavam na sala ao entrar
      socket.on('room-users', async (existingUsers: RoomParticipant[]) => {
        if (!isMounted) return;

        if (existingUsers && existingUsers.length > 0) {
          const peer = existingUsers[0];
          setPeerName(peer.userName);
          const pc = createPeerConnection(peer.socketId);

          try {
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            socket.emit('offer', {
              toSocketId: peer.socketId,
              sdp: offer,
            });
          } catch {
            setConnectionStatus('error');
          }
        } else {
          setConnectionStatus('waiting');
        }
      });

      // Outro usuário entrou na sala
      socket.on('user-connected', (newUser: UserConnectedEvent) => {
        if (!isMounted) return;
        setPeerName(newUser.userName);
        remoteSocketIdRef.current = newUser.socketId;
      });

      // Recebimento de Proposta SDP (Offer)
      socket.on('offer', async (data: { fromSocketId: string; sdp: RTCSessionDescriptionInit }) => {
        if (!isMounted) return;
        const pc = createPeerConnection(data.fromSocketId);

        try {
          await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
          await drainIceCandidates(pc);

          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);

          socket.emit('answer', {
            toSocketId: data.fromSocketId,
            sdp: answer,
          });
        } catch {
          setConnectionStatus('error');
        }
      });

      // Recebimento de Resposta SDP (Answer)
      socket.on('answer', async (data: { fromSocketId: string; sdp: RTCSessionDescriptionInit }) => {
        if (!isMounted) return;
        const pc = peerConnectionRef.current;
        if (pc) {
          try {
            await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
            await drainIceCandidates(pc);
          } catch {
            // Falha ao aplicar remote description
          }
        }
      });

      // Recebimento de Candidato ICE (STUN/TURN)
      socket.on('ice-candidate', async (data: { fromSocketId: string; candidate: RTCIceCandidateInit }) => {
        if (!isMounted) return;
        const pc = peerConnectionRef.current;

        if (pc && pc.remoteDescription && pc.remoteDescription.type) {
          try {
            await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
          } catch {
            // Candidato descartado
          }
        } else {
          iceCandidatesBufferRef.current.push(data.candidate);
        }
      });

      // Notificação de controle de mídia do par remoto (mute de áudio / câmera)
      socket.on('peer-media-toggled', (data: PeerMediaToggledEvent) => {
        if (!isMounted) return;
        if (data.mediaType === 'audio') {
          setPeerMuted(!data.enabled);
        } else if (data.mediaType === 'video') {
          setPeerVideoOff(!data.enabled);
        }
      });

      // Desconexão do par remoto
      socket.on('user-disconnected', () => {
        if (!isMounted) return;
        setRemoteStream(null);
        setConnectionStatus('waiting');
        setPeerName(null);
        if (peerConnectionRef.current) {
          peerConnectionRef.current.close();
          peerConnectionRef.current = null;
        }
      });

      // Sala cheia (RN-SIG-02)
      socket.on('room-full', (data: { message: string }) => {
        if (!isMounted) return;
        setErrorMessage(data.message || 'A sala de teleconsulta já atingiu o limite de participantes.');
        setConnectionStatus('error');
      });

      socket.on('connect_error', () => {
        if (!isMounted) return;
        setConnectionStatus('reconnecting');
      });
    }

    startCall();

    // Desligamento físico e liberação de recursos (RN-FRONT-01)
    return () => {
      isMounted = false;

      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => {
          track.stop();
        });
        localStreamRef.current = null;
      }

      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
      }

      if (socketRef.current) {
        socketRef.current.emit('leave-room');
        socketRef.current.disconnect();
        socketRef.current = null;
      }

      iceCandidatesBufferRef.current = [];
    };
  }, [appointmentId, userId, userRole, userName, enabled, createPeerConnection, drainIceCandidates]);

  // Alternar Mute de Áudio Local
  const toggleAudio = useCallback(() => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        const nextState = !audioTrack.enabled;
        audioTrack.enabled = nextState;
        setIsMuted(!nextState);

        if (socketRef.current && appointmentId) {
          socketRef.current.emit('toggle-media', {
            appointmentId,
            mediaType: 'audio',
            enabled: nextState,
          });
        }
      }
    }
  }, [appointmentId]);

  // Alternar Câmera de Vídeo Local
  const toggleVideo = useCallback(() => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        const nextState = !videoTrack.enabled;
        videoTrack.enabled = nextState;
        setIsVideoOff(!nextState);

        if (socketRef.current && appointmentId) {
          socketRef.current.emit('toggle-media', {
            appointmentId,
            mediaType: 'video',
            enabled: nextState,
          });
        }
      }
    }
  }, [appointmentId]);

  // Tentativa de recuperação de mídia (permissões ou periféricos) sem recarregar a tela
  const retryMedia = useCallback(async () => {
    setConnectionStatus('acquiring');
    setErrorMessage(null);

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      localStreamRef.current = stream;
      setLocalStream(stream);
      setIsVideoOff(false);
      setIsMuted(false);
      setConnectionStatus(remoteStream ? 'connected' : 'waiting');

      // Se houver conexão aberta, substitui as faixas de mídia
      if (peerConnectionRef.current) {
        const senders = peerConnectionRef.current.getSenders();
        stream.getTracks().forEach((track) => {
          const sender = senders.find((s) => s.track?.kind === track.kind);
          if (sender) {
            sender.replaceTrack(track);
          } else {
            peerConnectionRef.current?.addTrack(track, stream);
          }
        });
      }
    } catch (mediaErr) {
      try {
        const audioOnlyStream = await navigator.mediaDevices.getUserMedia({
          video: false,
          audio: true,
        });
        localStreamRef.current = audioOnlyStream;
        setLocalStream(audioOnlyStream);
        setIsVideoOff(true);
        setConnectionStatus(remoteStream ? 'connected' : 'waiting');
      } catch (audioErr) {
        setErrorMessage(formatMediaErrorMessage(audioErr));
        setConnectionStatus('error');
      }
    }
  }, [remoteStream]);

  // Saída voluntária da sala
  const leaveRoom = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    if (socketRef.current) {
      socketRef.current.emit('leave-room');
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    setLocalStream(null);
    setRemoteStream(null);
    setConnectionStatus('disconnected');
  }, []);

  return {
    localStream,
    remoteStream,
    connectionStatus,
    isMuted,
    isVideoOff,
    peerMuted,
    peerVideoOff,
    peerName,
    errorMessage,
    retryMedia,
    toggleAudio,
    toggleVideo,
    leaveRoom,
    localVideoRef,
    remoteVideoRef,
  };
}
