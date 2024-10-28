const xlsx = require('xlsx');
const path = require('path');

const exportExcel = (data, workSheetColumnNames, workSheetName, filePath) => {
    const workBook = xlsx.utils.book_new();
    const workSheetData = [
        workSheetColumnNames,
        ... data
    ];
    const workSheet = xlsx.utils.aoa_to_sheet(workSheetData);
    xlsx.utils.book_append_sheet(workBook, workSheet, workSheetName);
    xlsx.writeFile(workBook, path.resolve(filePath));
}

const exportUsersToExcel = async (datas, workSheetColumnNames, workSheetName, filePath) => {
    const data = datas.map(dat => {
        return [dat.paid_by, dat.amount, dat.order_id, dat.phone, dat.created_at.toLocaleString()];
    });

    await exportExcel(data, workSheetColumnNames, workSheetName, filePath);
}

module.exports = exportUsersToExcel;