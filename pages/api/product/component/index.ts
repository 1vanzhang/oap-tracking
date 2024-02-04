import { getSession } from "next-auth/react";
import prisma from "../../../../lib/prisma";
// await fetch(`/api/product/component`, {
//   method: "POST",
//   headers: { "Content-Type": "application/json" },
//   body: JSON.stringify({
//     productId: product.id,
//     itemId: newItemId,
//     quantity: newQuantity,
//     unitId: newUnitId,
//     componentId: product.components[selectedIndex - 1]?.id || null,
//   }),
// });

const handleAddComponent = async (req, res) => {
  const { productId, itemId, quantity, unitId, componentId } = req.body;

  if (componentId === null) {
    console.log("Creating new component", productId, itemId, quantity, unitId);
    const component = await prisma.productComponent.create({
      data: {
        productId: productId,
        options: {
          create: {
            itemId: itemId,
            quantity: quantity,
            unitId: unitId || null,
          },
        },
      },
    });
    res.json(component);
    return;
  } else {
    await prisma.productItem.create({
      data: {
        componentId: componentId,
        itemId: itemId,
        quantity: quantity,
        unitId: unitId,
      },
    });
  }
  const component = await prisma.productComponent.findUnique({
    where: {
      id: componentId,
    },
    include: {
      options: true,
    },
  });

  res.json(component);
};

const handleDeleteComponent = async (req, res) => {
  const { id } = req.body;
  const component = await prisma.productComponent.delete({
    where: { id },
  });
  res.json(component);
};

export default async function handle(req, res) {
  if (req.method == "POST") {
    handleAddComponent(req, res);
  } else if (req.method == "DELETE") {
    handleDeleteComponent(req, res);
  }
}
