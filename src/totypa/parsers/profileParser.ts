import * as yaml from 'js-yaml';
import * as fs from 'fs';
import { TOSCA_Service_Template } from '../tosca-types/template-types';


try {
    const doc: TOSCA_Service_Template = yaml.load(fs.readFileSync("../../../tosca-profiles/tosca-simple-profile-for-yaml-v1.3/data.yaml", 'utf8')) as TOSCA_Service_Template;
    console.log(doc);
    console.log(JSON.stringify(doc))
    /*
    if (doc.data_types) {
    for (let [key, datatype] of Object.entries(doc.data_types)) {
        console.log(key + ": " + datatype)
        if (datatype.constraints) {
            for (let [key, constraint] of Object.entries(datatype.constraints!)) {
                console.log(constraint)
            }
        }
    }
    }
    */

  } catch (e) {
    console.log(e);
}