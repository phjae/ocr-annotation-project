import axios, {AxiosError} from "axios"
import { createBrowserHistory } from 'history'
import {ACCESS_TOKEN} from "common/Constant"

export const history = createBrowserHistory();

const backendUri = process.env.REACT_APP_BACKEND_URI;
const apiVersion = process.env.REACT_APP_API_VERSION;

if (!backendUri) {
    throw new Error('REACT_APP_BACKEND_URI is not defined');
}

if (!apiVersion) {
    throw new Error('REACT_APP_API_VERSION is not defined');
}
export const apiClient = axios.create({
    baseURL: `$r{backendUri}${apiVersion}`,
})

export const multipartApiClient = axios.create({
    baseURL: `${backendUri}${apiVersion}`,
})

export const loginClient = axios.create({
    baseURL: `${backendUri}${apiVersion}`,
 })

export const jenkinsLoginApiClient = axios.create({
    baseURL: 'http://192.168.0.10:8100',
})

loginClient.interceptors.request.use(
    function (config){
        config.headers["Content-Type"] = 'application/json'
        return config;
    }
)

apiClient.interceptors.request.use(
    function (config){
        config.headers["Content-Type"] = 'application/json'
        config.headers["Authorization"] = `Bearer ${localStorage.getItem(ACCESS_TOKEN)?localStorage.getItem(ACCESS_TOKEN):''}`
        return config;
    }
)

multipartApiClient.interceptors.request.use(
    function (config){
        const boundary = '----WebKitFormBoundary' + Math.random().toString(16).substr(2)
        config.headers["Content-Type"] = `multipart/form-data; boundary=${boundary}`
        // config.headers["Content-Type"] = "multipart/form-data; charset=UTF-8"
        config.headers["Authorization"] = `Bearer ${localStorage.getItem(ACCESS_TOKEN)?localStorage.getItem(ACCESS_TOKEN):''}`
        return config;
    }
)

jenkinsLoginApiClient.interceptors.request.use(
    function (config){
        return config;
    }
)

loginClient.interceptors.response.use(
    response => {
      return response
    },
    function (error: AxiosError) {
        return Promise.reject(error.response)
    }
);

apiClient.interceptors.response.use(
    response => {
        return response
    },
    function (error: AxiosError) {
        return Promise.reject(error.response)
    }
);


multipartApiClient.interceptors.response.use(
    response => {
        return response
    },
    function (error: AxiosError) {
        return Promise.reject(error.response)
    }
);

jenkinsLoginApiClient.interceptors.response.use(
    response => {
        return response
    },
    function (error: AxiosError) {
        return Promise.reject(error.response)
    }
);