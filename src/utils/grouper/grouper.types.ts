import type { Merge } from "type-fest";

export type DayList = {
    day1?: string;
    day2?: string;
    day3?: string;
    day4?: string;
};

export type ResolvedDayList = {
    day1: boolean;
    day2: boolean;
    day3: boolean;
    day4: boolean;
};

export type Human = {
    id: string;
    name: string;
    gender: string;
};

export type HumanWithGroup = Merge<
    Human,
    {
        group: string;
    }
>;

export type TargetHumanInfo = Merge<Human, ResolvedDayList>;

export type TargetHumanSetting = {
    group?: string;
};

export type TargetHumanInfoWithSetting = Merge<
    TargetHumanInfo,
    TargetHumanSetting
>;

export type SheetRowData = Merge<
    HumanWithGroup,
    {
        [key in keyof DayList]: DayList[key];
    }
>;

export type ExtractedData = {
    sheetData: {
        sheetName: string;
        data: HumanWithGroup[];
    }[];
    targetData: TargetHumanInfoWithSetting[];
};

export interface ScoreData {
    matchScore: number;
    previousParticipationScore: number;
    attendanceScore: number;
}
