import { getSession } from "next-auth/react";
import prisma from "../../../lib/prisma";
import { ItemUnit } from "@prisma/client";

type Item = {
  id: string;
  name: string;
  standardUnit: string;
  createdAt: Date;
  updatedAt: Date;
  units: ItemUnit[];
};
type ProductItem = {
  itemId: string;
  quantity: number;
  unitId: string;
};
type ProductComponent = {
  options: ProductItem[];
};

const handleCreateProduct = async (req, res) => {
  const { name, components, sellPrice } = req.body;

  let newProduct = await prisma.product.create({
    data: {
      name: name,
      sellPrice: sellPrice,
      components: {
        createMany: {
          data: components.map((component: ProductComponent) => {
            return {};
          }),
        },
      },
    },
  });

  const newProductWithComponents = await prisma.product.findUnique({
    where: {
      id: newProduct.id,
    },
    include: {
      components: {
        include: {
          options: true,
        },
      },
    },
  });

  await Promise.all(
    newProductWithComponents.components.map((component, i) => {
      const options = components[i].options.map((option: ProductItem) => {
        return {
          quantity: option.quantity,
          itemId: option.itemId,
          unitId: option.unitId.length > 0 ? option.unitId : null,
        };
      });
      return prisma.productComponent.update({
        where: {
          id: component.id,
        },
        data: {
          options: {
            createMany: {
              data: options,
            },
          },
        },
      });
    })
  );
  const newProductWithEverything = await prisma.product.findUnique({
    where: {
      id: newProduct.id,
    },
    include: {
      components: {
        include: {
          options: {
            include: {
              item: true,
              unit: true,
            },
          },
        },
      },
    },
  });
  res.json(newProductWithEverything);
};

const handleDeleteProduct = async (req, res) => {
  const { id } = req.body;
  const product = await prisma.product.delete({
    where: { id },
  });
  res.json(product);
};

const handleUpdateProduct = async (req, res) => {
  const { id, name, sellPrice } = req.body;
  const product = await prisma.product.update({
    where: { id },
    data: {
      name,
      sellPrice,
    },
  });
  res.json(product);
};

export default async function handle(req, res) {
  if (req.method == "POST") {
    handleCreateProduct(req, res);
  } else if (req.method == "DELETE") {
    handleDeleteProduct(req, res);
  } else if (req.method == "PUT") {
    handleUpdateProduct(req, res);
  }
}
