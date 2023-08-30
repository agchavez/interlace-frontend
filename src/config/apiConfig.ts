import axios from 'axios';
const backendApi = axios.create({
    baseURL: import.meta.env.API_URL + '/api',
    timeout: 25000
})

export default backendApi