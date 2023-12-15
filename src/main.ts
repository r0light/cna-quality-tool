import { createApp } from 'vue'
import App from './App.vue'

// TODO workaround to avoid crashing error, seems to be a JointJS bug...
window.onerror = (error) => {
    if (error.toString().includes("TypeError: SVGPoint.y setter")) {
        console.log(error);
        return true;
    } else {
        return false;
    }
}

createApp(App).mount('#vapp')
