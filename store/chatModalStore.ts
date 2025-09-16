
// store/chatModalStore.ts
import { create } from "zustand";

interface ChatModalState {
  isModalOpen: boolean;
  selectedConvId: string | null;
  selectedConvTitle: string;

  openModal: (id: string, title: string) => void;
  closeModal: () => void;
}

export const useChatModalStore = create<ChatModalState>((set) => ({
  isModalOpen: false,
  selectedConvId: null,
  selectedConvTitle: "",

  openModal: (id, title) =>
    set({
      isModalOpen: true,
      selectedConvId: id,
      selectedConvTitle: title,
    }),

  closeModal: () =>
    set({
      isModalOpen: false,
      selectedConvId: null,
      selectedConvTitle: "",
    }),
}));
