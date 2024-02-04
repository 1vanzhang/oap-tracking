import React from "react";
import Layout from "../../../components/Layout";
import { GetStaticProps } from "next";
import prisma from "../../../lib/prisma";
import DateTimePicker from "../../../components/DateTimePicker";
import Router from "next/router";
type ItemUnit = {
  id: string;
  name: string;
  ratioToStandard: number;
  itemId: string;
};
export const getStaticProps: GetStaticProps = async () => {
  const items = await prisma.item.findMany({
    include: {
      units: true,
    },
  });
  const stockHistory = await prisma.itemStock.findMany({
    include: {
      item: {
        include: {
          units: true,
        },
      },
      unit: true,
    },
    orderBy: {
      timestamp: "desc",
    },
  });
  return {
    props: { items, stockHistory },
    revalidate: 5,
  };
};

type ItemStock = {
  id: string;
  timestamp: Date;
  itemId: string;
  item: Item;
  quantity: number;
  unitId: string;
  unit: ItemUnit;
};

type Item = {
  id: string;
  name: string;
  standardUnit: string;
  createdAt: Date;
  updatedAt: Date;
  units: ItemUnit[];
};
type Props = {
  items: Item[];
  stockHistory: ItemStock[];
};

export default function ReportStock({ items, stockHistory }: Props) {
  const [itemId, setItemId] = React.useState<string>("");
  const [quantity, setQuantity] = React.useState<number | "">("");
  const [unitId, setUnitId] = React.useState<string>("");
  const [timestamp, setTimestamp] = React.useState<string>(
    new Date().toISOString()
  );
  return (
    <Layout>
      <div className="page">
        <main>
          <h2>Report Stock</h2>

          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const response = await fetch("/api/stock", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ itemId, quantity, unitId, timestamp }),
              });
              Router.reload();
            }}
          >
            <select value={itemId} onChange={(e) => setItemId(e.target.value)}>
              <option value="">Select Item</option>
              {items.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.valueAsNumber)}
            />
            <select value={unitId} onChange={(e) => setUnitId(e.target.value)}>
              <option value="">
                {items.find((item) => item.id === itemId)?.standardUnit}
              </option>
              {items
                .find((item) => item.id === itemId)
                ?.units.map((unit) => (
                  <option key={unit.id} value={unit.id}>
                    {unit.name}
                  </option>
                ))}
            </select>
            <DateTimePicker timestamp={timestamp} setTimestamp={setTimestamp} />
            <button type="submit">Report Stock</button>
          </form>

          <h2>Stock History</h2>
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Quantity</th>
                <th>Unit</th>
                <th>Timestamp</th>
                <th>Delete</th>
              </tr>
            </thead>
            <tbody>
              {stockHistory.map((stock) => (
                <tr key={stock.id}>
                  <td>{stock.item.name}</td>
                  <td>{stock.quantity}</td>
                  <td>{stock.unit.name}</td>
                  <td>{stock.timestamp.toLocaleString()}</td>
                  <td>
                    <button
                      onClick={async () => {
                        await fetch("/api/stock", {
                          method: "DELETE",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ id: stock.id }),
                        });
                        Router.reload();
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </main>
      </div>
    </Layout>
  );
}
