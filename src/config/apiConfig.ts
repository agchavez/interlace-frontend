import axios from 'axios';
const backendApi = axios.create({
    baseURL: import.meta.env.VITE_JS_APP_API_URL + '/api',
    timeout: 60000
})

export default backendApi