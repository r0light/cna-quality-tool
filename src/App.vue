<template>
  <header>
    <nav class="navbar navbar-expand navbar-light bg-dark text-white">
      <div class="collapse navbar-collapse" id="navbarSupportedContent">
        <div class="navbar-header">
          <a class="navbar-brand text-muted"><i class="fa-solid fa-cube"></i> CNA Modeling</a>
        </div>
        <ul class="navbar-nav mr-auto">
          <li v-for="page of pages" class="nav-item" :class="{ active: page.active }">
            <div class="nav-link d-flex flex-row">
              <a class="text-white" @click="selectPage(page.index)">
              <i :class="page.iconClass"></i>
              {{ page.name }}
            </a>
            <button class="btn d-flex p-1 closeModelBtn" v-if="page.pageType === 'modeling'" @click="deleteModelingPage(page.index)"><i
            class="fa fa-fw fa-x text-white"></i></button>
            </div>
          </li>
          <li class="nav-item">
            <a id="newModelingApp" class="nav-link text-white" @click="overlayState = 'initial'">
              <i class="fa-solid fa-plus"></i>
              New Application Model</a>
          </li>
        </ul>
      </div>
    </nav>
  </header>

  <!-- Content -->

  <main role="main" ref="mainSection" class="flex-grow-1 mainElement">
    <div id="init-overlay" class="init-overlay" v-show="overlayState !== 'none'">
      <div class="init-overlay-content">
        <button class="btn d-flex ml-auto" @click="overlayState = 'none'"><i
            class="fa fa-fw fa-x text-white"></i></button>
        <h2 class="user-select-none text-center">Welcome to the CNA Modeling Application!</h2>
        <div id="init-firstInformation" v-show="overlayState === 'initial'">
          <p class="user-select-none">The modeling application allows you to model cloud-native application (CNA)
            architectures using thirteen different entities. It is based on the CNA quality model
            as introduced here:
            https://github.com/r0light/cna-quality-model/tree/9058f6236e8e0b1cceee9abf67a96e927140d0fa. In addition,
            the application supports exporting the graphical model into an
            extended version of the TOSCA architecture description language. The extended TOSCA version is being
            introduced here: https://github.com/KarolinDuerr/MA-CNA-ModelingSupport/tree/main/TOSCA_Extension.</p>
          <div class="d-flex flex-row justify-content-around">
            <button type="button" class="btn btn-outline-dark btn-light" @click="overlayState = 'startNew'"> <i
              class="fa-solid fa-pencil"></i> Create new diagram </button>
          <button type="button" class="btn btn-outline-dark btn-light" @click="overlayState = 'startImport'"> <i
              class="fa-solid fa-pencil"></i> Import existing diagram</button>
          </div>

        </div>
        <div id="startModelingForm" v-show="overlayState === 'startNew'">
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
        <div id="startModelingForm" v-show="overlayState === 'startImport'">
          <p class="user-select-none">Please select a file to import a model from it (TOSCA or JSON format)</p>
          <input type="file" accept=".json,.yaml,.yml,.tosca" ref="selectedFile" @change="importModelFromFile" tabindex="-1"/>
        </div>
      </div>
    </div>
    <div class="pagesContainer">
      <div v-for="pageContent of pages" class="pageWrapper">
        <Home v-if="pageContent.pageType === 'home'" v-show="currentPage === pageContent.index"></Home>
        <QualityModelApp v-if="pageContent.pageType === 'qualityModel'" v-show="currentPage === pageContent.index"
          :inView="currentPage === pageContent.index"></QualityModelApp>
        <EvaluationApp v-if="pageContent.pageType === 'evaluation'" v-show="currentPage === pageContent.index"
          :systemsData="sharedSystemsData"></EvaluationApp>
        <ModelingApp v-if="pageContent.pageType === 'modeling'"
          v-show="pageContent.pageType === 'modeling' && currentPage === pageContent.index" :systemName="pageContent.name"
          :pageIndex="pageContent.index" :modelingData="(modeledSystemsData[pageContent.index] as ModelingData)"
          @store:modelingData="(systemEntityManager, toImport) => storeModelingData(pageContent.index, toImport, systemEntityManager, pageContent.name, )"
          @update:systemName="event => updatePageName(event, pageContent.index)"></ModelingApp>
      </div>
    </div>
  </main>
  <div id="modalBackground"></div>
  <div id="modals" class="d-print-none"></div>
</template>

<script lang="ts" setup>
import $ from 'jquery';
import { ref, onMounted, computed, ComputedRef } from 'vue'
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import Home from './Home.vue';
import ModelingApp from './modeling/ModelingApp.vue';
import QualityModelApp from './qualitymodel/QualityModelApp.vue';
import EvaluationApp from './evaluation/EvaluationApp.vue';
import SystemEntityManager from './modeling/systemEntityManager';

type Page = {
  index: number;
  active: boolean;
  pageType: "home" | "qualityModel" | "evaluation" | "modeling"
  iconClass: string;
  name: string;
}

export type ImportData = {
    fileName: string,
    fileContent: string
  }

export type ModelingData = {
  index: number,
  name: string,
  toImport: ImportData,
  entityManager: SystemEntityManager
}

const pages = ref<Page[]>([
  {
    index: 0,
    active: false,
    pageType: "home",
    iconClass: "fa fa-fw fa-home",
    name: "Home"
  },
  {
    index: 1,
    active: false,
    pageType: "qualityModel",
    iconClass: "fa-solid fa-sitemap",
    name: "Quality Model"
  },
  {
    index: 2,
    active: false,
    pageType: "evaluation",
    iconClass: "fa-solid fa-gauge-high",
    name: "Evaluation"
  }
])

const modeledSystemsData = ref<ModelingData[]>([]);
const sharedSystemsData: ComputedRef<ModelingData[]> = computed(() => {
  return modeledSystemsData.value.filter(data => data.index !== -1) as ModelingData[];
});
/*const sharedSystemsKey: ComputedRef<string> = computed(() => {
  return modeledSystemsData.value.reduce((initial, b) => initial + b.name, "");
});*/

function storeModelingData(index: number, toImport: ImportData, systemEntityManager: SystemEntityManager, pageName: string, ) {
  modeledSystemsData.value[index] = {
    index: index,
    name: pageName,
    toImport: toImport,
    entityManager: systemEntityManager
  }

}

const currentPage = ref(0);

const overlayState = ref<"none" | "initial" | "startNew" | "startImport">("none");
const newSystemName = ref<string>("");
const selectedFile = ref<HTMLInputElement>(null);

function onNameEntered() {
  let forms = $("#init-overlay .needs-validation");

  for (const form of forms) {
    form.classList.add('was-validated');
  }

  if (!newSystemName.value) {
    return;
  }
  overlayState.value = "none";
  addNewModelingPage(newSystemName.value, {fileName: '', fileContent: ''});
  newSystemName.value = "";
}

function importModelFromFile() {
  let fr = new FileReader();
  fr.onload = (fileReader: ProgressEvent<FileReader>) => {
        let fileName = selectedFile.value.files[0].name;
        let stringifiedFile: string = fileReader.target.result.toString();
        addNewModelingPage(newSystemName.value, {fileName: fileName, fileContent: stringifiedFile});
        overlayState.value = "none";
  };
  fr.readAsText(selectedFile.value.files[0]);
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
    switch (page.pageType) {
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

function addNewModelingPage(name: string, toImport: ImportData) {

  // increment currently highest index by one to get a new index
  const newIndex = Math.max(...pages.value.map(page => page.index)) + 1;

  // prepare modeledSystemsData so that the array at index newIndex is not empty
  while (modeledSystemsData.value.length <= newIndex) {
    modeledSystemsData.value.push({
      index: -1,
      name: "",
      toImport: {fileName: "", fileContent: ""},
      entityManager: null
    });
  }

  modeledSystemsData.value.push({
      index: newIndex,
      name: "",
      toImport: toImport,
      entityManager: null
    });

  pages.value.push({
    index: newIndex,
    active: true,
    pageType: "modeling",
    iconClass: "fa-solid fa-pencil",
    name: name
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
  modeledSystemsData.value[index].name = newName;
}

function deleteModelingPage(index: number) {
  // TODO modal to ask for confirmation

  let highestIndexBefore = -1;

  for (let i = 0; i < pages.value.length; i++) {
    if (pages.value[i].index === index) {
      pages.value.splice(i, 1);
      break;
    }
    highestIndexBefore = pages.value[i].index;
  }

  for (let i = 0; i < modeledSystemsData.value.length; i++) {
    if (modeledSystemsData.value[i].index === index) {
      modeledSystemsData.value.splice(i, 1);
      break;
    }
  }

  selectPage(highestIndexBefore);
}

</script>

<style lang="scss">
.pagesContainer {
  display: flex;
  height: 100%;
  width: 100%;
}

.pageWrapper {
  display: contents;
}

#vapp {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.mainElement {
  overflow: scroll;
}

.hide {
  display: none;
}

.closeModelBtn {
  margin-left: 1em;

}

.closeModelBtn:hover > i {
  color:  #3db4f4 !important;
}
</style>
