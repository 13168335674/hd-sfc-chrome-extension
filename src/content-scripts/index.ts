import { createApp } from "vue";
import ShadowApp from "../components/ShadowApp.vue";

const root = document.createElement("div");
root.id = "hd-sfc-chrome-extension-app";

document.body.append(root);

createApp(ShadowApp).mount(root);
