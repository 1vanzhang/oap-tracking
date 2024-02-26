import { Prisma } from "@prisma/client";

type Supplier = Prisma.SupplierGetPayload<{
  include: {
    itemSupplier: {
      include: {
        item: true;
        suppliedUnit: true;
      };
    };
  };
}>;

export const getItemSupplierAtDate = (
  suppliers: Supplier[],
  itemId: string,
  date: Date
) => {
  const itemsuppliers = suppliers
    .map((supplier) =>
      supplier.itemSupplier.filter(
        (itemSupplier) => itemSupplier.item.id === itemId
      )
    )
    .flat()
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .filter((itemSupplier) => itemSupplier.date < date);
  return itemsuppliers[0];
};
