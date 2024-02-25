import React from "react";
import { GetStaticProps } from "next";
import Layout from "../components/Layout";
import CapacityReport, {
  CapacityReportProps,
} from "../components/CapacityReport";
import prisma from "../lib/prisma";
//person icon from react-icons
import {
  FaUser,
  FaShoppingCart,
  FaSignOutAlt,
  FaArchive,
} from "react-icons/fa";

import DashboardAction from "../components/DashboardAction";
import { Prisma } from "@prisma/client";

export const getStaticProps: GetStaticProps = async () => {
  const latestCapacityReport = await prisma.capacityReport.findFirst({
    orderBy: {
      timestamp: "desc",
    },
  });
  const lastItemCheckout = await prisma.itemCheckout.findFirst({
    include: {
      item: true,
      unit: true,
    },
    orderBy: {
      timestamp: "desc",
    },
  });
  return {
    props: { latestCapacityReport, lastItemCheckout },
    revalidate: 5,
  };
};

type Props = {
  latestCapacityReport?: CapacityReportProps;
  lastItemCheckout?: Prisma.ItemCheckoutGetPayload<{
    include: {
      item: true;
      unit: true;
    };
  }>;
};
const Tracking: React.FC<Props> = (props) => {
  return (
    <Layout>
      <div className="page">
        <main>
          <h1 className="text-center">Report</h1>
          <div className="flex flex-wrap gap-2 items-center justify-center">
            <DashboardAction
              action="Report Capacity"
              href="/reports/capacity"
              icon={<FaUser />}
            />
            <DashboardAction
              action="Checkout Item"
              href="/reports/checkout"
              icon={<FaSignOutAlt />}
            />
            <DashboardAction
              action="Report Stock"
              href="/reports/stock"
              icon={<FaArchive />}
            />
            <DashboardAction
              action="Order"
              href="/reports/order"
              icon={<FaShoppingCart />}
            />
          </div>
          <h1 className="text-center">View</h1>
          <div className="flex flex-wrap gap-2 items-center justify-center">
            <DashboardAction action="Profits" href="/reports/profit" />
            <DashboardAction action="View Stock" href="/stock" />
          </div>
          <CapacityReport capacityReport={props.latestCapacityReport} />
          <div>
            {props.lastItemCheckout && (
              <div>
                <h2>Last Item Checkout</h2>
                <p>
                  Timestamp: {props.lastItemCheckout.timestamp.toISOString()}
                </p>
                <p>Quantity: {props.lastItemCheckout.quantity}</p>
                <p>Unit Name: {props.lastItemCheckout.unit.name}</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </Layout>
  );
};

export default Tracking;
