import { create } from "zustand";

interface DsnFile {
  name: string;
  size: number;
  content?: string;
}

interface DsnUploadState {
  // State
  selectedFile: File | null;
  uploadedFile: DsnFile | null;
  isUploading: boolean;
  error: string | null;

  // Actions
  setSelectedFile: (file: File | null) => void;
  setUploadedFile: (file: DsnFile | null) => void;
  setUploading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  reset: () => void;
}

export const useDsnUploadStore = create<DsnUploadState>(set => ({
  // Initial state
  selectedFile: null,
  uploadedFile: null,
  isUploading: false,
  error: null,

  // Actions
  setSelectedFile: file => {
    set({ selectedFile: file, error: null });
  },

  setUploadedFile: file => {
    set({ uploadedFile: file });
  },

  setUploading: loading => {
    set({ isUploading: loading });
  },

  setError: error => {
    set({ error });
  },

  clearError: () => set({ error: null }),

  reset: () =>
    set({
      selectedFile: null,
      uploadedFile: null,
      isUploading: false,
      error: null,
    }),
}));
