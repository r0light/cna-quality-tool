<template>
    <ModalWrapper :show="show" :dialogMetaData="dialogConfig.dialogMetaData" @close:Modal="emit('close:Modal')" @save:Modal="emit('save:Modal')">
        <template v-slot:modalContent>
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
        </template>
    </ModalWrapper>
</template>

<script lang="ts">

export type ModalEditDialogData = {
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
            dialogMetaData: dialogConfig.dialogMetaData,
            dialogContent: {
                contentType: dialogConfig.dialogContent.contentType,
                groups: groups
            }
        }
    }
}

export function findInDialogByFeature(dialogData: ModalEditDialogData, feature: string): EditPropertySection {
    if (dialogData.dialogContent.contentType === UIContentType.GROUP_FORMS) {
        for (const group of dialogData.dialogContent.groups) {
            for (const option of group.contentItems) {
                if (option.providedFeature === feature) {
                    return option;
                }
            }
        }
    }
    return null;
}
</script>

<script lang="ts" setup>
import { ContentGroupMetaData, DialogConfig, DialogMetaData, InfoContentConfig, UIContentType } from '../../config/actionDialogConfig';
import PropertiesEditor, { toPropertySections } from '../detailsSidebar/PropertiesEditor.vue';
import { EditPropertySection } from '../detailsSidebar/PropertiesEditor.vue';
import ModalWrapper from './ModalWrapper.vue';


const props = defineProps<{
    titleId: string;
    context: string;
    show: boolean;
    headerDataType: string; //TODO put in DialogConfig?
    dialogConfig: ModalEditDialogData
}>();

const emit = defineEmits<{
    (e: "close:Modal"): void;
    (e: "save:Modal"): void;
}>()

</script>