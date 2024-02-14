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
