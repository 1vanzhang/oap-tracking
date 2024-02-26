import React, { ReactNode } from "react";

type Props = {
  title: string;
  columns: string[];
  data: ReactNode[][];
  entriesPerPage?: number;
  pagination?: boolean;
};

export default function DataTable({
  title,
  columns,
  data,
  entriesPerPage = 10,
  pagination = true,
}: Props) {
  const [currentPage, setCurrentPage] = React.useState(1);
  const actualEntriesPerPage = pagination ? entriesPerPage || 10 : data.length;
  const totalPages = Math.ceil(data.length / actualEntriesPerPage);
  const indexOfLastRow = currentPage * actualEntriesPerPage;
  const indexOfFirstRow = indexOfLastRow - actualEntriesPerPage;
  const currentRows = data.slice(indexOfFirstRow, indexOfLastRow);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
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
    </div>
  );
}
