import React, { use, useRef, useState } from "react";

import { Inter } from "next/font/google";
import { Button, Input } from "@mui/material";
import {
    extractFileData,
    getMatchCountByParticipation,
    getPreviousParticipationCounts,
    getRandomGroupListCase,
} from "@/utils/grouper";

import type { Human } from "@/utils/grouper";

/**
 * @see
 * 1. 주차별 인원수 균등하게 하기
 * 2. 지난달의 조와 겹치지 않기
 * 3. 성별
 * 4. 모임 경력 균등하게 하기
 */

const inter = Inter({ subsets: ["latin"] });

const GROUP_COUNT = 5;

export default function Home() {
    const fileInputRef = useRef<HTMLInputElement>(null);

    // 파일에서 추출한 데이터
    const [extractedData, setExtractedData] = useState<Awaited<
        ReturnType<typeof extractFileData>
    > | null>(null);

    // 지난기간동안의 참여자별 참여 횟수
    const [previousParticipationCounts, setPreviousParticipationCounts] =
        useState<Record<Human["id"], number>>({});

    // 그룹 케이스 리스트
    const [groupCaseList, setGroupCaseList] = useState<{
        score: number;
        groupListCase: ReturnType<typeof getRandomGroupListCase>;
    } | null>(null);

    // 최근 3번의 그룹에서의 다른 참가자와의 매칭 횟수
    const [matchCountByParticipation, setMatchCountByParticipation] = useState<
        Record<
            Human["id"],
            {
                [key: Human["id"]]: number;
            }
        >[]
    >([]);

    const handleFileChange = async (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = event.target.files?.[0]; // Get the selected file

        const extractedData = await extractFileData(file);

        setExtractedData(extractedData);

        const previousParticipationCounts = getPreviousParticipationCounts({
            extractedData,
        });

        setPreviousParticipationCounts(previousParticipationCounts);

        const matchCountByParticipation = getMatchCountByParticipation({
            extractedData,
        });

        setMatchCountByParticipation(matchCountByParticipation);
    };

    const generateGroupListCase = () => {
        if (!extractedData) {
            return;
        }

        const groupByGender = extractedData.targetData.reduce<{
            [key: string]: Human[];
        }>((acc, cur) => {
            if (acc[cur.gender]) {
                acc[cur.gender].push(cur);
            } else {
                acc[cur.gender] = [cur];
            }
            return acc;
        }, {});

        const randomGroupListCasePerGender = Object.values(groupByGender).map(
            (group) =>
                getRandomGroupListCase({
                    idList: group.map((v) => v.id),
                    groupCount: GROUP_COUNT,
                })
        );

        if (randomGroupListCasePerGender.length !== 2) {
            throw new Error("성별이 2가지가 아닙니다.");
        }

        const groupSliceList: string[][] = [];

        Array.from({ length: GROUP_COUNT }).forEach((_, index) => {
            groupSliceList.push([
                ...randomGroupListCasePerGender[0][index],
                ...randomGroupListCasePerGender[1][GROUP_COUNT - index - 1],
            ]);
        });
    };

    const clearFileInput = () => {
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    return (
        <main
            className={`flex min-h-screen flex-col items-center justify-between p-24 ${inter.className}`}
        >
            <Input
                type="file"
                inputRef={fileInputRef}
                onChange={handleFileChange}
                // accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
            />
            <Button onClick={clearFileInput}>Clear</Button>
            <Button onClick={generateGroupListCase}>Generate</Button>
        </main>
    );
}
