import HeaderPageLayout from '@/components/layout/HeaderPage'
import SellFileExcel from '@/components/modal/sell/file-excel';
import { DataTableDetail } from '@/components/table/data-table-detail';
import { SellFileExcelColumns } from '@/components/table/sell/columns-file-excel';
import { Card, CardContent} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ISellFileExcel } from '@/types/sell';
import { createLazyFileRoute } from '@tanstack/react-router'
import { useState } from 'react';
import * as XLSX from 'xlsx';

export const Route = createLazyFileRoute('/_app/sell/upload')({
    component: UploadSellPage
})


function UploadSellPage() {
    const [dataExcel, setDataExcel] = useState<ISellFileExcel[]>();

    const processExcel = (data: unknown) => {
        const workbook = XLSX.read(data, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonExcel = XLSX.utils.sheet_to_json(worksheet, { defval: null });
        return jsonExcel;
    }

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const fileData = event.target.files?.[0];

        if (fileData) {
            const reader = new FileReader();

            reader.onload = (e: Event) => {
                const data = (e as ProgressEvent<FileReader>).target?.result;
                const result = processExcel(data);
                setDataExcel(result as ISellFileExcel[]);
            };

            reader.readAsArrayBuffer(fileData);
        }
    };


    return (
        <div>
            <HeaderPageLayout buttonSubmit={<SellFileExcel data={dataExcel || []} />} idForm="createSellForm" title="Upload đơn bán hàng" />

            <div>
                <Card className="mt-4">
                    <CardContent className="mt-4">
                        <DataTableDetail
                            wrapperClassName="h-[calc(82vh-180px)] max-h-[calc(82vh-180px)]"
                            listTools={<Input type="file" accept=".xlsx, .xls, .csv" onChange={handleFileUpload} />}
                            data={dataExcel || []}
                            columns={SellFileExcelColumns} />

                    </CardContent>
                </Card>
            </div>
        </div>
    )
}