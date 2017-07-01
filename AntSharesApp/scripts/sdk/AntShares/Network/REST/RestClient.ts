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

        
        public getHeight(): JQueryPromise<any> {
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

        public postTransfer(): JQueryPromise<any> {
            let url = this.rootURL + "/transfer";
            let params = {};
            params['source'] = "AdinFgnkM1G3N1uw9FA1UEmRmttmwE6DsC";
            params['dests'] = "AdinFgnkM1G3N1uw9FA1UEmRmttmwE6DsC";
            params['amounts'] = "1";
            params['assetId'] = "c56f33fc6ecfcd0c225c4ab356fee59390af8560be0e930faebe74a6daff7c9b";

            debugLog(url);
            return $.ajax({
                type: "POST",
                data: params,
                dataType: "json",
                headers: { "Accept": "application/json" },
                contentType: 'application/json',
                url: url,
                timeout: 3 * 1000
            });
        }

        public postTransfer2(): JQueryPromise<any> {
            let url = this.rootURL + "/transfer";
            let params = {};
            params['source'] = "AdinFgnkM1G3N1uw9FA1UEmRmttmwE6DsC";
            params['dests'] = "AdinFgnkM1G3N1uw9FA1UEmRmttmwE6DsC";
            params['amounts'] = "1";
            params['assetId'] = "c56f33fc6ecfcd0c225c4ab356fee59390af8560be0e930faebe74a6daff7c9b";

            debugLog(url);
            return $.ajax({
                type: "POST",
                data: JSON.stringify(params),
                dataType: "json",
                headers: { "Accept": "application/json" },
                contentType: 'application/json',
                url: url,
                timeout: 3 * 1000
            });
        }

        public getHeight1(){
            let url = this.rootURL + "/height";
            debugLog(url);
            $.get(url, data => {

                debugLog(data);
            });
        }

        public postTransfer1() {
            let data = {source:"", dests:"", amounts:"", assetId:""};
            data.source = "AddZkjqPoPyhDhWoA8f9CXQeHQRDr8HbPo";
            data.dests = "AdinFgnkM1G3N1uw9FA1UEmRmttmwE6DsC";
            data.amounts = "1";
            data.assetId = "c56f33fc6ecfcd0c225c4ab356fee59390af8560be0e930faebe74a6daff7c9b";
            let url = this.rootURL + "/transfer";
            $.post(url, data => {

                debugLog(data);
            },"json");
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
