import Router from "next/router";
import React from "react";
import { Prisma } from "@prisma/client";

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

export default function ProductsTable({ products }: Props) {
  return (
    <div>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Sell Price</th>
            <th>Components</th>
            <th>Edit</th>
          </tr>
        </thead>
        <tbody>
          {products?.map((product) => {
            return (
              <tr key={product.id}>
                <td>{product.name}</td>
                <td>{product.sellPrice}</td>
                <td>{product.components.length}</td>
                <td>
                  <button
                    onClick={() => {
                      Router.push(`/settings/edit-product/${product.id}`);
                    }}
                  >
                    Edit
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
