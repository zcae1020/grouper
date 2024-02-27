import style from "./GroupList.module.scss";
import Group from "./Group";

import type { Human, getRandomGroupListCase } from "@/utils/grouper";

const GroupList = ({
    groupCaseList,
    targetData,
}: {
    groupCaseList: {
        scoreData: {
            score: number;
            matchScore: number;
            previousParticipationScore: number;
        };
        groupListCase: ReturnType<typeof getRandomGroupListCase>;
    }[];
    targetData: { [key: Human["id"]]: Human };
}) => {
    return (
        <div className={style.wrapper}>
            {groupCaseList.map((groupCase, index) => (
                <Group
                    key={index}
                    index={index}
                    scoreData={groupCase.scoreData}
                    groupListCase={groupCase.groupListCase}
                    targetData={targetData}
                />
            ))}
        </div>
    );
};

export default GroupList;
