<script setup lang="ts">
import { onMounted, reactive, watch } from "vue";
import lStorage from "../utils/localstore";

import { WS_STATUS, CHROME_KEY } from "./config/constant";

import pkg from "../../package.json";

interface IFormData {
  port: number;
  enable: boolean;
  hmrEnable: boolean;
}

const formData: IFormData = reactive({
  port: lStorage.get("port") || 5000,
  enable: lStorage.get("enable") || true,
  hmrEnable: lStorage.get("hmrEnable") || false,
});

let wsInstance: WebSocket | null = null;

const useHMR = (src = "") => {
  const scriptEle = document.createElement("script");
  scriptEle.type = "module";
  scriptEle.src = src;
  document.body.appendChild(scriptEle);
};

const setWsStatusChange = (status = WS_STATUS.PROCESSING) => {
  chrome?.runtime?.sendMessage(
    { action: CHROME_KEY.STATUS_CHANGE, status },
    (result) => {
      if (!chrome.runtime.lastError) {
        // message processing code goes here
      } else {
        // error handling code goes here
      }
    }
  );
};

const setFormDataLocalstore = () => {
  // console.log("ADI-LOG => setFormDataLocalstore");
  type keyType = keyof typeof formData;
  Object.keys(formData).forEach((key) => {
    lStorage.set(key, formData[key as keyType]);
  });
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

function initHdSfcChromeExtensionLocalHmrHook(localHost: string) {
  const src = `${localHost}/.vscode/HD_SFC_CHROME_EXTENSION/hooks/hmr.js`;
  appendScript(src);
}

function createServe(port: number) {
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
  };

  wsInstance.onerror = function () {
    setWsStatusChange(WS_STATUS.ERROR);
  };

  wsInstance.onmessage = function (event: any) {
    setWsStatusChange(WS_STATUS.SUCCESS);
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
