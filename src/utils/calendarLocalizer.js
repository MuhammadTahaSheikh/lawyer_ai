// src/utils/calendarLocalizer.js
import moment from "moment";
import { momentLocalizer } from "react-big-calendar";

// Create & stub out destroy() just once
const localizer = momentLocalizer(moment);
localizer.destroy = () => {};

export default localizer;