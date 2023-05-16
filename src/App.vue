<template>
  <header>
    <nav class="navbar navbar-expand navbar-light bg-dark text-white">
      <div class="collapse navbar-collapse" id="navbarSupportedContent">
        <div class="navbar-header">
          <a class="navbar-brand text-muted"><i class="fa-solid fa-cube"></i> CNA Modeling</a>
        </div>
        <ul class="navbar-nav mr-auto">
          <li class="nav-item">
            <a id="homeMenuItem" class="nav-link text-white" href="index.html" data-entry-module="src/home"
              data-menu-index="1"><i class="fa fa-fw fa-home"></i> Home</a>
          </li>
          <li class="nav-item">
            <a id="modelingApplicationMenuItem" class="nav-link text-white" href="index.html"
              data-entry-module="src/modeling/modelingApp" data-menu-index="2"><i class="fa-solid fa-pencil"></i> Modeling
              Application</a>
          </li>
        </ul>
      </div>
    </nav>
  </header>

  <!-- Content -->
  
  <main role="main" ref="mainSection" class="flex-grow-1">
    <!-- The content to load goes here -->
    <Home v-if="currentPage === 1"></Home>
    <ModelingApp v-if="currentPage === 2"></ModelingApp>
  </main>
</template>

<script lang="ts" setup>
import $ from 'jquery';
import { ref } from "vue";
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import Home from './Home.vue';
import ModelingApp from './modeling/ModelingApp.vue';
import { ModelingApplication } from './modeling/modelingApp';


const currentPage = ref(1);

// TODO reload resets modeling application => name disappears --> overlay or save
window.onload = () => {


  // get element to which the content is supposed to be added
  //const mainSection = document.querySelector("main");

  // create the Modeling Application Object
  //const modelingApp = new ModelingApplication();

  // render required content dynamically and only if needed
  const menuItems = document.querySelectorAll("a[data-entry-module]");
  const navbarItems = new Map();
  for (const menuItem of menuItems) {
    navbarItems.set(menuItem["dataset"].menuIndex, menuItem.parentNode);
    menuItem.addEventListener("click", async (event) => {
      // prevent loading href since it is dynamically rendered
      event.preventDefault();

      const activeElement = document.querySelector("li.active");
      activeElement?.classList.remove("active");
      menuItem.parentNode["classList"].add("active");

      document.title = "CNA Modeling:";
      if (menuItem["dataset"].entryModule.includes("modeling")) {
        currentPage.value = 2;
        sessionStorage.setItem("currentMenuSelectionIndex", menuItem["dataset"].menuIndex);
        triggerModelingApplicationFirstLoad();
        document.title += " Modeling Application";
      } else {
        //homepage.renderInto(mainSection);
        currentPage.value = 1;
        sessionStorage.setItem("currentMenuSelectionIndex", menuItem["dataset"].menuIndex);
        document.title += " Home";
      }
    });
  }

  document.title = "CNA Modeling:";

  // handle rendering on page loading
  switch (sessionStorage.getItem("currentMenuSelectionIndex")) {
    case "1":
      navbarItems.get("1")?.classList.add("active");;
      //homepage.renderInto(mainSection);
      currentPage.value = 1;
      document.title += " Home";
      sessionStorage.setItem("currentMenuSelectionIndex", "1");
      break;
    case "2":
      navbarItems.get("2")?.classList.add("active");
      currentPage.value = 2;
      //modelingApp.renderInto(mainSection);
      document.title += " Modeling Application";
      sessionStorage.setItem("currentMenuSelectionIndex", "2");
      // TODO
      //const overlayEvent = new Event("openModelingApplicationOverlay");
      //document.getElementById("app")?.dispatchEvent(overlayEvent);
      break;
    default:
      navbarItems.get("1")?.classList.add("active");
      currentPage.value = 1;
      //homepage.renderInto(mainSection);
      document.title += " Home";
      sessionStorage.setItem("currentMenuSelectionIndex", "1");
      break;
  }
}

const triggerModelingApplicationFirstLoad = () => {
  if (!(sessionStorage.getItem("reloadModelingApplication"))) {
    // trigger modeling app overlay
    //const overlayEvent = new Event("openModelingApplicationOverlay");
    //document.getElementById("app")?.dispatchEvent(overlayEvent);
    sessionStorage.setItem("reloadModelingApplication", "true");
  }
}
/*
// todo remove from here
document.querySelector("a.navbar-brand").addEventListener("click", (event) => {
    console.log(modelingApp.getModeledSystemEntity());
});
*/
/*
import { Options, Vue } from 'vue-class-component';
import HelloWorld from './components/HelloWorld.vue';

@Options({
  components: {
    HelloWorld,
  },
})
export default class App extends Vue {}
*/
</script>

<style lang="scss">
#vapp {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
</style>
