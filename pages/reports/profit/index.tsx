import React from "react";
import Layout from "../../../components/Layout";
import { GetStaticProps } from "next";
import prisma from "../../../lib/prisma";
type ItemUnit = {
  id: string;
  name: string;
  ratioToStandard: number;
  itemId: string;
};

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
    revalidate: 100,
  };
};

type ItemSupplier = {
  id: string;
  date: Date;
  pricePerUnit: number;
  itemId: string;
  supplierName: string;
  suppliedUnitId: string;
  suppliedUnit: ItemUnit;
};

type Item = {
  id: string;
  name: string;
  standardUnit: string;
  createdAt: Date;
  updatedAt: Date;
  suppliers: ItemSupplier[];
};

type ProductItem = {
  id: string;
  itemId: string;
  unitId: string;
  quantity: number;
  item: Item;
  unit: ItemUnit;
};

type ProductComponent = {
  id: string;
  productId: string;
  options: ProductItem[];
};

type Product = {
  id: string;
  name: string;
  sellPrice: number;
  createdAt: Date;
  updatedAt: Date;
  components: ProductComponent[];
};

type Props = {
  products: Product[];
};

export default function Profit({ products }: Props) {
  return (
    <Layout>
      <div className="page">
        <main>
          <h1>Profit</h1>
          <h2>Profit Margins</h2>
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Most Expensive Variation</th>
                <th>Cost</th>
                <th>Price</th>
                <th>Profit After Tax</th>
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
                        <div>{`${c.name} ($${c.cost})`}</div>
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
