import {
    Human,
    ScoreData,
    TargetHumanInfo,
    getRandomGroupListCase,
} from "@/utils/grouper";

export interface GroupProps {
    index: number;
    scoreData: ScoreData;
    groupListCase: ReturnType<typeof getRandomGroupListCase>;
    targetData: { [key: Human["id"]]: TargetHumanInfo };
}
