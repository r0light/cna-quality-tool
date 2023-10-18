import * as yaml from 'js-yaml';
import * as Entities from '../entities'
import { TOSCA_Service_Template } from '@/totypa/tosca-types/template-types';
import { EntitiesToToscaConverter } from './EntitiesToToscaConverter';
import { ToscaToEntitesConverter } from './ToscaToEntitesConverter';

export function convertToServiceTemplate(systemEntity: Entities.System): TOSCA_Service_Template {

    // TODO customize version?
    const entitiesToToscaConverter = new EntitiesToToscaConverter(systemEntity, "0.1.0");

    return entitiesToToscaConverter.convert();
}

export function importFromServiceTemplate(fileName: string, stringifiedServiceTemplate: string): Entities.System {

    const serviceTemplate: TOSCA_Service_Template = yaml.load(stringifiedServiceTemplate) as TOSCA_Service_Template;

    const systemName = fileName.replace(/\..*$/g, "");

    const toscaToEntitesConverter = new ToscaToEntitesConverter(serviceTemplate, systemName);

    return toscaToEntitesConverter.convert();
}