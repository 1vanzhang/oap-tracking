import React from 'react';
import { CapacityReport } from '@prisma/client';
import moment from 'moment';
import DeleteButton from '../../../components/DeleteButton';
import DataTable from '../../../components/DataTable';

type Props = {
    reports?: CapacityReport[];
    deleteReport: (id: string) => void;
};

export default function ReportsTable({ deleteReport, reports }: Props) {
    return (
        <div>
            {
                <DataTable
                    downloadData={reports}
                    title="Capacity Reports"
                    columns={[
                        'Timestamp',
                        'Number of people',
                        'Preventing entry',
                        'Delete',
                    ]}
                    data={
                        reports?.map((report) => [
                            moment(report.timestamp).format(
                                'YYYY-MM-DD hh:mm a'
                            ),
                            report.numPeople,
                            report.preventingEntry ? 'Yes' : 'No',
                            <DeleteButton
                                onClick={() => deleteReport(report.id)}
                            >
                                Delete
                            </DeleteButton>,
                        ]) ?? []
                    }
                />
            }
        </div>
    );
}
