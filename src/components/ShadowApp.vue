<script setup>
import { onMounted, reactive, watchEffect, watch } from "vue";
import lStorage from "../utils/localstore";
import { runScript, appendScript } from "../utils";

import { WS_STATUS, CHROME_KEY } from "./config/constant";

import pkg from '../../package.json';

const formData = reactive({
  port: lStorage.get("port") || 5000,
  enable: lStorage.get("enable") || false,
  hmrEnable: lStorage.get("hmrEnable") || false,
});

let wsInstance = null;

const useHMR = (src = "") => {
  appendScript(src);
  runScript(
    `HD_SFC_CHROME_EXTENSION__LOCAL__HMR_HOOK  && HD_SFC_CHROME_EXTENSION__LOCAL__HMR_HOOK()`
  );
};

const setWsStatusChange = (status = WS_STATUS.PROCESSING) => {
  chrome?.runtime?.sendMessage(
    { action: CHROME_KEY.STATUS_CHANGE, status },
    (result) => {
      if (!window.chrome.runtime.lastError) {
        // message processing code goes here
      } else {
        // error handling code goes here
      }
    }
  );
};

const setFormDataLocalstore = () => {
  // console.log("ADI-LOG => setFormDataLocalstore");
  Object.keys(formData).forEach((key) => {
    lStorage.set(key, formData[key]);
  });
  lStorage.set("version", pkg.version);
};

watchEffect(() => {
  setFormDataLocalstore();
  createServe(formData.port);
});

watch(formData, () => {
  setFormDataLocalstore();
  createServe(formData.port);
});

onMounted(() => {
  initChromeListener();
});

function initChromeListener() {
  chrome?.runtime?.onMessage.addListener(function (
    request,
    sender,
    sendResponse
  ) {
    switch (request.action) {
      case CHROME_KEY.START_SERVER: {
        // console.log("ADI-LOG => request, sender", request, sender);
        const { port, enable, hmrEnable } = request;

        formData.port = port;
        formData.enable = enable;
        formData.hmrEnable = hmrEnable;
        sendResponse(port);
        break;
      }
    }
  });
}

function initHdSfcChromeExtensionLocalHmrHook(localHost) {
  const src = `${localHost}/.vscode/HD_SFC_CHROME_EXTENSION/hooks/hmr.js`;
  appendScript(src);
}

function createServe(port) {
  if (wsInstance) {
    wsInstance.close();
  }
  if (!formData.enable) {
    return;
  }
  const wsHost = `ws://localhost:${port}`;
  const localHost = `http://localhost:${port}`;
  wsInstance = new WebSocket(wsHost);

  setWsStatusChange(WS_STATUS.PROCESSING);

  wsInstance.onopen = function () {
    setWsStatusChange(WS_STATUS.SUCCESS);
    formData.hmrEnable && initHdSfcChromeExtensionLocalHmrHook(localHost);
  };

  wsInstance.onerror = function () {
    setWsStatusChange(WS_STATUS.ERROR);
  };

  wsInstance.onmessage = function (event) {
    // console.log("ADI-LOG => onMessage", event.data);
    let data = event.data;
    try {
      data = JSON.parse(event.data);
    } catch (error) {}
    if (formData.hmrEnable && data.useHMR) {
      const src = `${localHost}/${data.file}?hrmKey=${new Date().getTime()}`;
      useHMR(src);
    } else {
      // console.log("ADI-LOG => reload");
      location.reload();
    }
  };
}
</script>
