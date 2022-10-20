import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:8080',
});

const { get, post, put } = instance;

export { get, post, put };
