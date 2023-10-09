# A Prototypical Web-Based Modeling Application

This directory includes a prototypical implementation of a modeling application and is related to the [https://github.com/KarolinDuerr/MA-CNA-ModelingSupport](https://github.com/KarolinDuerr/MA-CNA-ModelingSupport) repository.

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

## Generate Markdown description of the quality model

To generate a markdown representation of the quality model, a node script is included which you can run via:

```sh
cd src/core/qualitymodel
ts-node profileParser.ts
```

## TODO

### features

- [ ] preserve state in case of page reload
- [ ] new Tab: Quality Evaluation
  - [ ] calculated metrics
  - [ ] product factors and their "presence" expressed as value or color
  - [ ] quality ratings based on quality aspects
- [ ] new Tab: QM Configuration
  - [ ] Edit measures
  - [ ] Edit evaluations (relation between )
  - [ ] Edit product factors
  - [ ] Edit quality aspects
- [x] Import JSON model
- [ ] Import TOSCA model
- [ ] More specific show/hide features (all backing services, all infrastructure and deployment mappings, )

### Editor features

- [x] Delete element with delete button
- [x] Do not let infrastructure element grow in height
- [x] Data Aggregate / Backing Data Family selection: // TODO handle family topic
- [ ] make Paper draggable with mouse (https://stackoverflow.com/questions/28431384/how-to-make-a-paper-draggable)
- [ ] increase element size to ensure embedded elements are within the element when added

### technical things

- [x] refactor to TypeScript
- [ ] add tests for quality calculations (using https://github.com/avajs/ava)
