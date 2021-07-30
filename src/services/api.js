import axios from "axios";
export const api = axios.create({
  baseURL: "https://dtmoneymestreshake.netlify.app/api",
});
