import React, { useRef } from "react";

import Papa from "papaparse";
import { read, utils } from "xlsx";

import { Inter } from "next/font/google";
import { Button, Input } from "@mui/material";

/**
 * @see
 * 1. 주차별 인원수 균등하게 하기
 * 2. 지난달의 조와 겹치지 않기
 * 3. 성별
 * 4. 모임 경력 균등하게 하기
 */

const inter = Inter({ subsets: ["latin"] });

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

            wb.SheetNames.map((sheetName) => {
                const ws = wb.Sheets[sheetName];
                const data: {
                    group?: string;
                    id: string;
                    name: string;
                    gender: string;
                }[] = utils.sheet_to_json(ws);

                let newData = data;

                if (data[0].group !== undefined) {
                    let currentGroup = data[0].group;

                    newData = data.map((row) => {
                        const ret = { ...row };
                        if (row.group) {
                            currentGroup = row.group;
                        } else {
                            ret.group = currentGroup;
                        }
                        return ret;
                    });
                } else if (sheetName !== "target") {
                    alert("그룹이 없는 sheet가 존재합니다.");
                    console.log("그룹이 없습니다.", data);
                    return;
                }

                console.log("data", newData);

                // const groupingData: {
                //     [key: string]: string[];
                // } = {};

                // data.forEach((row: { [key: string]: string }) => {
                //     Object.keys(row).forEach((key) => {
                //         if (groupingData[key] === undefined)
                //             groupingData[key] = [];
                //         groupingData[key].push(row[key]);
                //     });
                // });

                // const keys = Object.keys(groupingData);

                // keys.forEach((key) => {
                //     const values = groupingData[key];
                //     for (let i = 0; i < values.length; i++) {
                //         for (let j = i + 1; j < values.length; j++) {
                //             let pair =
                //                 values[i].localeCompare(values[j]) > 0
                //                     ? new Tuple(values[i], values[j])
                //                     : new Tuple(values[j], values[i]);

                //             if (colleagueAssemble.has(pair.toString())) {
                //                 colleagueAssemble.set(
                //                     pair.toString(),
                //                     colleagueAssemble.get(pair.toString())! + 1
                //                 );
                //             } else {
                //                 colleagueAssemble.set(pair.toString(), 1);
                //             }
                //         }
                //     }
                // });
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
            className={`flex min-h-screen flex-col items-center justify-between p-24 ${inter.className}`}
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
