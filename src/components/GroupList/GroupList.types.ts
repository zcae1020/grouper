import {
    Human,
    ScoreData,
    TargetHumanInfo,
    getRandomGroupListCase,
} from "@/utils/grouper";

export interface GroupListProps {
    groupCaseList: {
        scoreData: ScoreData;
        groupListCase: ReturnType<typeof getRandomGroupListCase>;
    }[];
    targetData: { [key: Human["id"]]: TargetHumanInfo };
}
