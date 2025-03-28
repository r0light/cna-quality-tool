export const average: (list: number[]) => number = list => {
    if (list.length === 0) {
        return 0; // TODO better use NaN?
    }
    return list.reduce((e1, e2) => e1 + e2, 0) / list.length
}

export const median = (arr: number[]): number | undefined => {
    if (!arr.length) return undefined;
    const s = [...arr].sort((a, b) => a - b);
    const mid = Math.floor(s.length / 2);
    return s.length % 2 ? s[mid] : ((s[mid - 1] + s[mid]) / 2);
  };
  
export const lowest: (list: number[]) => number = list => { return Math.min(...list)}
export const highest: (list: number[]) => number = list => { return Math.max(...list)} 

export const partition = <T,>(
    array: T[],
    callback: (element: T, index: number, array: T[]) => boolean
) => {
    return array.reduce(function (result: T[][], element, i) {
        callback(element, i, array)
            ? result[0].push(element)
            : result[1].push(element);

        return result;
    }, [[], []]);
};
