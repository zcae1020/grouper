export const getStandardDeviation = (arr: number[]) => {
    const average = arr.reduce((acc, cur) => acc + cur, 0) / arr.length;

    return Math.sqrt(
        arr.reduce((acc, cur) => acc + Math.pow(cur - average, 2), 0) /
            arr.length
    );
};
