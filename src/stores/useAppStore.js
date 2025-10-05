import { create } from 'zustand';

const DOMAINS = ['auth', 'wardrobe', 'settings'];

const createInitialStatus = () => DOMAINS.reduce((acc, domain) => {
  acc[domain] = { loading: true, error: null };
  return acc;
}, {});

const evaluateAppReady = (status) => DOMAINS.every((domain) => {
  const info = status[domain];
  return info && info.loading === false && !info.error;
});

export const useAppStore = create((set) => ({
  domainStatus: createInitialStatus(),
  appReady: false,

  startLoading: (domain) => {
    if (!DOMAINS.includes(domain)) return;
    set((state) => {
      const domainStatus = {
        ...state.domainStatus,
        [domain]: {
          loading: true,
          error: null,
        },
      };
      return {
        domainStatus,
        appReady: evaluateAppReady(domainStatus),
      };
    });
  },

  finishLoading: (domain) => {
    if (!DOMAINS.includes(domain)) return;
    set((state) => {
      const domainStatus = {
        ...state.domainStatus,
        [domain]: {
          loading: false,
          error: null,
        },
      };
      return {
        domainStatus,
        appReady: evaluateAppReady(domainStatus),
      };
    });
  },

  setDomainError: (domain, error) => {
    if (!DOMAINS.includes(domain)) return;
    set((state) => {
      const domainStatus = {
        ...state.domainStatus,
        [domain]: {
          loading: false,
          error,
        },
      };
      return {
        domainStatus,
        appReady: evaluateAppReady(domainStatus),
      };
    });
  },

  clearDomainError: (domain) => {
    if (!DOMAINS.includes(domain)) return;
    set((state) => {
      const current = state.domainStatus[domain] || { loading: false, error: null };
      const domainStatus = {
        ...state.domainStatus,
        [domain]: {
          ...current,
          error: null,
        },
      };
      return {
        domainStatus,
        appReady: evaluateAppReady(domainStatus),
      };
    });
  },

  resetAppState: () => {
    const domainStatus = createInitialStatus();
    set({ domainStatus, appReady: false });
  },
}));
