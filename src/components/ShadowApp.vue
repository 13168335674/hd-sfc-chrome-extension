<script setup>
import { onMounted, reactive, watchEffect, watch } from "vue";
import lStorage from "../utils/localstore";

import { WS_STATUS, CHROME_KEY } from "./config/constant";

const formData = reactive({
  port: lStorage.get("port") || 5000,
  enable: lStorage.get("enable") || true,
  hmrEnable: lStorage.get("hmrEnable") || false,
});

let wsInstance = null;

const useHMR = (src = "") => {
  const scriptEle = document.createElement("script");
  scriptEle.type = "module";
  scriptEle.src = src;
  document.body.appendChild(scriptEle);
};

const setWsStatusChange = (status = WS_STATUS.PROCESSING) => {
  chrome?.runtime?.sendMessage(
    { action: CHROME_KEY.STATUS_CHANGE, status },
    function (response) {
      console.log(`ADI-LOG => STATUS_CHANGE.`, status);
    }
  );
};

const setFormDataLocalstore = () => {
  // console.log("ADI-LOG => setFormDataLocalstore");
  Object.keys(formData).forEach((key) => {
    lStorage.set(key, formData[key]);
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
