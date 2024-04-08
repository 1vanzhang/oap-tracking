import React, { useEffect } from 'react';
import Layout from '../../../components/Layout';
import { GetStaticProps } from 'next';
import prisma from '../../../lib/prisma';
import DateTimePicker from '../../../components/DateTimePicker';
import { useSession } from 'next-auth/react';
import Router from 'next/router';
import Form from '../../../components/Form';
import ItemAndQuantitySelector from '../../../components/ItemAndQuantitySelector';
import DeleteButton from '../../../components/DeleteButton';
import DataTable from '../../../components/DataTable';
import { Prisma } from '@prisma/client';
import useGreedyServerArray from '../../../hooks/useGreedyServerArray';
export const getStaticProps: GetStaticProps = async () => {
    const items = await prisma.item.findMany({
        include: {
            units: true,
        },
    });
    const checkoutHistory = await prisma.itemCheckout.findMany({
        include: {
            item: {
                include: {
                    units: true,
                },
            },
            unit: true,
        },
        orderBy: {
            timestamp: 'desc',
        },
    });
    return {
        props: { items, checkoutHistory },
        revalidate: 1,
    };
};

type CheckoutItem = Prisma.ItemCheckoutGetPayload<{
    include: {
        item: {
            include: {
                units: true;
            };
        };
        unit: true;
    };
}>;

type Props = {
    items: Prisma.ItemGetPayload<{
        include: {
            units: true;
        };
    }>[];
    checkoutHistory: CheckoutItem[];
};

export default function Checkout({ items, checkoutHistory }: Props) {
    const [greedyCheckoutHistory, addItem, removeItem, updateItem] =
        useGreedyServerArray(checkoutHistory);
    const [selectedItemId, setSelectedItemId] = React.useState<string>('');
    const [quantity, setQuantity] = React.useState<number>(1);
    const [selectedUnitId, setSelectedUnitId] = React.useState<string>('');
    const [timestamp, setTimestamp] = React.useState<string>(
        new Date().toISOString()
    );
    useEffect(() => {
        const mostRecentCheckout = greedyCheckoutHistory.find(
            (checkout) => checkout.itemId === selectedItemId
        );
        if (mostRecentCheckout) {
            setSelectedUnitId(mostRecentCheckout.unitId);
        } else {
            setSelectedUnitId('');
        }
    }, [greedyCheckoutHistory, selectedItemId]);
    const { data: session, status } = useSession();

    const userId = session?.user?.email;

    const submit = async (e: React.SyntheticEvent) => {
        e.preventDefault();
        const fakeNewCheckout: CheckoutItem = {
            id: Math.random().toString(36).substring(5),
            item: items.find((item) => item.id === selectedItemId),
            itemId: selectedItemId,
            quantity,
            unitId: selectedUnitId,
            unit: items
                .find((item) => item.id === selectedItemId)
                ?.units.find((unit) => unit.id === selectedUnitId),
            timestamp: new Date(timestamp),
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        setSelectedItemId('');
        addItem(fakeNewCheckout);
        fetch('/api/checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                itemId: selectedItemId,
                quantity: quantity,
                unitId: selectedUnitId?.length > 0 ? selectedUnitId : null,
                timestamp,
            }),
        })
            .then((newItem) => {
                newItem.json().then((newItem) => {
                    updateItem(0, {
                        ...fakeNewCheckout,
                        id: newItem.id,
                    });
                });
            })
            .catch(() => {
                removeItem(
                    greedyCheckoutHistory.findIndex(
                        (checkout) => checkout.id === fakeNewCheckout.id
                    )
                );
            });
    };
    return (
        <Layout>
            <div className="page">
                <main>
                    <Form title="Checkout Item" onSubmit={submit}>
                        <ItemAndQuantitySelector
                            itemOptions={items}
                            selectedItemId={selectedItemId}
                            selectedUnitId={selectedUnitId}
                            quantity={quantity}
                            setSelectedItemId={setSelectedItemId}
                            setQuantity={setQuantity}
                            setSelectedUnitId={setSelectedUnitId}
                        />
                        <DateTimePicker
                            timestamp={timestamp}
                            setTimestamp={setTimestamp}
                        />
                    </Form>
                    <DataTable
                        downloadData={greedyCheckoutHistory}
                        title="Checkout History"
                        columns={['Item', 'Quantity', 'Timestamp', 'Delete']}
                        data={greedyCheckoutHistory.map((checkout) => [
                            checkout.item.name,
                            `${checkout.quantity} ${
                                checkout.unit?.name ||
                                checkout.item.standardUnit
                            }`,
                            new Date(checkout.timestamp).toLocaleString(),
                            <DeleteButton
                                disabled={checkout.id.length < 10}
                                onClick={async () => {
                                    removeItem(
                                        greedyCheckoutHistory.findIndex(
                                            (c) => c.id === checkout.id
                                        )
                                    );
                                    await fetch('/api/checkout', {
                                        method: 'DELETE',
                                        headers: {
                                            'Content-Type': 'application/json',
                                        },
                                        body: JSON.stringify({
                                            id: checkout.id,
                                        }),
                                    }).catch(() => {
                                        Router.reload();
                                    });
                                }}
                            >
                                Delete
                            </DeleteButton>,
                        ])}
                    />
                </main>
            </div>
        </Layout>
    );
}
