import { createApp } from 'vue'
import { createRouter, createWebHashHistory, createWebHistory } from 'vue-router';
import RouteApp from './RouteApp.vue'
import Home from './Home.vue';

// TODO workaround to avoid crashing error, seems to be a JointJS bug...
window.onerror = (error) => {
    if (error.toString().includes("TypeError: SVGPoint.y setter")) {
        console.log(error);
        return true;
    } else {
        return false;
    }
}

const routes = [
];

const router = createRouter({
    // 4. Provide the history implementation to use. We
    // are using the hash history for simplicity here.
    history: createWebHistory(),
    routes, // short for `routes: routes`
})


const app = createApp(RouteApp)

app.use(router)

app.mount('#vapp')

