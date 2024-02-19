import React from "react";
import { GetStaticProps } from "next";
import Layout from "../components/Layout";
import CapacityReport, {
  CapacityReportProps,
} from "../components/CapacityReport";
import prisma from "../lib/prisma";

import DashboardAction from "../components/DashboardAction";
import { Item, ItemUnit } from "@prisma/client";

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
  console.log(lastItemCheckout);
  return {
    props: { latestCapacityReport, lastItemCheckout },
    revalidate: 5,
  };
};

type ItemCheckout = {
  id: string;
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
  itemId: string;
  quantity: number;
  unitId: string;
  item: Item;
  unit: ItemUnit;
};

type Props = {
  latestCapacityReport?: CapacityReportProps;
  lastItemCheckout?: ItemCheckout;
};
const Tracking: React.FC<Props> = (props) => {
  return (
    <Layout>
      <div className="page">
        <main>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "10px",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <DashboardAction
              action="Report Capacity"
              href="/reports/capacity"
            />
            <DashboardAction action="Checkout Item" href="/reports/checkout" />
            <DashboardAction action="Report Stock" href="/reports/stock" />
            <DashboardAction action="Order" href="/reports/order" />
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
