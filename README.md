# Clounaq Tool: A Web-Based Application to model and evaluate quality aspects of software architectures of cloud-native applications

This tool implements the Clounaq (**Clou**d-**n**ative **a**rchitectural **q**uality) approach which is based on the quality model for cloud-native software architectures (<https://r0light.github.io/cna-quality-model/>).

The first prototype covering the modeling functionality has been developed at <https://github.com/KarolinDuerr/CNA-ModelingApp>. This prototype has been extended to build the tool as available here.

## How to start the application

The application can be started using [Vite](https://vitejs.dev/).

To do so, [Node.js](https://nodejs.org) needs to be installed. You can then set up the project using:

```bash
$ npm install
```

And run the application locally in development mode with:

```bash
$ npm run dev
```

Afterwards you can go to [http://localhost:5173](http://localhost:5173)

## Dependencies

The application uses:
- the open-source modeling library [JointJS](https://www.jointjs.com/opensource) published under the [Open Source Mozilla Public License Version 2.0](https://www.mozilla.org/en-US/MPL/2.0/). The modeling application uses the library as-is.
- [Vue.js](https://vuejs.org/)

## Generate objects from TOSCA profiles

The totypa (TOSCA Typescript parser) library provides Typescript type definitions for the TOSCA standard and parsers for generating Javascript objects out of TOSCA Profile definitions so that they can be used within the app.

To be able to directly run Typescript files, install `ts-node`:

```sh
npm install -g ts-node
```

*Note: this installs ts-node globally on your system, if you do not want that, look for local installation possibilites.*

Then run the profileParser in the following way:

```sh
cd src/totypa/parsers
ts-node profileParser.ts
```

## Modifying and extending the quality model

The tool is intended to be customizable. Therefore you can edit the underlying quality model and extend the evaluation through additional implementations.
The underlying quality model is specified in JSON in the following file:

<src/core/qualitymodel/specifications/qualitymodel.ts>

Additional literature can be added in:

<src/core/qualitymodel/specifications/literature.ts>

Changes to these files will be directly reflected in the quality model after a restart of the application.

To also add implementations to specify additional evaluations, you can modify the following file:

<src/core/qualitymodel/evaluation/measureImplementations.ts>

to add measure implementations (The key for each attribute of the `measureImplementations` constant needs to be unique and the same as specified in the quality model specification).

And in:

<src/core/qualitymodel/evaluation/evaluationImplementations.ts>

you can add implementations for the evaluations of product factors or quality aspects. (Again the key for example for each attribute in the `productFactorEvaluationImplementation` constant needs to be unique and the same as specified in the quality model specification).

For the implementations of measures and evaluations, you can rely on the model of an application as represented by <src/core/entities/system.ts> and its related classes.

## Generate Markdown description of the quality model

To generate a markdown representation of the quality model (based on <src/core/qualitymodel/specifications/qualitymodel.ts> ), a node script is included which you can run via:

```sh
cd src/core/qualitymodel
ts-node exportToMarkdown.ts
```
