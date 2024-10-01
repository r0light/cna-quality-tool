export const average: (list: number[]) => number = list => {
    if (list.length === 0) {
        return 0; // TODO better use NaN?
    }
    return list.reduce((e1, e2) => e1 + e2, 0) / list.length
}

export const partition = <T,>(
    array: T[],
    callback: (element: T, index: number, array: T[]) => boolean
) => {
    return array.reduce(function (result, element, i) {
        callback(element, i, array)
            ? result[0].push(element)
            : result[1].push(element);

        return result;
    }, [[], []]);
};
