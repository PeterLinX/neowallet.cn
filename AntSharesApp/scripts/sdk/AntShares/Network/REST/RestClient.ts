namespace AntShares.Network.REST {
    export class RestClient {
        private rootURL: string;
        private restURL: string;
        private static commitTxURL = "/restful-server/oc/v3/service/gy/storecunzheng";

        public constructor(url: string, isMainNet: boolean) {
            if (isMainNet == true) {
                this.rootURL = url + "/mainnet";
            } else {
                this.rootURL = url + "/testnet";
            }
        }

        public getHeight1() {
            let url = this.rootURL + "/height";
            debugLog(url);
            $.get(url, data => {

                debugLog(data);
            });
        }

        public getHeight2(): JQueryPromise<any> {
            let url = this.rootURL+"/height";
            debugLog(url);
            return $.ajax({
                type: "GET",
                dataType: "json",
                headers: { "Accept": "application/json" },
                contentType: 'application/json',
                url: url,
                timeout: 3 * 1000
            });
        }

        public getHeight(): JQueryPromise<any> {
            let url = this.rootURL + "/height";
            debugLog(url);
            return $.ajax({
                type: "GET",
                url: url,
                timeout: 3 * 1000
            });
        }

        public getBlock(height: number): JQueryPromise<any> {
            let url: string = this.rootURL + "/block/"+height;
            debugLog(url);
            return $.ajax({
                type: "GET",
                url: url,
                timeout: 3 * 1000
            });
        }

        public getTx(txid: string): JQueryPromise<any> {
            let url: string = this.rootURL + "/transaction/" + txid;
            debugLog(url);
            return $.ajax({
                type: "GET",
                url: url,
                timeout: 3 * 1000
            });
        }

        public getAddr(addr: string): JQueryPromise<any> {
            let url: string = this.rootURL + "/address/" + addr;
            debugLog(url);
            return $.ajax({
                type: "GET",
                url: url,
                timeout: 3 * 1000
            });
        }

        public postOnTransfer(source: string, dests: string, amounts: string, assetId: string): JQueryPromise<any> {
            let url = this.rootURL + "/transfer";
            let params = [];
            params.push("source" + "=" + source);
            params.push("dests" + "=" + dests);
            params.push("amounts" + "=" + amounts);
            params.push("assetId" + "=" + assetId);
            let dataToSend = params.join("&");
            debugLog(url);
            debugLog(dataToSend);
            return $.ajax({
                type: "POST",
                data: dataToSend,
                contentType: 'application/x-www-form-urlencoded',
                url: url,
                timeout: 3 * 1000
            });
        }

        public postBroadcast(pubKey: string, signature: string, tx: string): JQueryPromise<any> {
            let url = this.rootURL + "/broadcast";
            let params = [];
            params.push("publicKey" + "=" + pubKey);
            params.push("signature" + "=" + signature);
            params.push("transaction" + "=" + tx);
            let dataToSend = params.join("&");
            debugLog(url);
            debugLog(dataToSend);
            return $.ajax({
                type: "POST",
                data: dataToSend,
                contentType: 'application/x-www-form-urlencoded',
                url: url,
                timeout: 3 * 1000
            });
        }

        //public static registerTx(accessToken: string, address: string, fileText: string): JQueryPromise<any>
        //{
        //    let url = RestMethod.restURL + RestMethod.commitTxURL;
        //    let params = {};
        //    params['access_token'] = accessToken;
        //    params['address'] = address;
        //    params['opType'] = "01";
        //    params['fileText'] = fileText;
        //    return $.ajax({
        //        type: "POST",
        //        data: JSON.stringify(params),
        //        dataType: "json",
        //        headers: { "Accept": "application/json" },
        //        contentType: 'application/json',
        //        url: url,
        //        timeout: 3 * 1000
        //    });

        //}

        //public static commitTx(accessToken: string, address: string, opType: OpType, fileText: string, originTxid: string): JQueryPromise<any> {
        //    let url = RestMethod.restURL + RestMethod.commitTxURL;
        //    let params = {};
        //    params['access_token'] = accessToken;
        //    params['address'] = address;
        //    params['opType'] = RestMethod.convertOpType(opType);
        //    params['fileText'] = fileText;
        //    params['origTxId'] = originTxid;
        //    return $.ajax({
        //        type: "POST",
        //        data: JSON.stringify(params),
        //        dataType: "json",
        //        headers: { "Accept": "application/json" },
        //        contentType: 'application/json',
        //        url: url,
        //        timeout: 3 * 1000
        //    });

        //}
        
    }
}
