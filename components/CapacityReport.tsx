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
    <div>
      {capacityReport ? (
        <h2>{`${moment(capacityReport.timestamp).fromNow()}: ${
          capacityReport.numPeople
        }`}</h2>
      ) : (
        <h2>No capacity report yet</h2>
      )}
    </div>
  );
};

export default CapacityReport;
