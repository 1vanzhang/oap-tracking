import React, { useEffect, useMemo } from "react";
import Layout from "../../../components/Layout";
import { GetStaticProps } from "next";
import prisma from "../../../lib/prisma";
import DateTimePicker from "../../../components/DateTimePicker";
import Router from "next/router";
import { Prisma, ItemOrder, Order } from "@prisma/client";
import DataTable from "../../../components/DataTable";
import moment from "moment";
import { getItemSupplierAtDate } from "../../../utils/supplier.utils";
import { getCurrentStock } from "../../../utils/stock.utils";

export const getStaticProps: GetStaticProps = async () => {
  let suppliers = await prisma.supplier.findMany({
    include: {
      itemSupplier: {
        include: {
          item: {
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
          },
          suppliedUnit: true,
        },
      },
    },
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

type Props = {
  suppliers: Prisma.SupplierGetPayload<{
    include: {
      itemSupplier: {
        include: {
          item: {
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
          };
          suppliedUnit: true;
        };
      };
    };
  }>[];
  orders: Order[];
};

type NewItemOrder = {
  itemId: string;
  quantity: number;
};

export default function Order({ suppliers, orders }: Props) {
  const [selectedSupplierId, setSelectedSupplierId] =
    React.useState<string>("");
  const selectedSupplier = useMemo(() => {
    return suppliers.find((supplier) => supplier.name === selectedSupplierId);
  }, [selectedSupplierId]);
  const [order, setOrder] = React.useState<NewItemOrder[]>([]);
  const [timestamp, setTimestamp] = React.useState<string>("");
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
    setActualTotal(Math.round(total * 100) / 100);
  }, [order]);

  useEffect(() => {
    if (selectedSupplier) {
      const order: NewItemOrder[] = [];
      const uniqueItemIds = new Set(
        selectedSupplier.itemSupplier.map((item) => item.item.id)
      );
      uniqueItemIds.forEach((itemId) => {
        const itemSupplier = getItemSupplierAtDate(
          suppliers,
          itemId,
          moment(timestamp).endOf("day").toDate()
        );
        if (itemSupplier?.supplierName === selectedSupplier.name) {
          order.push({
            itemId: itemSupplier.id,
            quantity: 0,
          });
          uniqueItemIds.delete(itemSupplier.item.id);
        }
      });

      setOrder(order);
    }
  }, [selectedSupplier, timestamp]);

  return (
    <Layout>
      <div className="page">
        <main>
          <h1>Order</h1>
          <h2>Select Date</h2>
          <input
            type="date"
            value={timestamp}
            onChange={(e) => setTimestamp(e.target.value)}
          />
          {timestamp != "" && (
            <div>
              <select
                className="h-8 rounded mt-2 mb-2"
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
                        <th>Price Date</th>
                        <th>Current Stock</th>
                        <th>Order Quantity</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.map((orderItem) => {
                        const item = selectedSupplier.itemSupplier.find(
                          (itemSupplier) => itemSupplier.id === orderItem.itemId
                        );
                        const stock = (
                          getCurrentStock(item.item) /
                          item.suppliedUnit.ratioToStandard
                        ).toFixed(1);

                        return (
                          <tr key={orderItem.itemId}>
                            <td>{item.item.name}</td>
                            <td>
                              ${item.pricePerUnit.toFixed(2)}/
                              {item.suppliedUnit.name}
                            </td>
                            <td>{moment(item.date).format("YYYY-MM-DD")}</td>
                            <td>
                              {stock} {item.suppliedUnit.name}
                            </td>
                            <td>
                              <input
                                type="number"
                                min={0}
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
                                : (
                                    item.pricePerUnit * orderItem.quantity
                                  ).toFixed(2)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <h3>
                      {`Total: $${order
                        .reduce((total, item) => {
                          const supplierItem =
                            selectedSupplier.itemSupplier.find(
                              (supplierItem) => supplierItem.id === item.itemId
                            );
                          const itemVal = isNaN(
                            supplierItem.pricePerUnit * item.quantity
                          )
                            ? 0
                            : supplierItem.pricePerUnit * item.quantity;
                          return total + itemVal;
                        }, 0)
                        .toFixed(2)}`}
                    </h3>
                  </table>

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
                          timestamp: new Date(timestamp),
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
            </div>
          )}
          <DataTable
            title="Order History"
            columns={["Supplier", "Timestamp", "Actual Total", "Edit"]}
            data={orders.map((order) => [
              order.supplierName,
              order.timestamp.toLocaleString(),
              order.actualTotal,
              <button
                onClick={() => Router.push(`/reports/order/edit/${order.id}`)}
              >
                Edit
              </button>,
            ])}
          />
        </main>
      </div>
    </Layout>
  );
}
