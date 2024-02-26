import React from "react";
import Layout from "../../../components/Layout";
import { GetStaticProps } from "next";
import prisma from "../../../lib/prisma";
import { Prisma } from "@prisma/client";

export const getStaticProps: GetStaticProps = async () => {
  const products = await prisma.product.findMany({
    include: {
      components: {
        include: {
          options: {
            include: {
              item: {
                include: {
                  suppliers: {
                    include: {
                      suppliedUnit: true,
                    },
                  },
                },
              },
              unit: true,
            },
          },
        },
      },
    },
  });
  console.log("products", products);
  return {
    props: { products },
    revalidate: 5,
  };
};

type Props = {
  products: Prisma.ProductGetPayload<{
    include: {
      components: {
        include: {
          options: {
            include: {
              item: {
                include: {
                  suppliers: {
                    include: {
                      suppliedUnit: true;
                    };
                  };
                };
              };
              unit: true;
            };
          };
        };
      };
    };
  }>[];
};

export default function Profit({ products }: Props) {
  return (
    <Layout>
      <div className="page">
        <main>
          <h1>Profits</h1>
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Most Expensive Variation</th>
                <th>Cost</th>
                <th>Sell For</th>
                <th>Sell For After Tax</th>
                <th>Margin</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                const componentCosts = product.components.map((component) => {
                  return component.options.reduce(
                    (a, b) => {
                      const itemSupplier = b.item.suppliers.sort((a, b) =>
                        a.date > b.date ? -1 : 1
                      )[0];
                      const supplierCostPerStandardUnit =
                        itemSupplier.pricePerUnit /
                        (itemSupplier.suppliedUnit?.ratioToStandard ?? 1);
                      const costPerItemSold =
                        supplierCostPerStandardUnit *
                        b.quantity *
                        (b.unit?.ratioToStandard ?? 1);
                      if (a.cost === 0 || costPerItemSold > a.cost) {
                        return {
                          cost: costPerItemSold,
                          name: b.item.name + " " + itemSupplier.supplierName,
                        };
                      }
                      return a;
                    },
                    { cost: 0, name: "" }
                  );
                });
                const cost = componentCosts.reduce((a, b) => a + b.cost, 0);

                return (
                  <tr key={product.id}>
                    <td>{product.name}</td>
                    <td>
                      {componentCosts.map((c) => (
                        <div>{`${c.name} ($${
                          Math.round(c.cost * 1000) / 1000
                        })`}</div>
                      ))}
                    </td>
                    <td>${Math.round(cost * 100) / 100}</td>
                    <td>${product.sellPrice}</td>
                    <td>
                      ${Math.round((product.sellPrice / 1.14975) * 100) / 100}
                    </td>
                    <td>
                      {Math.round(
                        ((product.sellPrice / 1.14975 - cost) / cost) * 100
                      )}
                      % or $
                      {Math.round((product.sellPrice / 1.14975 - cost) * 100) /
                        100}
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
