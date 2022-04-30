import { localStorePrefix } from "../config";


export default {
  set(key, value) {
    localStorage.setItem(localStorePrefix + key, JSON.stringify(value));
  },
  get(key) {
    return JSON.parse(localStorage.getItem(localStorePrefix + key));
  },
  remove(key) {
    localStorage.removeItem(localStorePrefix + key);
  },
};
