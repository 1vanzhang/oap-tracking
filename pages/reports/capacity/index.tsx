import React from "react";
import Layout from "../../../components/Layout";
import moment from "moment";
import { GetStaticProps } from "next";
import prisma from "../../../lib/prisma";
import ReportsTable from "./ReportsTable";
import TimeGraph from "../../../components/TimeGraph";
import { CapacityReport } from "@prisma/client";
import CapacityForm from "./CapacityForm";

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
  return (
    <Layout>
      <CapacityForm />
      <h2 className="text-center">Capacity Reports</h2>
      <TimeGraph
        data={allReports}
        plotField="numPeople"
        defaultStartTime={moment().subtract(1, "day").format("YYYY-MM-DD")}
      />
      <ReportsTable reports={allReports ?? []} />
    </Layout>
  );
}
