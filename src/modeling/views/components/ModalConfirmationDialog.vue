
<template>
    <ModalWrapper :show="show" :dialogMetaData="dialogMetaData" @close:Modal="onCancel" @action:Modal="actionIndex => onAction(actionIndex)">
        <template v-slot:modalContent>
            <div v-html="confirmationPrompt"></div>
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
                showCancelButton: true,
                cancelButtonText: "Cancel",
                actionButtons: [{ buttonIconClass: "", buttonText: "Save"}]
            }
        }, 
        confirmationPrompt: "",
        onCancel: () => {},
        actions: []
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
    actions: (() => void)[]
}

const props = defineProps<{
    show: boolean;
    dialogMetaData: DialogMetaData,
    confirmationPrompt: string,
    onCancel: () => void,
    actions: (() => void)[]
}>();

function onAction(actionIndex: number) {
    if (actionIndex < props.actions.length) {
        props.actions[actionIndex]();
    } else {
        throw new Error(`There exists no action with index ${actionIndex} in ${props.actions}`);
    }
}

</script>