
<template>
    <ModalWrapper :show="show" :dialogMetaData="dialogMetaData" @close:Modal="onCancel" @save:Modal="onConfirm">
        <template v-slot:modalContent>
            <p>{{ confirmationPrompt }}</p>
        </template>
    </ModalWrapper>
</template>

<script lang="ts">

export function getDefaultConfirmationDialogData(): ConfirmationModalProps {
    return {
        show: false,
        dialogMetaData: {
            dialogSize: DialogSize.DEFAULT,
            header: {
                iconClass: "",
                svgRepresentation: "",
                text: ""
            },
            footer: {
                cancelButtonText: "Cancel",
                saveButtonIconClass: "",
                saveButtonText: "Save"
            }
        }, 
        confirmationPrompt: "",
        onCancel: () => {},
        onConfirm: () => {}
    }
}

</script>

<script lang="ts" setup>
import ModalWrapper from './ModalWrapper.vue';
import { DialogMetaData, DialogSize } from '../../config/actionDialogConfig';

export type ConfirmationModalProps = {
    show: boolean;
    dialogMetaData: DialogMetaData,
    confirmationPrompt: string,
    onCancel: () => void,
    onConfirm: () => void
}

const props = defineProps<{
    show: boolean;
    dialogMetaData: DialogMetaData,
    confirmationPrompt: string,
    onCancel: () => void,
    onConfirm: () => void
}>();

</script>