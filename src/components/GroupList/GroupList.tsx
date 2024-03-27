import style from "./GroupList.module.scss";
import Group from "./Group";

import type { GroupListProps } from "./GroupList.types";

const GroupList = ({ groupCaseList, targetData }: GroupListProps) => {
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
