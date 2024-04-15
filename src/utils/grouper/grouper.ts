import { read, utils } from "xlsx";

import { getStandardDeviation } from "../common";

import type {
    DayList,
    ExtractedData,
    Human,
    HumanWithGroup,
    ResolvedDayList,
    ScoreData,
    SheetRowData,
    TargetHumanInfo,
    TargetHumanInfoWithSetting,
} from ".";

const DAY_LIST = {
    DAY1: "day1",
    DAY2: "day2",
    DAY3: "day3",
    DAY4: "day4",
};

const DAY_LIST_VALUES = Object.values(DAY_LIST);

type DayListValue = "day1" | "day2" | "day3" | "day4";

const YES_ALIASES = ["Y", "y", "YES", "yes", "O", "o", "예", "ㅇ", "네"];

const TARGET_SHEET_NAME = "target";

const ATTDENDANCE_SCORE_THRESHOLD = 1;

const trimSheetData = (sheetData: SheetRowData[]) => {
    return sheetData.map((row) => {
        const newRow = { ...row };
        for (const key in newRow) {
            const rowKey = key as keyof SheetRowData;
            if (typeof newRow[rowKey] === "string") {
                newRow[rowKey] = newRow[rowKey]?.trim() ?? "";
            }
        }
        return newRow;
    });
};

export const extractFileData = async (file: File | undefined) => {
    const buffer = await file?.arrayBuffer();
    const wb = read(buffer, { type: "buffer" });

    let targetCount = 0;

    let targetData: TargetHumanInfoWithSetting[] = [];

    const sheetData: {
        sheetName: string;
        data: HumanWithGroup[];
    }[] = [];

    for (const sheetName of wb.SheetNames) {
        const ws = wb.Sheets[sheetName];
        const data: SheetRowData[] = utils.sheet_to_json(ws);

        const trimedData = trimSheetData(data);

        const idSet = new Set<string>();

        for (const row of trimedData) {
            if (idSet.has(row.id)) {
                console.log(sheetName, idSet, row.id);
                throw new Error("중복된 id가 존재합니다.");
            }

            idSet.add(row.id);
        }

        if (sheetName === TARGET_SHEET_NAME) {
            targetCount++;
            targetData = trimedData.map<TargetHumanInfoWithSetting>(
                ({ id, name, gender, ...dayList }) => {
                    const newDayList: ResolvedDayList = {
                        day1: false,
                        day2: false,
                        day3: false,
                        day4: false,
                    };

                    DAY_LIST_VALUES.forEach((key) => {
                        const dayListKey = key as keyof DayList;
                        newDayList[dayListKey] = YES_ALIASES.includes(
                            dayList[dayListKey] ?? ""
                        );
                    });

                    return { id, name, gender, ...newDayList };
                }
            );
            continue;
        }

        if (trimedData[0]?.group === undefined) {
            throw new Error(
                "첫번째 줄의 그룹 설정 이력이 없는 sheet가 존재합니다."
            );
        }

        let currentGroup = trimedData[0].group;
        const newData = trimedData.map<HumanWithGroup>((row) => {
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

export const getPreviousParticipationCounts = ({
    extractedData,
}: {
    extractedData: Awaited<ReturnType<typeof extractFileData>>;
}) => {
    const previousParticipationCounts: Record<Human["id"], number> = {};

    extractedData.sheetData.forEach(({ data }) => {
        data.forEach((row) => {
            if (previousParticipationCounts[row.id]) {
                previousParticipationCounts[row.id]++;
            } else {
                previousParticipationCounts[row.id] = 1;
            }
        });
    });

    return previousParticipationCounts;
};

/**
 * index 0: 가장 최근
 */
export const getMatchCountByParticipation = ({
    extractedData,
    time = 3,
}: {
    extractedData: Awaited<ReturnType<typeof extractFileData>>;
    time?: number;
}) => {
    const ret: Record<Human["id"], Record<Human["id"], number>>[] = [];

    for (let sheetIndex = 0; sheetIndex < time; sheetIndex++) {
        const matchCountByParticipation: Record<
            Human["id"],
            {
                [key: Human["id"]]: number;
            }
        > = {};

        const currentSheetData =
            extractedData.sheetData[
                extractedData.sheetData.length - sheetIndex - 1
            ].data;

        currentSheetData.forEach((row, i) => {
            const currentId = row.id;

            if (!matchCountByParticipation[currentId]) {
                matchCountByParticipation[currentId] = {};
            }

            currentSheetData.forEach((row, j) => {
                if (i === j) {
                    return;
                }

                if (matchCountByParticipation[currentId][row.id]) {
                    matchCountByParticipation[currentId][row.id]++;
                } else {
                    matchCountByParticipation[currentId][row.id] = 1;
                }
            });
        });

        ret.push(matchCountByParticipation);
    }

    return ret;
};

/**
 *
 * @param obj
 * @property idList - 그룹을 나눌 대상(group이 없는 대상)]
 * @property groupCount - 나눌 그룹 수
 * @property allTargetCount - 전체 대상 수
 * @property prefixGroupList - 각 그룹별로 미리 할당된 대상 리스트
 *
 * @returns
 */
export const getRandomGroupListCase = ({
    idList,
    groupCount,
    allTargetCount,
    prefixGroupList,
}: {
    idList: Human["id"][];
    prefixGroupList: Human["id"][][];
    groupCount: number;
    allTargetCount: number;
}): Human["id"][][] => {
    const targetLength = Math.floor(allTargetCount / groupCount);

    const randomGroupListCase = [];

    let ceilCount = 0;

    for (let i = 0; i < groupCount; i++) {
        const randomList: Human["id"][] = [];
        for (
            let j = 0;
            j < targetLength - (prefixGroupList?.[i]?.length ?? 0);
            j++
        ) {
            const randomIndex = Math.floor(Math.random() * idList.length);
            randomList.push(idList[randomIndex]);
            idList.splice(randomIndex, 1);
        }

        const newList = [...randomList, ...(prefixGroupList?.[i] ?? [])];

        // 랜덤으로 추가할 인원이 남은 경우 그룹 길이 ceil 연산한만큼으로 설정
        if (
            groupCount - i === (allTargetCount % groupCount) - ceilCount ||
            (allTargetCount % groupCount > ceilCount &&
                Math.floor(Math.random() * 2))
        ) {
            ceilCount++;
            const randomIndex = Math.floor(Math.random() * idList.length);
            newList.push(idList[randomIndex]);
            idList.splice(randomIndex, 1);
        }

        newList.sort();

        randomGroupListCase.push(newList);
    }

    return randomGroupListCase;
};

export const getScoreOfGroupListCase = ({
    targetData,
    groupListCase,
    matchCountByParticipation,
    previousParticipationCounts,
}: {
    targetData: Record<Human["id"], TargetHumanInfo>;
    groupListCase: Human["id"][][];
    matchCountByParticipation: Awaited<
        ReturnType<typeof getMatchCountByParticipation>
    >;
    previousParticipationCounts: Awaited<
        ReturnType<typeof getPreviousParticipationCounts>
    >;
}): ScoreData | null => {
    let matchScore = 0;
    let previousParticipationScorePerGroup = Array.from({
        length: groupListCase.length,
    }).map(() => 0);

    const attendanceCountPerGroup = (DAY_LIST_VALUES as DayListValue[]).map(
        (day) =>
            groupListCase.map((group) =>
                group.reduce((acc, id) => {
                    return acc + (targetData[id][day] ? 1 : 0);
                }, 0)
            )
    );

    const attendanceCountPerGroupStandardDeviation =
        attendanceCountPerGroup.map((attendanceCount) =>
            getStandardDeviation(attendanceCount)
        );

    const attendanceCountPerGroupStandardDeviationAverage =
        attendanceCountPerGroupStandardDeviation.reduce(
            (acc, value) => acc + value,
            0
        ) / attendanceCountPerGroupStandardDeviation.length;

    if (
        attendanceCountPerGroupStandardDeviationAverage >
        ATTDENDANCE_SCORE_THRESHOLD
    ) {
        return null;
    }

    groupListCase.forEach((group, index) => {
        group.forEach((id, i) => {
            group.forEach((id2, j) => {
                if (i === j) {
                    return;
                }

                matchScore += matchCountByParticipation.reduce(
                    (acc, matchCount) => {
                        return acc + (matchCount[id]?.[id2] ?? 0);
                    },
                    0
                );
            });

            previousParticipationScorePerGroup[index] +=
                previousParticipationCounts[id];
        });
    });

    const previousParticipationScoreStandardDeviation = getStandardDeviation(
        previousParticipationScorePerGroup
    );

    const genderDifferenceScorePerGroup = groupListCase.map((group) => {
        const maleCount = group.reduce(
            (acc, id) => acc + (targetData[id].gender === "남" ? 1 : 0),
            0
        );

        const femaleCount = group.reduce(
            (acc, id) => acc + (targetData[id].gender === "여" ? 1 : 0),
            0
        );

        return Math.abs(maleCount - femaleCount);
    });

    const genderDifferenceScoreStandardDeviation = getStandardDeviation(
        genderDifferenceScorePerGroup
    );

    return {
        matchScore,
        previousParticipationScore: previousParticipationScoreStandardDeviation,
        attendanceScore: attendanceCountPerGroupStandardDeviationAverage,
        genderRatioScore: genderDifferenceScoreStandardDeviation,
    };
};

// TODO: 비동기 함수로 변경
export const getGroupCaseWithScore = ({
    visited,
    extractedData,
}: {
    visited: Record<string, boolean>;
    extractedData: ExtractedData;
}): {
    scoreData: ScoreData;
    groupListCase: string[][];
} | null => {
    return null;
};
