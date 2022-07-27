const axios = require('axios')
// 默认超时设置
axios.defaults.timeout = 50000;

// 相对路径设置
axios.defaults.baseURL = "https://api.binance.com";

//http request 拦截器
axios.interceptors.request.use(
    config => {
        // 设置参数格式
        if (!config.headers['Content-Type']) {
            config.headers = {
                'Content-Type': 'application/json',
            };
        }
        // 鉴权参数设置
        if (config.method === 'get') {
            //get请求下 参数在params中，其他请求在data中
            config.params = config.params || {};
            config.params = JSON.parse(JSON.stringify(config.params));
            //一些参数处理
        } else {
            config.data = config.data || {};
            //一些参数处理
        }
        return config;
    },
    err => {
        return Promise.reject(err);
    }
);

//http response 拦截器
axios.interceptors.response.use(
    response => {
        //一些统一code的返回处理
        if (response.data.code === 501) {

        }
        return response;
    },
    error => {
        return Promise.reject(error)
    }
);

/**
 * 封装get方法
 * @param url
 * @param params
 * @returns {Promise}
 */
const fetch = function(url, params = {}) {
    return new Promise((resolve, reject) => {
        axios.get(url, {
            params: params
        })
            .then(response => {
                if (response.status === 200) {
                    //返回成功处理  这里传的啥 后续调用的时候 res就是啥
                    resolve(response.data);//我们后台所有数据都是放在返回的data里所以这里统一处理了
                } else {
                    //错误处理
                    reject(response);
                }
            })
            .catch(err => {
                reject(err);

            })
    })
}

/**
 * 封装post请求
 * @param url
 * @param data
 * @returns {Promise}
 */

const post = function(url, data = {}) {
    return new Promise((resolve, reject) => {
        axios.post(url, data)
            .then(response => {
                if (response.status === 200) {
                    resolve(response.data.data);
                } else {
                    reject(response.data.message)
                }
            }, err => {
                reject(err);
            })
    })
}

/**
 * 封装patch请求
 * @param url
 * @param data
 * @returns {Promise}
 */

const patch = function(url, data = {}) {
    return new Promise((resolve, reject) => {
        axios.patch(url, data)
            .then(response => {
                if (response.data.code === 200) {
                    resolve(response.data.data);
                } else {
                    reject(response.data.message)
                }
            }, err => {
                reject(err);
            })
    })
}

/**
 * 封装put请求
 * @param url
 * @param data
 * @returns {Promise}
 */

const put = function(url, data = {}) {
    return new Promise((resolve, reject) => {
        axios.put(url, data)
            .then(response => {
                if (response.data.code === 200) {
                    resolve(response.data.data);
                } else {
                    reject(response.data.message)
                }
            }, err => {
                reject(err);

            })
    })
}

/**
 * 封装del请求
 * @param url
 * @param data
 * @returns {Promise}
 */
const del = function(url, data = {}) {
    return new Promise((resolve, reject) => {
        axios.delete(url, data)
            .then(response => {
                if (response.data.code === 200) {
                    resolve(response.data.data);
                } else {
                    reject(response.data.msg)
                }
            }, err => {
                reject(err);
            })
    })
}

module.exports = {
    fetch:fetch,
    post:post,
    del:del,
    put:put,
    patch:patch,
}