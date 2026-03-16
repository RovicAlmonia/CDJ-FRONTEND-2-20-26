import Axios from 'axios';

const baseUrl = window.location.origin;

const http = Axios.create({
    // baseURL: "https://cu-app-server.vercel.app/api",
    baseURL: baseUrl.split(':')[0] + ':' + baseUrl.split(':')[1] + ":8100/api",
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
    },
});



export { http };