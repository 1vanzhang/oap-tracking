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
import { getCurrentStock } from "../utils/stock.utils";
import DataTable from "../components/DataTable";
import moment from "moment";

export const getStaticProps: GetStaticProps = async () => {
  const latestCapacityReport = await prisma.capacityReport.findFirst({
    orderBy: {
      timestamp: "desc",
    },
  });
  const itemsWithHistory = await prisma.item.findMany({
    include: {
      units: true,
      suppliers: {
        include: {
          suppliedUnit: true,
          itemOrder: {
            include: {
              order: true,
            },
          },
        },
      },
      checkouts: {
        include: {
          unit: true,
        },
      },
      itemStocks: {
        include: {
          unit: true,
        },
      },
    },
  });
  const currentStock = itemsWithHistory.map((item) => {
    const amountCheckedOutWithinLastMonth = item.checkouts
      .filter((checkout) => {
        return moment(checkout.timestamp).isAfter(
          moment().subtract(1, "month")
        );
      })
      .reduce((acc, checkout) => {
        return acc + checkout.quantity * (checkout.unit?.ratioToStandard ?? 1);
      }, 0);
    return {
      amount: getCurrentStock(item),
      item: item,
      amountCheckedOutWithinLastMonth,
    };
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
    props: { latestCapacityReport, lastItemCheckout, currentStock },
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
  currentStock: {
    amount: number;
    amountCheckedOutWithinLastMonth: number;
    item: Prisma.ItemGetPayload<{
      include: {
        units: true;
        suppliers: {
          include: {
            suppliedUnit: true;
            itemOrder: {
              include: {
                order: true;
              };
            };
          };
        };
        checkouts: {
          include: {
            unit: true;
          };
        };
        itemStocks: {
          include: {
            unit: true;
          };
        };
      };
    }>;
  }[];
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
          <DataTable
            title="Current Stock"
            pagination={false}
            columns={[
              "Item",
              "Quantity",
              "Unit",
              "Checked Out Within Last Month",
            ]}
            data={props.currentStock.map((stock) => {
              let percentage =
                (stock.amountCheckedOutWithinLastMonth /
                  (stock.amountCheckedOutWithinLastMonth + stock.amount)) *
                100;
              if (isNaN(percentage)) {
                percentage = 100;
              }
              if (percentage === Infinity) {
                percentage = 100;
              }
              let color = "bg-red-200";
              if (percentage >= 100) {
                color = "bg-red-200";
              } else if (percentage < 25) {
                color = "bg-green-200";
              } else if (percentage < 50) {
                color = "bg-yellow-200";
              } else {
                color = "bg-orange-200";
              }
              return [
                stock.item.name,
                <div className={`rounded ${color}`}>{stock.amount}</div>,
                stock.item.standardUnit,
                stock.amountCheckedOutWithinLastMonth +
                  " " +
                  (stock.amount == 0 ||
                  stock.amountCheckedOutWithinLastMonth == 0
                    ? ""
                    : `(${percentage.toFixed(2)}%)`),
              ];
            })}
          />
        </main>
      </div>
    </Layout>
  );
};

export default Tracking;
