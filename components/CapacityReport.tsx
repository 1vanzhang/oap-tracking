import React from "react";
import ReactMarkdown from "react-markdown";
import moment from "moment";
export type CapacityReportProps = {
  id: string;
  numPeople: number;
  timestamp: string;
  preventingEntry: boolean;
};

const CapacityReport: React.FC<{ capacityReport?: CapacityReportProps }> = ({
  capacityReport,
}) => {
  return (
    <div className="w-fit mx-auto">
      <h2>Latest Capacity Report</h2>
      {capacityReport ? (
        <div>{`${capacityReport.numPeople} people (${moment(
          capacityReport.timestamp
        ).fromNow()})`}</div>
      ) : (
        <div>No capacity report yet</div>
      )}
    </div>
  );
};

export default CapacityReport;
