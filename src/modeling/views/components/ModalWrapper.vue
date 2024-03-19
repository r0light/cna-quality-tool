<template>
    <Teleport to="#modals" v-show="show">
        <div class="modal" :class="{ 'show': show }" tabindex="-1" aria-labelledby="modal-dialog-title" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable" :class="dialogMetaData.dialogSize">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modalTitleIcon modal-title" v-if="dialogMetaData.header.iconClass">
                            <i :class="dialogMetaData.header.iconClass"></i>
                        </h5>
                        <h5 class="modalTitleIcon modal-title" v-if="dialogMetaData.header.svgRepresentation">
                        <span v-html="dialogMetaData.header.svgRepresentation"></span>
                    </h5>
                        <h5 id="modal-dialog-title" class="modal-title">{{ dialogMetaData.header.text }}</h5>
                        <div class="close">
                            <button type="button" class="close" aria-label="Close" @click="requestClose">
                                <i class="fa fa-fw fa-x"></i>
                            </button>
                        </div>
                    </div>
                    <div class="modal-body">
                        <div class="container-fluid">
                            <slot name="modalContent"></slot>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button v-show="dialogMetaData.footer.showCancelButton" type="button" class="btn btn-secondary" tabindex="0"
                            @click="requestClose">
                            {{ dialogMetaData.footer.cancelButtonText }}
                        </button>
                        <button v-for="[index, buttonConfig] of dialogMetaData.footer.actionButtons.entries()" type="button" class="btn btn-primary" :tabindex="index" @click="requestAction(index)">
                            <i class="mr-1" :class="buttonConfig.buttonIconClass" v-if="buttonConfig.buttonIconClass"></i>
                            <span>{{ buttonConfig.buttonText }}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </Teleport>


    <Teleport to="#modalBackground" v-show="show">
        <div class="modal-backdrop" :class="{ 'show': show }" v-show="show"></div>
    </Teleport>
</template>


<script lang="ts" setup>
import {  DialogMetaData } from '../../config/actionDialogConfig';

const props = defineProps<{
    show: boolean;
    dialogMetaData: DialogMetaData 
}>();

const emit = defineEmits<{
    (e: "close:Modal"): void;
    (e: "action:Modal", actionIndex: number): void;
}>()

function requestClose() {
    emit("close:Modal")
}

function requestAction(index: number) {
    emit("action:Modal", index);
}

</script>

<style>
.show {
    display: block !important;
}
</style>