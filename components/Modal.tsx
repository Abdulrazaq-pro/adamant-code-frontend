import React from "react";
import { createPortal } from "react-dom";
import { useChatModalStore } from "@/store/chatModalStore";
import { useChatStore } from "@/store/chatStore";

interface ModalProps {
  onDelete?: () => Promise<void> | void;
}

export default function Modal({ onDelete }: ModalProps) {
  const { isModalOpen, selectedConvId, selectedConvTitle, closeModal } =
    useChatModalStore();
  const { deleteConversation } = useChatStore();

  if (!isModalOpen) return null;

  const handleDelete = async () => {
    if (onDelete) {
      await onDelete();
    } else {
      if (selectedConvId) await deleteConversation(selectedConvId);
    }
    closeModal();
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* backdrop (does not intercept clicks) */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm pointer-events-none" />

      {/* modal content (receives clicks) */}
      <div className="relative bg-white p-6 rounded-xl shadow-lg max-w-sm w-full text-center pointer-events-auto">
        <p className="text-gray-800 mb-6">
          Are you sure you want to delete{" "}
          <span className="font-semibold">{selectedConvTitle}</span>?
        </p>
        <div className="flex justify-center gap-4">
          <button
            onClick={closeModal}
            className="px-4 py-2 rounded-lg bg-purple-100 text-purple-700 hover:bg-purple-200"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
