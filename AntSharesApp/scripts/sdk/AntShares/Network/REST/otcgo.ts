/// <reference path="RestClient2.ts"/>

namespace AntShares.Network.REST {
    export class otcgo extends RestClient2 {

        constructor(isMainNet: boolean) {
            let url: string;
            let rootURL: string = "https://api.otcgo.cn";
            if (isMainNet == true) {
                url = rootURL + "/mainnet";
            } else {
                url = rootURL + "/testnet";
            }
            super(url);
        }

        public getHeight(): PromiseLike<any> {
            let url = this.rootURL + "/height";
            return this.get(url);
        }

        public getBlock(height: number): PromiseLike<any> {
            let url: string = this.rootURL + "/block/" + height;
            return this.get(url);
        }

        public getTx(txid: string): PromiseLike<any> {
            let url: string = this.rootURL + "/transaction/" + txid;
            return this.get(url);
        }

        public getAddr(addr: string): PromiseLike<any> {
            let url: string = this.rootURL + "/address/" + addr;
            return this.get(url);
        }

        public postOnTransfer(source: string, dests: string, amounts: string, assetId: string): PromiseLike<any> {
            let url = this.rootURL + "/transfer";
            let params = [];
            params.push("source" + "=" + source);
            params.push("dests" + "=" + dests);
            params.push("amounts" + "=" + amounts);
            params.push("assetId" + "=" + assetId);
            let dataToSend = params.join("&");
            return this.post(url, dataToSend);
        }

        public postBroadcast(pubKey: string, signature: string, tx: string): PromiseLike<any> {
            let url = this.rootURL + "/broadcast";
            let params = [];
            params.push("publicKey" + "=" + pubKey);
            params.push("signature" + "=" + signature);
            params.push("transaction" + "=" + tx);
            let dataToSend = params.join("&");
            return this.post(url, dataToSend);
        }

        public getGas(addr: string): PromiseLike<any> {
            let url: string = this.rootURL + "/claim/" + addr;
            return this.get(url);
        }

        public claimGas(pubKey: string): PromiseLike<any> {
            let url: string = this.rootURL + "/gas";
            let params = [];
            params.push("publicKey" + "=" + pubKey);
            let dataToSend = params.join("&");
            return this.post(url, dataToSend);
        }

    }
}
