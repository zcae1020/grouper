export const getStandardDeviation = (arr: number[]) => {
    const average = arr.reduce((acc, cur) => acc + cur, 0) / arr.length;

    return Math.sqrt(
        arr.reduce((acc, cur) => acc + Math.pow(cur - average, 2), 0) /
            arr.length
    );
};

export const roundWithPrecision = (num: number, precision: number) => {
    const multiplier = Math.pow(10, precision);

    return Math.round(num * multiplier) / multiplier;
};
