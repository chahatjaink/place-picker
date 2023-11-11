import { useEffect, useState } from "react";

export default function ProgressBar({ timer }) {
    const [remainingTime, setRemainingTime] = useState(timer);

    useEffect(() => {
        const timerId = setInterval(() => {
            setRemainingTime((prevTime) => prevTime - 10);
        }, 10);

        return () => {
            clearInterval(timerId);
        }
    }, [])

    return (
        <progress value={remainingTime} max={timer} />
    )
}