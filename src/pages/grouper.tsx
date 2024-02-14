import React, { useRef } from "react";

import { Inter } from "next/font/google";
import { Button, Input } from "@mui/material";
import axios from "axios";
import { extractFileData } from "@/utils/grouper";

/**
 * @see
 * 1. 주차별 인원수 균등하게 하기
 * 2. 지난달의 조와 겹치지 않기
 * 3. 성별
 * 4. 모임 경력 균등하게 하기
 */

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = event.target.files?.[0]; // Get the selected file

        const data = await extractFileData(file);

        console.log("data", data);
    };

    const handleApi = async () => {
        const { data: hello } = await axios.get("/api/hello", {
            params: {
                name: "hello",
            },
        });

        console.log("hello", hello);
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
            <Button onClick={handleApi}>Run</Button>
        </main>
    );
}
