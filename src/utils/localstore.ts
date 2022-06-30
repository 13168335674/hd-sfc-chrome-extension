import { localStorePrefix } from "../config";

export default {
  set(key: string, value: any) {
    localStorage.setItem(localStorePrefix + key, JSON.stringify(value));
  },
  get(key: string) {
    const value = localStorage.getItem(localStorePrefix + key);
    return value ? JSON.parse(value) : value;
  },
  remove(key: string) {
    localStorage.removeItem(localStorePrefix + key);
  },
};
