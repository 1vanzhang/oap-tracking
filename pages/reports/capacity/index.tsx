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
    where: {
      timestamp: {
        gte: moment().startOf("day").toDate(),
        lte: moment().endOf("day").toDate(),
      },
    },
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
    revalidate: 100,
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
      <h1>Report Capacity</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submitData(e);
        }}
      >
        <DateTimePicker timestamp={timestamp} setTimestamp={setTimestamp} />
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

        <button type="submit">Submit</button>
      </form>
      <h2>Today's Capacity Reports</h2>
      <CapacityGraph capacityReports={todayReports} />
      <h2>All Capacity Reports</h2>
      <ReportsTable reports={allReports} />
    </Layout>
  );
}
