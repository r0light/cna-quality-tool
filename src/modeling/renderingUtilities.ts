import { dia } from "jointjs";
import { addSelectionToolToEntity } from "./views/tools/entitySelectionTools";

export function ensureCorrectRendering(createdCells: dia.Cell[], paper: dia.Paper): Promise<void> {
    return new Promise<void>((outerResolve, outerReject) => {

        let cellsRendered = [];

        for (const cell of createdCells) {

            let cellRendered = Promise.resolve();

            if (cell.isElement()) {

                // resize element to a different size and that to the wanted size again, to rerender the bounding box and ensure that it has the right size
                let wantedWidth = cell.prop("size/width");
                let wantedHeight = cell.prop("size/height");
                cellsRendered.push(
                    cellRendered.then(() => {
                        return new Promise<void>((resolve, reject) => {
                            //element.resize(element.prop("defaults/size").width, element.prop("defaults/size").height);
                            (cell as dia.Element).resize(wantedWidth + 10, wantedHeight + 10);
                            setTimeout(() => {
                                resolve();
                            }, 100)
                        })
                    }).then(() => {
                        return new Promise<void>((resolve, reject) => {
                            (cell as dia.Element).resize(wantedWidth, wantedHeight);
                            setTimeout(() => {
                                resolve();
                            }, 100)
                        });
                    }).then(() => {
                        return new Promise<void>((resolve, reject) => {
                            addSelectionToolToEntity(paper.requireView(cell as dia.Element).model, paper);
                            setTimeout(() => {
                                resolve();
                            }, 100)
                        });
                    })
                );
            } else if (cell.isLink) {
                (cell.findView(paper) as dia.LinkView).requestConnectionUpdate();
            } 
        }

        Promise.all(cellsRendered).then(() => {
            //mainPaper.value.updateViews();
            paper.hideTools();
            outerResolve();
        })
    });
}