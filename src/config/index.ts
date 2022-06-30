import pck from "../../package.json";

const prefix = pck.name.split("-").join("_");

export const localStorePrefix = (prefix + "__local__").toUpperCase();
