import cn from "classnames";

import { IconButton } from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

import TargetTable from "@/components/TargetTable";
import GroupList from "@/components/GroupList";

import style from "./DataBoard.module.scss";

import type { DataBoardProps } from "./DataBoard.types";

const DataBoard = ({
    targetTableProps,
    groupListProps,
    onGenerateGroup,
    isDataReady,
}: DataBoardProps) =>
    isDataReady ? (
        <div className={style.wrapper}>
            <TargetTable {...targetTableProps} className={style.targetTable} />
            <IconButton
                onClick={onGenerateGroup}
                className={cn(style.iconButton, style.icon)}
            >
                <ArrowForwardIcon className={style.icon} />
            </IconButton>
            <GroupList {...groupListProps} className={style.groupList} />
        </div>
    ) : null;

export default DataBoard;
