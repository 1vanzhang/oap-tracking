"use client";
import React from "react";
import Layout from "../../../components/Layout";
import Router from "next/router";
import moment from "moment";
import DateTimePicker from "../../../components/DateTimePicker";
import { GetStaticProps } from "next";
import prisma from "../../../lib/prisma";
import ReportsTable from "./ReportsTable";
import Form from "../../../components/Form";
import TimeGraph from "../../../components/TimeGraph";
import { CapacityReport } from "@prisma/client";

type Props = {
  allReports: CapacityReport[];
};

export const getStaticProps: GetStaticProps = async () => {
  const allReports = await prisma.capacityReport.findMany({
    orderBy: {
      timestamp: "asc",
    },
  });

  return {
    props: { allReports },
    revalidate: 1,
  };
};

export default function ReportCapacity({ allReports }: Props) {
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
      Router.reload();
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
            placeholder="# People"
            min={0}
            className="w-32"
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
      <TimeGraph
        data={allReports}
        plotField="numPeople"
        defaultStartTime={moment().subtract(1, "day").format("YYYY-MM-DD")}
      />
      <ReportsTable reports={allReports} />
    </Layout>
  );
}
