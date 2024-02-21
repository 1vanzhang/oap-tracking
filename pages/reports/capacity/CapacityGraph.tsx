import React from "react";

import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { CapacityReport } from ".";
import moment from "moment";
import TimeGraph from "../../../components/TimeGraph";

type Props = {
  capacityReports: CapacityReport[];
};

export default function CapacityGraph({ capacityReports }: Props) {
  //x=timestamp, y=numPeople
  return (
    <div>
      <TimeGraph data={capacityReports} plotField="numPeople" />
      {/* <ResponsiveContainer width="100%" height={400}>
        <AreaChart
          data={capacityReports?.map((report) => {
            return {
              timestamp: moment(report.timestamp).format("YYYY-MM-DD hh:mm a"),
              numPeople: report.numPeople,
            };
          })}
        >
          <CartesianGrid strokeDasharray="3 3" />

          <XAxis
            dataKey="timestamp"
            tickFormatter={(timeStr) => moment(timeStr).format("hh:mm a")}
          />
          <YAxis />
          <Tooltip />
          <Legend />
          <Area type="monotone" dataKey="numPeople" activeDot={{ r: 8 }} />
        </AreaChart>
      </ResponsiveContainer> */}
    </div>
  );
}
