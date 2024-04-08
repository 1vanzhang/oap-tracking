import React, { ReactNode } from 'react';

type Props = {
    title: string;
    columns: string[];
    data?: ReactNode[][];
    entriesPerPage?: number;
    pagination?: boolean;
    downloadData?: any[];
};

export default function DataTable({
    title,
    columns,
    data = [],
    entriesPerPage = 10,
    pagination = true,
    downloadData,
}: Props) {
    const [currentPage, setCurrentPage] = React.useState(1);
    const actualEntriesPerPage = pagination
        ? entriesPerPage || 10
        : data.length;
    const totalPages = Math.ceil(data.length / actualEntriesPerPage);
    const indexOfLastRow = currentPage * actualEntriesPerPage;
    const indexOfFirstRow = indexOfLastRow - actualEntriesPerPage;
    const currentRows = data.slice(indexOfFirstRow, indexOfLastRow);

    const handlePageChange = (pageNumber: number) => {
        setCurrentPage(pageNumber);
    };
    const handleDownloadToJSON = () => {
        const jsonData = JSON.stringify(downloadData);
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'data.json';
        link.click();
    };

    return (
        <div className="w-fit mx-auto">
            <h2>{title}</h2>
            <table>
                <thead>
                    <tr>
                        {columns.map((column) => (
                            <th key={column}>{column}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {currentRows.map((row, i) => (
                        <tr key={i}>
                            {row.map((cell, j) => (
                                <td key={j}>{cell}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
            {totalPages > 1 && (
                <div className="flex justify-center mt-4">
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="mr-2 disabled:bg-gray-300"
                    >
                        Previous
                    </button>
                    <span className="flex items-center justify-center">
                        Page: {currentPage}/{totalPages}
                    </span>
                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="ml-2 disabled:bg-gray-300"
                    >
                        Next
                    </button>
                </div>
            )}
            {downloadData && (
                <div className="w-100% place-items-center	grid m-5">
                    <button onClick={handleDownloadToJSON}>Download</button>
                </div>
            )}
        </div>
    );
}
