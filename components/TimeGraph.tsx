import moment from "moment";
import React, { useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type TimeData = {
  timestamp: string | Date;
};

type Props<T extends TimeData> = {
  data: T[];
  plotField: keyof T & string;
};

export default function TimeGraph<T extends TimeData>({
  data,
  plotField,
}: Props<T>) {
  const [startTime, setStartTime] = React.useState<string | null>(
    moment().subtract(14, "day").format("YYYY-MM-DD")
  );
  const [endTime, setEndTime] = React.useState<string | null>(
    moment().format("YYYY-MM-DD")
  );

  const xAxisFormat = useMemo(() => {
    let numdays = 0;
    if (startTime && endTime) {
      numdays = moment(endTime).add(1, "day").diff(moment(startTime), "days");
    }
    if (numdays == 1) {
      return "hh:mm a";
    }
    if (numdays <= 8) {
      return "ddd";
    }
    return "YYYY-MM-DD";
  }, [startTime, endTime]);

  const formattedData = useMemo(() => {
    return data
      .map((report) => {
        return {
          ...report,
          timestamp: new Date(report.timestamp).getTime(),
        };
      })
      .sort((a, b) => (a.timestamp > b.timestamp ? 1 : -1))
      .filter((report) => {
        if (
          startTime &&
          moment(report.timestamp).isBefore(moment(startTime).startOf("day"))
        ) {
          return false;
        }
        if (
          endTime &&
          moment(report.timestamp).isAfter(moment(endTime).endOf("day"))
        ) {
          return false;
        }
        return true;
      });
  }, [data, startTime, endTime]);

  return (
    <div className="w-fit mx-auto h-64 w-11/12">
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={formattedData}>
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis
              dataKey="timestamp"
              type="number"
              domain={["dataMin", "dataMax"]}
              tickFormatter={(unixTime) => moment(unixTime).format(xAxisFormat)}
            />
            <YAxis dataKey={String(plotField)} />
            <Tooltip
              labelFormatter={(time) =>
                moment(time).format("YYYY-MM-DD hh:mm a")
              }
            />
            <Legend />
            <Area
              type="monotone"
              dataKey={String(plotField)}
              activeDot={{ r: 8 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="text-center">Date Range</div>
      <div className="w-fit flex gap-2 mx-auto">
        <input
          type="date"
          onChange={(e) => setStartTime(e.target.value)}
          value={startTime}
        />

        <input
          type="date"
          onChange={(e) => setEndTime(e.target.value)}
          value={endTime}
        />
      </div>
    </div>
  );
}
