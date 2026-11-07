export type UserRole = 'MEDICO' | 'PACIENTE' | 'ADMIN' | string;

export interface RoomParticipant {
  socketId: string;
  userId: string;
  userRole: UserRole;
  userName: string;
}

export interface JoinRoomPayload {
  appointmentId: string;
  userId: string;
  userRole: UserRole;
  userName: string;
}

export interface OfferPayload {
  toSocketId: string;
  sdp: unknown;
}

export interface AnswerPayload {
  toSocketId: string;
  sdp: unknown;
}

export interface IceCandidatePayload {
  toSocketId: string;
  candidate: unknown;
}

export interface ToggleMediaPayload {
  appointmentId: string;
  mediaType: 'audio' | 'video';
  enabled: boolean;
}

export interface PeerMediaToggledPayload {
  socketId: string;
  mediaType: 'audio' | 'video';
  enabled: boolean;
}

export interface UserConnectedPayload {
  socketId: string;
  userId: string;
  userRole: UserRole;
  userName: string;
}

export interface UserDisconnectedPayload {
  socketId: string;
  userId?: string;
  userName?: string;
}

export interface RoomFullPayload {
  appointmentId: string;
  message: string;
}
