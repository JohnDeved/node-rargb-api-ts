"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const request = require("request");
const url_1 = require("url");
const appName = 'node-rargb-api-ts';
const apiEndpoint = 'https://torrentapi.org/pubapi_v2.php';
const ratelimit = 2000;
const requestOptions = {
    json: true,
    headers: {
        'User-Agent': 'UA'
    }
};
class Common {
    constructor() {
        this._token = '';
    }
    get ratelimit() {
        if (!this._ratelimit) {
            this._ratelimit = Date.now() + ratelimit;
            return false;
        }
        const limit = this._ratelimit > Date.now();
        if (!limit) {
            this._ratelimit = Date.now() + ratelimit;
        }
        return limit;
    }
    request(url, options = requestOptions) {
        return new Promise((resolve, reject) => {
            const complete = () => {
                request.get(url, options, (err, response) => {
                    if (err)
                        return reject(err);
                    resolve(response.body);
                });
            };
            const stall = () => {
                if (this.ratelimit) {
                    setTimeout(() => stall(), 100);
                }
                else {
                    complete();
                }
            };
            stall();
        });
    }
    get token() {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            if (this._token !== '') {
                return resolve(this._token);
            }
            const url = new url_1.URL(apiEndpoint);
            url.searchParams.append('get_token', 'get_token');
            url.searchParams.append('app_id', appName);
            console.log(url.href);
            const response = yield this.request(url.href);
            resolve(response.token);
        }));
    }
    queryApi(...params) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                const url = new url_1.URL(apiEndpoint);
                url.searchParams.append('app_id', appName);
                url.searchParams.append('token', yield this.token);
                params.forEach(param => {
                    Object.getOwnPropertyNames(param).forEach(key => {
                        if (param[key]) {
                            url.searchParams.append(key, param[key]);
                        }
                    });
                });
                console.log(url.href);
                resolve(yield this.request(url.href));
            }));
        });
    }
}
class Rargb {
    constructor() {
        this.common = new Common();
    }
    list(limit) {
        this.common.queryApi({ limit });
    }
}
exports.Rargb = Rargb;
exports.rargb = new Rargb();
