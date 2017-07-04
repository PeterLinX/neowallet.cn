namespace AntShares.UI.Account {
    export class Claim extends TabBase {
        private availableGas: string;
        private unAvailableGas: string;
        private strTx: string;

        protected oncreate(): void {
            $("#Tab_Account_Claim #claim").click(this.OnClaimButtonClick);
        }

        protected onload(): void {
            if (Global.Wallet == null) {
                TabBase.showTab("#Tab_Wallet_Open");
                return;
            }
            setTitle(1);

            this.loadAddr().then(addr => {
                return this.loadGas(addr);
            }).then(() => {
                $("#Tab_Account_Claim #my_available_gas").text(this.availableGas);
                $("#Tab_Account_Claim #my_unavailable_gas").text(this.unAvailableGas);
            });
        }

        private OnClaimButtonClick = () => {
            let publicKey = Global.Wallet.getAccounts()[0].publicKey.encodePoint(false).toHexString();
            Promise.resolve(1).then(() => {
                return this.loadTx(publicKey);
            }).then(() => {
                let tx = Core.Transaction.deserializeFrom(this.strTx.hexToBytes().buffer);
                return this.signInternal(tx, Global.Wallet.getAccounts()[0]);
            }).then(signature => {
                let sig: string = new Uint8Array(signature).toHexString();
                Global.RestClient.postBroadcast(publicKey, sig, this.strTx).then(response => {
                    let res: JSON = JSON.parse(response);
                    if (res["result"] == true) {
                        alert("交易成功， txid = " + res["txid"]);
                    }
                });
            });
        }

        private signInternal(signable: Core.ISignable, account: AntShares.Wallets.Account): PromiseLike<ArrayBuffer> {
            let pubkey = account.publicKey.encodePoint(false);
            let d = new Uint8Array(account.privateKey).base64UrlEncode();
            let x = pubkey.subarray(1, 33).base64UrlEncode();
            let y = pubkey.subarray(33, 65).base64UrlEncode();
            return window.crypto.subtle.importKey("jwk", <any>{ kty: "EC", crv: "P-256", d: d, x: x, y: y, ext: true }, { name: "ECDSA", namedCurve: "P-256" }, false, ["sign"]).then(result => {
                let ms = new IO.MemoryStream();
                let writer = new IO.BinaryWriter(ms);
                signable.serializeUnsigned(writer);
                return window.crypto.subtle.sign({ name: "ECDSA", hash: { name: "SHA-256" } }, result, <any>ms.toArray());
            });
        }


        private loadTx = (pubKey: string): JQueryPromise<any> => {
            return Global.RestClient.claimGas(pubKey).then(response => {
                let res: JSON = JSON.parse(response);
                if (res["result"] == true) {
                    this.strTx = res["transaction"];
                }
            });
        }

        private loadAddr = (): PromiseLike<string> => {
            return Global.Wallet.getContracts()[0].getAddress().then(addr => {
                return addr;
            });
        }


        private loadGas = (addr: string): JQueryPromise<any> => {
            //{"claims": [], "enable": "0", "disable": "0.00001112"}
            return Global.RestClient.getGas(addr).then(response => {
                let gas: JSON = JSON.parse(response);
                this.availableGas = gas["enable"];
                this.unAvailableGas = gas["disable"];
                
            });
        }
    }
}
