import type { GroupListProps } from "@/components/GroupList/GroupList.types";
import type { TargetTableProps } from "@/components/TargetTable/TargetTable.types";

export interface DataBoardProps {
    targetTableProps: TargetTableProps;
    groupListProps: GroupListProps;
    isDataReady: boolean;
    onGenerateGroup: () => void;
}
