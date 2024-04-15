import React, { useMemo, useRef, useState } from "react";

import { Button, Input, InputLabel } from "@mui/material";

import {
    extractFileData,
    getMatchCountByParticipation,
    getPreviousParticipationCounts,
    getRandomGroupListCase,
    getScoreOfGroupListCase,
} from "@/utils/grouper";
import GroupList from "@/components/GroupList";

import type {
    Human,
    ScoreData,
    TargetHumanInfoWithSetting,
} from "@/utils/grouper";
import TargetTable from "@/components/TargetTable";
import DataBoard from "@/components/Dashboard/Grouper/DataBoard";

const CASE_COUNT = 100;

/**
 * @see
 * 1. 주차별 인원수 균등하게 하기
 * 2. 지난달의 조와 겹치지 않기
 * 3. 성별
 * 4. 모임 경력 균등하게 하기
 */
export default function Home() {
    const fileInputRef = useRef<HTMLInputElement>(null);

    // 파일에서 추출한 데이터
    const [extractedData, setExtractedData] = useState<Awaited<
        ReturnType<typeof extractFileData>
    > | null>(null);

    // 최근 3번의 그룹에서의 다른 참가자와의 매칭 횟수
    const [matchCountByParticipation, setMatchCountByParticipation] = useState<
        Record<
            Human["id"],
            {
                [key: Human["id"]]: number;
            }
        >[]
    >([]);

    // 지난기간동안의 참여자별 참여 횟수(for 자료구조)
    const [previousParticipationCounts, setPreviousParticipationCounts] =
        useState<Record<Human["id"], number>>({});

    // 그룹 케이스 리스트(for output)
    const [groupCaseList, setGroupCaseList] = useState<
        | {
              scoreData: ScoreData;
              groupListCase: ReturnType<typeof getRandomGroupListCase>;
          }[]
        | null
    >(null);

    // 케이스당 그룹 수(for input)
    const [groupCount, setGroupCount] = useState<number>(5);

    const [visibleGroupCaseListCount, setVisibleGroupCaseListCount] =
        useState<number>(5);

    const [isLoading, setIsLoading] = useState<boolean>(false);

    const groupedTargetData = useMemo(
        () =>
            extractedData?.targetData.reduce<{
                [key: Human["id"]]: TargetHumanInfoWithSetting;
            }>((acc, cur) => {
                acc[cur.id] = cur;
                return acc;
            }, {}),
        [extractedData]
    );

    const visitedGroupCaseList = useRef<Record<string, boolean>>({});

    const handleFileChange = async (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = event.target.files?.[0]; // Get the selected file
        let extractedData: Awaited<ReturnType<typeof extractFileData>>;

        try {
            extractedData = await extractFileData(file);
        } catch (e: any) {
            console.error(e);
            alert(
                e.message ? e.message : "파일을 읽는 중 오류가 발생했습니다."
            );
            return;
        }

        setExtractedData(extractedData);

        setPreviousParticipationCounts(
            getPreviousParticipationCounts({
                extractedData,
            })
        );

        setMatchCountByParticipation(
            getMatchCountByParticipation({
                extractedData,
            })
        );
    };

    const generateGroupListCase = () => {
        if (!extractedData) {
            return;
        }

        // TODO: 비동기로 수정
        // 그룹을 가진 데이터를 그룹별로 나누기
        const targetDataGroupedByGroup: TargetHumanInfoWithSetting[][] = [];

        extractedData.targetData.map((target) => {
            if (target.group) {
                const group = Number(target.group) - 1;

                if (targetDataGroupedByGroup[Number(group)]) {
                    targetDataGroupedByGroup[Number(group)].push(target);
                } else {
                    targetDataGroupedByGroup[Number(group)] = [target];
                }
            }
        });

        const prefixGroupCountList = targetDataGroupedByGroup.map(
            (group) => group.length
        );

        const maxParticipantCountPerGroup = Math.ceil(
            extractedData.targetData.length / groupCount
        );
        if (
            prefixGroupCountList.reduce(
                (acc, cur) => acc + (cur > maxParticipantCountPerGroup ? 1 : 0),
                0
            ) >
            extractedData.targetData.length % groupCount
        ) {
            alert("한 그룹에 최대로 들어갈 수 있는 인원수를 초과했습니다.");
            return;
            // throw new Error(
            //     "한 그룹에 최대로 들어갈 수 있는 인원수를 초과했습니다."
            // );
        }

        const hasNoGroupTargetData = extractedData.targetData.filter(
            (target) => target.group === undefined
        );

        for (let i = 0; i < CASE_COUNT; i++) {
            const groupListCase: Human["id"][][] = getRandomGroupListCase({
                allTargetCount: extractedData.targetData.length,
                idList: hasNoGroupTargetData.map((target) => target.id),
                prefixGroupList: targetDataGroupedByGroup.map((group) =>
                    group.map((target) => target.id)
                ),
                groupCount,
            });

            groupListCase.sort((a, b) =>
                a.join(".").localeCompare(b.join("."))
            );

            if (visitedGroupCaseList.current[JSON.stringify(groupListCase)]) {
                continue;
            }

            visitedGroupCaseList.current[JSON.stringify(groupListCase)] = true;

            const scoreData = getScoreOfGroupListCase({
                groupListCase,
                targetData: groupedTargetData ?? {},
                matchCountByParticipation,
                previousParticipationCounts,
            });

            if (!scoreData) {
                continue;
            }

            setGroupCaseList((prev) =>
                [
                    ...(prev ?? []),
                    {
                        scoreData,
                        groupListCase,
                    },
                ].sort((a, b) => {
                    if (
                        a.scoreData.attendanceScore ===
                        b.scoreData.attendanceScore
                    ) {
                        if (
                            a.scoreData.previousParticipationScore ===
                            b.scoreData.previousParticipationScore
                        ) {
                            if (
                                a.scoreData.genderRatioScore ===
                                b.scoreData.genderRatioScore
                            ) {
                                return (
                                    a.scoreData.matchScore -
                                    b.scoreData.matchScore
                                );
                            }

                            return (
                                a.scoreData.genderRatioScore -
                                b.scoreData.genderRatioScore
                            );
                        }

                        return (
                            a.scoreData.previousParticipationScore -
                            b.scoreData.previousParticipationScore
                        );
                    }

                    return (
                        a.scoreData.attendanceScore -
                        b.scoreData.attendanceScore
                    );
                })
            );
        }
    };

    const clearFileInput = () => {
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    return (
        <main className={`flex min-h-screen flex-col items-center p-4 gap-10`}>
            <div className="flex gap-5" style={{ width: "100%" }}>
                <div>
                    <InputLabel>데이터 파일</InputLabel>
                    <Input
                        type="file"
                        inputRef={fileInputRef}
                        onChange={handleFileChange}
                        // accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                    />
                </div>
                <div>
                    <InputLabel>생성 그룹 수</InputLabel>
                    <Input
                        type="number"
                        value={groupCount}
                        onChange={(e) => setGroupCount(Number(e.target.value))}
                    />
                </div>
                {/* <Button onClick={generateGroupListCase}>Generate</Button>
                <Button
                    onClick={() =>
                        setVisibleGroupCaseListCount((prev) => prev + 5)
                    }
                >
                    결과 더보기
                </Button>
                <Button onClick={clearFileInput}>Clear</Button> */}
            </div>
            <DataBoard
                targetTableProps={{
                    targetData: extractedData?.targetData ?? [],
                    groupCount,
                    onTargetChange: (targetData) =>
                        setExtractedData((prev) => {
                            if (!prev) {
                                return prev;
                            }

                            return {
                                ...prev,
                                targetData,
                            };
                        }),
                }}
                groupListProps={{
                    targetData: groupedTargetData ?? {},
                    groupCaseList: groupCaseList ?? [],
                }}
                isDataReady={!!extractedData}
                onGenerateGroup={generateGroupListCase}
            />
        </main>
    );
}
