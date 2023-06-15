<template>
    <div v-for="option of propertyOptions" :data-group-context="groupId" :data-group-id="cardBodyId" v-show="option.show">
        <form :id="option.providedFeature" class="form-group"
            :class="[{ 'needs-validation': option.includeFormCheck }, { 'form-check': (option.contentType === PropertyContentType.CHECKBOX) }, { 'novalidate': option.includeFormCheck }]">
            <!--TODO separation line?-->
            <label :for="option.providedFeature"
                :class="{ 'form-check-label': option.contentType === PropertyContentType.CHECKBOX }">
                <span v-if="option.attributes.svgRepresentation" v-html="option.attributes.svgRepresentation"></span>
                <i v-if="option.attributes.iconClass" :class="option.attributes.iconClass"></i>
                <span v-html="option.label"></span>
                <span v-if="option.contentType === PropertyContentType.INPUT_RANGE"
                    class="rangeBoxCurrentValue ml-2 align-baseline badge badge-primary badge-pill">{{
                        option.value }} px</span>
            </label>
            <div :class="['input-group', { 'has-validation': option.includeFormCheck }]">
                <!--TODO group item-->
                <textarea v-if="option.contentType === PropertyContentType.TEXTAREA" :id="option.providedFeature"
                    class="form-control" type="text" :class="option.validationState"
                    :disabled="option.inputProperties.disabled" :required="option.inputProperties.required"
                    :rows="option.attributes.rows" :maxlength="option.attributes.maxLength" v-model="option.value"
                    :aria-describedby="option.helpTextId" :title="option.attributes.title" :data-property-type="groupId"
                    v-on:keydown.enter.prevent="onEnterProperty(option)"></textarea>
                <input v-if="option.contentType === PropertyContentType.INPUT_RANGE"
                    class="col px-md-2 form-control-range form-check" :id="option.providedFeature"
                    :class="option.validationState" :disabled="option.inputProperties.disabled"
                    :required="option.inputProperties.required" type="range" :min="option.attributes.min"
                    :max="option.attributes.max" v-model="option.value" :step="option.attributes.step"
                    :aria-describedby="option.helpTextId" :data-property-type="groupId"
                    v-on:keydown.enter.prevent="onEnterProperty(option)">
                <input v-if="option.contentType === PropertyContentType.INPUT_NUMBERBOX" :id="option.providedFeature"
                    class="form-control" type="number" :class="option.validationState"
                    :disabled="option.inputProperties.disabled" :required="option.inputProperties.required"
                    :min="option.attributes.min" :max="option.attributes.max" :step="option.attributes.step"
                    :maxlength="option.attributes.maxlength" v-model="option.value" :aria-describedby="option.helpTextId"
                    :title="option.attributes.title" :data-property-type="groupId"
                    v-on:keydown.enter.prevent="onEnterProperty(option)">
                <input v-if="option.contentType === PropertyContentType.INPUT_TEXTBOX" :id="option.providedFeature"
                    class="form-control" type="text" :class="option.validationState"
                    :disabled="option.inputProperties.disabled" :required="option.inputProperties.required"
                    :placeholder="option.attributes.placeholder" :maxlength="option.attributes.maxlength"
                    v-model="option.value" :pattern="option.attributes.pattern" :aria-describedby="option.helpTextId"
                    :title="option.attributes.title" :data-property-type="groupId"
                    v-on:keydown.enter.prevent="onEnterProperty(option)">
                <div v-if="option.contentType === PropertyContentType.INPUT_TEXTBOX_LABEL_PREPEND" class="input-group">
                    <div class="input-group-prepend">
                        <span class="input-group-text">
                            <i :class="option.attributes.labelIcon"></i>
                            <span class="modalInputLabel">{{ option.label }}</span>
                        </span>
                    </div>
                    <input :id="option.providedFeature" class="form-control" type="text" :class="option.validationState"
                        :disabled="option.inputProperties.disabled" :required="option.inputProperties.required"
                        :placeholder="option.attributes.placeholder" v-model="option.value"
                        :aria-describedby="option.helpTextId" :data-property-type="groupId"
                        v-on:keydown.enter.prevent="onEnterProperty(option)">
                </div>
                <input v-if="option.contentType === PropertyContentType.CHECKBOX" :id="option.providedFeature"
                    class="form-check-input" type="checkbox" :class="option.validationState"
                    :disabled="option.inputProperties.disabled" :required="option.inputProperties.required"
                    :checked="option.inputProperties.checked" :aria-describedby="option.helpTextId"
                    :title="option.attributes.title" :data-property-type="groupId">
                <select v-if="option.contentType === PropertyContentType.DROPDOWN" class="custom-select"
                    :id="option.providedFeature" :class="option.validationState" :disabled="option.inputProperties.disabled"
                    :required="option.inputProperties.required" :size="option.attributes.size"
                    :multiple="option.attributes.multiple" :data-property-type="groupId" v-model="option.value"
                    @change="onEnterProperty(option)">
                    <option v-for="selectOption of option.dropdownOptions" :value="selectOption.optionValue"
                        :key="selectOption.optionValue" :placeholder="option.attributes.placeholder"
                        :title="selectOption.optionTitle" :selected="selectOption.selected">
                        {{ selectOption.optionText }}
                    </option>
                </select>
                <div v-if="option.contentType === PropertyContentType.TOGGLE" class="input-group"
                    @click="() => { option.checked = !option.checked }">
                    <label class="detailsSidebar-toggle-leftLabel user-select-none"
                        :class="{ 'text-muted': option.checked }" :for="option.providedFeature">{{
                            option.attributes.labels.leftLabel }}</label>
                    <div class="custom-control custom-switch toggle-group">
                        <input :id="option.providedFeature" class="custom-control-input detailsSidebar-toggle"
                            type="checkbox" :aria-describedby="option.helpTextId" :data-property-type="groupId"
                            :disabled="option.inputProperties.disabled" :required="option.inputProperties.required"
                            v-model="option.checked">
                        <label class="detailsSidebar-toggle-rightLabel custom-control-label user-select-none"
                            :class="{ 'text-muted': !option.checked }" :for="option.providedFeature">{{
                                option.attributes.labels.rightLabel
                            }}</label>
                    </div>
                </div>
                <div v-if="option.contentType === PropertyContentType.TABLE_DIALOG">
                    <button :id="option.providedFeature" class="btn btn-dark btn-block" type="button"
                        :aria-describedby="option.helpTextId" :data-property-type="groupId"
                        :disabled="option.inputProperties.disabled" :required="option.inputProperties.required"
                        @click="onOpenDialog(option)">
                        <i :class="option.attributes.buttonIconClass"></i>
                        {{ option.attributes.buttonText }}
                    </button>

                    <Teleport to="#modals" v-show="option.showDialog">
                        <ModalEditDialog :context="'entity'" :isStatic="false" :titleId="option.providedFeature"
                            :header-data-type="'normal'" :dialog-config="option.buttonActionContent"
                            :show="option.showDialog" @close:Modal="option.showDialog = false"
                            @save:Modal="onEnterProperty(option)">
                        </ModalEditDialog>
                    </Teleport>
                </div>
                <div v-if="option.contentType === PropertyContentType.TABLE" class="table-responsive">
                    <table class="table table-hover">
                        <thead class="thead-dark">
                            <tr>
                                <th v-for="columnHeader of option.tableColumnHeaders">
                                    {{ columnHeader.text }}
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="row of option.tableRows" class="tableRow"
                                :class="[{ 'text-muted': row.attributes.disabled }, row.attributes.representationClass]">
                                <td v-for="[columnKey, columnValue] of Object.entries(row.columns)"
                                    :data-table-context="columnKey">
                                    <span v-if="typeof columnValue === 'string'"
                                        :class="{ 'font-weight-bold': row.attributes.isTheCurrentEntity }"> {{
                                            columnValue }}</span>
                                    <div v-if="typeof columnValue === 'object' && columnValue.contentType === PropertyContentType.CHECKBOX_WITHOUT_LABEL"
                                        class="form-check">
                                        <input class="dialogCheckBox form-check-input position-static" type="checkbox"
                                            :value="columnValue.id" :disabled="columnValue.disabled"
                                            :checked="columnValue.checked" v-model="columnValue.checked">
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <button v-if="option.contentType === PropertyContentType.BUTTON" type="button" :id="option.providedFeature" class="btn btn-outline-dark" @click="onEnterProperty(option)">
                    <i :class="option.attributes.labelIcon"></i>
                    {{ option.label }}
                </button>

                <!-- TODO in leftLabel ${isChecked ? 'text-muted' : ''}"-->
                <!--TODO edit button? -->
                <div v-if="option.provideEnterButton" class="input-group-append">
                    <button :id="option.enterButtonId" :disabled="option.inputProperties.disabled"
                        class="enterPropertyButton btn btn-outline-secondary" type="button"
                        @click="onEnterProperty(option)">
                        <i class="enterPropertyButtonIcon fa-solid fa-check"></i>
                    </button>
                </div>

            </div>
            <small :id="option.helpTextId" class="form-text text-muted" v-if="option.helpText">{{
                option.helpText }}</small>
            <!--TODO dynamic show-->
            <div v-show="option.validationState === 'is-invalid'" class="invalid-feedback">Reset:
                Invalid input provided</div>
            <div v-show="option.validationState === 'is-valid'" class="valid-feedback">Successfully
                changed.</div>
        </form>
    </div>
</template>

<script lang="ts">
import type { ComputedRef, } from 'vue';
import type { dia } from 'jointjs';
import { PropertyContentType, CheckboxPropertyConfig, DropdownOptionConfig, DropdownPropertyConfig, InputProperties, JointJsConfig, ListPropertyConfig, NumberPropertyConfig, NumberRangePropertyConfig, PropertyConfig, TextAreaPropertyConfig, TextPropertyConfig, TogglePropertyConfig, TableDialogPropertyConfig, TablePropertyConfig, TextLabelPrependPropertyConfig, ButtonPropertyConfig } from '../../config/detailsSidebarConfig';
import { DialogConfig, FormContentConfig } from '@/modeling/config/actionDialogConfig';

export type EditPropertySection = {
    providedFeature: string,
    enterButtonId: string,
    helpTextId: string,
    contentType: string,
    label: string,
    inputProperties: InputProperties,
    helpText: string,
    show: boolean | ComputedRef<boolean>,
    provideEnterButton: boolean,
    jointJsConfig: JointJsConfig
    includeFormCheck: boolean,
    validationState: string,
    attributes: any, //TODO better solution?
    dropdownOptions?: any[]
    value: string | number,
    checked?: boolean,
    buttonActionContent?: ModalEditDialogData,
    showDialog?: boolean,
    tableColumnHeaders?: { text: string }[],
    tableRows?: TableRowConfig[]
}

export type TableRowConfig = {
    attributes: { isTheCurrentEntity: boolean, representationClass: string, disabled: boolean },
    columns: {
        [key: string]: string | TableRowContentConfig
    }
}

export type TableRowContentConfig = {
    contentType: "checkbox-without-label",
    disabled: boolean,
    checked: boolean,
    id: dia.Cell.ID
}

export function toPropertySections(propertyConfigs: PropertyConfig[]): EditPropertySection[] {
    let options: EditPropertySection[] = [];
    for (const option of propertyConfigs) {

        let preparedProperty: EditPropertySection = {
            providedFeature: option.providedFeature,
            enterButtonId: option.providedFeature + "-enterButton",
            helpTextId: option.providedFeature + "-helpText",
            contentType: option.contentType,
            label: option.label,
            inputProperties: option.inputProperties,
            helpText: option.helpText,
            show: option.show,
            provideEnterButton: option.provideEnterButton,
            jointJsConfig: option.jointJsConfig,
            includeFormCheck: true,
            validationState: "",
            attributes: {},
            value: ""
        }
        let contentType: PropertyContentType = option.contentType;
        switch (contentType) {
            case (PropertyContentType.TEXTAREA):
                let textAreaOption = option as TextAreaPropertyConfig;
                options.push({
                    ...preparedProperty, ...{
                        attributes: textAreaOption.attributes,
                        value: ""
                    }
                } as EditPropertySection)
                break;
            case (PropertyContentType.INPUT_TEXTBOX):
                let textBoxOption = option as TextPropertyConfig;
                options.push({
                    ...preparedProperty, ...{
                        attributes: textBoxOption.attributes,
                        value: ""
                    }
                } as EditPropertySection)
                break;
            case (PropertyContentType.INPUT_TEXTBOX_LABEL_PREPEND):
                let textPrependedLabelOption = option as TextLabelPrependPropertyConfig;
                options.push({
                    ...preparedProperty, ...{
                        attributes: textPrependedLabelOption.attributes,
                        value: ""
                    }
                } as EditPropertySection)
                break;
            case (PropertyContentType.INPUT_NUMBERBOX):
                let inputNumberOption = option as NumberPropertyConfig;
                options.push({
                    ...preparedProperty, ...{
                        attributes: inputNumberOption.attributes,
                        value: 0
                    }
                } as EditPropertySection)
                break;
            case (PropertyContentType.INPUT_RANGE):
                let inputRangeOption = option as NumberRangePropertyConfig;
                options.push({
                    ...preparedProperty, ...{
                        attributes: inputRangeOption.attributes,
                        value: 0
                    }
                } as EditPropertySection)
                break;
            case (PropertyContentType.CHECKBOX):
                let checkboxOption = option as CheckboxPropertyConfig;
                options.push({
                    ...preparedProperty, ...{
                        attributes: checkboxOption.attributes,
                        value: "" //TODO does this work?
                    }
                } as EditPropertySection)
                break;
            case (PropertyContentType.INPUT_LIST):
                let listOption = option as ListPropertyConfig;
                options.push({
                    ...preparedProperty, ...{
                        attributes: listOption.attributes,
                        value: ""
                    }
                } as EditPropertySection)
                break;
            case (PropertyContentType.DROPDOWN):
                let dropdownOption = option as DropdownPropertyConfig;
                options.push({
                    ...preparedProperty, ...{
                        attributes: dropdownOption.attributes,
                        dropdownOptions: dropdownOption.dropdownOptions,
                        value: ""
                    }
                } as EditPropertySection)
                break;
            case (PropertyContentType.TOGGLE):
                let toggleOption = option as TogglePropertyConfig;
                options.push({
                    ...preparedProperty, ...{
                        attributes: {
                            labels: toggleOption.labels
                        },
                        value: "",
                        checked: toggleOption.inputProperties.checked
                    }
                } as EditPropertySection)
                break;
            case (PropertyContentType.TABLE_DIALOG):
                let tableDialogOption = option as TableDialogPropertyConfig;
                options.push({
                    ...preparedProperty, ...{
                        attributes: tableDialogOption.attributes,
                        buttonActionContent: toDialogData(tableDialogOption.buttonActionContent),
                        showDialog: false
                    }
                } as EditPropertySection)
                break;
            case (PropertyContentType.TABLE):
                let tableOption = option as TablePropertyConfig;
                options.push({
                    ...preparedProperty, ...{
                        tableColumnHeaders: tableOption.tableColumnHeaders,
                        tableRows: []
                    }
                })
                break;
            case (PropertyContentType.BUTTON):
                let buttonOption = option as ButtonPropertyConfig;
                options.push({
                    ...preparedProperty, ...{
                        attributes: buttonOption.attributes
                    }
                })
                break;
        }
    }
    return options;
}
</script>

<script lang="ts" setup>
import ModalEditDialog, { ModalEditDialogData, toDialogData } from '../components/ModalEditDialog.vue';

const props = defineProps<{
    groupId: string,
    cardBodyId: string,
    propertyOptions: EditPropertySection[]
}>()

const emit = defineEmits<{
    (e: "on:EnterProperty", property: EditPropertySection): void;
}>()


function onEnterProperty(propertyOption: EditPropertySection) {
    emit("on:EnterProperty", propertyOption);
}

function onOpenDialog(propertyOption: EditPropertySection) {
    propertyOption.showDialog = !propertyOption.showDialog;
}


</script>