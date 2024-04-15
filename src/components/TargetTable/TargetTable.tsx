import cn from "classnames";

import {
    MenuItem,
    Paper,
    Select,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material/Select";
import type { TargetTableProps } from "./TargetTable.types";

import style from "./TargetTable.module.scss";

const TargetTable = ({
    targetData,
    groupCount,
    className,
    onTargetChange,
}: TargetTableProps) =>
    targetData.length > 0 && (
        <TableContainer
            component={Paper}
            className={cn(className, style.wrapper)}
        >
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
                <TableHead>
                    <TableRow>
                        <TableCell>index</TableCell>
                        <TableCell>id</TableCell>
                        <TableCell align="right">name</TableCell>
                        <TableCell align="right">gender</TableCell>
                        <TableCell align="right">day1</TableCell>
                        <TableCell align="right">day2</TableCell>
                        <TableCell align="right">day3</TableCell>
                        <TableCell align="right">day4</TableCell>
                        <TableCell align="right">group</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {targetData.map((target, index) => (
                        <TableRow
                            key={target.id}
                            sx={{
                                "&:last-child td, &:last-child th": {
                                    border: 0,
                                },
                            }}
                        >
                            <TableCell component="th" scope="row">
                                {index + 1}
                            </TableCell>
                            <TableCell component="th" scope="row">
                                {target.id}
                            </TableCell>
                            <TableCell align="right">{target.name}</TableCell>
                            <TableCell align="right">{target.gender}</TableCell>
                            <TableCell align="right">
                                {target.day1 ? "O" : "X"}
                            </TableCell>
                            <TableCell align="right">
                                {" "}
                                {target.day2 ? "O" : "X"}
                            </TableCell>
                            <TableCell align="right">
                                {" "}
                                {target.day3 ? "O" : "X"}
                            </TableCell>
                            <TableCell align="right">
                                {" "}
                                {target.day4 ? "O" : "X"}
                            </TableCell>
                            <TableCell align="right">
                                <Select
                                    value={target?.group?.toString() ?? "none"}
                                    labelId={`group-select-label-${target.id}`}
                                    id={`group-select-${target.id}`}
                                    label="Group"
                                    onChange={(e: SelectChangeEvent) =>
                                        onTargetChange(
                                            targetData.map((t) =>
                                                t.id === target.id
                                                    ? {
                                                          ...t,
                                                          group:
                                                              e.target.value ===
                                                              "none"
                                                                  ? undefined
                                                                  : e.target
                                                                        .value,
                                                      }
                                                    : t
                                            )
                                        )
                                    }
                                >
                                    <MenuItem key="none" value="none">
                                        none
                                    </MenuItem>
                                    {Array.from({ length: groupCount }).map(
                                        (_, index) => (
                                            <MenuItem
                                                key={index}
                                                value={index + 1}
                                            >
                                                {index + 1}
                                            </MenuItem>
                                        )
                                    )}
                                </Select>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );

export default TargetTable;
