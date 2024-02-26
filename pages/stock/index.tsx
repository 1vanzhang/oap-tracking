import React, { useMemo } from "react";
import Layout from "../../components/Layout";
import { GetStaticProps } from "next";
import prisma from "../../lib/prisma";

import { getStockHistory } from "../../utils/stock.utils";
import TimeGraph from "../../components/TimeGraph";
import { Event } from "@prisma/client";

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
  const events = await prisma.event.findMany();
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
    props: { items: formattedItems, events },
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
  events: Event[];
};

export default function Stock({ items, events }: Props) {
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
              <TimeGraph
                events={events}
                data={items[selectedItem].history.map((h) => ({
                  stock: h.quantity,
                  timestamp: h.timestamp,
                }))}
                plotField="stock"
              />
            </div>
          </div>
        </main>
      </div>
    </Layout>
  );
}
