<template>
    <div class="modal" :class="{'show': show}" :data-backdrop="{ 'static': isStatic }" :data-keyboard="!isStatic" tabindex="-1"
        :aria-labelledby="titleId" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable" :class="dialogConfig.dialogSize">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modalTitleIcon modal-title">
                        <span v-html="dialogConfig.dialogContent.header.svgRepresentation"></span>
                        <!-- TODO use as default <i class="fa-solid fa-info" :data-type="headerDataType"></i> -->
                    </h5>
                    <h5 class="modal-title">{{ dialogConfig.dialogContent.header.text }}</h5>
                    <div class="close">
                    <button v-show="dialogConfig.dialogContent.header.closeButton" type="button" class="close"
                        data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                </div>
                <div class="modal-body">
                    <div class="container-fluid">
                        <p v-if="dialogConfig.dialogContent.content.contentType === UIContentType.SINGLE_TEXTBLOCK">
                            {{ dialogConfig.dialogContent.content.text }}
                        </p>
                        <div v-if="dialogConfig.dialogContent.content.contentType === UIContentType.GROUP_FORMS"
                            v-for="item of dialogConfig.dialogContent.content.groups" :data-group-context="context">
                            <div v-if="item.contentType === PropertyContentType.TABLE">
                                <h5 v-html="item.headline"></h5>
                                <p>{{ item.text }}</p>
                                <div class="table-responsive">
                                    <table class="table table-hover">
                                        <thead class="thead-dark">
                                            <tr>
                                                <th v-for="columnHeader of item.tableColumnHeaders">
                                                    {{ columnHeader.text }}
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr v-for="row of item.tableRows" class="tableRow"
                                                :class="[{ 'text-muted': row.attributes.disabled }, row.attributes.representationClass]">
                                                <td v-for="[columnKey, columnValue] of Object.entries(row.columns)"
                                                    :data-table-context="columnKey">
                                                    <span v-if="typeof columnValue === 'string'" :class="{ 'font-weight-bold': row.attributes.isTheCurrentEntity }"> {{ columnValue }}</span>
                                                    <div v-if="typeof columnValue === 'object' && columnValue.contentType === PropertyContentType.CHECKBOX_WITHOUT_LABEL" class="form-check">
                                                        <input class="dialogCheckBox form-check-input position-static"
                                                            type="checkbox" :value="columnValue.id" :disabled="columnValue.disabled" :checked="columnValue.checked" v-model="columnValue.checked">
                                                    </div>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div v-if="item.contentType === PropertyContentType.FORMGROUP">
                                <p>TODO: to be implemented</p> <!-- TODO implement with combined solution also for DetailsSidebar-->
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-dismiss="modal" tabindex="0" @click="requestClose">
                        {{ dialogConfig.dialogContent.footer.cancelButtonText }}
                    </button>
                    <button type="button" class="btn btn-primary" tabindex="0" @click="requestSave">
                        <i :class="dialogConfig.dialogContent.footer.saveButtonIconClass"></i>
                        <span>{{ dialogConfig.dialogContent.footer.saveButtonText }}</span>
                    </button>
                </div>
            </div>
        </div>
    </div>`
</template>


<script lang="ts" setup>
import { UIContentType } from '@/modeling/config/toolbarConfiguration';
import { DialogConfig } from '../../config/actionDialogConfig';
import { PropertyContentType } from '@/modeling/config/detailsSidebarConfig';


const props = defineProps<{
    isStatic: boolean;
    titleId: string;
    context: string;
    show: boolean;
    headerDataType: string; //TODO put in DialogConfig?

    dialogConfig: DialogConfig
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