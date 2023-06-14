<template>
    <div class="details-container">
        <div class="sameEntityHighlighting">
            <div id="entityHighlightingTitle">
                <h6>Entity Highlighting</h6>
            </div>
            <form class="sameEntityHighlighting-Form">
                <fieldset v-for="highlightOption in entityHighlighting" :id="highlightOption.entityType">
                    <div class="form-group">
                        <label :for="highlightOption.entityType"><span v-html="highlightOption.svgRepresentation"></span>{{
                            highlightOption.labelText }}</label>
                        <select class="entityHighlightingOption custom-select" :id="highlightOption.selectId"
                            :disabled="highlightOption.options.length == 1" v-model="highlightOption.selectedOption"
                            @change="onSelectHighlighOption(highlightOption)">
                            <option v-for="option of highlightOption.options" :value="option.optionValue">{{
                                option.optionText }}</option>
                        </select>
                    </div>

                </fieldset>
            </form>
            <div class="accordion" id="entireDetailsAccordion" v-show="!!selectedEntity">
                <div id="otherEntityDetailsTitle">
                    <h6>Entity Properties</h6>
                </div>
                <div v-for="propertyGroup of selectedEntityPropertyGroups" :id="propertyGroup.cardId"
                    class="detailsSidebar card">
                    <div class="card-header" :id="propertyGroup.headerId">
                        <h2 class="mb-0">
                            <button :id="propertyGroup.headerButtonId"
                                class="detailsSidebar-headlineButton btn btn-link btn-block text-left collapsed"
                                :class="{ collapsed: true }" type="button" data-toggle="collapse"
                                :data-target="propertyGroup.dataTargetId" aria-expanded="false"
                                :aria-controls="propertyGroup.dataTarget">
                                <i class="detailsSidebar-iconHeadline" :class="propertyGroup.headlineIconClass"></i>
                                {{ propertyGroup.headline }}
                            </button>
                        </h2>
                    </div>
                    <div :id="propertyGroup.dataTarget" class="collapse" :aria-labelledby="propertyGroup.headerId"
                        data-parent="#entireDetailsAccordion">
                        <div :id="propertyGroup.cardBodyId" class="card-body">
                            <p v-if="propertyGroup.groupId === 'entity'" class="text-muted">
                                <i class="fa-solid fa-info" style="margin-right: 10px;"></i>
                                Properties included here will not change any presentation details but provide additional
                                information, which is especially relevant for a TOSCA transformation.
                            </p>
                            <div v-for="option of propertyGroup.options" :data-group-context="propertyGroup.groupId"
                                :data-group-id="propertyGroup.cardBodyId" v-show="option.show">
                                <form :id="option.providedFeature" class="form-group"
                                    :class="[{ 'needs-validation': option.includeFormCheck }, { 'form-check': (option.contentType === PropertyContentType.CHECKBOX) }, { 'novalidate': option.includeFormCheck }]">
                                    <!--TODO separation line?-->
                                    <label :for="option.providedFeature"
                                        :class="{ 'form-check-label': option.contentType === PropertyContentType.CHECKBOX }">
                                        <span v-if="option.attributes.svgRepresentation"
                                            v-html="option.attributes.svgRepresentation"></span>
                                        <i v-if="option.attributes.iconClass" :class="option.attributes.iconClass"></i>
                                        <span v-html="option.label"></span>
                                        <span v-if="option.contentType === PropertyContentType.INPUT_RANGE"
                                            class="rangeBoxCurrentValue ml-2 align-baseline badge badge-primary badge-pill">{{
                                                option.value }} px</span>
                                    </label>
                                    <div :class="['input-group', { 'has-validation': option.includeFormCheck }]">
                                        <!--TODO group item-->
                                        <textarea v-if="option.contentType === PropertyContentType.TEXTAREA"
                                            :id="option.providedFeature" class="form-control" type="text"
                                            :class="option.validationState" :disabled="option.inputProperties.disabled"
                                            :required="option.inputProperties.required" :rows="option.attributes.rows"
                                            :maxlength="option.attributes.maxLength" v-model="option.value"
                                            :aria-describedby="option.helpTextId" :title="option.attributes.title"
                                            :data-property-type="propertyGroup.groupId"
                                            v-on:keydown.enter.prevent="onEnterProperty(option)"></textarea>
                                        <input v-if="option.contentType === PropertyContentType.INPUT_RANGE"
                                            class="col px-md-2 form-control-range form-check" :id="option.providedFeature"
                                            :class="option.validationState" :disabled="option.inputProperties.disabled"
                                            :required="option.inputProperties.required" type="range"
                                            :min="option.attributes.min" :max="option.attributes.max" v-model="option.value"
                                            :step="option.attributes.step" :aria-describedby="option.helpTextId"
                                            :data-property-type="propertyGroup.groupId"
                                            v-on:keydown.enter.prevent="onEnterProperty(option)">
                                        <input v-if="option.contentType === PropertyContentType.INPUT_NUMBERBOX"
                                            :id="option.providedFeature" class="form-control" type="number"
                                            :class="option.validationState" :disabled="option.inputProperties.disabled"
                                            :required="option.inputProperties.required" :min="option.attributes.min"
                                            :max="option.attributes.max" :step="option.attributes.step"
                                            :maxlength="option.attributes.maxlength" v-model="option.value"
                                            :aria-describedby="option.helpTextId" :title="option.attributes.title"
                                            :data-property-type="propertyGroup.groupId"
                                            v-on:keydown.enter.prevent="onEnterProperty(option)">
                                        <input v-if="option.contentType === PropertyContentType.INPUT_TEXTBOX"
                                            :id="option.providedFeature" class="form-control" type="text"
                                            :class="option.validationState" :disabled="option.inputProperties.disabled"
                                            :required="option.inputProperties.required"
                                            :placeholder="option.attributes.placeholder"
                                            :maxlength="option.attributes.maxlength" v-model="option.value"
                                            :pattern="option.attributes.pattern" :aria-describedby="option.helpTextId"
                                            :title="option.attributes.title" :data-property-type="propertyGroup.groupId"
                                            v-on:keydown.enter.prevent="onEnterProperty(option)">
                                        <input v-if="option.contentType === PropertyContentType.CHECKBOX"
                                            :id="option.providedFeature" class="form-check-input" type="checkbox"
                                            :class="option.validationState" :disabled="option.inputProperties.disabled"
                                            :required="option.inputProperties.required"
                                            :checked="option.inputProperties.checked" :aria-describedby="option.helpTextId"
                                            :title="option.attributes.title" :data-property-type="propertyGroup.groupId">
                                        <select v-if="option.contentType === PropertyContentType.DROPDOWN"
                                            class="custom-select" :id="option.providedFeature"
                                            :class="option.validationState" :disabled="option.inputProperties.disabled"
                                            :required="option.inputProperties.required" :size="option.attributes.size"
                                            :multiple="option.attributes.multiple"
                                            :data-property-type="propertyGroup.groupId" v-model="option.value"
                                            @change="onEnterProperty(option)">
                                            <option v-for="selectOption of option.dropdownOptions"
                                                :value="selectOption.optionValue" :key="selectOption.optionValue"
                                                :placeholder="option.attributes.placeholder"
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
                                                <input :id="option.providedFeature"
                                                    class="custom-control-input detailsSidebar-toggle" type="checkbox"
                                                    :aria-describedby="option.helpTextId"
                                                    :data-property-type="propertyGroup.groupId"
                                                    :disabled="option.inputProperties.disabled"
                                                    :required="option.inputProperties.required" v-model="option.checked">
                                                <label
                                                    class="detailsSidebar-toggle-rightLabel custom-control-label user-select-none"
                                                    :class="{ 'text-muted': !option.checked }"
                                                    :for="option.providedFeature">{{ option.attributes.labels.rightLabel
                                                    }}</label>
                                            </div>
                                        </div>
                                        <div v-if="option.contentType === PropertyContentType.TABLE_DIALOG">
                                            <button :id="option.providedFeature" class="btn btn-dark btn-block"
                                                type="button" :aria-describedby="option.helpTextId"
                                                :data-property-type="propertyGroup.groupId"
                                                :disabled="option.inputProperties.disabled"
                                                :required="option.inputProperties.required" @click="onTableDialog(option)">
                                                <i :class="option.attributes.buttonIconClass"></i>
                                                {{ option.attributes.buttonText }}
                                            </button>

                                            <Teleport to="#modals" v-show="option.showDialog">
                                                <ModalEditDialog :context="'entity'" :isStatic="false"
                                                    :titleId="option.providedFeature" :header-data-type="'normal'"
                                                    :dialog-config="option.buttonActionContent" :show="option.showDialog"
                                                    @close:Modal="option.showDialog = false"
                                                    @save:Modal="onEnterProperty(option)">
                                                </ModalEditDialog>
                                            </Teleport>
                                        </div>

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
                        </div>
                    </div>
                </div>
            </div>

        </div>
    </div>
</template>


<script lang="ts" setup>
import { CheckboxPropertyConfig, DetailsSidebarConfig, DropdownOptionConfig, DropdownPropertyConfig, EntityDetailsConfig, InputProperties, JointJsConfig, ListPropertyConfig, NumberPropertyConfig, NumberRangePropertyConfig, PropertyConfig, TextAreaPropertyConfig, TextPropertyConfig, TogglePropertyConfig } from '../../config/detailsSidebarConfig';
import { dia } from 'jointjs';
import { ref, computed, onUpdated, onMounted, nextTick } from 'vue';
import type { ComputedRef, Ref } from 'vue';
import EntityTypes from '@/modeling/config/entityTypes';
import { TableDialogPropertyConfig } from '../../config/detailsSidebarConfig';
import ModalEditDialog from '../components/ModalEditDialog.vue';
import { DialogConfig, FormContentConfig, TablePropertyConfig } from '@/modeling/config/actionDialogConfig';
import { PropertyContentType } from '../../config/detailsSidebarConfig';

const props = defineProps<{
    graph: dia.Graph;
    paper: dia.Paper;
    selectedEntity: dia.CellView | dia.LinkView;
    selectedDataAggregate: string;
    selectedBackingData: string;
}>()

type PropertyGroupSection = {
    groupId: string,
    cardId: string,
    headerId: string,
    headerButtonId: string,
    headline: string,
    headlineIconClass: string,
    dataTarget: string,
    dataTargetId: string,
    cardBodyId: string,
    options: EditPropertySection[]
}

type EditPropertySection = {
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
    buttonActionContent?: DialogConfig,
    showDialog?: boolean
}


const selectedEntityId = ref<string>("")
const selectedEntityPropertyGroups = ref<PropertyGroupSection[]>([]);

const entityHighlighting = ref((() => {
    let highlightOptions = []
    for (const entityType of DetailsSidebarConfig.EntityHighlighting) {
        highlightOptions.push({
            entityType: entityType.type + "-fieldset",
            selectId: entityType.type,
            svgRepresentation: entityType.svgRepresentation,
            labelText: entityType.labelText,
            highlightColour: entityType.highlightColour,
            options: [{ optionValue: "none", optionText: "Choose existing entity..." }],
            selectedOption: ""
        })
    }
    return highlightOptions;
})());


function refreshHighlightOptions() {
    for (let highlightOption of entityHighlighting.value) {
        let updatedOptions = [{ optionValue: "none", optionText: "Choose existing entity..." }];
        let considerableEntites = props.graph.getElements().filter(element => element.prop("entity/type") === highlightOption.selectId);
        for (const entity of considerableEntites) {
            let familyName = entity.prop("entity/properties/assignedFamily")
            if (familyName) {
                if (updatedOptions.filter(selectableOption => selectableOption.optionValue === familyName).length === 0) {
                    updatedOptions.push({ optionValue: familyName, optionText: familyName });
                }
            } else {
                updatedOptions.push({
                    optionValue: entity.id.toString(),
                    optionText: entity.attr("label/textWrap/text")
                });
            }
        }
        highlightOption.options = updatedOptions;
        // TODO reset selectedOption if not available anymore
    }
}

function onSelectHighlighOption(highlightOption) {
    let considerableEntites = props.graph.getElements().filter(element => element.prop("entity/type") === highlightOption.selectId);
    for (const entity of considerableEntites) {
        if (entity.id.toString() === highlightOption.selectedOption || entity.prop("entity/properties/assignedFamily") === highlightOption.selectedOption) {
            entity.attr("body/fill", highlightOption.highlightColour);
        } else {
            // reset highlighting of all other elements
            entity.attr("body/fill", "white");
        }
    }
}

function preparePropertyGroupSections(exclude: string[]): PropertyGroupSection[] {
    let propertyGroups: PropertyGroupSection[] = [];

    for (const [groupKey, groupValue] of Object.entries(DetailsSidebarConfig.GeneralProperties)) {
        if (!exclude.includes(groupKey)) {
            propertyGroups.push({
                groupId: groupKey,
                cardId: groupKey + "-card",
                headerId: groupKey + "-header",
                headerButtonId: groupKey + "-button",
                headline: groupValue.headline,
                headlineIconClass: groupValue.iconClass,
                dataTarget: "collapse-" + groupKey,
                dataTargetId: "#collapse-" + groupKey,
                cardBodyId: groupKey + "-card-body",
                options: toPropertySections(groupValue.options)
            } as PropertyGroupSection)
        }

    }
    return propertyGroups;
}

function toPropertySections(propertyConfigs: PropertyConfig[]): EditPropertySection[] {
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
                        buttonActionContent: tableDialogOption.buttonActionContent,
                        showDialog: false
                    }
                } as EditPropertySection)
                break;
        }
    }
    return options;
}

onMounted(() => {
    refreshHighlightOptions();

    // TODO maybe add context and deregister before new registration?
    props.graph.on("change", (cell) => {
        refreshHighlightOptions();
    })

})

onUpdated(() => {

    // if no entity is selected / an entity was deselected, clear the current values
    if (!props.selectedEntity) {
        selectedEntityId.value = "";
        selectedEntityPropertyGroups.value.length = 0;
        return;
    }
    // if the selection has stayed the same, do nothing
    if (props.selectedEntity.model.id.toString() === selectedEntityId.value) {
        return;
    }

    //console.log(props.selectedEntity.model.id);
    // selected entity has changed! only now update the values
    selectedEntityId.value = props.selectedEntity.model.id.toString();

    // clear current property sections
    selectedEntityPropertyGroups.value.length = 0;

    let excludePropertySections = [];
    if (props.selectedEntity.model.prop("entity/type") === EntityTypes.LINK || props.selectedEntity.model.prop("entity/type") === EntityTypes.DEPLOYMENT_MAPPING) {
        // exclude sections if the entity is a link or a deployment mapping
        excludePropertySections.push(...["label", "size", "position"]);
    }
    // fill property sections
    const currentSections: PropertyGroupSection[] = selectedEntityPropertyGroups.value
    currentSections.push(...preparePropertyGroupSections(excludePropertySections));

    // clear current entity-specific properties
    //selectedEntityPropertyGroups.value.find(propertyGroup => propertyGroup.groupId === "entity").options.length = 0;

    //add entity specific properties for current entity
    const entityConfig: { type: string, specificProperties: PropertyConfig[] } = Object.entries(EntityDetailsConfig).find(entry => {
        return entry[1].type === props.selectedEntity.model.prop("entity/type")
    }
    )[1];
    const currentOptions: EditPropertySection[] = selectedEntityPropertyGroups.value.find(propertyGroup => propertyGroup.groupId === "entity").options;
    currentOptions.push(...toPropertySections(entityConfig.specificProperties))

    for (let propertyGroup of selectedEntityPropertyGroups.value) {
        for (let option of propertyGroup.options) {

            let valueToSet = option.jointJsConfig.isProperty ? props.selectedEntity.model.prop(option.jointJsConfig.modelPath) : props.selectedEntity.model.attr(option.jointJsConfig.modelPath);

            if (option.providedFeature === "entity-aspect-ratio" && valueToSet) {
                valueToSet = "(h ~ " + (valueToSet.height / valueToSet.width).toFixed(2) + " * w)";
            }

            option.value = valueToSet;
            option.validationState = "";
        }
    }

    switch (props.selectedEntity.model.prop("entity/type")) {
        case EntityTypes.DATA_AGGREGATE:
            let parentRelationOption: EditPropertySection = selectedEntityPropertyGroups.value.find(section => section.groupId === "entity").options.find(option => option.providedFeature === "dataAggregate-parentRelation");
            parentRelationOption.show = computed(() => selectedEntityPropertyGroups.value.find(section => section.groupId === "entity").options.find(option => option.providedFeature === "embedded").value !== "" && selectedEntityPropertyGroups.value.find(section => section.groupId === "entity").options.find(option => option.providedFeature === "dataAggregate-chooseEditMode").checked);
            parentRelationOption.label = getParentRelationLabel(props.selectedEntity.model.prop("entity/embedded"));
            let chooseEditModeOption: EditPropertySection = selectedEntityPropertyGroups.value.find(section => section.groupId === "entity").options.find(option => option.providedFeature === "dataAggregate-chooseEditMode");
            chooseEditModeOption.show = computed(() => selectedEntityPropertyGroups.value.find(section => section.groupId === "entity").options.find(option => option.providedFeature === "embedded").value !== "");
            let familyConfigOption: EditPropertySection = selectedEntityPropertyGroups.value.find(section => section.groupId === "entity").options.find(option => option.providedFeature === "dataAggregate-familyConfig");
            familyConfigOption.includeFormCheck = false;
            familyConfigOption.show = computed(() => {
                if (selectedEntityPropertyGroups.value.find(section => section.groupId === "entity").options.find(option => option.providedFeature === "embedded").value !== "") {
                    return !selectedEntityPropertyGroups.value.find(section => section.groupId === "entity").options.find(option => option.providedFeature === "dataAggregate-chooseEditMode").checked
                } else {
                    return true;
                }
            });
            let familyTableConfig: TablePropertyConfig = ((familyConfigOption.buttonActionContent.dialogContent.content as FormContentConfig).groups as TablePropertyConfig[])[0];
            // clear table rows
            familyTableConfig.tableRows.length = 0;
            // TODO make sure this does not have to be cleared by avoiding that the original config is changed, which is currently the case
            props.graph.getElements().filter(element => element.prop("entity/type") === EntityTypes.DATA_AGGREGATE).forEach(dataAggregate => {
                let parent = dataAggregate.getParentCell();
                let isValid = !!parent
                let parentName = isValid ? parent.attr("label/textWrap/text") : "-";
                let isSameFamily = dataAggregate.prop("entity/properties/assignedFamily").length !== 0 && dataAggregate.prop("entity/properties/assignedFamily").localeCompare(props.selectedEntity.model.prop("entity/properties/assignedFamily")) === 0;
                familyTableConfig.tableRows.push({
                    attributes: {
                        isTheCurrentEntity: props.selectedEntity.model.id === dataAggregate.id,
                        representationClass: isValid ? "validOption" : "invalidOption",
                        disabled: !isValid
                    },
                    columns: {
                        name: dataAggregate.attr("label/textWrap/text") ? dataAggregate.attr("label/textWrap/text") : "-",
                        familyName: dataAggregate.prop("entity/properties/assignedFamily") ? dataAggregate.prop("entity/properties/assignedFamily") : "-",
                        parent: parentName,
                        included: {
                            contentType: PropertyContentType.CHECKBOX_WITHOUT_LABEL,
                            disabled: !isValid,
                            checked: isSameFamily,
                            id: dataAggregate.id
                        },
                    }
                })
            })

            let assignedFamilyOption: EditPropertySection = selectedEntityPropertyGroups.value.find(section => section.groupId === "entity").options.find(option => option.providedFeature === "dataAggregate-assignedFamily");
            assignedFamilyOption.show = computed(() => {
                if (selectedEntityPropertyGroups.value.find(section => section.groupId === "entity").options.find(option => option.providedFeature === "embedded").value !== "") {
                    return selectedEntityPropertyGroups.value.find(section => section.groupId === "entity").options.find(option => option.providedFeature === "dataAggregate-chooseEditMode").checked
                } else {
                    return false;
                }
            }
            );
            const parentId: string = props.selectedEntity.model.prop("entity/embedded")
            break;
        case EntityTypes.BACKING_DATA:
            break;
    }

    // remove previously registered event callbacks
    props.selectedEntity.model.off(null, null, "detailsSidebar");

    props.selectedEntity.model.on("change:parent", () => {

        let parent: dia.Cell = props.selectedEntity.model.getParentCell();
        let parentId: string = "";
        if (parent) {
            parentId = parent.id.toString();
        }

        selectedEntityPropertyGroups.value.find(section => section.groupId === "entity").options.find(option => option.providedFeature === "embedded").value = parentId;
        props.selectedEntity.model.prop("entity/embedded", parentId);
        if (props.selectedEntity.model.prop("entity/type") === EntityTypes.DATA_AGGREGATE) {
            let parentRelationOption: EditPropertySection = selectedEntityPropertyGroups.value.find(section => section.groupId === "entity").options.find(option => option.providedFeature === "dataAggregate-parentRelation");
            parentRelationOption.label = getParentRelationLabel(props.selectedEntity.model.prop("entity/embedded"));
        }

    }, "detailsSidebar");

    // update position properties when entity is moved
    props.selectedEntity.model.on("change:position", () => {
        let xOption = selectedEntityPropertyGroups.value.find(propertyGroup => propertyGroup.groupId === "position").options.find(propertyOption => propertyOption.providedFeature === "entity-x-position");
        xOption.value = props.selectedEntity.model.prop(xOption.jointJsConfig.modelPath);
        let yOption = selectedEntityPropertyGroups.value.find(propertyGroup => propertyGroup.groupId === "position").options.find(propertyOption => propertyOption.providedFeature === "entity-y-position");
        yOption.value = props.selectedEntity.model.prop(yOption.jointJsConfig.modelPath);
    }, "detailsSidebar")

})

function getParentRelationLabel(parentId: string) {
    if (parentId) {
        const parentType: string = props.graph.getCell(parentId).prop("entity/type");
        const svgRepresentation = ((entityType) => {
            switch (parentType) {
                case EntityTypes.COMPONENT:
                    return `<svg width="30" height="20"><rect width="24" height="12" rx="2" ry="2" transform="translate(2.2, 2)" stroke-dasharray="0" stroke-width="2" stroke="black" fill="white"></rect></svg>`;
                case EntityTypes.SERVICE:
                    return `<svg width="30" height="20"><polygon points="5,0 15,0 20,8 15,16 5,16 0,8" transform="translate(7, 0.7)" stroke-dasharray="0" stroke-width="2" stroke="black" fill="white"></polygon></svg>`;
                case EntityTypes.BACKING_SERVICE:
                    return `<svg width="30" height="20"><polygon points="12.5,0 25,7.5 12.5,15 0,7.5" transform="translate(2, 0.8)" stroke-width="2" stroke="black" fill="white"></polygon></svg>`;
                case EntityTypes.STORAGE_BACKING_SERVICE:
                    return `<svg width="30" height="20">
                                <path transform="translate(6, 0.7) scale(0.27)" d="M 0 10 L 0 50 C 0 55.51784 17.928639999999998 60 40 60 C 62.07136 60 80 55.51784 80 50 L 80 10 C 80 4.4821599999999995 62.07136 0 40 0 C 17.928639999999998 0 0 4.4821599999999995 0 10 Z" stroke-width="5" stroke="black" fill="white"></path>
                                <ellipse transform="translate(6, 0.7) scale(0.27)" cy="10" ry="10" cx="40" rx="40" stroke-width="5" stroke="black" fill="white"></ellipse>
                                </svg>`;
                default:
                    return '';
            }
        }
        )(parentType);
        return svgRepresentation + " Parent Relation:"
    } else {
        return "Parent Relation:"
    }
}


function onEnterProperty(propertyOption: EditPropertySection) {

    if (propertyOption.includeFormCheck && !isPropertyValueValid(propertyOption)) {
        propertyOption.validationState = "is-invalid";
        let oldValue = propertyOption.jointJsConfig.isProperty ? props.selectedEntity.model.prop(propertyOption.jointJsConfig.modelPath) : props.selectedEntity.model.attr(propertyOption.jointJsConfig.modelPath);
        propertyOption.value = oldValue;
        return;
    }
    propertyOption.validationState = "is-valid";

    const selectedEntityElement: dia.Element = props.selectedEntity.model as dia.Element;

    if (propertyOption.jointJsConfig.hasProvidedMethod) {
        switch (propertyOption.providedFeature) {
            case "entity-x-position":
                selectedEntityElement.position(propertyOption.value as number, selectedEntityElement.position().y, { deep: true, restrictedArea: props.paper.getArea() });
                break;
            case "entity-y-position":
                selectedEntityElement.position(selectedEntityElement.position().x, propertyOption.value as number, { deep: true, restrictedArea: props.paper.getArea() });
                break;
            case "entity-width":
                let newWidth = propertyOption.value;
                let oldHeight = selectedEntityElement.size().height;
                if (selectedEntityElement.prop("entity/type") !== EntityTypes.INFRASTRUCTURE) {
                    // ensure aspect ratio except for infrastructure
                    const defaultEntitySize = selectedEntityElement.prop("defaults/size");
                    const aspectRatio = defaultEntitySize.height / defaultEntitySize.width;
                    oldHeight = Number((aspectRatio * (newWidth as number)).toFixed(2));
                }
                selectedEntityElement.resize(newWidth as number, oldHeight, { deep: true });
                break;
            case "entity-height":
                let newHeight = propertyOption.value;
                let oldWidth = selectedEntityElement.size().width;
                // TODO preserve aspect ratio? -> currently height is not modifiable
                selectedEntityElement.resize(oldWidth, newHeight as number, { deep: true });
            default:
                break;
        }
    } else if (propertyOption.jointJsConfig.isProperty) {
        selectedEntityElement.prop(propertyOption.jointJsConfig.modelPath, propertyOption.value);
    } else {
        // handle special cases
        switch (selectedEntityElement.prop("entity/type")) {
            case EntityTypes.BACKING_DATA:
                if (propertyOption.providedFeature === "entity-text" && selectedEntityElement.prop("entity/properties/assignedFamily")) {

                    selectedEntityElement.prop("entity/properties/assignedFamily", propertyOption.value);
                    // also change all other backing data elements of the same family
                    const relatedBackingDataEntities = props.graph.getElements().filter((entityElement) => {
                        return entityElement.prop("entity/type") === EntityTypes.BACKING_DATA && entityElement.attr(propertyOption.jointJsConfig.modelPath).localeCompare(selectedEntityElement.attr(propertyOption.jointJsConfig.modelPath)) === 0;
                    });
                    for (const relatedBackingDataEntity of relatedBackingDataEntities) {
                        relatedBackingDataEntity.attr(propertyOption.jointJsConfig.modelPath, propertyOption.value);
                        relatedBackingDataEntity.prop("entity/properties/assignedFamily", propertyOption.value);
                    }
                    return;
                }
                break;
            case EntityTypes.DATA_AGGREGATE:
                if (propertyOption.providedFeature === "entity-text" && selectedEntityElement.prop("entity/properties/assignedFamily")) {

                    selectedEntityElement.prop("entity/properties/assignedFamily", propertyOption.value);

                    const relatedDataAggregateEntities = props.graph.getElements().filter((entityElement) => {
                        return entityElement.prop("entity/type") === EntityTypes.DATA_AGGREGATE && entityElement.attr(propertyOption.jointJsConfig.modelPath).localeCompare(selectedEntityElement.attr(propertyOption.jointJsConfig.modelPath)) === 0;
                    });

                    for (const relatedDataAggregateEntity of relatedDataAggregateEntities) {
                        relatedDataAggregateEntity.attr(propertyOption.jointJsConfig.modelPath, propertyOption.value);
                        relatedDataAggregateEntity.prop("entity/properties/assignedFamily", propertyOption.value);
                    }
                    return;
                }
                if (propertyOption.providedFeature === "dataAggregate-familyConfig") {
                    let currentFamilyName = selectedEntityElement.attr("label/textWrap/text");
                    let familyTableConfig: TablePropertyConfig = ((propertyOption.buttonActionContent.dialogContent.content as FormContentConfig).groups as TablePropertyConfig[])[0];
                    for (let otherBackingData of familyTableConfig.tableRows) {
                        if (otherBackingData.columns["included"]["checked"]) {
                            (props.graph.getCell(otherBackingData.columns["included"]["id"]) as dia.Element).attr("label/textWrap/text", currentFamilyName);
                            (props.graph.getCell(otherBackingData.columns["included"]["id"]) as dia.Element).prop("entity/properties/assignedFamily", currentFamilyName);
                        } else {
                            // TODO reset name or not?
                            (props.graph.getCell(otherBackingData.columns["included"]["id"]) as dia.Element).attr("label/textWrap/text", "Data Aggregate");
                            (props.graph.getCell(otherBackingData.columns["included"]["id"]) as dia.Element).prop("entity/properties/assignedFamily", "");
                        }
                    }
                    return;
                }
                break;
        }

        // otherwise, it is the simplest case:
        selectedEntityElement.attr(propertyOption.jointJsConfig.modelPath, propertyOption.value);
    }

}

function isPropertyValueValid(option): boolean {

    let newValue = option.value;
    if (!newValue || newValue <= 0) {
        // TOOO: "<= 0" might be possible for some values 
        return false;
    }

    if (option.jointJsConfig.minPath) {
        let minValue = props.selectedEntity.model.prop(option.jointJsConfig.minPath);
        return newValue >= minValue;
    }

    if (option.attributes && option.attributes.min) {
        return newValue >= Number(option.attributes.min);
    }
    return true;
}

function onTableDialog(option: EditPropertySection) {
    option.showDialog = !option.showDialog;
}


</script>

<style>
/* Entity Highlighting */
#entityHighlightingTitle {
    padding-left: 5px;
    padding-top: 5px;
    padding-bottom: 1px;
    background-color: var(--menu-background-colour);
    color: white;
}

.sameEntityHighlighting-Form {
    margin-left: 10px;
    margin-right: 10px;
    margin-top: 10px;
}

select.entityHighlightingOption:focus {
    /* box-shadow: 0 0 0 2px var(--button-focus-colour); */
    box-shadow: 0 0 0 3px rgba(52, 58, 64, 0.3);
    border: 2px solid var(--menu-background-colour);
}

/* FIX ME!!! */
/* .entityHighlightingOption option:hover:not(:disabled),
.entityHighlightingOption option:active:not(:disabled),
.entityHighlightingOption option:focus:not(:disabled) { */
/* select option:selected { */
/* border-color: gray; */
/* outline: none; */
/* border-color: red; */
/* background: var(--button-focus-colour);
    color: #000; 
    box-shadow: inset 20px 20px #00f;
} */

.detailsSidebarSeparator {
    /* border: 1px solid var(--toolbar-line-colour); */
    background-color: var(--toolbar-line-colour);
}

#otherEntityDetailsTitle {
    padding-left: 5px;
    padding-top: 8px;
    padding-bottom: 3px;
    background-color: var(--menu-background-colour);
    color: white;
}

/* .propertyHeadlineButton { */
.detailsSidebar-headlineButton {
    color: black;
}

/* .propertyHeadlineButton:hover { */
.detailsSidebar-headlineButton:hover {
    color: var(--button-focus-colour);
}

/* .propertyHeadlineButton:focus { */
.detailsSidebar-headlineButton:focus {
    box-shadow: 0 0 0 0 !important;
    text-decoration: none !important;
}

.detailsSidebar-iconHeadline {
    margin-right: 10px;
}

.involvedLinks-buttonIcon {
    margin-right: 15px;
}

.enterPropertyButton {
    border-color: lightgray;
}

.enterPropertyButtonIcon {
    color: limegreen;
}

/* Endpoint has parent */
option.validOption {
    background-color: rgb(0, 128, 0, 0.2);
}

.tableRow.invalidOption {
    /* background-color: rgb(212, 212, 212, 0.4);
    opacity: 0.6; */
}

.dialogCheckBox:checked {
    accent-color: #343a40;
}

/* Toggle Switch */
.detailsSidebar-toggle-leftLabel {
    margin-right: 10px;
}

.detailsSidebar-toggle:checked~.custom-control-label::before {
    background-color: #343a40;
    border-color: black;
}

.detailsSidebar-toggle:focus:checked~.custom-control-label::before {
    border-color: black;
    box-shadow: 0 0 0 3px rgba(52, 58, 64, 0.3);
}

/* toggle-group */
.detailsSidebar-toggle:not(:checked)~.detailsSidebar-toggle-rightLabel {
    color: #6c757d;
}

.card-body .valid-feedback {
    display: flex;
    width: 100%;
    margin-top: .25rem;
    font-size: .875em;
    color: #28a745;
}

.card-body .invalid-feedback {
    display: flex;
    width: 100%;
    margin-top: .25rem;
    font-size: .875em;
    color: #dc3545;
}
</style>