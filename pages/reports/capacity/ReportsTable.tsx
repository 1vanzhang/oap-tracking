import React from "react";
import { CapacityReport } from "@prisma/client";
import moment from "moment";
import DeleteButton from "../../../components/DeleteButton";
import DataTable from "../../../components/DataTable";

type Props = {
  reports?: CapacityReport[];
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
      location.reload();
    }
  };
  return (
    <div>
      {
        <DataTable
          title="Capacity Reports"
          columns={[
            "Timestamp",
            "Number of people",
            "Preventing entry",
            "Delete",
          ]}
          data={
            reports?.map((report) => [
              moment(report.timestamp).format("YYYY-MM-DD hh:mm a"),
              report.numPeople,
              report.preventingEntry ? "Yes" : "No",
              <DeleteButton onClick={() => deleteReport(report.id)}>
                Delete
              </DeleteButton>,
            ]) ?? []
          }
        />
      }
    </div>
  );
}
