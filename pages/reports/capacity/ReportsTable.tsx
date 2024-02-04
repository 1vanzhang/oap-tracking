import React from "react";
import { CapacityReport } from ".";
import moment from "moment";

type Props = {
  reports: CapacityReport[];
};

export default function ReportsTable({ reports }: Props) {
  const deleteReport = async (id: string) => {
    const response = await fetch(`/api/capacity`, {
      method: "DELETE",
      body: JSON.stringify({ id }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.ok) {
      alert("Report deleted");
      location.reload();
    }
  };
  return (
    <div>
      <table>
        <thead>
          <tr>
            <th>Timestamp</th>
            <th>Number of people</th>
            <th>Preventing entry</th>
            <th>Delete</th>
          </tr>
        </thead>
        <tbody>
          {reports
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
            .map((report) => (
              <tr key={report.id}>
                <td>{moment(report.timestamp).format("YYYY-MM-DD hh:mm a")}</td>
                <td>{report.numPeople}</td>
                <td>{report.preventingEntry ? "Yes" : "No"}</td>
                <td>
                  <button
                    onClick={() => {
                      deleteReport(report.id);
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}
