<script setup>
import { ref, reactive, watch, onMounted, computed } from "vue";
import lStorage from "../utils/localstore";
import { WS_STATUS, CHROME_KEY } from "./config/constant";

const loading = ref(false);

const formData = reactive({
  port: lStorage.get("port") || 5000,
  status: lStorage.get("status") || WS_STATUS.PROCESSING,
  enable: lStorage.get("enable") || false,
  hmrEnable: lStorage.get("hmrEnable") || false,
});

const setFormDataLocalstore = () => {
  // console.log("ADI-LOG => setFormDataLocalstore");
  Object.keys(formData).forEach((key) => {
    lStorage.set(key, formData[key]);
  });
};

const startServerMain = () => {
  // console.log("ADI-LOG => startServerMain");
  const { port, enable, hmrEnable } = formData;
  chrome?.tabs?.query({ active: true, currentWindow: true }, function (tabs) {
    chrome?.tabs?.sendMessage(
      tabs[0].id,
      {
        action: CHROME_KEY.START_SERVER,
        port,
        enable,
        hmrEnable,
      },
      function (response) {
        console.log("ADI-LOG => START_SERVER response", response);
      }
    );
  });
};

const statusMsg = computed(() => {
  if (!formData.enable) return "Server is not running";
  switch (formData.status) {
    case WS_STATUS.SUCCESS:
      return "Server is running";
    case WS_STATUS.ERROR:
      return "Server is not running";
    case WS_STATUS.PROCESSING:
      return "Server is processing";
    default:
      return "Server is not running";
  }
});
const statusType = computed(() => {
  if (!formData.enable) return "warning";
  switch (formData.status) {
    case WS_STATUS.SUCCESS:
      return "success";
    case WS_STATUS.ERROR:
      return "error";
    case WS_STATUS.PROCESSING:
      return "warning";
    default:
      return "warning";
  }
});

function initChromeListener() {
  chrome?.runtime?.onMessage.addListener(function (request, sender, sendResponse) {
    switch (request.action) {
      case CHROME_KEY.STATUS_CHANGE: {
        formData.status = request.status;
        console.log(`ADI-LOG => STATUS_CHANGE`, request.status);
        break;
      }
    }
    sendResponse();
  });
}

function onFinish(values) {
  setFormDataLocalstore();
  startServerMain();
  // console.log("ADI-LOG => onFinish:", values, formData);
}

watch([() => formData.enable, () => formData.hmrEnable], () => {
  setFormDataLocalstore();
  startServerMain();
});

onMounted(() => {
  initChromeListener();
});
</script>

<template>
  <a-alert
    :message="statusMsg"
    title="HD Extension"
    :type="statusType"
    show-icon
    banner
  ></a-alert>
  <a-card :loading="loading" title="HD Extension" class="cardBox">
    <a-form :model="formData" name="basic" autocomplete="off" @finish="onFinish">
      <a-form-item label="是否启用:" name="enable">
        <a-switch v-model:checked="formData.enable" />
      </a-form-item>
      <a-form-item label="热更新:" name="hmrEnable">
        <a-switch v-model:checked="formData.hmrEnable" />
      </a-form-item>
      <a-form-item label="端口号:" name="port">
        <a-input v-model:value="formData.port" class="form__port" />
      </a-form-item>

      <a-form-item style="text-align: right">
        <a-button type="primary" html-type="submit" class="form__submit">SYNC</a-button>
      </a-form-item>
    </a-form>
  </a-card>
</template>

<style lang="scss" scoped>
.cardBox {
  max-height: 500px;
  overflow: auto;
  .form__port {
    background: #e5e5e5;
    color: #5c5c5c;
    padding: 6px 14px;
    &:hover, &:focus {
      border-color: #d9d9d9;
    }
  }
  .form__submit {
    background: #4285f4;
    display: block;
    width: 100%;
    border-radius: 4px;
    padding: 4px 15px;
    height: 36px;
  }
}
</style>

<style lang="scss">
.cardBox {
  .ant-card-head-title {
    color: #4285f4;
    font-weight: bold;
    font-size: 22px;
  }
  .ant-form-item-label > label {
    color: #666;
  }
}
</style>
