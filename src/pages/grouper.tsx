import React, { useRef, useState } from "react";

import { Button, CircularProgress, Input } from "@mui/material";

import {
    extractFileData,
    getMatchCountByParticipation,
    getPreviousParticipationCounts,
    getRandomGroupListCase,
    getScoreOfGroupListCase,
} from "@/utils/grouper";
import GroupList from "@/components/GroupList";

import type { Human } from "@/utils/grouper";

/**
 * @see
 * 1. 주차별 인원수 균등하게 하기
 * 2. 지난달의 조와 겹치지 않기
 * 3. 성별
 * 4. 모임 경력 균등하게 하기
 */

const GROUP_COUNT = 5;

export default function Home() {
    const fileInputRef = useRef<HTMLInputElement>(null);

    // 파일에서 추출한 데이터
    const [extractedData, setExtractedData] = useState<Awaited<
        ReturnType<typeof extractFileData>
    > | null>(null);

    const [targetData, setTargetData] = useState<{
        [key: Human["id"]]: Human;
    } | null>(null);

    // 지난기간동안의 참여자별 참여 횟수
    const [previousParticipationCounts, setPreviousParticipationCounts] =
        useState<Record<Human["id"], number>>({});

    // 그룹 케이스 리스트
    const [groupCaseList, setGroupCaseList] = useState<
        | {
              scoreData: {
                  score: number;
                  matchScore: number;
                  previousParticipationScore: number;
              };
              groupListCase: ReturnType<typeof getRandomGroupListCase>;
          }[]
        | null
    >(null);

    const [visibleGroupCaseListCount, setVisibleGroupCaseListCount] =
        useState<number>(5);

    const [visitedGroupCaseList, setVisitedGroupCaseList] = useState<
        Record<string, boolean>
    >({});

    const [isLoading, setIsLoading] = useState<boolean>(false);

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
        setTargetData(
            extractedData.targetData.reduce<{
                [key: Human["id"]]: Human;
            }>((acc, cur) => {
                acc[cur.id] = cur;
                return acc;
            }, {})
        );

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

        setIsLoading(true);

        // TODO: 비동기로 수정
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

        for (let i = 0; i < 100; i++) {
            const randomGroupListCasePerGender = Object.values(
                groupByGender
            ).map((group) =>
                getRandomGroupListCase({
                    idList: group.map((v) => v.id),
                    groupCount: GROUP_COUNT,
                })
            );

            if (randomGroupListCasePerGender.length !== 2) {
                throw new Error("성별이 2가지가 아닙니다.");
            }

            const groupListCase: Human["id"][][] = [];

            Array.from({ length: GROUP_COUNT }).forEach((_, index) => {
                groupListCase.push(
                    [
                        ...randomGroupListCasePerGender[0][index],
                        ...randomGroupListCasePerGender[1][
                            GROUP_COUNT - index - 1
                        ],
                    ].sort()
                );
            });

            groupListCase.sort((a, b) =>
                a.join(".").localeCompare(b.join("."))
            );

            const scoreData = getScoreOfGroupListCase({
                groupListCase,
                matchCountByParticipation,
                previousParticipationCounts,
            });

            if (visitedGroupCaseList[JSON.stringify(groupListCase)]) {
                continue;
            }

            setVisitedGroupCaseList((prev) => ({
                ...prev,
                [JSON.stringify(groupListCase)]: true,
            }));

            setGroupCaseList((prev) =>
                [
                    ...(prev ?? []),
                    {
                        scoreData,
                        groupListCase,
                    },
                ].sort((a, b) => a.scoreData.score - b.scoreData.score)
            );
        }

        setIsLoading(false);
    };

    const clearFileInput = () => {
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    return (
        <main
            className={`flex min-h-screen flex-col items-center justify-between p-24`}
        >
            <Input
                type="file"
                inputRef={fileInputRef}
                onChange={handleFileChange}
                // accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
            />
            <div>
                {isLoading ? (
                    <CircularProgress />
                ) : (
                    <GroupList
                        targetData={targetData ?? {}}
                        groupCaseList={
                            groupCaseList?.slice(
                                0,
                                visibleGroupCaseListCount
                            ) ?? []
                        }
                    />
                )}
            </div>
            <Button onClick={clearFileInput}>Clear</Button>
            <Button onClick={generateGroupListCase}>Generate</Button>
            <Button
                onClick={() => setVisibleGroupCaseListCount((prev) => prev + 5)}
            >
                결과 더보기
            </Button>
        </main>
    );
}
