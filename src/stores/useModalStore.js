import { create } from 'zustand';

export const ModalTypes = {
  ADD_CLOTH: 'ADD_CLOTH',
  ADD_OUTFIT: 'ADD_OUTFIT',
  IMPORT_DATA: 'IMPORT_DATA',
};

export const useModalStore = create((set) => ({
  currentModal: null,
  modalProps: {},
  openModal: (modalType, props = {}) => set({ currentModal: modalType, modalProps: props }),
  closeModal: () => set({ currentModal: null, modalProps: {} }),
}));
