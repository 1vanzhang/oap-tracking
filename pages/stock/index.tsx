import React, { useMemo } from "react";
import Layout from "../../components/Layout";
import { GetStaticProps } from "next";
import prisma from "../../lib/prisma";
import { Prisma } from "@prisma/client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { getStockHistory } from "../../utils/stock.utils";

export const getStaticProps: GetStaticProps = async () => {
  const items = await prisma.item.findMany({
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
  const formattedItems = items.map((item) => {
    const history = getStockHistory(item);
    return {
      name: item.name,
      id: item.id,
      standardUnit: item.standardUnit,
      history: history,
    };
  });
  return {
    props: { items: formattedItems },
    revalidate: 5,
  };
};

type FormattedItem = {
  name: string;
  id: string;
  standardUnit: string;
  history: {
    timestamp: Date;
    quantity: number;
  }[];
};

type Props = {
  items: FormattedItem[];
};

export default function Stock({ items }: Props) {
  const [selectedItem, setSelectedItem] = React.useState(0);

  return (
    <Layout>
      <div className="page">
        <main>
          <h1>Stock</h1>
          <div style={{ display: "grid", placeItems: "center" }}>
            <div style={{ width: "fit-content" }}>
              <select
                value={selectedItem}
                onChange={(e) => setSelectedItem(Number(e.target.value))}
              >
                {items.map((item, index) => (
                  <option key={item.id} value={index}>
                    {item.name}
                  </option>
                ))}
              </select>
              <h2>
                {items[selectedItem].name} ({items[selectedItem].standardUnit})
              </h2>
              <ResponsiveContainer width={400} height={250}>
                <LineChart
                  data={items[selectedItem].history.map((h) => ({
                    ...h,
                    timestamp: h.timestamp.getTime(),
                  }))}
                  margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
                >
                  <XAxis
                    dataKey="timestamp"
                    type="number"
                    domain={["dataMin", "dataMax"]}
                    tickFormatter={(unixTime) =>
                      new Date(unixTime).toLocaleDateString()
                    }
                  />
                  <YAxis dataKey="stock" />
                  <CartesianGrid stroke="#f5f5f5" />
                  <Tooltip
                    labelFormatter={(unixTime) =>
                      new Date(unixTime).toLocaleDateString()
                    }
                  />
                  <Legend />
                  <Line type="monotone" dataKey="stock" stroke="#ff7300" />
                  <CartesianGrid stroke="#000" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </main>
      </div>
    </Layout>
  );
}
