
<template>
    <ModalWrapper :show="show" :dialogMetaData="dialogMetaData" @close:Modal="emit('close:Modal')" @save:Modal="emit('save:Modal')">
        <template v-slot:modalContent>
            <p>{{ confirmationPrompt }}</p>
        </template>
    </ModalWrapper>
</template>

<script lang="ts" setup>
import ModalWrapper from './ModalWrapper.vue';
import {  DialogMetaData } from '../../config/actionDialogConfig';

const props = defineProps<{
    show: boolean;
    dialogMetaData: DialogMetaData,
    confirmationPrompt: string, 
}>();

const emit = defineEmits<{
    (e: "close:Modal"): void;
    (e: "save:Modal"): void;
}>()

</script>