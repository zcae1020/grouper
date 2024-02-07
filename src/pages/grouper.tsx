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

    const handleFileChange = async (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = event.target.files?.[0]; // Get the selected file

        const buffer = await file?.arrayBuffer();
        const wb = read(buffer, { type: "buffer" });

        let targetCount = 0;

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

            if (sheetName === "target") {
                targetCount++;
            }

            console.log("data", newData);
        });

        if (targetCount !== 1) {
            alert("target sheet가 없거나 여러개입니다.");
            return;
        }
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
