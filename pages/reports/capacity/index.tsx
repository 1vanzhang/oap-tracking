import React from "react";
import Layout from "../../../components/Layout";
import moment from "moment";
import { GetStaticProps } from "next";
import prisma from "../../../lib/prisma";
import ReportsTable from "./ReportsTable";
import TimeGraph from "../../../components/TimeGraph";
import { CapacityReport, Event } from "@prisma/client";
import CapacityForm from "./CapacityForm";

type Props = {
  allReports: CapacityReport[];
  events: Event[];
};

export const getStaticProps: GetStaticProps = async () => {
  const allReports = await prisma.capacityReport.findMany({
    orderBy: {
      timestamp: "asc",
    },
  });
  const events = await prisma.event.findMany();

  return {
    props: { allReports, events },
    revalidate: 1,
  };
};

export default function ReportCapacity({ allReports, events }: Props) {
  return (
    <Layout>
      <CapacityForm />
      <h2 className="text-center">Capacity Reports</h2>
      <TimeGraph
        events={events}
        data={allReports}
        plotField="numPeople"
        defaultStartTime={moment().subtract(1, "day").format("YYYY-MM-DD")}
      />
      <ReportsTable reports={allReports} />
    </Layout>
  );
}
