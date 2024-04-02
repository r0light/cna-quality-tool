<template>
    <div class="details-container">
        <div class="sameEntityHighlighting">
            <div id="entityHighlightingTitle">
                <h6>Entity Highlighting</h6>
            </div>
            <form class="sameEntityHighlighting-Form">
                <fieldset v-for="highlightOption in entityHighlighting" :id="highlightOption.entityType">
                    <div class="form-group">
                        <label :for="highlightOption.entityType"><span
                                v-html="highlightOption.svgRepresentation"></span>{{
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
                            <PropertiesEditor :groupId="propertyGroup.groupId" :cardBodyId="propertyGroup.cardBodyId"
                                :propertyOptions="propertyGroup.options" @on:EnterProperty="onEnterProperty">
                            </PropertiesEditor>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>


<script lang="ts" setup>
import { PropertyContentType, DetailsSidebarConfig, EntityDetailsConfig, PropertyConfig, } from '../../config/detailsSidebarConfig';
import { dia } from 'jointjs';
import { ref, computed, onUpdated, onMounted } from 'vue';
import EntityTypes from '@/modeling/config/entityTypes';
import PropertiesEditor from './PropertiesEditor.vue';
import type { EditPropertySection } from './PropertiesEditor.vue';
import { toPropertySections } from './PropertiesEditor.vue';
import { FormContentData, findInDialogByFeature } from '../components/ModalEditDialog.vue';
import { prop } from 'vue-class-component';
import { DEPLOYMENT_UPDATE_STRATEGIES } from '@/core/entities/deploymentMapping';

const toArray = (o: object, keyName: string, valueName: string) => {
    let asArray = [];
    for (const [attributeKey, attributeValue] of Object.entries(o)) {
        let element = {};
        element[keyName] = attributeKey;
        element[valueName] = attributeValue;
        asArray.push(element);
    };
    return asArray;
}


const props = defineProps<{
    graph: dia.Graph;
    paper: dia.Paper;
    selectedEntity: dia.CellView | dia.LinkView;
    selectedDataAggregate: string;
    selectedBackingData: string;
}>()

const emit = defineEmits<{
    (e: "update:selectedDataAggregate", selectedDataAggregate: string): void;
    (e: "update:selectedBackingData", selectedBackingData: string): void;
}>();

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

const relationshipPath = new RegExp("^relationship\/.*");

var selectedEntity: dia.CellView | dia.LinkView = null;
const selectedEntityId = ref<string>("")
const selectedEntityPropertyGroups = ref<PropertyGroupSection[]>([]);

function findInSectionsByFeature(sections: PropertyGroupSection[], feature: string): EditPropertySection {
    for (const section of sections) {
        let option: EditPropertySection = section.options.find(option => option.providedFeature === feature);
        if (option) {
            return option;
        }
    }
    return null;
}

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
            selectedOption: ((entityTypeName) => {
                switch (entityTypeName) {
                    case EntityTypes.DATA_AGGREGATE:
                        return props.selectedDataAggregate;
                    case EntityTypes.BACKING_DATA:
                        return props.selectedBackingData;
                    default:
                        return "none";
                }
            })(entityType.type)
        })
    }
    return highlightOptions;
})());


function refreshHighlightOptions() {
    for (let highlightOption of entityHighlighting.value) {
        let updatedOptions = [{ optionValue: "none", optionText: "Choose existing entity..." }];
        let considerableEntites = props.graph.getElements().filter(element => element.prop("entity/type") === highlightOption.selectId);
        for (const entity of considerableEntites) {
            let familyName = entity.prop("entity/assignedFamily")
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
        if (entity.id.toString() === highlightOption.selectedOption || entity.prop("entity/assignedFamily") === highlightOption.selectedOption) {
            entity.attr("body/fill", highlightOption.highlightColour);
        } else {
            // reset highlighting of all other elements
            entity.attr("body/fill", "white");
        }
    }
    switch (highlightOption.selectId) {
        case EntityTypes.DATA_AGGREGATE:
            emit("update:selectedDataAggregate", highlightOption.selectedOption);
            break;
        case EntityTypes.BACKING_DATA:
            emit("update:selectedDataAggregate", highlightOption.selectedOption);
            break;
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

onMounted(() => {

    props.graph.on("resetHighlighting", () => {
        for (const highlightingType of entityHighlighting.value) {
            highlightingType.selectedOption = "none";
            onSelectHighlighOption(highlightingType);
        }
    });

    props.graph.on("reloaded", () => {
        refreshHighlightOptions();
    })

    props.graph.on("change", () => {
        refreshHighlightOptions();
    })

})

onUpdated(() => {

    // if no entity is selected / an entity was deselected, clear the current values
    if (!props.selectedEntity) {

        if (selectedEntity) {
            selectedEntity.model.off(null, null, "detailsSidebar");
            selectedEntity = null;
        }

        selectedEntityId.value = "";
        selectedEntityPropertyGroups.value.length = 0;
        return;
    }
    // if the selection has stayed the same, do nothing
    if (props.selectedEntity.model.id.toString() === selectedEntityId.value) {
        return;
    }

    selectedEntity = props.selectedEntity;

    //console.log(props.selectedEntity.model.id);
    // selected entity has changed! only now update the values
    selectedEntityId.value = props.selectedEntity.model.id.toString();

    // clear current property sections
    selectedEntityPropertyGroups.value.length = 0;

    let excludePropertySections = [];
    if (selectedEntity.model.prop("entity/type") === EntityTypes.LINK || props.selectedEntity.model.prop("entity/type") === EntityTypes.DEPLOYMENT_MAPPING) {
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
        return entry[1].type === selectedEntity.model.prop("entity/type")
    }
    )[1];
    const currentOptions: EditPropertySection[] = selectedEntityPropertyGroups.value.find(propertyGroup => propertyGroup.groupId === "entity").options;
    currentOptions.push(...toPropertySections(entityConfig.specificProperties))

    for (let propertyGroup of selectedEntityPropertyGroups.value) {
        for (let option of propertyGroup.options) {

            let valueToSet: any = "";
            if (option.jointJsConfig.propertyType === "attribute") {
                valueToSet = selectedEntity.model.attr(option.jointJsConfig.modelPath);
            } else if (option.jointJsConfig.propertyType === "property" || option.jointJsConfig.propertyType === "providedMethod") {
                valueToSet = selectedEntity.model.prop(option.jointJsConfig.modelPath);

                if (option.providedFeature === "entity-aspect-ratio" && valueToSet) {
                    valueToSet = "(h ~ " + (valueToSet.height / valueToSet.width).toFixed(2) + " * w)";
                }
            }

            option.value = valueToSet;
            option.validationState = "";
        }
    }

    switch (selectedEntity.model.prop("entity/type")) {
        case EntityTypes.COMPONENT:
        case EntityTypes.SERVICE:
        case EntityTypes.BACKING_SERVICE:
        case EntityTypes.STORAGE_BACKING_SERVICE:
            let editComponentAssignedNetworks: EditPropertySection = findInSectionsByFeature(selectedEntityPropertyGroups.value, "assigned-networks-wrapper");
            let componentAssignedNetworksOption = findInDialogByFeature(editComponentAssignedNetworks.buttonActionContent, "assigned_networks");
            componentAssignedNetworksOption.includeFormCheck = false;
            componentAssignedNetworksOption.value = selectedEntity.model.prop(componentAssignedNetworksOption.jointJsConfig.modelPath);
            break;
        case EntityTypes.INFRASTRUCTURE:

            let editSupportedArtifacts: EditPropertySection = findInSectionsByFeature(selectedEntityPropertyGroups.value, "supportedArtifacts-wrapper");
            let supportedArtifactsOption = findInDialogByFeature(editSupportedArtifacts.buttonActionContent, "supported_artifacts");
            supportedArtifactsOption.includeFormCheck = false;

            supportedArtifactsOption.value = selectedEntity.model.prop(supportedArtifactsOption.jointJsConfig.modelPath);

            // prepare involved links selection
            let supportedUpdateStrategiesWrapperConfig: EditPropertySection = findInSectionsByFeature(selectedEntityPropertyGroups.value, "supportedUpdateStrategies-wrapper");
            let supportedUpdateStrategiesConfig = findInDialogByFeature(supportedUpdateStrategiesWrapperConfig.buttonActionContent, "supported_update_strategies");
            supportedUpdateStrategiesConfig.includeFormCheck = false;

            const currentlySupportedStrategies = selectedEntity.model.prop(supportedUpdateStrategiesConfig.jointJsConfig.modelPath) ? selectedEntity.model.prop(supportedUpdateStrategiesConfig.jointJsConfig.modelPath) : [];

            // clear table rows
            supportedUpdateStrategiesConfig.tableRows.length = 0;
            DEPLOYMENT_UPDATE_STRATEGIES.forEach((strategy) => {

                supportedUpdateStrategiesConfig.tableRows.push({
                    columns: {
                        name: strategy.name,
                        supported: {
                            contentType: PropertyContentType.CHECKBOX_WITHOUT_LABEL,
                            disabled: false,
                            checked: currentlySupportedStrategies.includes(strategy.key),
                            id: strategy.key
                        }
                    },
                    attributes: {
                        representationClass: "validOption",
                        disabled: false
                    }
                });
            })

            let editAssignedNetworks: EditPropertySection = findInSectionsByFeature(selectedEntityPropertyGroups.value, "assigned-networks-wrapper");
            let assignedNetworksOption = findInDialogByFeature(editAssignedNetworks.buttonActionContent, "assigned_networks");
            assignedNetworksOption.includeFormCheck = false;

            assignedNetworksOption.value = selectedEntity.model.prop(assignedNetworksOption.jointJsConfig.modelPath);

            break;
        case EntityTypes.DATA_AGGREGATE:

            for (let propertyOption of currentOptions) {
                // if property is a relationship property it only applies to embedded data aggregates
                if (propertyOption.jointJsConfig.modelPath && relationshipPath.test(propertyOption.jointJsConfig.modelPath)) {

                    propertyOption.show = computed(() => findInSectionsByFeature(selectedEntityPropertyGroups.value, "embedded").value !== "" && findInSectionsByFeature(selectedEntityPropertyGroups.value, "dataAggregate-chooseEditMode").checked);

                    // special case for parent relation, because we want a custom label for the field
                    if (propertyOption.providedFeature === "usage_relation") {
                        propertyOption.label = getParentRelationLabel(selectedEntity.model.prop("entity/embedded"));
                    }
                }
            }

            let chooseEditModeOption: EditPropertySection = findInSectionsByFeature(selectedEntityPropertyGroups.value, "dataAggregate-chooseEditMode");
            chooseEditModeOption.show = computed(() => findInSectionsByFeature(selectedEntityPropertyGroups.value, "embedded").value !== "");

            let assignedFamilyOption: EditPropertySection = findInSectionsByFeature(selectedEntityPropertyGroups.value, "dataAggregate-assignedFamily");
            assignedFamilyOption.show = computed(() => {
                if (findInSectionsByFeature(selectedEntityPropertyGroups.value, "embedded").value !== "") {
                    return findInSectionsByFeature(selectedEntityPropertyGroups.value, "dataAggregate-chooseEditMode").checked
                } else {
                    return false;
                }
            });
            let familyConfigOption: EditPropertySection = findInSectionsByFeature(selectedEntityPropertyGroups.value, "dataAggregate-familyConfig-wrapper");
            familyConfigOption.includeFormCheck = false;
            familyConfigOption.show = computed(() => {
                if (findInSectionsByFeature(selectedEntityPropertyGroups.value, "embedded").value !== "") {
                    return !findInSectionsByFeature(selectedEntityPropertyGroups.value, "dataAggregate-chooseEditMode").checked
                } else {
                    return true;
                }
            });
            let familyTableConfig = ((familyConfigOption.buttonActionContent.dialogContent as FormContentData).groups)[0].contentItems[0];
            familyTableConfig.includeFormCheck = false;
            // clear table rows
            familyTableConfig.tableRows.length = 0;
            // TODO make sure this does not have to be cleared by avoiding that the original config is changed, which is currently the case
            props.graph.getElements().filter(element => element.prop("entity/type") === EntityTypes.DATA_AGGREGATE).forEach(dataAggregate => {
                let parent = dataAggregate.getParentCell();
                let isValid = !!parent
                let parentName = isValid ? parent.attr("label/textWrap/text") : "-";
                let isSameFamily = dataAggregate.prop(assignedFamilyOption.jointJsConfig.modelPath).length !== 0 && dataAggregate.prop(assignedFamilyOption.jointJsConfig.modelPath).localeCompare(props.selectedEntity.model.prop(assignedFamilyOption.jointJsConfig.modelPath)) === 0;
                familyTableConfig.tableRows.push({
                    attributes: {
                        isTheCurrentEntity: selectedEntity.model.id === dataAggregate.id,
                        representationClass: isValid ? "validOption" : "invalidOption",
                        disabled: !isValid
                    },
                    columns: {
                        name: dataAggregate.attr("label/textWrap/text") ? dataAggregate.attr("label/textWrap/text") : "-",
                        familyName: dataAggregate.prop(assignedFamilyOption.jointJsConfig.modelPath) ? dataAggregate.prop(assignedFamilyOption.jointJsConfig.modelPath) : "-",
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


            break;
        case EntityTypes.BACKING_DATA:

            for (let propertyOption of currentOptions) {
                // if property is a relationship property it only applies to embedded data aggregates
                if (propertyOption.jointJsConfig.modelPath && relationshipPath.test(propertyOption.jointJsConfig.modelPath)) {

                    propertyOption.show = computed(() => findInSectionsByFeature(selectedEntityPropertyGroups.value, "embedded").value !== "" && findInSectionsByFeature(selectedEntityPropertyGroups.value, "backingData-chooseEditMode").checked);

                    // special case for parent relation, because we want a custom label for the field
                    if (propertyOption.providedFeature === "usage_relation") {
                        propertyOption.label = getParentRelationLabel(selectedEntity.model.prop("entity/embedded"));
                    }
                }
            }

            let chooseBDEditModeOption: EditPropertySection = findInSectionsByFeature(selectedEntityPropertyGroups.value, "backingData-chooseEditMode");
            chooseBDEditModeOption.show = computed(() => findInSectionsByFeature(selectedEntityPropertyGroups.value, "embedded").value !== "");

            //TODO included data always visible?
            let includedDataOptionWrapper: EditPropertySection = findInSectionsByFeature(selectedEntityPropertyGroups.value, "backingData-includedData-wrapper");
            includedDataOptionWrapper.includeFormCheck = false;
            includedDataOptionWrapper.show = computed(() => {
                if (findInSectionsByFeature(selectedEntityPropertyGroups.value, "embedded").value !== "") {
                    return findInSectionsByFeature(selectedEntityPropertyGroups.value, "backingData-chooseEditMode").checked
                } else {
                    return true;
                }
            });

            let includedDataOption = findInDialogByFeature(includedDataOptionWrapper.buttonActionContent, "backingData-includedData");
            includedDataOption.includeFormCheck = false;

            const toArray = (o: object, keyName: string, valueName: string) => {
                let asArray = [];
                for (const [attributeKey, attributeValue] of Object.entries(o)) {
                    let element = {};
                    element[keyName] = attributeKey;
                    element[valueName] = attributeValue;
                    asArray.push(element);
                };
                return asArray;
            }

            includedDataOption.value = toArray(selectedEntity.model.prop("entity/properties/included_data"), includedDataOption.listElementFields[0].key, includedDataOption.listElementFields[1].key);

            let backingDataAssignedFamilyOption: EditPropertySection = findInSectionsByFeature(selectedEntityPropertyGroups.value, "backingData-assignedFamily");
            backingDataAssignedFamilyOption.show = computed(() => {
                if (findInSectionsByFeature(selectedEntityPropertyGroups.value, "embedded").value !== "") {
                    return findInSectionsByFeature(selectedEntityPropertyGroups.value, "backingData-chooseEditMode").checked
                } else {
                    return false;
                }
            }
            );
            let backingDataFamilyConfigOption: EditPropertySection = findInSectionsByFeature(selectedEntityPropertyGroups.value, "backingData-familyConfig-wrapper");
            backingDataFamilyConfigOption.includeFormCheck = false;
            backingDataFamilyConfigOption.show = computed(() => {
                if (findInSectionsByFeature(selectedEntityPropertyGroups.value, "embedded").value !== "") {
                    return !findInSectionsByFeature(selectedEntityPropertyGroups.value, "backingData-chooseEditMode").checked
                } else {
                    return true;
                }
            });
            let backingDataFamilyTableConfig = (backingDataFamilyConfigOption.buttonActionContent.dialogContent as FormContentData).groups[0].contentItems[0];
            backingDataFamilyTableConfig.includeFormCheck = false;
            // clear table rows
            backingDataFamilyTableConfig.tableRows.length = 0;
            // TODO make sure this does not have to be cleared by avoiding that the original config is changed, which is currently the case
            props.graph.getElements().filter(element => element.prop("entity/type") === EntityTypes.BACKING_DATA).forEach(backingData => {
                let parent = backingData.getParentCell();
                let isValid = !!parent
                let parentName = isValid ? parent.attr("label/textWrap/text") : "-";
                let isSameFamily = backingData.prop(backingDataAssignedFamilyOption.jointJsConfig.modelPath).length !== 0 && backingData.prop(backingDataAssignedFamilyOption.jointJsConfig.modelPath).localeCompare(props.selectedEntity.model.prop(backingDataAssignedFamilyOption.jointJsConfig.modelPath)) === 0;
                backingDataFamilyTableConfig.tableRows.push({
                    attributes: {
                        isTheCurrentEntity: selectedEntity.model.id === backingData.id,
                        representationClass: isValid ? "validOption" : "invalidOption",
                        disabled: !isValid
                    },
                    columns: {
                        name: backingData.attr("label/textWrap/text") ? backingData.attr("label/textWrap/text") : "-",
                        familyName: backingData.prop(backingDataAssignedFamilyOption.jointJsConfig.modelPath) ? backingData.prop(backingDataAssignedFamilyOption.jointJsConfig.modelPath) : "-",
                        parent: parentName,
                        included: {
                            contentType: PropertyContentType.CHECKBOX_WITHOUT_LABEL,
                            disabled: !isValid,
                            checked: isSameFamily,
                            id: backingData.id
                        },
                    }
                })
            })


            break;
        case EntityTypes.REQUEST_TRACE:
            const externalEndpoints = props.graph.getElements().filter(element => element.prop("entity/type") === EntityTypes.EXTERNAL_ENDPOINT);
            let externalEndpointOption: EditPropertySection = findInSectionsByFeature(selectedEntityPropertyGroups.value, "referred_endpoint");
            const selectedExternalEndpoint = selectedEntity.model.prop(externalEndpointOption.jointJsConfig.modelPath);
            const dropdownOptions = externalEndpoints.map((endpoint) => {

                let parentName = "";
                let representationClass = "";
                let invalid = true;

                let parent = endpoint.getParentCell();
                if (parent) { // TODO: don't even show if not parent because then actually invalid?
                    parentName = endpoint.getParentCell().attr("label/textWrap/text");
                    representationClass = "validOption"
                    invalid = false;
                } else {
                    invalid = true;
                    representationClass = "invalidOption";
                }

                return {
                    optionValue: endpoint.id,
                    optionText: endpoint.attr("label/textWrap/text"),
                    optionTitle: `${parentName ? `(Parent: ${parentName})` : 'no parent: invalid option'}`,
                    optionRepresentationClass: `${representationClass ? representationClass : ''}`,
                    disabled: invalid,
                };
            })
            externalEndpointOption.dropdownOptions = dropdownOptions;
            externalEndpointOption.value = selectedExternalEndpoint;

            // prepare involved links selection
            let involvedLinksWrapperConfig: EditPropertySection = findInSectionsByFeature(selectedEntityPropertyGroups.value, "involvedLinks-wrapper");
            let involvedLinksConfig = findInDialogByFeature(involvedLinksWrapperConfig.buttonActionContent, "involved_links");
            involvedLinksConfig.includeFormCheck = false;

            const existingLinks = props.graph.getLinks().filter((link) => { return link.prop("entity/type") === EntityTypes.LINK });
            const selectedLinks: Set<dia.Cell.ID> = new Set(selectedEntity.model.prop(involvedLinksConfig.jointJsConfig.modelPath));

            // clear table rows
            involvedLinksConfig.tableRows.length = 0;
            existingLinks.sort((a, b) => {
                return a.getSourceElement().attr("label/textWrap/text").localeCompare(b.getSourceElement().attr("label/textWrap/text"));
            }).forEach((link) => {
                let isInvalid = true;
                let targetHasParent = false;
                let parentName = "-";

                if (link.getTargetElement() && link.getTargetElement().parent()) {
                    parentName = props.graph.getCell(link.getTargetElement().parent()).attr("label/textWrap/text");
                    targetHasParent = true;
                } else {
                    targetHasParent = false;
                }

                if (link.getSourceElement() && link.getTargetElement()) {
                    isInvalid = targetHasParent ? false : true;
                }

                const fromElement = link.getSourceElement() ? link.getSourceElement().attr("label/textWrap/text") : "-";
                const toElement = link.getTargetElement() ? link.getTargetElement().attr("label/textWrap/text") : "-";

                involvedLinksConfig.tableRows.push({
                    columns: {
                        from: fromElement,
                        to: toElement,
                        parent: parentName,
                        included: {
                            contentType: PropertyContentType.CHECKBOX_WITHOUT_LABEL,
                            disabled: isInvalid,
                            checked: selectedLinks.has(link.id),
                            id: link.id
                        }
                    },
                    attributes: {
                        representationClass: isInvalid ? "invalidOption" : "validOption",
                        disabled: isInvalid
                    }
                });
            })

            break;
        case EntityTypes.ENDPOINT:
        case EntityTypes.EXTERNAL_ENDPOINT:
            // prepare used data aggregate selection
            let usesDataWrapperConfig: EditPropertySection = findInSectionsByFeature(selectedEntityPropertyGroups.value, "usesData-wrapper");
            let usesDataConfig = findInDialogByFeature(usesDataWrapperConfig.buttonActionContent, "uses_data");
            usesDataConfig.includeFormCheck = false;

            const associatedDataAggregates: dia.Cell[] = [];

            let parentComponent = selectedEntity.model.getParentCell();
            if (parentComponent) {
                associatedDataAggregates.push(...parentComponent.getEmbeddedCells().filter(embedded => embedded.prop("entity/type") === EntityTypes.DATA_AGGREGATE));
            }

            const selectedDataAggregates: Set<dia.Cell.ID> = new Set(selectedEntity.model.prop(usesDataConfig.jointJsConfig.modelPath));

            // clear table rows
            usesDataConfig.tableRows.length = 0;
            associatedDataAggregates.sort((a, b) => {
                return a.attr("label/textWrap/text").localeCompare(b.attr("label/textWrap/text"));
            }).forEach((dataAggregate) => {

                usesDataConfig.tableRows.push({
                    columns: {
                        dataAggregateName: dataAggregate.attr("label/textWrap/text"),
                        usageRelation: dataAggregate.prop("relationship/properties/usage_relation"),
                        included: {
                            contentType: PropertyContentType.CHECKBOX_WITHOUT_LABEL,
                            disabled: false,
                            checked: selectedDataAggregates.has(dataAggregate.id),
                            id: dataAggregate.id
                        }
                    },
                    attributes: {
                        representationClass: "validOption",
                        disabled: false
                    }
                });
            })
    }

    // remove previously registered event callbacks
    selectedEntity.model.off(null, null, "detailsSidebar");

    selectedEntity.model.on("change:parent", (cell: dia.Cell) => {

        if (!selectedEntity) {
            return;
        }

        if (cell.id !== selectedEntity.model.id) {
            return;
        }
        //update only if the cell is still selected

        let parent: dia.Cell = selectedEntity.model.getParentCell();
        let parentId: string = "";
        if (parent) {
            parentId = parent.id.toString();
        }

        findInSectionsByFeature(selectedEntityPropertyGroups.value, "embedded").value = parentId;
        selectedEntity.model.prop("entity/embedded", parentId);
        if (selectedEntity.model.prop("entity/type") === EntityTypes.DATA_AGGREGATE) {
            let parentRelationOption: EditPropertySection = findInSectionsByFeature(selectedEntityPropertyGroups.value, "usage_relation");
            parentRelationOption.label = getParentRelationLabel(selectedEntity.model.prop("entity/embedded"));
        }

    }, "detailsSidebar");

    // update position properties when entity is moved
    selectedEntity.model.on("change:position", () => {
        let xOption = findInSectionsByFeature(selectedEntityPropertyGroups.value, "entity-x-position");
        xOption.value = selectedEntity.model.prop(xOption.jointJsConfig.modelPath);
        let yOption = findInSectionsByFeature(selectedEntityPropertyGroups.value, "entity-y-position");
        yOption.value = selectedEntity.model.prop(yOption.jointJsConfig.modelPath);
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


function onEnterProperty(propertyOptions: EditPropertySection[]) {

    for (const propertyOption of propertyOptions) {

        if (propertyOption.includeFormCheck && !isPropertyValueValid(propertyOption)) {
            propertyOption.validationState = "is-invalid";

            let oldValue = "";
            if (propertyOption.jointJsConfig.propertyType === "attribute") {
                oldValue = props.selectedEntity.model.attr(propertyOption.jointJsConfig.modelPath);
            } else if (propertyOption.jointJsConfig.propertyType === "property") {
                oldValue = props.selectedEntity.model.prop(propertyOption.jointJsConfig.modelPath);

            }
            propertyOption.value = oldValue;
            continue;
        }
        propertyOption.validationState = "is-valid";

        const selectedEntityElement: dia.Element = props.selectedEntity.model as dia.Element;

        if (propertyOption.jointJsConfig.propertyType === "free") {
            continue;
        } else if (propertyOption.jointJsConfig.propertyType === "providedMethod") {
            switch (propertyOption.providedFeature) {
                case "entity-x-position":
                    selectedEntityElement.position(propertyOption.value as number, selectedEntityElement.position().y, { deep: true, restrictedArea: props.paper.getArea() });
                    break;
                case "entity-y-position":
                    selectedEntityElement.position(selectedEntityElement.position().x, propertyOption.value as number, { deep: true, restrictedArea: props.paper.getArea() });
                    break;
                case "entity-width":
                    let currentWidth = selectedEntityElement.size().width;
                    let newWidth = propertyOption.value as number;
                    let oldHeight = selectedEntityElement.size().height;
                    let updatedHeight = oldHeight;
                    if (selectedEntityElement.prop("entity/type") !== EntityTypes.INFRASTRUCTURE) {
                        // ensure aspect ratio except for infrastructure
                        const defaultEntitySize = selectedEntityElement.prop("defaults/size");
                        const aspectRatio = defaultEntitySize.height / defaultEntitySize.width;
                        updatedHeight = Number((aspectRatio * (newWidth as number)).toFixed(2));
                    }
                    selectedEntityElement.resize(newWidth as number, updatedHeight, { deep: true });
                    selectedEntityElement.position(selectedEntityElement.position().x - (newWidth - currentWidth) * 0.5, selectedEntityElement.position().y - (updatedHeight - oldHeight) * 0.5);
                    break;
                case "entity-height":
                    let newHeight = propertyOption.value;
                    let oldWidth = selectedEntityElement.size().width;
                    // TODO preserve aspect ratio? -> currently height is not modifiable
                    selectedEntityElement.resize(oldWidth, newHeight as number, { deep: true });
                default:
                    break;
            }
        } else if (propertyOption.jointJsConfig.propertyType === "attribute") {

            // handle special cases first
            switch (selectedEntityElement.prop("entity/type")) {
                case EntityTypes.DATA_AGGREGATE:
                    if (propertyOption.providedFeature === "entity-text" && selectedEntityElement.prop("entity/assignedFamily")) {

                        selectedEntityElement.prop("entity/assignedFamily", propertyOption.value, { rewrite: true });

                        const relatedDataAggregateEntities = props.graph.getElements().filter((entityElement) => {
                            return entityElement.prop("entity/type") === EntityTypes.DATA_AGGREGATE && entityElement.attr(propertyOption.jointJsConfig.modelPath).localeCompare(selectedEntityElement.attr(propertyOption.jointJsConfig.modelPath)) === 0;
                        });

                        for (const relatedDataAggregateEntity of relatedDataAggregateEntities) {
                            relatedDataAggregateEntity.attr(propertyOption.jointJsConfig.modelPath, propertyOption.value);
                            relatedDataAggregateEntity.prop("entity/assignedFamily", propertyOption.value, { rewrite: true });
                        }
                        continue;
                    }
                    break;
                case EntityTypes.BACKING_DATA:
                    if (propertyOption.providedFeature === "entity-text" && selectedEntityElement.prop("entity/assignedFamily")) {

                        selectedEntityElement.prop("entity/assignedFamily", propertyOption.value, { rewrite: true });
                        // also change all other backing data elements of the same family
                        const relatedBackingDataEntities = props.graph.getElements().filter((entityElement) => {
                            return entityElement.prop("entity/type") === EntityTypes.BACKING_DATA && entityElement.attr(propertyOption.jointJsConfig.modelPath).localeCompare(selectedEntityElement.attr(propertyOption.jointJsConfig.modelPath)) === 0;
                        });
                        for (const relatedBackingDataEntity of relatedBackingDataEntities) {
                            relatedBackingDataEntity.attr(propertyOption.jointJsConfig.modelPath, propertyOption.value);
                            relatedBackingDataEntity.prop("entity/assignedFamily", propertyOption.value, { rewrite: true });
                        }
                        continue;
                    }
                    break;
                default:
                    break;
            }

            selectedEntityElement.attr(propertyOption.jointJsConfig.modelPath, propertyOption.value);

        } else if (propertyOption.jointJsConfig.propertyType === "property") {
            selectedEntityElement.prop(propertyOption.jointJsConfig.modelPath, propertyOption.value);
        } else if (propertyOption.jointJsConfig.propertyType === "customProperty") {

            switch (selectedEntityElement.prop("entity/type")) {
                case EntityTypes.COMPONENT:
                case EntityTypes.SERVICE:
                case EntityTypes.BACKING_SERVICE:
                case EntityTypes.STORAGE_BACKING_SERVICE:
                    if (propertyOption.providedFeature === "assigned_networks") {
                        selectedEntityElement.prop(propertyOption.jointJsConfig.modelPath, propertyOption.value);
                    }
                    break;
                case EntityTypes.INFRASTRUCTURE:
                    if (propertyOption.providedFeature === "supported_artifacts" || propertyOption.providedFeature === "assigned_networks") {
                        selectedEntityElement.prop(propertyOption.jointJsConfig.modelPath, propertyOption.value);
                    } else if (propertyOption.providedFeature === "supported_update_strategies") {
                        let supportedStrategies = [];
                        propertyOption.tableRows.forEach(strategy => {
                            if (strategy.columns["supported"]["checked"]) {
                                supportedStrategies.push(strategy.columns["supported"]["id"]);
                            }
                        })
                        selectedEntityElement.prop(propertyOption.jointJsConfig.modelPath, supportedStrategies, { rewrite: true });
                    }
                    break;
                case EntityTypes.DATA_AGGREGATE:
                    if (propertyOption.providedFeature === "dataAggregate-familyConfig") {
                        let currentFamilyName = selectedEntityElement.attr("label/textWrap/text");
                        for (let otherDataAggregate of propertyOption.tableRows) {
                            if (otherDataAggregate.columns["included"]["checked"]) {
                                (props.graph.getCell(otherDataAggregate.columns["included"]["id"]) as dia.Element).attr("label/textWrap/text", currentFamilyName, { rewrite: true });
                                (props.graph.getCell(otherDataAggregate.columns["included"]["id"]) as dia.Element).prop("entity/assignedFamily", currentFamilyName, { rewrite: true });
                            } else {
                                // reset name if it was previously in the same family
                                if ((props.graph.getCell(otherDataAggregate.columns["included"]["id"]) as dia.Element).prop("entity/assignedFamily").localeCompare(currentFamilyName) === 0) {
                                    (props.graph.getCell(otherDataAggregate.columns["included"]["id"]) as dia.Element).attr("label/textWrap/text", "Data Aggregate", { rewrite: true });
                                    (props.graph.getCell(otherDataAggregate.columns["included"]["id"]) as dia.Element).prop("entity/assignedFamily", "", { rewrite: true });
                                }
                            }
                        }
                        continue;
                    }
                    break;
                case EntityTypes.BACKING_DATA:
                    if (propertyOption.providedFeature === "backingData-familyConfig") {
                        let currentFamilyName = selectedEntityElement.attr("label/textWrap/text");
                        for (let otherBackingData of propertyOption.tableRows) {
                            if (otherBackingData.columns["included"]["checked"]) {
                                (props.graph.getCell(otherBackingData.columns["included"]["id"]) as dia.Element).attr("label/textWrap/text", currentFamilyName, { rewrite: true });
                                (props.graph.getCell(otherBackingData.columns["included"]["id"]) as dia.Element).prop("entity/assignedFamily", currentFamilyName, { rewrite: true });
                            } else {
                                // TODO reset name or not?
                                // reset name if it was previously in the same family
                                if ((props.graph.getCell(otherBackingData.columns["included"]["id"]) as dia.Element).prop("entity/assignedFamily").localeCompare(currentFamilyName) === 0) {
                                    (props.graph.getCell(otherBackingData.columns["included"]["id"]) as dia.Element).attr("label/textWrap/text", "Backing Data", { rewrite: true });
                                    (props.graph.getCell(otherBackingData.columns["included"]["id"]) as dia.Element).prop("entity/assignedFamily", "", { rewrite: true });
                                }
                            }
                        }
                        continue;
                    } else if (propertyOption.providedFeature === "backingData-includedData") {
                        const toObject = (a: object[]) => {
                            let asObject = {};
                            for (const element of a) {
                                asObject[element[propertyOption.listElementFields[0].key]] = element[propertyOption.listElementFields[1].key];
                            }
                            return asObject;
                        }

                        selectedEntityElement.prop(propertyOption.jointJsConfig.modelPath, toObject(propertyOption.value as any[]), { rewrite: true });
                    }
                    break;
                case EntityTypes.ENDPOINT:
                case EntityTypes.EXTERNAL_ENDPOINT:
                    if (propertyOption.providedFeature === "uses_data") {
                        let selectedDataAggregateIDs = propertyOption.tableRows.filter(row => row.columns["included"]["checked"])
                            .map(row => row.columns["included"]["id"]);
                        selectedEntityElement.prop(propertyOption.jointJsConfig.modelPath, selectedDataAggregateIDs, { rewrite: true });
                        continue;
                    }
                    break;
                case EntityTypes.REQUEST_TRACE:
                    if (propertyOption.providedFeature === "involved_links") {
                        let selectedLinkIDs = propertyOption.tableRows.filter(row => row.columns["included"]["checked"])
                            .map(row => row.columns["included"]["id"]);
                        selectedEntityElement.prop(propertyOption.jointJsConfig.modelPath, selectedLinkIDs, { rewrite: true });
                        continue;
                    }
                    break;
                default:
                    console.error("no custom handling for this property defined: " + propertyOption.providedFeature);
            }
        } else {
            console.error("unknow property type for: " + propertyOption.providedFeature);
        }
    }
}

function isPropertyValueValid(option): boolean {
    let newValue = option.value;

    //TODO adjust validation to property characteristics

    if (typeof newValue === "string" && !newValue) {
        return false;
    }

    if (typeof newValue === "number") {
        if (option.jointJsConfig.minPath) {
            let minValue = props.selectedEntity.model.prop(option.jointJsConfig.minPath);
            return newValue >= minValue;
        }

        if (option.attributes && option.attributes.min) {
            return newValue >= Number(option.attributes.min);
        }
    }

    return true;
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