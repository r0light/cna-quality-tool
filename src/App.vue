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
              <a class="text-white" @click="selectPage(page.id)">
                <i :class="page.iconClass"></i>
                {{ page.name }}
              </a>
              <button class="btn d-flex p-1 closeModelBtn" v-if="page.pageType === 'modeling'"
                @click="deleteModelingPage(page.id)"><i class="fa fa-fw fa-x text-white"></i></button>
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
          <input type="file" accept=".json,.yaml,.yml,.tosca" ref="selectedFile" @change="importModelFromFile"
            tabindex="-1" />
        </div>
      </div>
    </div>
    <div class="pagesContainer">
      <div v-for="pageContent of pages" class="pageWrapper">
        <Home v-if="pageContent.pageType === 'home'" v-show="currentPage === pageContent.id"></Home>
        <QualityModelApp v-if="pageContent.pageType === 'qualityModel'" v-show="currentPage === pageContent.id"
          :inView="currentPage === pageContent.id"></QualityModelApp>
        <EvaluationApp v-if="pageContent.pageType === 'evaluation'" v-show="currentPage === pageContent.id"
          :systemsData="sharedSystemsData"></EvaluationApp>
        <ModelingApp v-if="pageContent.pageType === 'modeling'"
          v-show="pageContent.pageType === 'modeling' && currentPage === pageContent.id" :systemName="pageContent.name"
          :pageId="pageContent.id"
          :modelingData="(modeledSystemsData.find(systemData => systemData.id === pageContent.id) as ModelingData)"
          @store:modelingData="(systemEntityManager, toImport) => storeModelingData(pageContent.id, toImport, systemEntityManager, pageContent.name,)"
          @update:systemName="event => updatePageName(event, pageContent.id)"></ModelingApp>
      </div>
    </div>
  </main>
  <div id="modalBackground"></div>
  <div id="modals" class="d-print-none"></div>
</template>

<script lang="ts" setup>
import $ from 'jquery';
import { ref, onMounted, computed, ComputedRef } from 'vue';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import Home from './Home.vue';
import ModelingApp from './modeling/ModelingApp.vue';
import QualityModelApp from './qualitymodel/QualityModelApp.vue';
import EvaluationApp from './evaluation/EvaluationApp.vue';
import SystemEntityManager from './modeling/systemEntityManager';

type Page = {
  id: number;
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
  id: number,
  name: string,
  toImport: ImportData,
  entityManager: SystemEntityManager
}

const pages = ref<Page[]>([
  {
    id: 0,
    active: false,
    pageType: "home",
    iconClass: "fa fa-fw fa-home",
    name: "Home"
  },
  {
    id: 1,
    active: false,
    pageType: "qualityModel",
    iconClass: "fa-solid fa-sitemap",
    name: "Quality Model"
  },
  {
    id: 2,
    active: false,
    pageType: "evaluation",
    iconClass: "fa-solid fa-gauge-high",
    name: "Evaluation"
  }
])

const modeledSystemsData = ref<ModelingData[]>([]);
const sharedSystemsData: ComputedRef<ModelingData[]> = computed(() => {
  return modeledSystemsData.value.filter(data => data.id !== -1) as ModelingData[];
});
/*const sharedSystemsKey: ComputedRef<string> = computed(() => {
  return modeledSystemsData.value.reduce((initial, b) => initial + b.name, "");
});*/

function storeModelingData(id: number, toImport: ImportData, systemEntityManager: SystemEntityManager, pageName: string,) {

  for (let i = 0; i < modeledSystemsData.value.length; i++) {
    if (modeledSystemsData.value[i].id === id) {
      modeledSystemsData.value[i] = {
        id: id,
        name: pageName,
        toImport: toImport,
        entityManager: systemEntityManager
      }
    }
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
  addNewModelingPage(newSystemName.value, { fileName: '', fileContent: '' });
  newSystemName.value = "";
}

function importModelFromFile() {
  let fr = new FileReader();
  fr.onload = (fileReader: ProgressEvent<FileReader>) => {
    let fileName = selectedFile.value.files[0].name;
    let systemName = fileName.replace(/\..*$/g, "");
    let stringifiedFile: string = fileReader.target.result.toString();
    addNewModelingPage(systemName, { fileName: fileName, fileContent: stringifiedFile });
    overlayState.value = "none";
  };
  fr.readAsText(selectedFile.value.files[0]);
}

onMounted(() => {

  let importDone: Promise<void> = Promise.resolve();

  if (sessionStorage.getItem("modelingData")) {
    let modelingDataToImport: ModelingData[] = JSON.parse(sessionStorage.getItem("modelingData"));

    for (const modelingData of modelingDataToImport) {
      importDone = importDone.then(() => {
        return new Promise((resolve, reject) => {
          modelingData.toImport.fileContent = JSON.stringify(modelingData.toImport.fileContent);
          modeledSystemsData.value.push(modelingData);
          pages.value.push({
            id: modelingData.id,
            active: false,
            pageType: "modeling",
            iconClass: "fa-solid fa-pencil",
            name: modelingData.name
          })
          currentPage.value = modelingData.id;
          // import each model with a little time buffer in between to avoid visualization issues
          setTimeout(resolve, 50);
        });
      });
    }

    importDone.then(() => {
      if (sessionStorage.getItem("currentPage")) {
        currentPage.value = parseInt(sessionStorage.getItem("currentPage"));
      }

      for (const page of pages.value) {
        page.active = page.id === currentPage.value ? true : false;
      }

    })
  }


  document.getElementById("applicationNameInputField").addEventListener("keydown", (event) => {
    if (event.key?.localeCompare("Enter") === 0) {
      event.preventDefault();
      onNameEntered();
    }
  });

  window.onbeforeunload = function () {
    let modelingDataToStore = modeledSystemsData.value.map((modelingData: ModelingData): ModelingData => {
      return {
        id: modelingData.id,
        name: modelingData.name,
        toImport: {
          fileName: `${modelingData.name}.json`,
          fileContent: modelingData.entityManager.convertToJson()
        },
        entityManager: null
      }
    })

    sessionStorage.setItem("modelingData", JSON.stringify(modelingDataToStore));
    sessionStorage.setItem("currentPage", `${currentPage.value}`);
  }

});

function selectPage(id: number) {
  currentPage.value = id;

  // set current page active
  for (const page of pages.value) {
    page.active = page.id === currentPage.value ? true : false;
    if (page.active) {
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
}

function addNewModelingPage(name: string, toImport: ImportData) {

  // increment currently highest id by one to get a new id
  const newId = Math.max(...pages.value.map(page => page.id)) + 1;

  modeledSystemsData.value.push({
    id: newId,
    name: name,
    toImport: toImport,
    entityManager: null
  });

  pages.value.push({
    id: newId,
    active: true,
    pageType: "modeling",
    iconClass: "fa-solid fa-pencil",
    name: name
  })

  selectPage(newId);
}

function updatePageName(newName: string, id: number) {
  for (const page of pages.value) {
    if (page.id === id) {
      page.name = newName;
      document.title += `CNA Modeling: ${newName}`;
    }
  }

  for (const systemData of modeledSystemsData.value) {
    if (systemData.id === id) {
      systemData.name = newName;
      break;
    }
  }
}

function deleteModelingPage(id: number) {
  // TODO modal to ask for confirmation

  let highestIdBefore = -1;

  for (let i = 0; i < pages.value.length; i++) {
    if (pages.value[i].id === id) {
      pages.value.splice(i, 1);
      break;
    }
    highestIdBefore = pages.value[i].id;
  }

  for (let i = 0; i < modeledSystemsData.value.length; i++) {
    if (modeledSystemsData.value[i].id === id) {
      modeledSystemsData.value.splice(i, 1);
      break;
    }
  }

  selectPage(highestIdBefore);
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

.closeModelBtn:hover>i {
  color: #3db4f4 !important;
}
</style>
