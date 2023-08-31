<template>
  <header>
    <nav class="navbar navbar-expand navbar-light bg-dark text-white">
      <div class="collapse navbar-collapse" id="navbarSupportedContent">
        <div class="navbar-header">
          <a class="navbar-brand text-muted"><i class="fa-solid fa-cube"></i> CNA Modeling</a>
        </div>
        <ul class="navbar-nav mr-auto">
          <li v-for="page of pages" class="nav-item" :class="{ active: page.active }">
            <a class="nav-link text-white" @click="selectPage(page.index)">
              <i :class="page.iconClass"></i>
              {{ page.name }}
            </a>
          </li>
          <li class="nav-item">
            <a id="newModelingApp" class="nav-link text-white" @click="startModelingForm">
              <i class="fa-solid fa-plus"></i>
              New Application Model</a>
          </li>
        </ul>
      </div>
    </nav>
  </header>

  <!-- Content -->

  <main role="main" ref="mainSection" class="flex-grow-1">
    <div id="init-overlay" class="init-overlay" v-show="showInitOverlay">
      <div class="init-overlay-content">
        <h2 class="user-select-none text-center">Welcome to the CNA Modeling Application!</h2>
        <div id="init-firstInformation" v-show="!showStartModelingForm">
          <p class="user-select-none">The modeling application allows you to model cloud-native application (CNA)
            architectures using thirteen different entities. It is based on the CNA quality model
            as introduced here:
            https://github.com/r0light/cna-quality-model/tree/9058f6236e8e0b1cceee9abf67a96e927140d0fa. In addition,
            the application supports exporting the graphical model into an
            extended version of the TOSCA architecture description language. The extended TOSCA version is being
            introduced here: https://github.com/KarolinDuerr/MA-CNA-ModelingSupport/tree/main/TOSCA_Extension.</p>
          <button id="createNewDiagramBtn" type="button" class="btn btn-outline-dark btn-light"
            @click="startCreatingModel"> <i class="fa-solid fa-pencil"></i> Create new diagram </button>
        </div>
        <div id="startModelingForm" v-show="showStartModelingForm">
          <p class="user-select-none">Please type the application name of the System entity you want to model
            in the following form. Afterwards, you can start modeling your application's architecture.</p>
          <form class="needs-validation" novalidate>
            <div class="form-row">
              <div class="input-group has-validation">
                <div class="input-group-prepend">
                  <span class="user-select-none input-group-text">Application Name</span>
                </div>
                <input name="systemName" type="text" class="form-control" id="applicationNameInputField"
                  placeholder="Application name of your System" v-model="newSystemName" required>
                <div class="validationError invalid-feedback">
                  Please provide an application name.
                </div>
              </div>
              <div class="startModelingBtnArea form-group row">
                <div class="col-auto">
                  <button id="startModelingBtn" type="button" class="btn btn-outline-dark" @click="onNameEntered"><i
                      class="fa-solid fa-pencil"></i> Start modeling</button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
    <div class="pagesContainer">
      <div v-for="pageContent of pages" class="pageWrapper">
        <Home v-if="pageContent.pageType === 'home' && currentPage === pageContent.index"></Home>
        <ModelingApp v-if="pageContent.pageType === 'modeling' && currentPage === pageContent.index" :systemName="pageContent.name" :pageData="pageContent.pageData" @store:pageData="(dataKey, dataValue) => storePageData(dataKey, dataValue, pageContent.index)" @update:systemName="event => updatePageName(event, pageContent.index)"></ModelingApp>
      </div>
    </div>
  </main>
  <div id="modalBackground"></div>
</template>

<script lang="ts" setup>
import $ from 'jquery';
import { ref, onMounted } from 'vue'
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import Home from './Home.vue';
import ModelingApp from './modeling/ModelingApp.vue';

type Page = {
  index: number;
  active: boolean;
  pageType: "home" | "modeling"
  iconClass: string;
  name: string;
  pageData: Map<string,object>;
}

const pages = ref<Page[]>([
  {
    index: 0,
    active: false,
    pageType: "home",
    iconClass: "fa fa-fw fa-home",
    name: "Home",
    pageData: new Map<string,object>()
  }
])

function storePageData(dataKey, dataValue, index) {
  for (const page of pages.value) {
    if (page.index === index) {
      page.pageData.set(dataKey, dataValue);
    }
  }
}

const currentPage = ref(0);

const showInitOverlay = ref(false);
const showStartModelingForm = ref(false);
const newSystemName = ref<string>("");

function startModelingForm() {
  showInitOverlay.value = true;
  //showStartModelingForm.value = true;
}

function startCreatingModel() {
  showStartModelingForm.value = true;
}

function onNameEntered() {
  let forms = $("#init-overlay .needs-validation");

  for (const form of forms) {
    form.classList.add('was-validated');
  }

  if (!newSystemName.value) {
    return;
  }
  showInitOverlay.value = false;
  showStartModelingForm.value = false;
  addNewModelingPage(newSystemName.value);
  newSystemName.value = "";
}

onMounted(() => {

  for (const page of pages.value) {
    page.active = page.index === currentPage.value ? true : false;
  }

  document.getElementById("applicationNameInputField").addEventListener("keydown", (event) => {
    if (event.key?.localeCompare("Enter") === 0) {
      event.preventDefault();
      onNameEntered();
    }
  });
});

function selectPage(index: number) {
  currentPage.value = index;

  // set current page active
  for (const page of pages.value) {
    page.active = page.index === currentPage.value ? true : false;
    switch(page.pageType) {
      case "home":
        document.title = "Home";
        break;
      case "modeling":
        document.title = `CNA Modeling ${page.name}`;
        break;
      default:
        document.title = "Home";
    }
  }
}

function addNewModelingPage(name: string) {

  const newIndex = pages.value.length

  pages.value.push({
    index: newIndex,
    active: true,
    pageType: "modeling",
    iconClass: "fa-solid fa-pencil",
    name: name,
    pageData: new Map<string,object>()
  })

  selectPage(newIndex);
}

function updatePageName(newName: string, index: number) {
  for (const page of pages.value) {
    if (page.index === index) {
      page.name = newName;
      document.title += `CNA Modeling: ${newName}`;
    }
  }
}

</script>

<style lang="scss">
.pagesContainer {
  display: flex;
  height: 100%;
}

.pageWrapper {
  display: contents;
}

#vapp {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.hide {
  display: none;
}
</style>
