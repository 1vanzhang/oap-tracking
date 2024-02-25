import { Prisma } from "@prisma/client";

type ItemWithHistory = Prisma.ItemGetPayload<{
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
}>;

type StockHistory = {
  timestamp: Date;
  quantity: number;
};

export const getCurrentStock = (item: ItemWithHistory): number => {
  const stockHistory = getStockHistory(item);
  return stockHistory[stockHistory.length - 1].quantity;
};

export const getStockHistory = (item: ItemWithHistory): StockHistory[] => {
  const history = [];
  item.checkouts.forEach((checkout) => {
    history.push({
      type: "checkout",
      timestamp: checkout.timestamp,
      quantity: checkout.quantity * (checkout.unit.ratioToStandard ?? 1),
    });
  });
  item.suppliers.forEach((supplier) => {
    supplier.itemOrder.forEach((order) => {
      history.push({
        type: "order",
        timestamp: order.order.timestamp,
        quantity: order.quantity * (supplier.suppliedUnit.ratioToStandard ?? 1),
      });
    });
  });
  item.itemStocks.forEach((stock) => {
    history.push({
      type: "stock",
      timestamp: stock.timestamp,
      quantity: stock.quantity * (stock.unit.ratioToStandard ?? 1),
    });
  });

  const sortedHistory = history.sort(
    (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
  );
  const stockHistory = [];
  let stock = 0;
  sortedHistory.forEach((event) => {
    switch (event.type) {
      case "checkout":
        stock -= event.quantity;
        break;
      case "order":
        stock += event.quantity;
        break;
      case "stock":
        stock = event.quantity;
        break;
    }
    stockHistory.push({
      timestamp: event.timestamp,
      stock,
    });
  });
  return stockHistory;
};
