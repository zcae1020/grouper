import { read, utils } from "xlsx";

import type { Human, HumanWithGroup, SheetRowData } from ".";

const TARGET_SHEET_NAME = "target";

export const extractFileData = async (file: File | undefined) => {
    const buffer = await file?.arrayBuffer();
    const wb = read(buffer, { type: "buffer" });

    let targetCount = 0;

    let targetData: Human[] = [];

    const sheetData: {
        sheetName: string;
        data: HumanWithGroup[];
    }[] = [];

    for (const sheetName of wb.SheetNames) {
        const ws = wb.Sheets[sheetName];
        const data: SheetRowData[] = utils.sheet_to_json(ws);

        if (sheetName === TARGET_SHEET_NAME) {
            targetCount++;
            targetData = data;
            continue;
        }

        if (data[0]?.group === undefined) {
            throw new Error(
                "첫번째 줄의 그룹 설정 이력이 없는 sheet가 존재합니다."
            );
        }

        let currentGroup = data[0].group;
        const newData = data.map<HumanWithGroup>((row) => {
            if (row?.group !== undefined) {
                currentGroup = row.group;
            }

            return {
                ...row,
                group: currentGroup,
            };
        });

        sheetData.push({
            sheetName,
            data: newData,
        });
    }

    if (targetCount !== 1) {
        throw new Error(
            `"${TARGET_SHEET_NAME}"이라는 이름의 sheet가 없거나 여러개입니다.`
        );
    }

    return {
        sheetData,
        targetData,
    };
};

export const divideIntoGroups = (
    idList: string[],
    groupSize: number,
    numGroups: number
): string[][][] => {
    const allGroupCombinations: string[][][] = [];

    // 가능한 모든 그룹 조합을 생성
    const combinations: string[][] = generateCombinations(
        idList,
        groupSize * numGroups
    );

    // 각 그룹 조합을 검사
    for (const combination of combinations) {
        const groups: string[][] = new Array(numGroups).fill(0).map((_) => []);

        // 사람들을 그룹에 할당
        combination.forEach((personId, idx) => {
            const groupIdx = idx % numGroups;
            groups[groupIdx].push(personId);
        });

        // 모든 그룹이 조건을 충족하는지 확인하고, 충족한다면 결과에 추가
        if (groups.every((group) => group.length === groupSize)) {
            allGroupCombinations.push(groups);
        }
    }

    return allGroupCombinations;
};

// 순열 생성 함수
const generateCombinations = <T>(items: T[], length: number): T[][] => {
    if (length === 0) return [[]];
    if (items.length === 0) return [];

    const first = items[0];
    const rest = items.slice(1);
    const withoutFirst = generateCombinations(rest, length);
    const withFirst = generateCombinations(rest, length - 1).map((comb) => [
        first,
        ...comb,
    ]);

    return [...withoutFirst, ...withFirst];
};

// 40명을 8명씩 5조로 나누는 경우의 수 계산
const peopleIds: string[] = ["id1", "id2" /* 나머지 ID들을 여기에 추가 */];
const allPossibleGroups = divideIntoGroups(peopleIds, 8, 5);

// 결과 출력
console.log("Total possible groupings:", allPossibleGroups.length);
allPossibleGroups.forEach((groups, idx) => {
    console.log("Grouping", idx + 1, ":");
    groups.forEach((group, groupIdx) => {
        console.log("Group", groupIdx + 1, ":", group);
    });
});
