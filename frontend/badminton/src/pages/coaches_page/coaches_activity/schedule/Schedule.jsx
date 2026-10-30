import "./Schedule.css";
const WEEK = {
    Monday: [["6:00 AM", "Junior batch", "Court 1"], ["6:30 PM", "Elite batch", "Court 2"]],
    Tuesday: [["4:30 PM", "Senior batch", "Court 1"]],
    Wednesday: [["6:00 AM", "Junior batch", "Court 1"], ["6:30 PM", "Elite batch", "Court 2"]],
    Thursday: [["4:30 PM", "Senior batch", "Court 1"]],
    Friday: [["6:00 AM", "Junior batch", "Court 1"], ["6:30 PM", "Elite batch", "Court 2"]],
    Saturday: [["8:00 AM", "Weekend batch", "Court 1"], ["4:30 PM", "Senior batch", "Court 2"]],
    Sunday: [],
};
export default function Schedule() {
    return (
        <div className="sc">
            {Object.entries(WEEK).map(([day, list]) => (
                <section className="sc-day" key={day}>
                    <h2>{day}</h2>
                    {list.length ? list.map(([t, b, c]) => (
                        <div className="sc-slot" key={t + b}><b>{t}</b><span>{b}</span><em>{c}</em></div>
                    )) : <p>Rest day. No sessions planned.</p>}
                </section>
            ))}
        </div>
    );
}
