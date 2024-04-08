import moment from 'moment';
import Router from 'next/router';
import React from 'react';
import Form from '../../../components/Form';
import DateTimePicker from '../../../components/DateTimePicker';
import { CapacityReport } from '@prisma/client';

type Props = {
    onAddReport: (report: CapacityReport) => void;
    updateReport: (id: string, newReport: CapacityReport) => void;
};

export default function CapacityForm({ onAddReport, updateReport }: Props) {
    const [numPeople, setNumPeople] = React.useState<number | ''>('');
    const [timestamp, setTimestamp] = React.useState<string>(
        moment().toISOString()
    );
    const [preventingEntry, setPreventingEntry] =
        React.useState<boolean>(false);

    const submitData = async (e: React.SyntheticEvent) => {
        e.preventDefault();
        try {
            //timestamp by date and time
            if (numPeople === '') {
                alert('Please enter the number of people.');
                return;
            }
            const body = { numPeople, timestamp, preventingEntry };
            const fakeId = Math.floor(Math.random() * 1000000).toString();
            const newFakeReport: CapacityReport = {
                id: fakeId,
                numPeople: numPeople,
                timestamp: new Date(timestamp),
                preventingEntry: preventingEntry,
            };
            onAddReport(newFakeReport);
            setNumPeople('');
            console.log(
                timestamp,
                moment(timestamp).add(1, 'minute').toISOString()
            );
            setTimestamp(moment(timestamp).add(1, 'minute').toISOString());
            const resp = await fetch('/api/capacity', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            const newReport: CapacityReport = await resp.json();
            updateReport(fakeId, newReport);
        } catch (error) {
            console.error(error);
        }
    };
    return (
        <Form title="Report Capacity" onSubmit={submitData}>
            <div>
                <input
                    autoFocus
                    type="number"
                    placeholder="# People"
                    min={0}
                    className="w-32"
                    value={numPeople}
                    onChange={(e) => {
                        setNumPeople(
                            e.target.value.length == 0
                                ? ''
                                : parseInt(e.target.value)
                        );
                    }}
                />
                <label>
                    Preventing Entry
                    <input
                        type="checkbox"
                        onChange={(e) => setPreventingEntry(e.target.checked)}
                        checked={preventingEntry}
                    />
                </label>
            </div>
            <DateTimePicker timestamp={timestamp} setTimestamp={setTimestamp} />
        </Form>
    );
}
