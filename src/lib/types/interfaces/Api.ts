import type EndpointInterface from "./Endpoint";


export default interface ApiInterface {
    url: string;
    [key : string]: any;
};