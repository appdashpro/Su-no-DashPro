export const safeStorage = {
  getItem: (key: string) => {
    try {
      return window.localStorage.getItem(key);
    } catch (e) {
      return null;
    }
  },
  setItem: (key: string, value: string) => {
    try {
      window.localStorage.setItem(key, value);
    } catch (e) {}
  },
  removeItem: (key: string) => {
    try {
      window.localStorage.removeItem(key);
    } catch (e) {}
  },
  clear: () => {
    try {
      window.localStorage.clear();
    } catch (e) {}
  },
  hasItem: (key: string) => {
    try {
      return key in window.localStorage;
    } catch (e) {
      return false;
    }
  }
};
