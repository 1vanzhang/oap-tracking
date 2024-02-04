import Router from "next/router";
import React from "react";
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

export type Product = {
  id: string;
  name: string;
  sellPrice: number;
  createdAt: Date;
  updatedAt: Date;
  components: ProductComponent[];
};

type ProductComponent = {
  id: string;
  productId: string;
  options: ProductItem[];
};
type ProductItem = {
  id: string;
  itemId: string;
  quantity: number;
  unitId: string;
  componentId: string;
  item: Item;
  unit: ItemUnit;
};

type Props = {
  products: Product[];
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
