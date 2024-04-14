import type { TargetHumanInfoWithSetting } from "@/utils/grouper";

export interface TargetTableProps {
    targetData: TargetHumanInfoWithSetting[];
    groupCount: number;
    onTargetChange: (targetData: TargetHumanInfoWithSetting[]) => void;
    className?: string;
}
