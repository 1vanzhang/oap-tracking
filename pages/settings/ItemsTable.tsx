import Router from "next/router";
import React from "react";

export type ItemUnit = {
  id: string;
  name: string;
  ratioToStandard: number;
  itemId: string;
};

type ItemSupplier = {
  id: string;
  itemId: string;
  date: Date;
  pricePerUnit: number;
  suppliedUnit: ItemUnit;
  supplierName: string;
};

export type Item = {
  id: string;
  name: string;
  standardUnit: string;
  createdAt: Date;
  updatedAt: Date;
  units: ItemUnit[];
  suppliers: ItemSupplier[];
};
type Props = {
  items: Item[];
};

export default function ItemsTable({ items }: Props) {
  return (
    <div>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Standard Unit</th>
            <th>Other Units</th>
            <th>Current Supplier</th>
            <th>Edit</th>
          </tr>
        </thead>
        <tbody>
          {items?.map((item) => {
            const supplier =
              item.suppliers.length > 0
                ? item.suppliers.sort(
                    (a, b) => b.date.getTime() - a.date.getTime()
                  )[0]
                : null;
            return (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>{item.standardUnit}</td>
                <td>{item.units.map((unit) => unit.name).join(", ")}</td>
                <td>
                  {supplier
                    ? `${supplier.supplierName} @ $${supplier.pricePerUnit}/${supplier.suppliedUnit.name}`
                    : "None"}
                </td>

                <td>
                  <button
                    onClick={() => {
                      Router.push(`/settings/edit-item/${item.id}`);
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
