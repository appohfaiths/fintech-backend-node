import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import advancedFormat from "dayjs/plugin/advancedFormat";

dayjs.extend(utc);
dayjs.extend(advancedFormat)

export function formatDate(date: Date): string {
    return dayjs.utc(date).format("DD MMMM YYYY");
}