import React from 'react';
import Layout from '../../../components/Layout';
import moment from 'moment';
import { GetStaticProps } from 'next';
import prisma from '../../../lib/prisma';
import ReportsTable from './ReportsTable';
import TimeGraph from '../../../components/TimeGraph';
import { CapacityReport, Event } from '@prisma/client';
import CapacityForm from './CapacityForm';

type Props = {
    allReports: CapacityReport[];
    events: Event[];
};

export const getStaticProps: GetStaticProps = async () => {
    const allReports = await prisma.capacityReport.findMany({
        orderBy: {
            timestamp: 'asc',
        },
    });
    const events = await prisma.event.findMany();

    return {
        props: { allReports, events },
        revalidate: 1,
    };
};

export default function ReportCapacity({ allReports, events }: Props) {
    const [reports, setReports] = React.useState<CapacityReport[]>(allReports);

    const onDeleteReport = async (id: string) => {
        setReports(reports.filter((report) => report.id !== id));
        const response = await fetch(`/api/capacity`, {
            method: 'DELETE',
            body: JSON.stringify({ id }),
            headers: {
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) {
            location.reload();
        }
    };
    const onAddReport = (report: CapacityReport) => {
        setReports((reps) => [report, ...reps]);
    };
    const updateReport = (id: string, newReport: CapacityReport) => {
        setReports((reps) => reps.map((r) => (r.id === id ? newReport : r)));
    };

    return (
        <Layout>
            <CapacityForm
                onAddReport={onAddReport}
                updateReport={updateReport}
            />
            <h2 className="text-center">Capacity Reports</h2>
            <TimeGraph
                events={events}
                data={reports}
                plotField="numPeople"
                defaultStartTime={moment()
                    .subtract(1, 'day')
                    .format('YYYY-MM-DD')}
            />
            <ReportsTable reports={reports} deleteReport={onDeleteReport} />
        </Layout>
    );
}
