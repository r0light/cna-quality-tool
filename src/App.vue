<template>
  <header>
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark text-white">
      <div class="navbar-header">
          <a class="navbar-brand text-muted no-line-space"><i class="fa-solid fa-cube"></i> Clounaq <br><span class="versionInfo">v{{ version }}</span></a>
        </div>
      <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent"
        aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarSupportedContent">

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
        <ul class="navbar-nav ml-auto">
          <li class="nav-item">
            <router-link class="nav-link text-white" to="/imprint">
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
        <h2 class="text-center">Start Modeling Software Architectures!</h2>
        <div id="init-firstInformation" v-show="overlayState === 'initial'">
          <p>The modeling feature allows you to model cloud-native application (CNA)
            architectures using different entities. It is based on the <a
              href="https://r0light.github.io/cna-quality-model/" target="_blank">Cloud-native Quality Model </a>. You
            can either start with a new architectural model or import a previously created and exported model.</p>
          <div class="d-flex flex-row justify-content-around">
            <button type="button" class="btn btn-outline-dark btn-light" @click="overlayState = 'startNew'"> <i
                class="fa-solid fa-pencil"></i> Create new model </button>
            <button type="button" class="btn btn-outline-dark btn-light" @click="overlayState = 'startImport'"> <i
                class="fa-solid fa-pencil"></i> Import existing model</button>
          </div>

        </div>
        <div id="startModelingForm" v-show="overlayState === 'startNew'">
          <p>Please type the application name of the System entity you want to model
            in the following form. Afterwards, you can start modeling your application's architecture.</p>
          <form class="needs-validation" novalidate>
            <div class="form-row">
              <div class="input-group has-validation">
                <div class="input-group-prepend">
                  <span class="input-group-text">Application Name</span>
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
        @store:modelingData="(id, systemEntityManager, toImport, importDone, appSettings) => storeModelingData(id, toImport, systemEntityManager, importDone, appSettings)"
        @update:systemName="(newName, id) => updatePageName(newName, id)"
        @update:evaluatedSystem="(systemId) => storeSelectedSystemToEvaluate(systemId)">
      </router-view>
    </div>
  </main>
  <div id="modalBackground"></div>
  <div id="modals" class="d-print-none"></div>
</template>

<script lang="ts" setup>
import $ from 'jquery';
import { ref, onMounted, computed, ComputedRef } from 'vue';
import { useRouter } from 'vue-router';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import Home from './Home.vue';
import Legal from './Legal.vue';
import ModelingApp from './modeling/ModelingApp.vue';
import QualityModelApp from './qualitymodel/QualityModelApp.vue';
import EvaluationApp from './evaluation/EvaluationApp.vue';
import SystemEntityManager from './modeling/systemEntityManager';
import { ModelingAppSettings, getDefaultAppSettings } from './modeling/config/appSettings';

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
  importDone: boolean,
  appSettings: ModelingAppSettings
}

const CLOUNAQ = "Clounaq";
const version = APP_VERSION;

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

function storeModelingData(id: number, toImport: ImportData, systemEntityManager: SystemEntityManager, importDone: boolean, appSettings: ModelingAppSettings) {

  for (let i = 0; i < modeledSystemsData.value.length; i++) {
    if (modeledSystemsData.value[i].id === id) {
      modeledSystemsData.value[i] = {
        id: id,
        name: modeledSystemsData.value[i].name,
        toImport: toImport,
        entityManager: systemEntityManager,
        importDone: importDone,
        appSettings: appSettings
      }
    }
  }
}

const selectedSystemToEvaluate = ref<number>(-1);

function storeSelectedSystemToEvaluate(systemId: number) {
  selectedSystemToEvaluate.value = systemId;
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

  console.log("onMounted")

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
          systemsData: sharedSystemsData.value,
          evaluatedSystemId: selectedSystemToEvaluate.value
        })
      })
    }
  }

  router.addRoute({
    path: "/imprint",
    component: Legal
  })

  router.beforeEach(async (to, from) => {

    // redirect if path does not exist
    if (to.path !== "/" && !router.getRoutes().find(route => {
      return route.path !== "/" && to.path.startsWith(route.path)
    })) {
      router.replace({ path: "/" });
    }

    // set current page active
    for (const page of pages.value) {
      if (page.path === "/" && to.path !== "/") {
        page.active = false;
        continue;
      }
      // use startsWith here to ensure quality model tab is also active, if a subpath is used
      if (!to.path.startsWith(page.path)) {
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
            name: `modeling-${modelingData.id}`,
            component: ModelingApp,
            props: route => ({
              systemName: modeledSystemsData.value.find(data => data.id === modelingData.id) ? modeledSystemsData.value.find(data => data.id === modelingData.id).name : "",
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
    // workaround: reload page when router is ready to be sure all components are rendered
    router.isReady().then(() => {
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

      if (modelingData.importDone) {
        return {
          id: modelingData.id,
          name: modelingData.name,
          toImport: {
            fileName: `${modelingData.name}.json`,
            fileContent: modelingData.entityManager.convertToJson()
          },
          entityManager: null,
          importDone: false,
          appSettings: modelingData.appSettings
        }
      } else {
        return {
          id: modelingData.id,
          name: modelingData.name,
          toImport: {
            fileName: `${modelingData.name}.json`,
            fileContent: JSON.parse(modelingData.toImport.fileContent)
          },
          entityManager: null,
          importDone: false,
          appSettings: modelingData.appSettings
        }
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
    importDone: true,
    appSettings: getDefaultAppSettings()
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
    name: `modeling-${newId}`,
    component: ModelingApp,
    props: route => ({
      systemName: modeledSystemsData.value.find(systemData => systemData.id === newId) ? modeledSystemsData.value.find(systemData => systemData.id === newId).name : "",
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
      router.removeRoute(`modeling-${pages.value[i].id}`);
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

.no-line-space {
  line-height: 0.4em;
}

.versionInfo {
  font-size: x-small;
  margin-left: 6.5em;
  color: white;
}

#vapp {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.mainElement {
  overflow: auto;
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
