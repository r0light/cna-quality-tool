<template>
    <div class="button-group" :data-group="buttonGroupId">
        <div v-for="button in buttons">
            <button v-if="button.buttonType === 'button'" :id="button.providedFeature"
                @click="emitToolbarButtonClick(button.providedFeature, $event)" v-show="button.show" class="toolbarButton btn"
                :class="button.additionalCssClass" type="button" :title="button.tooltipText" data-toggle="tooltip"
                data-placement="bottom">
                <i :class="button.iconClass"></i>{{ button.text }}
            </button>
            <div v-if="button.buttonType === 'button-dropdown'" class="buttonDropDownGroup dropdown">
                <button :id="button.providedFeature" class="toolbarDropdownButton btn dropdown-toggle"
                    :class="button.additionalCssClass" type="button" :title="button.tooltipText" data-toggle="dropdown"
                    data-tooltip-toggle="tooltip" data-placement="bottom" aria-expanded="false">
                    <i :class="button.iconClass"></i>{{ button.text }}
                </button>

                <div :id="button.providedFeatureGroup" class="dropdown-menu" :aria-labelledby="button.providedFeatureGroup">
                    <div v-for="dropdownItem of button.dropdownButtons">
                        <button :id="dropdownItem.providedFeature"
                            @click="emitToolbarButtonClick(dropdownItem.providedFeature, $event)"
                            class="toolbarDropdownButtonItem btn dropdown-item" :class="dropdownItem.additionalCssClass"
                            type="button">
                            <i :class="dropdownItem.iconClass" style="font-size: 1.1em"></i>
                            <span> {{ dropdownItem.text }}</span>
                        </button>
                    </div>
                </div>

            </div>

        </div>
    </div>
</template>


<script lang="ts" setup>
import { ToolbarButton } from '../Toolbar.vue';

const props = defineProps<{
    buttonGroupId: string;
    buttons: ToolbarButton[];
    hideButtonClass: string;
}>()

const emit = defineEmits<{
    (e: "toolbarButtonClicked", buttonId: string, event: Event): void;
}>()

function emitToolbarButtonClick(buttonId: string, event: Event) {
    emit("toolbarButtonClicked", buttonId, event)
}


</script>