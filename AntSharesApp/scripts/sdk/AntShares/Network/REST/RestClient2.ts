namespace AntShares.Network.REST {
    export class RestClient2 {
        public rootURL: string;

        public constructor(url: string) {
            this.rootURL = url;
        }

        public handleResponse(response) {
            let contentType = response.headers.get('content-type');
            return new Promise((resolve, reject) => {
                if (response.status == 200) {
                    if (contentType.includes('application/json')) {
                        return resolve(response.json());
                    } else if (contentType.includes('text/html')) {
                        return resolve(response.text());
                    } else {
                        throw new Error("Sorry, content-type " + contentType + " not supported");
                    }
                } else {
                    throw new Error(response.statusText);
                }
            });
        }

        public get(url: string): PromiseLike<any> {
            return new Promise((resolve, reject) => {
                return fetch(url, { method: 'GET' }).then(this.handleResponse).then(result => {
                    return resolve(result);
                }).catch(error => {
                    return reject(error);
                });
            });
        }

        
        public post(url: string, data: string): PromiseLike<any> {
            return new Promise((resolve, reject) => {
                return fetch(url, {
                    method: 'POST',
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded"
                    },
                    body: data
                }).then(this.handleResponse).then(result => {
                    return resolve(result);
                }).catch(error => {
                    return reject(error);
                });
            });
        }


    }
}
