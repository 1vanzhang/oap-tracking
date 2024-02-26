"use client";
import { Event } from "@prisma/client";
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
  events: Event[];
  data: T[];
  plotField: keyof T & string;
  defaultStartTime?: string;
};

export default function TimeGraph<T extends TimeData>({
  data,
  plotField,
  defaultStartTime,
  events,
}: Props<T>) {
  const [startTime, setStartTime] = React.useState<string | null>(
    defaultStartTime || moment().subtract(14, "day").format("YYYY-MM-DD")
  );
  const [endTime, setEndTime] = React.useState<string | null>(
    moment().format("YYYY-MM-DD")
  );
  const [selectedEvent, setSelectedEvent] = React.useState<Event | null>(null);

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
    const newData = data
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
    const lastOneBeforeStart = data
      .sort((a, b) => (a.timestamp > b.timestamp ? 1 : -1))
      .filter((report) => {
        return moment(report.timestamp).isBefore(
          moment(startTime).startOf("day")
        );
      })[0];
    if (lastOneBeforeStart) {
      newData.unshift({
        timestamp: moment(startTime).startOf("D").valueOf(),
        [plotField]: lastOneBeforeStart[plotField],
      } as T & {
        timestamp: number;
      });
    } else if (data.length > 0) {
      newData.unshift({
        timestamp: moment(startTime).startOf("D").valueOf(),
        [plotField]: newData[0][plotField],
      } as T & {
        timestamp: number;
      });
    }
    newData.push({
      timestamp: moment(endTime).endOf("D").valueOf(),
      [plotField]: newData[newData.length - 1][plotField],
    } as T & {
      timestamp: number;
    });
    return newData;
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
              domain={[
                moment(startTime).valueOf(),
                moment(endTime).endOf("D").valueOf(),
              ]}
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
        <select
          onChange={(e) => {
            const selected = events.find(
              (event) => event.name === e.target.value
            );
            setSelectedEvent(selected || null);
            if (selected) {
              const dates = selected.dates.sort((a, b) => (a > b ? 1 : -1));
              setStartTime(moment(dates[0]).format("YYYY-MM-DD"));
              setEndTime(moment(dates[dates.length - 1]).format("YYYY-MM-DD"));
            }
          }}
          value={selectedEvent?.name || ""}
        >
          <option>Select Event</option>
          {events.map((event) => (
            <option key={event.name}>{event.name}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
