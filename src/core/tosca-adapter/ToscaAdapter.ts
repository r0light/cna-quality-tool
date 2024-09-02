import * as yaml from 'js-yaml';
import * as Entities from '../entities'
import { TOSCA_Service_Template } from '@/totypa/tosca-types/v1dot3-types/template-types';
import { EntitiesToToscaConverter } from './EntitiesToToscaConverter';
import { ToscaToEntitesConverter } from './ToscaToEntitesConverter';
import { TOSCA_File } from '@/totypa/tosca-types/v2dot0-types/definition-types';

export function convertToServiceTemplate(systemEntity: Entities.System): TOSCA_File {

    // TODO customize version?
    const entitiesToToscaConverter = new EntitiesToToscaConverter(systemEntity, "0.1.0");

    return entitiesToToscaConverter.convert();
}

export function importFromServiceTemplate(fileName: string, stringifiedServiceTemplate: string): Entities.System {

    const toscaFile: TOSCA_File = yaml.load(stringifiedServiceTemplate) as TOSCA_File;

    const systemName = fileName.replace(/\..*$/g, "");

    const toscaToEntitesConverter = new ToscaToEntitesConverter(toscaFile, systemName);

    return toscaToEntitesConverter.convert();
}