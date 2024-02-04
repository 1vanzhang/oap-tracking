import React, { useEffect, useMemo } from "react";
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
type Item = {
  id: string;
  name: string;
  standardUnit: string;
  createdAt: Date;
  updatedAt: Date;
};

export const getStaticProps: GetStaticProps = async () => {
  let suppliers = await prisma.supplier.findMany({
    include: {
      itemSupplier: {
        include: {
          item: true,
          suppliedUnit: true,
        },
      },
    },
  });
  //
  suppliers = suppliers.map((supplier) => {
    const newItemSupplier = supplier.itemSupplier.sort(
      (a, b) => b.date.getTime() - a.date.getTime()
    );

    const seenItemIds = new Set<string>();
    const uniqueItemSupplier = newItemSupplier.filter((itemSupplier) => {
      if (seenItemIds.has(itemSupplier.itemId)) {
        return false;
      }
      seenItemIds.add(itemSupplier.itemId);
      return true;
    });

    return {
      ...supplier,
      itemSupplier: uniqueItemSupplier,
    };
  });

  const orders = await prisma.order.findMany({
    orderBy: {
      timestamp: "desc",
    },
  });

  return {
    props: { suppliers, orders },
    revalidate: 5,
  };
};

type ItemSupplier = {
  id: string;
  date: Date;
  pricePerUnit: number;
  itemId: string;
  item: Item;
  supplierName: string;
  suppliedUnitId: string;
  suppliedUnit: ItemUnit;
};

type Supplier = {
  name: string;
  itemSupplier: ItemSupplier[];
};
type ItemOrder = {
  itemId: string;
  quantity: number;
};

type Order = {
  id: string;
  timestamp: Date;
  supplierName: string;
  actualTotal: number;
  createdAt: Date;
  updatedAt: Date;
};

type Props = {
  suppliers: Supplier[];
  orders: Order[];
};

export default function Order({ suppliers, orders }: Props) {
  const [selectedSupplierId, setSelectedSupplierId] =
    React.useState<string>("");
  const selectedSupplier = useMemo(() => {
    return suppliers.find((supplier) => supplier.name === selectedSupplierId);
  }, [selectedSupplierId]);
  const [order, setOrder] = React.useState<ItemOrder[]>([]);
  const [timestamp, setTimestamp] = React.useState<string>(
    new Date().toISOString()
  );
  const [actualTotal, setActualTotal] = React.useState<number | "">(0);

  useEffect(() => {
    //calculate total
    let total = 0;
    order.forEach((orderItem) => {
      const item = selectedSupplier?.itemSupplier.find(
        (itemSupplier) => itemSupplier.id === orderItem.itemId
      );
      total += item?.pricePerUnit * (orderItem.quantity || 0);
    });
    setActualTotal(total);
  }, [order]);

  useEffect(() => {
    if (selectedSupplier) {
      const order: ItemOrder[] = [];
      selectedSupplier.itemSupplier.forEach((itemSupplier) => {
        order.push({ itemId: itemSupplier.id, quantity: 0 });
      });
      setOrder(order);
    }
  }, [selectedSupplier]);

  return (
    <Layout>
      <div className="page">
        <main>
          <h1>Order</h1>
          <select
            value={selectedSupplierId}
            onChange={(e) => {
              setOrder([]);
              setSelectedSupplierId(e.target.value);
            }}
          >
            <option value="">Select Supplier</option>
            {suppliers.map((supplier) => (
              <option key={supplier.name} value={supplier.name}>
                {supplier.name}
              </option>
            ))}
          </select>
          {selectedSupplier && (
            <div>
              <table>
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Price Per Unit</th>
                    <th>Supplied Unit</th>
                    <th>Order Quantity</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.map((orderItem) => {
                    const item = selectedSupplier.itemSupplier.find(
                      (itemSupplier) => itemSupplier.id === orderItem.itemId
                    );
                    return (
                      <tr key={orderItem.itemId}>
                        <td>{item.item.name}</td>
                        <td>{item.pricePerUnit}</td>
                        <td>{item.suppliedUnit.name}</td>
                        <td>
                          <input
                            type="number"
                            value={orderItem.quantity}
                            onChange={(e) => {
                              const newOrder = order.map((item) => {
                                if (item.itemId === orderItem.itemId) {
                                  return {
                                    ...item,
                                    quantity: e.target.valueAsNumber,
                                  };
                                }
                                return item;
                              });
                              setOrder(newOrder);
                            }}
                          />
                        </td>
                        <td>
                          $
                          {isNaN(item.pricePerUnit * orderItem.quantity)
                            ? "0"
                            : item.pricePerUnit * orderItem.quantity}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <h3>
                  {`Total: $${order.reduce((total, item) => {
                    const supplierItem = selectedSupplier.itemSupplier.find(
                      (supplierItem) => supplierItem.id === item.itemId
                    );
                    const itemVal = isNaN(
                      supplierItem.pricePerUnit * item.quantity
                    )
                      ? 0
                      : supplierItem.pricePerUnit * item.quantity;
                    return total + itemVal;
                  }, 0)}`}
                </h3>
              </table>
              <DateTimePicker
                timestamp={timestamp}
                setTimestamp={setTimestamp}
              />
              <label>
                Actual Total ($)
                <input
                  type="number"
                  value={actualTotal}
                  onChange={(e) => setActualTotal(e.target.valueAsNumber)}
                />
              </label>

              <button
                onClick={async () => {
                  await fetch("/api/order", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      order,
                      supplierName: selectedSupplier.name,
                      timestamp,
                      actualTotal,
                    }),
                  });
                  Router.reload();
                }}
              >
                Save
              </button>
            </div>
          )}
          <h2>Order History</h2>
          <table>
            <thead>
              <tr>
                <th>Supplier</th>
                <th>Timestamp</th>
                <th>Actual Total</th>
                <th>Delete</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>{order.supplierName}</td>
                  <td>{order.timestamp.toLocaleString()}</td>
                  <td>{order.actualTotal}</td>
                  <td>
                    <button
                      onClick={async () => {
                        await fetch("/api/order", {
                          method: "DELETE",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ id: order.id }),
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
