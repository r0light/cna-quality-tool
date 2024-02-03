import * as yaml from 'js-yaml';
import { TOSCA_Service_Template } from "../tosca-types/template-types.js";

console.log("hello world")


const test = {
    "first": "a",
    "second": "quotation marks are fine"
}

export function readServiceTemplate(templateFileContent: string) {

    const serviceTemplate: TOSCA_Service_Template = yaml.load(templateFileContent) as TOSCA_Service_Template;
    return serviceTemplate;

}