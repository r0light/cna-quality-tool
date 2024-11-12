<template>
    <div v-for="option of propertyOptions" :data-group-context="groupId" :data-group-id="cardBodyId"
        v-show="option.show">
        <form :id="option.providedFeature" class="form-group"
            :class="[{ 'needs-validation': option.includeFormCheck }, { 'form-check': (option.contentType === PropertyContent.CHECKBOX) }, { 'novalidate': option.includeFormCheck }]">
            <!--TODO separation line?-->
            <label :for="option.providedFeature"
                :class="{ 'form-check-label': option.contentType === PropertyContent.CHECKBOX }">
                <span v-if="option.attributes.svgRepresentation" v-html="option.attributes.svgRepresentation"></span>
                <i v-if="option.attributes.iconClass" :class="option.attributes.iconClass"></i>
                <span v-html="option.label"></span>
                <span v-if="option.contentType === PropertyContent.INPUT_RANGE"
                    class="rangeBoxCurrentValue ml-2 align-baseline badge badge-primary badge-pill">{{
                        option.value }} px</span>
            </label>
            <div :class="['input-group', { 'has-validation': option.includeFormCheck }]">
                <!--TODO group item-->
                <textarea v-if="option.contentType === PropertyContent.TEXTAREA" :id="option.providedFeature"
                    class="form-control" type="text" :class="option.validationState"
                    :disabled="option.inputProperties.disabled" :required="option.inputProperties.required"
                    :rows="option.attributes.rows" :maxlength="option.attributes.maxLength" v-model="option.value"
                    :aria-describedby="option.helpTextId" :data-property-type="groupId"
                    v-on:keydown.enter.prevent="onEnterProperties([option])"></textarea>
                <input v-if="option.contentType === PropertyContent.INPUT_RANGE"
                    class="col px-md-2 form-control-range form-check" :id="option.providedFeature"
                    :class="option.validationState" :disabled="option.inputProperties.disabled"
                    :required="option.inputProperties.required" type="range" :min="option.attributes.min"
                    :max="option.attributes.max" v-model="option.value" :step="option.attributes.step"
                    :aria-describedby="option.helpTextId" :data-property-type="groupId"
                    v-on:keydown.enter.prevent="onEnterProperties([option])">
                <input v-if="option.contentType === PropertyContent.INPUT_NUMBERBOX" :id="option.providedFeature"
                    class="form-control" type="number" :class="option.validationState"
                    :disabled="option.inputProperties.disabled" :required="option.inputProperties.required"
                    :min="option.attributes.min" :max="option.attributes.max" :step="option.attributes.step"
                    :maxlength="option.attributes.maxlength" v-model="option.value"
                    :aria-describedby="option.helpTextId" :data-property-type="groupId"
                    v-on:keydown.enter.prevent="onEnterProperties([option])">
                <div v-if="option.contentType === PropertyContent.INPUT_TEXTBOX" class="input-group">
                    <div v-if="option.attributes.inputLabelIcon" class="input-group-prepend">
                        <span class="input-group-text">
                            <i :class="option.attributes.inputLabelIcon"></i>
                            <span class="modalInputLabel">{{ option.label }}</span>
                        </span>
                    </div>
                    <input :id="option.providedFeature" class="form-control" type="text" :class="option.validationState"
                        :disabled="option.inputProperties.disabled" :required="option.inputProperties.required"
                        :placeholder="option.attributes.placeholder" v-model="option.value"
                        :aria-describedby="option.helpTextId" :data-property-type="groupId"
                        :list="option.providedFeature + '-datalist'"
                        v-on:keydown.enter.prevent="onEnterProperties([option])">
                    <datalist :id="option.providedFeature + '-datalist'">
                        <option v-for="suggestOption of option.attributes.suggestedValues" :value="suggestOption.value">
                            {{ suggestOption.text }}</option>
                    </datalist>
                </div>
                <input v-if="option.contentType === PropertyContent.CHECKBOX" :id="option.providedFeature"
                    class="form-check-input" type="checkbox" :class="option.validationState"
                    :disabled="option.inputProperties.disabled" :required="option.inputProperties.required"
                    :checked="option.inputProperties.checked" :aria-describedby="option.helpTextId"
                    :data-property-type="groupId" v-model="option.value" @change="onEnterProperties([option])">
                <select v-if="option.contentType === PropertyContent.DROPDOWN" class="custom-select"
                    :id="option.providedFeature" :class="option.validationState"
                    :disabled="option.inputProperties.disabled" :required="option.inputProperties.required"
                    :size="option.attributes.size" :multiple="option.attributes.multiple" :data-property-type="groupId"
                    v-model="option.value" @change="onEnterProperties([option])">
                    <option v-for="selectOption of option.dropdownOptions" :value="selectOption.optionValue"
                        :class="selectOption.representationClass" :key="selectOption.optionValue"
                        :placeholder="option.attributes.placeholder" :title="selectOption.optionTitle"
                        :disabled="selectOption.disabled">
                        {{ selectOption.optionText }}
                    </option>
                </select>
                <div v-if="option.contentType === PropertyContent.TOGGLE" class="input-group"
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
                <div v-if="option.contentType === PropertyContent.MULTI_SELECT">
                    <button :id="option.providedFeature" class="btn btn-dark btn-block" type="button"
                        aria-describedby="" :data-property-type="groupId" :disabled="option.inputProperties.disabled"
                        :required="option.inputProperties.required" @click="onOpenDialog(option)">
                        <i :class="option.attributes.buttonIconClass"></i>
                        {{ option.attributes.buttonText }}
                    </button>

                    <ModalWrapper :show="option.showDialog" :dialogMetaData="option.attributes.dialogMetaData"
                        @close:Modal="option.showDialog = false"
                        @action:Modal="onEnterProperties([option]); option.showDialog = false">
                        <template v-slot:modalContent>
                            <!--TODO headline?-->
                            <p>{{ option.attributes.dialogInfo }}</p>
                            <div class="table-responsive">
                                <table class="table table-hover">
                                    <thead class="thead-dark">
                                        <tr>
                                            <th v-for="columnHeader of option.attributes.tableColumnHeaders">
                                                {{ columnHeader.text }}
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr v-for="row of option.tableRows" class="tableRow"
                                            :class="[{ 'text-muted': row.attributes.disabled }, row.attributes.representationClass]">
                                            <td v-for="[columnKey, columnValue] of Object.entries(row.columns)"
                                                :data-table-context="columnKey" >
                                                <span v-if="typeof columnValue === 'string'"
                                                    :class="{ 'font-weight-bold': row.attributes.isTheCurrentEntity }">
                                                    {{
                                                        columnValue }}</span>
                                                <div v-if="typeof columnValue === 'object' && columnValue.contentType === PropertyContent.CHECKBOX_WITHOUT_LABEL"
                                                    class="form-check">
                                                    <input class="dialogCheckBox form-check-input position-static"
                                                        type="checkbox" :value="columnValue.id"
                                                        :disabled="columnValue.disabled" :checked="columnValue.checked"
                                                        v-model="columnValue.checked">
                                                </div>
                                                <div v-if="typeof columnValue === 'object' && columnValue.contentType === PropertyContent.INPUT_NUMBERBOX"
                                                    class="form-check" >
                                                    <input class="position-static form-control" :class="[option.validationState, { 'cell-highlighted': columnValue.highlight(columnValue.value) }]" :id="columnValue.id"
                                                        type="number" :min="columnValue.min" :max="columnValue.max"  :step="columnValue.step" :value="columnValue.value" :disabled="columnValue.disabled" v-model="columnValue.value">
                                                </div>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </template>
                    </ModalWrapper>
                </div>
                <div v-if="option.contentType === PropertyContent.DYNAMIC_LIST">
                    <button :id="option.providedFeature" class="btn btn-dark btn-block" type="button"
                        aria-describedby="" :data-property-type="groupId" :disabled="option.inputProperties.disabled"
                        :required="option.inputProperties.required" @click="onOpenDialog(option)">
                        <i :class="option.attributes.buttonIconClass"></i>
                        {{ option.attributes.buttonText }}
                    </button>

                    <ModalWrapper :show="option.showDialog" :dialogMetaData="option.attributes.dialogMetaData"
                        @close:Modal="option.showDialog = false"
                        @action:Modal="onEnterProperties([option]); option.showDialog = false">
                        <template v-slot:modalContent>
                            <!--TODO headline?-->
                            <p>{{ option.attributes.dialogInfo }}</p>
                            <div class="dynamic-list-wrapper">
                                <div class="table-responsive">
                                    <table class="table table-hover">
                                        <thead class="thead-dark">
                                            <tr>
                                                <th v-for="elementField of option.attributes.listElementFields.slice(0, Math.min(3, option.attributes.listElementFields.length))">
                                                    {{ elementField.label }}
                                                </th>
                                                <th v-if="option.attributes.listElementFields.length > 3" class="overloaded">
                                                    <span v-for="elementField of option.attributes.listElementFields.slice(3)"> {{ elementField.label }}</span>
                                                
                                                </th>
                                                <th>Delete</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr v-for="[index, row] of (option.value as any[]).entries()"
                                                class="tableRow">
                                                <td v-if="typeof row === 'object'"
                                                    v-for="[columnKey, columnValue] of Object.entries(row).slice(0, Math.min(3, Object.entries(row).length))"
                                                    :data-table-context="columnKey">
                                                    <!-- list with objects -->
                                                    <span v-if="typeof columnValue === 'string'"> {{ columnValue
                                                        }}</span>
                                                </td>
                                                <td v-if="typeof row === 'object' && Object.entries(row).length > 3" class="overloaded">
                                                    <!-- list with objects -->
                                                    <span v-for="[columnKey, columnValue] of Object.entries(row).slice(3)"> {{ columnValue
                                                        }}</span>
                                                </td>
                                                <td v-else>
                                                    <!-- list with literals -->
                                                    <span>{{ row }}</span>
                                                </td>
                                                <td>
                                                    <button type="button" class="btn btn-outline-dark"
                                                        @click="onRemoveFromDynamicList(option, index)">
                                                        <i class="fa-solid fa-trash-can"></i>
                                                    </button>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                                <h5>Add new Item</h5>
                                <div v-for="elementField of option.attributes.listElementFields">
                                    <div class="input-group">
                                        <div class="input-group-prepend">
                                            <span class="input-group-text">
                                                <i :class="elementField.labelIcon"></i>
                                                <span class="modalInputLabel">{{ elementField.label }}</span>
                                            </span>
                                        </div>
                                        <input v-if="elementField.fieldType === 'text'" :id="elementField.key"
                                            class="form-control" type="text" :placeholder="elementField.placeholder"
                                            v-model="option.newElementData[elementField.key]">
                                        <select v-if="elementField.fieldType === 'dropdown'" :id="elementField.key"
                                            class="form-control"
                                            v-model="option.newElementData[elementField.key]">
                                        <option v-for="dropdownOption of elementField.dropdownOptions" :value="dropdownOption"> {{ dropdownOption }}</option>
                                    </select>
                                    </div>
                                </div>
                                <button type="button" class="btn btn-outline-dark" @click="onAddToDynamicList(option)">
                                    <i :class="option.attributes.addElementButton.labelIcon"></i>
                                    {{ option.attributes.addElementButton.label }}
                                </button>
                            </div>


                        </template>
                    </ModalWrapper>
                </div>

                <!-- TODO in leftLabel ${isChecked ? 'text-muted' : ''}"-->
                <!--TODO edit button? -->
                <div v-if="option.provideEnterButton" class="input-group-append">
                    <button :id="option.enterButtonId" :disabled="option.inputProperties.disabled"
                        class="enterPropertyButton btn btn-outline-secondary" type="button"
                        @click="onEnterProperties([option])">
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
import type { dia } from '@joint/core';
import { PropertyContent, CheckboxPropertyConfig, DropdownPropertyConfig, InputProperties, JointJsConfig, NumberPropertyConfig, NumberRangePropertyConfig, PropertyConfig, TextAreaPropertyConfig, TextPropertyConfig, TogglePropertyConfig, DynamicListPropertyConfig, PropertyContentType, MultiSelectPropertyConfig } from '../../config/detailsSidebarConfig';
import ModalWrapper from '../components/ModalWrapper.vue';

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
    value: string | number | any[],
    checked?: boolean,
    showDialog?: boolean,
    tableRows?: TableRowConfig[]
    newElementData?: object
}

export type TableRowConfig = {
    attributes: { isTheCurrentEntity?: boolean, representationClass: string, disabled: boolean },
    columns: {
        [key: string]: string | TableRowCheckboxConfig | TableRowNumberConfig
    }
}

export type TableRowCheckboxConfig = {
    contentType: "checkbox-without-label",
    disabled: boolean,
    checked: boolean,
    id: dia.Cell.ID
}

export type TableRowNumberConfig = {
    contentType: "number",
    disabled: boolean,
    min: number,
    max: number,
    step: number,
    value: number,
    id: string,
    highlight: (value: number) => boolean
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
            case (PropertyContent.TEXTAREA):
                let textAreaOption = option as TextAreaPropertyConfig;
                options.push({
                    ...preparedProperty, ...{
                        attributes: textAreaOption.attributes,
                        value: ""
                    }
                } as EditPropertySection)
                break;
            case (PropertyContent.INPUT_TEXTBOX):
                let textBoxOption = option as TextPropertyConfig;
                options.push({
                    ...preparedProperty, ...{
                        attributes: textBoxOption.attributes,
                        value: ""
                    }
                } as EditPropertySection)
                break;
            case (PropertyContent.INPUT_NUMBERBOX):
                let inputNumberOption = option as NumberPropertyConfig;
                options.push({
                    ...preparedProperty, ...{
                        attributes: inputNumberOption.attributes,
                        value: 0
                    }
                } as EditPropertySection)
                break;
            case (PropertyContent.INPUT_RANGE):
                let inputRangeOption = option as NumberRangePropertyConfig;
                options.push({
                    ...preparedProperty, ...{
                        attributes: inputRangeOption.attributes,
                        value: 0
                    }
                } as EditPropertySection)
                break;
            case (PropertyContent.CHECKBOX):
                let checkboxOption = option as CheckboxPropertyConfig;
                options.push({
                    ...preparedProperty, ...{
                        attributes: checkboxOption.attributes,
                        value: "" //TODO does this work?
                    }
                } as EditPropertySection)
                break;
            case (PropertyContent.DROPDOWN):
                let dropdownOption = option as DropdownPropertyConfig;
                options.push({
                    ...preparedProperty, ...{
                        attributes: dropdownOption.attributes,
                        dropdownOptions: dropdownOption.dropdownOptions,
                        value: dropdownOption.attributes.defaultValue
                    }
                } as EditPropertySection)
                break;
            case (PropertyContent.TOGGLE):
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
            case (PropertyContent.MULTI_SELECT):
                let multiSelectDialogOption = option as MultiSelectPropertyConfig;
                options.push({
                    ...preparedProperty, ...{
                        attributes: multiSelectDialogOption.attributes,
                        showDialog: false,
                        tableRows: []
                    }
                } as EditPropertySection)
                break;
            case (PropertyContent.DYNAMIC_LIST):
                let dynamicListOption = option as DynamicListPropertyConfig;
                options.push({
                    ...preparedProperty, ...{
                        attributes: dynamicListOption.attributes,
                        newElementData: (() => {
                            let dataHolder = {};
                            if (Array.isArray(dynamicListOption.attributes.listElementFields)) {
                                // list with objects
                                for (const elementField of dynamicListOption.attributes.listElementFields) {
                                    dataHolder[elementField.key] = "";
                                }
                            } else {
                                // list with literals
                                //dataHolder[dynamicListOption.attributes.listElementFields.key] = "";
                            }
                            return dataHolder;
                        })(),
                        showDialog: false,
                        value: []
                    }
                })
                break;
        }
    }
    return options;
}
</script>

<script lang="ts" setup>

const props = defineProps<{
    groupId: string,
    cardBodyId: string,
    propertyOptions: EditPropertySection[]
}>()

const emit = defineEmits<{
    (e: "on:EnterProperty", properties: EditPropertySection[]): void;
}>()


function onEnterProperties(propertyOptions: EditPropertySection[]) {
    emit("on:EnterProperty", propertyOptions);
}

function onOpenDialog(propertyOption: EditPropertySection) {
    propertyOption.showDialog = !propertyOption.showDialog;
}


function onAddToDynamicList(propertyOption: EditPropertySection) {
    // TODO validation?

    if (Object.entries(propertyOption.newElementData).length === 1) {
        for (const [key, value] of Object.entries(propertyOption.newElementData)) {
            (propertyOption.value as any[]).push(value);
        }
    } else {
        let newElement = {};
        for (const [key, value] of Object.entries(propertyOption.newElementData)) {
            newElement[key] = value;
        }
        (propertyOption.value as any[]).push(newElement);
    }

    // clear new data input
    for (const key of Object.keys(propertyOption.newElementData)) {
        propertyOption.newElementData[key] = "";
    }
}

function onRemoveFromDynamicList(propertyOption: EditPropertySection, listIndex: number) {
    (propertyOption.value as any[]).splice(listIndex, 1);
}

</script>

<style>
.dynamic-list-wrapper {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    row-gap: 1em;
    width: 100%;
}

.dynamic-list-wrapper button {
    width: fit-content;
}

.overloaded {
    display: flex;
    flex-direction: column;
}

.cell-highlighted {
    background-color: #cadde7;
}
</style>