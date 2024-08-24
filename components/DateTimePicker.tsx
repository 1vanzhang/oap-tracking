import React, { useEffect } from 'react';
import moment from 'moment';

type Props = {
    timestamp: string;
    setTimestamp: (timestamp: string) => void;
};

export default function DateTimePicker({ timestamp, setTimestamp }: Props) {
    const [date, setDate] = React.useState(
        moment(timestamp).format('YYYY-MM-DD')
    );
    const [time, setTime] = React.useState(moment(timestamp).format('HH:mm'));

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
        setTimestamp(moment(`${date} ${time}`).toISOString());
    }, [date, time]);

    useEffect(() => {
        const updateTimeIfToday = () => {
            const today = moment().format('YYYY-MM-DD');
            if (date === today) {
                const currentTime = moment().format('HH:mm');
                setTime(currentTime);
            }
        };

        const intervalId = setInterval(updateTimeIfToday, 10000); // 10 seconds

        return () => clearInterval(intervalId);
    }, [date]);

    return (
        <div>
            <input
                type="date"
                value={date}
                onChange={(e) => {
                    setDate(e.target.value);
                }}
            />
            <input
                type="time"
                value={time}
                onChange={(e) => {
                    setTime(e.target.value);
                }}
            />
        </div>
    );
}
