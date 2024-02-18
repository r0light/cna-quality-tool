<template>
  <header>
    <nav class="navbar navbar-expand navbar-light bg-dark text-white">
      <div class="collapse navbar-collapse" id="navbarSupportedContent">
        <div class="navbar-header">
          <a class="navbar-brand text-muted"><i class="fa-solid fa-cube"></i> Clounaq</a>
        </div>
        <ul class="navbar-nav mr-auto">
          <li v-for="page of pages" class="nav-item" :class="{ active: page.active }">
            <div class="nav-link d-flex flex-row">
              <router-link class="text-white" :to="`${page.path}`">
                <i :class="page.iconClass"></i>
                {{ page.name }}
              </router-link>
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
      <div class="navbar-collapse collapse">
        <ul class="navbar-nav ml-auto">
          <li class="nav-item p-2">
            <router-link class="text-white" to="/imprint">
              <i class="fa-solid fa-scale-balanced"></i>
              Imprint
            </router-link>
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
      <router-view :key="$route.path"
        @store:modelingData="(id, systemEntityManager, toImport, importDone) => storeModelingData(id, toImport, systemEntityManager, importDone)"
        @update:systemName="(newName, id) => updatePageName(newName, id)">
      </router-view>
    </div>
  </main>
  <div id="modalBackground"></div>
  <div id="modals" class="d-print-none"></div>
</template>

<script lang="ts" setup>
import $ from 'jquery';
import { ref, onMounted, computed, ComputedRef } from 'vue';
import { RouteRecordRaw, Router, createRouter, createWebHashHistory, useRouter } from 'vue-router';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import Home from './Home.vue';
import Legal from './Legal.vue';
import ModelingApp from './modeling/ModelingApp.vue';
import QualityModelApp from './qualitymodel/QualityModelApp.vue';
import EvaluationApp from './evaluation/EvaluationApp.vue';
import SystemEntityManager from './modeling/systemEntityManager';

type Page = {
  id: number;
  path: string;
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
  entityManager: SystemEntityManager,
  importDone: boolean
}

const CLOUNAQ = "Clounaq";

const router = useRouter();

const pages = ref<Page[]>([
  {
    id: 1,
    path: "/",
    active: false,
    pageType: "home",
    iconClass: "fa fa-fw fa-home",
    name: "Home"
  },
  {
    id: 2,
    path: "/quality-model",
    active: false,
    pageType: "qualityModel",
    iconClass: "fa-solid fa-sitemap",
    name: "Quality Model"
  },
  {
    id: 3,
    path: "/evaluation",
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

function storeModelingData(id: number, toImport: ImportData, systemEntityManager: SystemEntityManager, importDone: boolean) {

  for (let i = 0; i < modeledSystemsData.value.length; i++) {
    if (modeledSystemsData.value[i].id === id) {
      modeledSystemsData.value[i] = {
        id: id,
        name: modeledSystemsData.value[i].name,
        toImport: toImport,
        entityManager: systemEntityManager,
        importDone: importDone
      }
    }
  }
}

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

function waitForLoadedToResolve(modelingDataId: number, resolve: () => void) {

  for (let i = 0; i < modeledSystemsData.value.length; i++) {
    if (modeledSystemsData.value[i].id === modelingDataId) {
      if (modeledSystemsData.value[i].importDone) {
        resolve();
        return;
      } else {
        setTimeout(() => {
          waitForLoadedToResolve(modelingDataId, resolve);
        }, 2000); //TODO with 2 seconds all seems to work reasonably well, but it is not really a satisfying solution
      }
    }
  }
}

onMounted(() => {

  for (const page of pages.value) {
    if (page.pageType === "home") {
      router.addRoute({
        path: page.path,
        component: Home
      })
    } else if (page.pageType === "qualityModel") {
      router.addRoute({
        path: page.path,
        component: QualityModelApp,
        props: route => ({
          active: page.active,
          path: page.path
        })
      })
      router.addRoute({
        path: `${page.path}/:factorKey`,
        component: QualityModelApp,
        props: route => ({
          active: page.active,
          path: page.path
        })
      })
    } else if (page.pageType === "evaluation") {
      router.addRoute({
        path: page.path,
        component: EvaluationApp,
        props: route => ({
          active: page.active,
          systemsData: sharedSystemsData.value
        })
      })
    }
  }

  router.addRoute({
    path: "/imprint",
    component: Legal
  })

  router.beforeEach(async (to, from) => {

    console.log("request: " + to.path);

    // set current page active
    for (const page of pages.value) {
      if (page.path !== to.path) {
        page.active = false;
        continue;
      }
      page.active = true;
      switch (page.pageType) {
        case "home":
          document.title = CLOUNAQ + ": Home";
          break;
        case "qualityModel":
          document.title = CLOUNAQ + ": Quality Model";
          break;
        case "evaluation":
          document.title = CLOUNAQ + ": Evaluation";
          break;
        case "modeling":
          document.title = CLOUNAQ + `: Modeling ${page.name}`;
          break;
        default:
          document.title = CLOUNAQ + ": Home";
      }
    }
    return true;
  })

  let importDone: Promise<void> = Promise.resolve();

  let lastRoute = sessionStorage.getItem("lastRoute") ? sessionStorage.getItem("lastRoute") : "";

  if (sessionStorage.getItem("modelingData")) {
    let modelingDataToImport: ModelingData[] = JSON.parse(sessionStorage.getItem("modelingData"));

    for (const modelingData of modelingDataToImport) {
      importDone = importDone.then(() => {
        return new Promise((resolve, reject) => {
          modelingData.toImport.fileContent = JSON.stringify(modelingData.toImport.fileContent);
          modeledSystemsData.value.push(modelingData);
          pages.value.push({
            id: modelingData.id,
            path: `/modeling-${modelingData.id}`,
            active: false,
            pageType: "modeling",
            iconClass: "fa-solid fa-pencil",
            name: modelingData.name
          })

          router.addRoute({
            path: `/modeling-${modelingData.id}`,
            component: ModelingApp,
            props: route => ({
              systemName: modeledSystemsData.value.find(data => data.id === modelingData.id).name,
              pageId: modelingData.id,
              modelingData: modeledSystemsData.value.find(data => data.id === modelingData.id),
            })
          })

          if (lastRoute.startsWith("modeling")) {
            router.push(`/modeling-${modelingData.id}`);
            waitForLoadedToResolve(modelingData.id, resolve);
          } else {
            resolve();
          }
        });
      });
    }
  }

  importDone.then(() => {
    // reload page when router is ready to be sure all components are rendered
    router.isReady().then(() => {
      console.log({
        router: "ready",
        "router.currentRoute.value": router.currentRoute.value
      });
      router.push(router.currentRoute.value.path);
    })


  })


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
        entityManager: null,
        importDone: false
      }
    })

    sessionStorage.setItem("modelingData", JSON.stringify(modelingDataToStore));
    sessionStorage.setItem("lastRoute", router.currentRoute.value.path);
  }

});


function addNewModelingPage(name: string, toImport: ImportData) {

  // increment currently highest id by one to get a new id
  const newId = Math.max(...pages.value.map(page => page.id)) + 1;

  modeledSystemsData.value.push({
    id: newId,
    name: name,
    toImport: toImport,
    entityManager: null,
    importDone: true
  });

  pages.value.push({
    id: newId,
    path: `/modeling-${newId}`,
    active: true,
    pageType: "modeling",
    iconClass: "fa-solid fa-pencil",
    name: name
  })

  router.addRoute({
    path: `/modeling-${newId}`,
    component: ModelingApp,
    props: route => ({
      systemName: name,
      pageId: newId,
      modelingData: (modeledSystemsData.value.find(systemData => systemData.id === newId) as ModelingData)
    })
  })

  router.isReady().then(() => {
    router.push(`/modeling-${newId}`);
  });

}

function updatePageName(newName: string, id: number) {
  for (const page of pages.value) {
    if (page.id === id) {
      page.name = newName;
      document.title = CLOUNAQ + `: Modeling ${newName}`;
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
      router.removeRoute(pages.value[i].path);
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

  router.push(pages.value.find(page => page.id === highestIdBefore).path);
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
