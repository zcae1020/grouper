import React, { useRef } from "react";

import Papa from "papaparse";
import { Inter } from "next/font/google";
import { Button, Input } from "@mui/material";
const inter = Inter({ subsets: ["latin"] });

export default function Home() {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]; // Get the selected file
        if (file) {
            Papa.parse(file, {
                complete: function (results) {
                    console.log("Parsed CSV:", results); // Display parsed data
                },
                header: true, // If CSV has headers
            });
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
