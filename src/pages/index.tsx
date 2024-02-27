import React, { useRef } from "react";

import { read, utils } from "xlsx";

import { Button, Input } from "@mui/material";

class Tuple {
    x: string;
    y: string;

    constructor(x: string, y: string) {
        this.x = x;
        this.y = y;
    }

    toString = () => "[" + this.x + "," + this.y + "]";
}

export default function Home() {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]; // Get the selected file

        file?.arrayBuffer().then((buffer) => {
            const wb = read(buffer, { type: "buffer" });

            const colleagueAssemble = new Map<string, number>();

            wb.SheetNames.forEach((sheetName) => {
                const ws = wb.Sheets[sheetName];
                const data: { [key: string]: string }[] =
                    utils.sheet_to_json(ws);

                const groupingData: {
                    [key: string]: string[];
                } = {};

                data.forEach((row: { [key: string]: string }) => {
                    Object.keys(row).forEach((key) => {
                        if (groupingData[key] === undefined)
                            groupingData[key] = [];
                        groupingData[key].push(row[key]);
                    });
                });

                const keys = Object.keys(groupingData);

                keys.forEach((key) => {
                    const values = groupingData[key];
                    for (let i = 0; i < values.length; i++) {
                        for (let j = i + 1; j < values.length; j++) {
                            let pair =
                                values[i].localeCompare(values[j]) > 0
                                    ? new Tuple(values[i], values[j])
                                    : new Tuple(values[j], values[i]);

                            if (colleagueAssemble.has(pair.toString())) {
                                colleagueAssemble.set(
                                    pair.toString(),
                                    colleagueAssemble.get(pair.toString())! + 1
                                );
                            } else {
                                colleagueAssemble.set(pair.toString(), 1);
                            }
                        }
                    }
                });
            });

            const colleagueAssembleArray = Array.from(colleagueAssemble);
            colleagueAssembleArray.sort((a, b) => {
                return b[1] - a[1];
            });

            console.log(
                "colleagueAssembleArray",
                JSON.stringify(colleagueAssembleArray)
            );
        });
    };

    const clearFileInput = () => {
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    return (
        <main
            className={`flex min-h-screen flex-col items-center justify-between p-24`}
        >
            <Input
                type="file"
                inputRef={fileInputRef}
                onChange={handleFileChange}
                // accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
            />
            <Button onClick={clearFileInput}>Clear</Button>
        </main>
    );
}
