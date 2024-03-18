import type { Merge } from "type-fest";

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

export type SheetRowData = Merge<
    Human,
    {
        group?: string;
    }
>;

export type ExtractedData = {
    sheetData: {
        sheetName: string;
        data: HumanWithGroup[];
    }[];
    targetData: Human[];
};

export interface ScoreData {
    score: number;
    matchScore: number;
    previousParticipationScore: number;
}
