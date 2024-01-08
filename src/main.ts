import {createApp} from "vue";
import VueFeather from "vue-feather";
import App from "./App.vue";
import "./styles/main.scss";

const app = createApp(App);
app.component(VueFeather.name, VueFeather);
app.mount("#app").$nextTick(() => postMessage({payload: "removeLoading"}, "*"));
