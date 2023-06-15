<template>
    <div class="modal" :class="{ 'show': show }" :data-backdrop="{ 'static': isStatic }" :data-keyboard="!isStatic"
        tabindex="-1" :aria-labelledby="titleId" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable" :class="dialogConfig.dialogSize">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modalTitleIcon modal-title">
                        <span v-html="dialogConfig.dialogMetaData.header.svgRepresentation"></span>
                        <!-- TODO use as default <i class="fa-solid fa-info" :data-type="headerDataType"></i> -->
                    </h5>
                    <h5 class="modal-title">{{ dialogConfig.dialogMetaData.header.text }}</h5>
                    <div class="close">
                        <button v-show="dialogConfig.dialogMetaData.header.closeButton" type="button" class="close"
                            data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                </div>
                <div class="modal-body">
                    <div class="container-fluid">
                        <p v-if="dialogConfig.dialogContent.contentType === UIContentType.SINGLE_TEXTBLOCK">
                            {{ dialogConfig.dialogContent.text }}
                        </p>
                        <div v-if="dialogConfig.dialogContent.contentType === UIContentType.GROUP_FORMS"
                            v-for="item of dialogConfig.dialogContent.groups" :data-group-context="context">

                            <div>
                                <h5 v-html="item.groupMetaData.headline"></h5>
                                <p>{{ item.groupMetaData.text }}</p>
                                <PropertiesEditor :groupId="''" :cardBodyId="''" :propertyOptions="item.contentItems">
                                </PropertiesEditor>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-dismiss="modal" tabindex="0" @click="requestClose">
                        {{ dialogConfig.dialogMetaData.footer.cancelButtonText }}
                    </button>
                    <button type="button" class="btn btn-primary" tabindex="0" @click="requestSave">
                        <i :class="dialogConfig.dialogMetaData.footer.saveButtonIconClass"></i>
                        <span>{{ dialogConfig.dialogMetaData.footer.saveButtonText }}</span>
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">

export type ModalEditDialogData = {
    dialogSize: string,
    dialogMetaData: DialogMetaData,
    dialogContent: InfoContentConfig | FormContentData
}

export type FormContentData = {
    contentType: "groupForms",
    groups: {
        groupMetaData: ContentGroupMetaData,
        contentItems: EditPropertySection[]
    }[]
}

export function toDialogData(dialogConfig: DialogConfig): ModalEditDialogData {
    if (dialogConfig.dialogContent.contentType === UIContentType.SINGLE_TEXTBLOCK) {
        return dialogConfig as ModalEditDialogData;
    } else {

        let groups = [];
        for (const group of dialogConfig.dialogContent.groups) {
            groups.push({
                groupMetaData: group.contentGroupMetaData,
                contentItems: toPropertySections(group.contentItems)
            })
        }
        return {
            dialogSize: dialogConfig.dialogSize,
            dialogMetaData: dialogConfig.dialogMetaData,
            dialogContent: {
                contentType: dialogConfig.dialogContent.contentType,
                groups: groups
            }
        }
    }
}
</script>

<script lang="ts" setup>
import { UIContentType } from '@/modeling/config/toolbarConfiguration';
import { ContentGroupMetaData, DialogConfig, DialogMetaData, InfoContentConfig } from '../../config/actionDialogConfig';
import PropertiesEditor, { toPropertySections } from '../detailsSidebar/PropertiesEditor.vue';
import { EditPropertySection } from '../detailsSidebar/PropertiesEditor.vue';


const props = defineProps<{
    isStatic: boolean;
    titleId: string;
    context: string;
    show: boolean;
    headerDataType: string; //TODO put in DialogConfig?
    dialogConfig: ModalEditDialogData
}>();

const emit = defineEmits<{
    (e: "close:Modal", titleId: string): void;
    (e: "save:Modal", titleId: string): void;
}>()


/* TODO defaults:
    headerDataType = "normal",
    iconClass = "fa-solid fa-info"
    footerButtonText = "Close"
*/

function requestClose() {
    emit("close:Modal", props.titleId);
}

function requestSave() {
    emit("save:Modal", props.titleId);
    requestClose();
}

</script>

<style>
.show {
    display: block !important;
}
</style>