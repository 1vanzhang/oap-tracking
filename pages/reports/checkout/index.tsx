import React, { useEffect } from "react";
import Layout from "../../../components/Layout";
import { GetStaticProps } from "next";
import prisma from "../../../lib/prisma";
import DateTimePicker from "../../../components/DateTimePicker";
import { useSession } from "next-auth/react";
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
  const checkoutHistory = await prisma.itemCheckout.findMany({
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
    props: { items, checkoutHistory },
    revalidate: 100,
  };
};

type ItemCheckout = {
  id: string;
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
  itemId: string;
  item: Item;
  quantity: number;
  userId: string;
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
  checkoutHistory: ItemCheckout[];
};

export default function Checkout({ items, checkoutHistory }: Props) {
  const [selectedItemId, setSelectedItemId] = React.useState<string>("");
  const [quantity, setQuantity] = React.useState<number>(1);
  const [selectedUnitId, setSelectedUnitId] = React.useState<string>("");
  const [timestamp, setTimestamp] = React.useState<string>(
    new Date().toISOString()
  );
  useEffect(() => {
    const mostRecentCheckout = checkoutHistory.find(
      (checkout) => checkout.itemId === selectedItemId
    );
    if (mostRecentCheckout) {
      setSelectedUnitId(mostRecentCheckout.unitId);
    } else {
      setSelectedUnitId("");
    }
  }, [checkoutHistory, selectedItemId]);
  const { data: session, status } = useSession();

  const userId = session?.user?.email;
  return (
    <Layout>
      <div className="page">
        <main>
          <h1>Checkout Item</h1>
          <select
            value={selectedItemId}
            onChange={(e) => setSelectedItemId(e.target.value)}
          >
            <option value="" disabled>
              Select Item
            </option>
            {items.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value))}
          />

          <select
            value={selectedUnitId}
            onChange={(e) => setSelectedUnitId(e.target.value)}
          >
            <option value="">
              {items.find((item) => item.id === selectedItemId)?.standardUnit}
            </option>
            {items
              .find((item) => item.id === selectedItemId)
              ?.units.map((unit) => (
                <option key={unit.id} value={unit.id}>
                  {unit.name}
                </option>
              ))}
          </select>
          <DateTimePicker timestamp={timestamp} setTimestamp={setTimestamp} />
          <button
            onClick={async () => {
              await fetch("/api/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  itemId: selectedItemId,
                  quantity: quantity,
                  unitId: selectedUnitId.length > 0 ? selectedUnitId : null,
                  timestamp,
                  userId,
                }),
              });
              Router.reload();
            }}
          >
            Checkout Item
          </button>
          <h2>Checkout History</h2>
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Quantity</th>
                <th>Timestamp</th>
                <th>Delete</th>
              </tr>
            </thead>
            <tbody>
              {checkoutHistory.map((checkout) => {
                return (
                  <tr key={checkout.id}>
                    <td>{checkout.item.name}</td>
                    <td>
                      {checkout.quantity}{" "}
                      {checkout.unit?.name || checkout.item.standardUnit}
                    </td>
                    <td>{new Date(checkout.timestamp).toLocaleString()}</td>
                    <td>
                      <button
                        onClick={async () => {
                          await fetch("/api/checkout", {
                            method: "DELETE",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ id: checkout.id }),
                          });
                          Router.reload();
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </main>
      </div>
    </Layout>
  );
}
