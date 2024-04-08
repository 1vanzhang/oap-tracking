import React from 'react';
import Layout from './Layout';
import Form from './Form';
import DataTable from './DataTable';
import useGreedyServerArray from '../hooks/useGreedyServerArray';
import DeleteButton from './DeleteButton';
import Router from 'next/router';

type Data = {
    id: string;
};

type Props<T extends Data> = {
    children: React.ReactNode | React.ReactNode[];
    title: string;
    tableTitle: string;
    history: T[];
    columns: string[];
    getRow: (item: T) => React.ReactNode[];
    deleteRow: (id: string) => Promise<void>;
    addRow: () => Promise<string>;
    getFormItem: () => Omit<T, 'id'>;
};

export default function FormAndTable<T extends Data>({
    title,
    children,
    history,
    tableTitle,
    columns,
    getRow,
    deleteRow,
    getFormItem,
    addRow,
}: Props<T>) {
    const [greedyHistory, addItem, removeItem, updateItem] =
        useGreedyServerArray(history);

    const submit = async (event: React.FormEvent) => {
        event.preventDefault();
        const item: T = {
            id: Math.random().toString(36).substring(5),
            ...getFormItem(),
        } as T;
        addItem(item);
        const id = await addRow().catch(() => {
            Router.reload();
        });
        updateItem(0, { ...item, id });
    };

    return (
        <Layout>
            <div className="page">
                <main>
                    <Form title={title} onSubmit={submit}>
                        {children}
                    </Form>
                    <DataTable
                        downloadData={greedyHistory}
                        title={tableTitle}
                        columns={columns}
                        data={greedyHistory.map((item) => {
                            const cells = getRow(item);
                            cells.push(
                                <DeleteButton
                                    disabled={item.id.length < 10}
                                    onClick={async () => {
                                        removeItem(
                                            greedyHistory.findIndex(
                                                (c) => c.id === item.id
                                            )
                                        );
                                        await deleteRow(item.id).catch(() => {
                                            Router.reload();
                                        });
                                    }}
                                >
                                    Delete
                                </DeleteButton>
                            );
                            return cells;
                        })}
                    />
                </main>
            </div>
        </Layout>
    );
}
