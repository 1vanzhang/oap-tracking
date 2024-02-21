"use client";
import React from "react";
import Layout from "../../../components/Layout";
import Router from "next/router";
import moment from "moment";
import DateTimePicker from "../../../components/DateTimePicker";
import { GetStaticProps } from "next";
import prisma from "../../../lib/prisma";
import CapacityGraph from "./CapacityGraph";
import ReportsTable from "./ReportsTable";
import Form from "../../../components/Form";
import TimeGraph from "../../../components/TimeGraph";

export type CapacityReport = {
  id: string;
  numPeople: number;
  timestamp: Date;
  preventingEntry: boolean;
};

type Props = {
  todayReports: CapacityReport[];
  allReports: CapacityReport[];
};

export const getStaticProps: GetStaticProps = async () => {
  const todayReports = await prisma.capacityReport.findMany({
    orderBy: {
      timestamp: "asc",
    },
  });
  const allReports = await prisma.capacityReport.findMany({
    orderBy: {
      timestamp: "asc",
    },
  });

  return {
    props: { todayReports, allReports },
    revalidate: 5,
  };
};

export default function ReportCapacity({ todayReports, allReports }: Props) {
  const [numPeople, setNumPeople] = React.useState<number | "">("");
  const [timestamp, setTimestamp] = React.useState<string>(
    moment().toISOString()
  );
  const [preventingEntry, setPreventingEntry] = React.useState<boolean>(false);

  const submitData = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    try {
      //timestamp by date and time
      const body = { numPeople, timestamp, preventingEntry };
      await fetch("/api/capacity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      await Router.push("/");
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <Layout>
      <Form title="Report Capacity" onSubmit={submitData}>
        <div>
          <input
            autoFocus
            type="number"
            placeholder="Number of people"
            min={0}
            value={numPeople}
            onChange={(e) => {
              setNumPeople(
                e.target.value.length == 0 ? "" : parseInt(e.target.value)
              );
            }}
          />
          <label>
            Preventing Entry
            <input
              type="checkbox"
              onChange={(e) => setPreventingEntry(e.target.checked)}
              checked={preventingEntry}
            />
          </label>
        </div>
        <DateTimePicker timestamp={timestamp} setTimestamp={setTimestamp} />
      </Form>

      <h2 className="text-center">Capacity Reports</h2>
      <TimeGraph data={allReports} plotField="numPeople" />
      <h2>All Capacity Reports</h2>
      <ReportsTable reports={allReports} />
    </Layout>
  );
}
