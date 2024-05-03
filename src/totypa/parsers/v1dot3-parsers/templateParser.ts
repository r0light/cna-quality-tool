import * as yaml from 'js-yaml';
import { TOSCA_Service_Template } from "../../tosca-types/v1dot3-types/template-types.js";

export function readServiceTemplate(templateFileContent: string) {

    const serviceTemplate: TOSCA_Service_Template = yaml.load(templateFileContent) as TOSCA_Service_Template;
    return serviceTemplate;

}