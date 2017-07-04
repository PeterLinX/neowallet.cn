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
            let context: Core.SignatureContext;
            let tx: Core.ContractTransaction;
            Promise.resolve(1).then(() => {
                return this.loadTx(publicKey);
            }).then(() => {
                tx = Core.Transaction.deserializeFrom(this.strTx.hexToBytes().buffer);
                return Core.SignatureContext.create(tx, "AntShares.Core." + Core.TransactionType[tx.type]);
            }).then(result => {
                context = result;
                return Global.Wallet.sign(context);
            }).then(result => {
                if (!result) throw new Error(Resources.global.canNotSign);
                if (!context.isCompleted())
                    throw new Error(Resources.global.thisVersion1);
                tx.scripts = context.getScripts();
                return tx.ensureHash();
            }).then(() => {
                return Global.Node.relay(tx);
            }).then(result => {
                Global.count = 0;
                alert(Resources.global.txId + tx.hash.toString());
            }).catch(e => {
                alert(e.message);
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
