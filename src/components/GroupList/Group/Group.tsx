import type { Human, getRandomGroupListCase } from "@/utils/grouper";
import HumanComponent from "./Human";

import style from "./Group.module.scss";

const Group = ({
    groupListCase,
    targetData,
    index,
    scoreData,
}: {
    index: number;
    groupListCase: ReturnType<typeof getRandomGroupListCase>;
    scoreData: {
        score: number;
        matchScore: number;
        previousParticipationScore: number;
    };
    targetData: { [key: Human["id"]]: Human };
}) => {
    return (
        <div className={style.wrapper}>
            <div>
                <div>{index + 1}번째 그룹</div>
                <div>
                    <div>총점: {scoreData.score}</div>
                    <div>매칭점수: {scoreData.matchScore}</div>
                    <div>
                        지난 참여 횟수 표준편차:{" "}
                        {scoreData.previousParticipationScore}
                    </div>
                </div>
            </div>
            <div className={style.groupListWrapper}>
                {groupListCase.map((group, index) => (
                    <div key={index} className={style.group}>
                        {group.map((id) => (
                            <HumanComponent key={id} human={targetData[id]} />
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Group;
