'use client';
import React, { useEffect, useState } from 'react';
import moment from 'moment';

type Props = {
    timestamp: string;
    setTimestamp: (timestamp: string) => void;
};

export default function DateTimePicker({ timestamp, setTimestamp }: Props) {
    const [date, setDate] = useState(moment(timestamp).format('YYYY-MM-DD'));
    const [time, setTime] = useState(moment(timestamp).format('HH:mm'));
    const [isLiveTime, setIsLiveTime] = useState(false);
    const [liveTime, setLiveTime] = useState(moment().format('HH:mm:ss'));

    useEffect(() => {
        setIsLiveTime(true);
    }, []);

    useEffect(() => {
        const newDate = moment(timestamp).format('YYYY-MM-DD');
        const newTime = moment(timestamp).format('HH:mm');
        if (newDate != date) {
            setDate(newDate);
        }
        if (newTime != time) {
            setTime(newTime);
        }
    }, [timestamp]);

    useEffect(() => {
        if (!isLiveTime) {
            setTimestamp(moment(`${date} ${time}`).toISOString());
        }
    }, [date, time, isLiveTime, setTimestamp]);

    useEffect(() => {
        let intervalId: NodeJS.Timeout;

        if (isLiveTime) {
            const updateLiveTime = () => {
                const now = moment();
                setLiveTime(now.format('HH:mm:ss'));
                setTimestamp(now.toISOString());
            };

            updateLiveTime(); // Update immediately when switching to live mode
            intervalId = setInterval(updateLiveTime, 1000); // Update every second
        }

        return () => {
            if (intervalId) clearInterval(intervalId);
        };
    }, [isLiveTime, setTimestamp]);

    return (
        <div className="space-y-2">
            <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2">
                    <input
                        type="checkbox"
                        checked={isLiveTime}
                        onChange={(e) => setIsLiveTime(e.target.checked)}
                        className="form-checkbox"
                    />
                    <span>Live Time</span>
                </label>
                {isLiveTime && (
                    <div className="text-xl font-semibold">{liveTime}</div>
                )}
            </div>
            {!isLiveTime && (
                <div className="flex space-x-2">
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="border rounded p-2"
                    />
                    <input
                        type="time"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        className="border rounded p-2"
                    />
                </div>
            )}
        </div>
    );
}
