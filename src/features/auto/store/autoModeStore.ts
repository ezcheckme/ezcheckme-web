import { create } from "zustand";
import type { AutoSession } from "@/shared/types/session.types";

interface AutoModeState {
  room: string | null;
  rooms: string[];
  sessions: AutoSession[];
  isLoading: boolean;
  error: string | null;

  setRoom: (room: string | null) => void;
  setRooms: (rooms: string[]) => void;
  setSessions: (sessions: AutoSession[]) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  config: { registrationDuration: number };
  setConfig: (config: { registrationDuration: number }) => void;
}

export const useAutoModeStore = create<AutoModeState>((set) => ({
  room: null,
  rooms: [], // Inferred from user data or fetched
  sessions: [],
  isLoading: false,
  error: null,

  setRoom: (room) => {
    // Persist room selection to local storage as per the old app
    if (room) {
      localStorage.setItem("_room_", JSON.stringify(room));
    } else {
      localStorage.removeItem("_room_");
    }
    set({ room });
  },

  setRooms: (rooms) => set({ rooms }),
  setSessions: (sessions) => set({ sessions }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  config: { registrationDuration: 7 },
  setConfig: (config) => set({ config }),
}));
