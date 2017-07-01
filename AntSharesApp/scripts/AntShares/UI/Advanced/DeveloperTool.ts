namespace AntShares.UI.Advanced
{
    export class DeveloperTool extends TabBase {
        private db: AntShares.Implementations.Wallets.IndexedDB.WalletDataContext;

        protected oncreate(): void {
            $(this.target).find("#delete_wallet").click(this.OnDeleteButtonClick);
            $(this.target).find("#set_height").click(this.OnSetHeightButtonClick);
            $(this.target).find("#refresh_nood").click(this.OnRefreshNode);
            $(this.target).find("#refresh_device").click(this.OnRefreshDevice);
            $(this.target).find("#no_backup").click(this.OnNoBackupButtonClick);

            $(this.target).find("#getHeight").click(this.OnGetHeightClick);
            $(this.target).find("#getBlock").click(this.OnGetBlockClick);
            $(this.target).find("#getTransaction").click(this.OnGetTransactionClick);
            $(this.target).find("#getAddress").click(this.OnGetAddressClick);
            $(this.target).find("#postTransfer").click(this.OnPostTransferClick);
            $(this.target).find("#postBroadcast").click(this.OnPostBroadcastClick); 
        }

        protected onload(args: any[]): void {
            try {
                this.db = new AntShares.Implementations.Wallets.IndexedDB.WalletDataContext(Global.Wallet.dbPath);
                this.db.open();
            } catch (e)
            {
                debugLog(e);
            }
            
            formReset("form_dev_tool");
            //this.showPrivateKey();
        }

        private showPrivateKey() {
            let accounts = Global.Wallet.getAccounts();
            let str = "";
            for (var i = 0; i < accounts.length; i++) {
                accounts[i].export().then(result => {
                    str = str + result + "\r\n";
                    $("#pri_key").text(str);
                });
            }
        }

        //删除所有钱包，测试用
        private OnDeleteButtonClick = () => {
            let master: Wallets.Master;
            Wallets.Master.instance().then(result => {
                console.log("删除中...");
                master = result;
                if (Global.Wallet != null) {
                    return Global.Wallet.close();
                }
            }).then(() => {
                Global.Wallet = null;
                return master.get();
            }).then(result => {
                let promises = [];
                promises[0] = Promise.resolve(1);
                for (let j = 0; j < result.length; j++) {
                    promises[j + 1] = promises[j].then(Implementations.Wallets.IndexedDB.IndexedDBWallet.delete(result[j]));
                };
                return Promise.all(promises);
            }).then(() => {
                master.close();
                setCookie("gesturePwd", "", 365);
                return Implementations.Wallets.IndexedDB.DbContext.delete("master");
            }).then(() => {
                console.log("删除中，进度：100%");
                alert("已经删除所有钱包文件！");
                setTimeout(() => { location.reload(); }, 1000);
            }).catch(reason => {
                alert(reason);
            });
        }

        private OnNoBackupButtonClick()
        {
            let backup: string = getCookie("hasBackup");
            setCookie("hasBackup", "0", 365);
            TabBase.showTab("#Tab_Account_Receive");
        }

        private OnSetHeightButtonClick = () => {
            let height: number = $("#Tab_Advanced_DeveloperTool #input_curent_height").val();
            Global.Blockchain.getBlockCount().then(result => {
                let currentHeight: number = result - 1;
                let value = new Uint32Array([height]).buffer;
                if (height < 0 || height > currentHeight) {
                    alert("输入值有误！");
                } else {
                    let _transaction = this.db.transaction("Key", "readwrite");
                    _transaction.store("Key").put({
                        name: "Height",
                        value: new Uint8Array(value).toHexString()
                    });
                    return _transaction.commit();
                }
            }).then(() => {
                location.reload()
                TabBase.showTab("#Tab_Account_Index");
            }).catch(e => {
                alert(e);
            });


        }

        private OnRefreshNode = () => {
            $("#seed").text(Global.RpcClient.Url);

        }

        private OnRefreshDevice = () => {
            $("#platform").text(device.platform);
            $("#version").text(device.version);
        }


        private OnGetHeightClick = () => {
            //url: http://api.otcgo.cn/mainnet/height
            //result: "{"height": 1080065}"
            debugLog(1);
            let x = Global.RestClient.getHeight1();
            debugLog(x);
            Global.RestClient.getHeight().then(height => {
                debugLog(height);
            });
        }

        private OnGetBlockClick = () => {
            //url: http://api.otcgo.cn/mainnet/block/1
            //result: {"index": 1, "previousblockhash": "d42561e3d30e15be6400b6df2f328e02d2bf6354c41dce433bc57687c82144bf", "hash": "d782db8a38b0eea0d7394e0f007c61c71798867578c77c387c08113903946cc9", "tx": ["d6ba8b0f381897a59396394e9ce266a3d1d0857b5e3827941c2d2cedc38ef918"], "time": 1476647382, "_id": 1}
            debugLog(2);
        }

        private OnGetTransactionClick = () => {
            //url: http://api.otcgo.cn/mainnet/transaction/482aca533fea9ed97d46170440aeb70c6fe7400cd8baaec42a302a3439f2446c
            //result: {"net_fee": "0", "vout": [{"n": 0, "asset": "c56f33fc6ecfcd0c225c4ab356fee59390af8560be0e930faebe74a6daff7c9b", "value": "534", "address": "AHWzoRf9PHtW1nDaU7h2raBEkiXj9GsUos"}], "sys_fee": "0", "vin": [{"vout": 0, "txid": "d15bb1b8e8fff4e0ed6650779217036cdc47cc8bd64f96dda4110be239f77d5f"}], "txid": "482aca533fea9ed97d46170440aeb70c6fe7400cd8baaec42a302a3439f2446c", "version": 0, "scripts": [{"invocation": "407e69a45eb4a91ac092a33e19224ca44f7f6d72a775729d07a6220b9eb39557384c3317bed018b6922bd5e815547242e1a30f7966a0479b32e959513704fa9d60", "verification": "21035bc519a5fec76ebe1bdd728a1a1505cdcd2f7cf104f34b9357ba4c96f1fc4ee2ac"}], "attributes": [], "_id": "482aca533fea9ed97d46170440aeb70c6fe7400cd8baaec42a302a3439f2446c", "type": "ContractTransaction", "size": 202}
            debugLog(3);
        }

        private OnGetAddressClick = () => {
            //url: http://api.otcgo.cn/mainnet/address/AHWzoRf9PHtW1nDaU7h2raBEkiXj9GsUos
            //result: {"utxo": {"602c79718b16e442de58778e148d0b1084e3b2dffd5de6b7b16cee7969282de7": [{"prevIndex": 0, "prevHash": "25d337deae8730d9a627310d8b386e5c2323f9ca7ffe1a0096d5edddd2909172", "value": "0.08463024"}, {"prevIndex": 0, "prevHash": "4268b477e2d1631a1d6e3df535612fed06dfbc2d77c2a6cc5ff4cbc55f292b5a", "value": "0.0965472"}, {"prevIndex": 0, "prevHash": "26e96f2a3cea657c0fe622d07298dd39afd097f4da19d943b23a6533ecd380d5", "value": "0.1379856"}], "c56f33fc6ecfcd0c225c4ab356fee59390af8560be0e930faebe74a6daff7c9b": [{"prevIndex": 0, "prevHash": "482aca533fea9ed97d46170440aeb70c6fe7400cd8baaec42a302a3439f2446c", "value": "534"}]}, "_id": "AHWzoRf9PHtW1nDaU7h2raBEkiXj9GsUos", "balances": {"602c79718b16e442de58778e148d0b1084e3b2dffd5de6b7b16cee7969282de7": "0.31916304", "c56f33fc6ecfcd0c225c4ab356fee59390af8560be0e930faebe74a6daff7c9b": "534"}}
            debugLog(4);
        }

        private OnPostTransferClick = () => {
            //url: http://api.otcgo.cn/mainnet/transfer
            //result: "{"height": 1080065}"
            debugLog(5);
            Global.RestClient.postTransfer().then(result => {
                debugLog(result);
            }).then(() => {
                return Global.RestClient.postTransfer2();
                }).then(data => {
                    debugLog(data);
                });
        }

        private OnPostBroadcastClick = () => {
            //url: http://api.otcgo.cn/mainnet/broadcast
            //result: "{"height": 1080065}"
            debugLog(6);
            //let xhr = new XMLHttpRequest();
            //xhr.onreadystatechange = function () {
            //    if (xhr.readyState == 4) {
            //        if (xhr.status >= 200 && xhr.status < 304 || xhr.status == 304) {
            //            console.log(xhr.responseText);
            //        }
            //    }
            //}
            //xhr.open('get', 'http://api.otcgo.cn/mainnet/height');

            $.ajax({
                type: "get",
                async: false,
                url: "http://api.otcgo.cn/mainnet/height",
                dataType: "jsonp",
                //jsonp: "callbackparam",//服务端用于接收callback调用的function名的参数
                //jsonpCallback: "success_jsonpCallback",//callback的function名称
                success: function (json) {
                    alert(json);
                    alert(json[0].name);
                },
                error: function () {
                    alert('fail');
                }
            });
        }
    }
}