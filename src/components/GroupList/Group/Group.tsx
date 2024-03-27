import { roundWithPrecision } from "@/utils/common";
import HumanComponent from "./Human";

import style from "./Group.module.scss";

import type { GroupProps } from "./Group.types";

const Group = ({ groupListCase, targetData, index, scoreData }: GroupProps) => {
    return (
        <div className={style.wrapper}>
            <div>
                <div>{index + 1}번째 그룹</div>
                <div>
                    <div>
                        출석률 표준편차:{" "}
                        {roundWithPrecision(scoreData.attendanceScore, 3)}
                    </div>
                    <div>
                        지난 참여 횟수 표준편차:{" "}
                        {roundWithPrecision(
                            scoreData.previousParticipationScore,
                            3
                        )}
                    </div>
                    <div>매칭점수: {scoreData.matchScore}</div>
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
