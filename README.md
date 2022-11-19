# A Prototypical Web-Based Modeling Application

This directory includes a prototypical implementation of a modeling application and is related to the [https://github.com/KarolinDuerr/MA-CNA-ModelingSupport](https://github.com/KarolinDuerr/MA-CNA-ModelingSupport) repository.


## How to start the application

Start a local server using python by executing the following command in this directory: `python -m http.server 8001`

Afterwards you can go to [http://localhost:8001/modelingApplication.html](http://localhost:8001/modelingApplication.html)

## Dependencies

The application uses:
- the open-source modeling library [JointJS](https://www.jointjs.com/opensource) published under the [Open Source Mozilla Public License Version 2.0](https://www.mozilla.org/en-US/MPL/2.0/). The modeling application used the library as-is.

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
- [ ] Import JSON model
- [ ] Import TOSCA model
- [ ] More specific show/hide features (all backing services, all infrastructure and deployment mappings, )

### Editor features

- [x] Delete element with delete button
- [x] Do not let infrastructure element grow in height
- [ ] make Paper draggable with mouse (https://stackoverflow.com/questions/28431384/how-to-make-a-paper-draggable)
- [ ] increase element size to ensure embedded elements are within the element when added

### technical things

- [ ] refactor to TypeScript
- [ ] add tests for quality calculations
