import React from "react";
import Layout from "../../../../components/Layout";
import { GetServerSideProps } from "next";
import prisma from "../../../../lib/prisma";
import { Prisma } from "@prisma/client";
import moment from "moment";
import DeleteButton from "../../../../components/DeleteButton";
import Router from "next/router";

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const order = await prisma.order.findUnique({
    where: {
      id: String(params?.id),
    },
    include: {
      supplier: true,
      items: {
        include: {
          item: {
            include: {
              suppliedUnit: true,
              item: {
                include: {
                  units: true,
                },
              },
            },
          },
        },
      },
    },
  });
  return {
    props: { order },
  };
};

type Props = {
  order: Prisma.OrderGetPayload<{
    include: {
      supplier: true;
      items: {
        include: {
          item: {
            include: {
              suppliedUnit: true;
              item: {
                include: {
                  units: true;
                };
              };
            };
          };
        };
      };
    };
  }>;
};

export default function EditOrder({ order }: Props) {
  return (
    <Layout>
      <div className="page">
        <main>
          <h2>
            {order.supplier.name} Order{" "}
            {moment(order.timestamp).format("YYYY-MM-DD")}
          </h2>
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Quantity</th>
                <th>Unit</th>
                <th>Price Per Unit</th>
                <th>Price</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((orderItem) => (
                <tr key={orderItem.id}>
                  <td>{orderItem.item.item.name}</td>
                  <td>{orderItem.quantity}</td>
                  <td>{orderItem.item.suppliedUnit.name}</td>
                  <td>${orderItem.item.pricePerUnit.toFixed(2)}</td>
                  <td>
                    $
                    {(orderItem.quantity * orderItem.item.pricePerUnit).toFixed(
                      2
                    )}
                  </td>
                </tr>
              ))}
              <tr>
                <td colSpan={4}>Total</td>
                <td>
                  $
                  {order.items
                    .reduce((a, b) => a + b.quantity * b.item.pricePerUnit, 0)
                    .toFixed(2)}
                </td>
              </tr>
              <tr>
                <td colSpan={4}>Charged Total</td>
                <td>${order.actualTotal.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
          <DeleteButton
            onClick={async () => {
              await fetch("/api/order", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: order.id }),
              });
              Router.push("/reports/order");
            }}
          >
            Delete Order
          </DeleteButton>
        </main>
      </div>
    </Layout>
  );
}

// <button
//   onClick={async () => {
//     await fetch("/api/order", {
//       method: "DELETE",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ id: order.id }),
//     });
//     Router.reload();
//   }}
// >
//   Delete
// </button>;
