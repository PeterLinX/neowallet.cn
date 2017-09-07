namespace AntShares.UI.Advanced {
    export class DeveloperTool extends TabBase {

        private db: AntShares.Implementations.Wallets.IndexedDB.WalletDataContext;
        private strTx: string;

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
            $(this.target).find("#postOnTransfer").click(this.OnPostOnTransferClick);
            $(this.target).find("#postBroadcast").click(this.OnPostBroadcastClick);
            $(this.target).find("#postTransfer").click(this.OnPostTransferClick);

            $(this.target).find("#rpcHeight").click(this.OnGetRpcHeightClick);
            $(this.target).find("#rpcBalance").click(this.OnGetRpcBalanceClick);
        }

        protected onload(args: any[]): void {
            try {
                this.db = new AntShares.Implementations.Wallets.IndexedDB.WalletDataContext(Global.Wallet.dbPath);
                this.db.open();
            } catch (e) {
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
                for (let j = 0; j < result.length; j++) {
                    promises[j] = Implementations.Wallets.IndexedDB.IndexedDBWallet.delete(result[j]);
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

        private OnNoBackupButtonClick() {
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
            Global.RestClient.getHeight().then(response => {
                let height: JSON = JSON.parse(response);
                debugLog(height["height"]);
            });
        }

        private OnGetBlockClick = () => {
            //url: http://api.otcgo.cn/mainnet/block/1
            //result: {"index": 1, "previousblockhash": "d42561e3d30e15be6400b6df2f328e02d2bf6354c41dce433bc57687c82144bf", "hash": "d782db8a38b0eea0d7394e0f007c61c71798867578c77c387c08113903946cc9", "tx": ["d6ba8b0f381897a59396394e9ce266a3d1d0857b5e3827941c2d2cedc38ef918"], "time": 1476647382, "_id": 1}
            debugLog(2);
            Global.RestClient.getBlock(1).then(response => {
                let block: JSON = JSON.parse(response);
                debugLog(block["index"]);
                for (let i = 0; i < block["tx"].length; i++) {
                    debugLog(block["tx"][i]);
                }
            });
        }

        private OnGetTransactionClick = () => {
            //url: http://api.otcgo.cn/mainnet/transaction/482aca533fea9ed97d46170440aeb70c6fe7400cd8baaec42a302a3439f2446c
            //result: {"net_fee": "0", "vout": [{"n": 0, "asset": "c56f33fc6ecfcd0c225c4ab356fee59390af8560be0e930faebe74a6daff7c9b", "value": "534", "address": "AHWzoRf9PHtW1nDaU7h2raBEkiXj9GsUos"}], "sys_fee": "0", "vin": [{"vout": 0, "txid": "d15bb1b8e8fff4e0ed6650779217036cdc47cc8bd64f96dda4110be239f77d5f"}], "txid": "482aca533fea9ed97d46170440aeb70c6fe7400cd8baaec42a302a3439f2446c", "version": 0, "scripts": [{"invocation": "407e69a45eb4a91ac092a33e19224ca44f7f6d72a775729d07a6220b9eb39557384c3317bed018b6922bd5e815547242e1a30f7966a0479b32e959513704fa9d60", "verification": "21035bc519a5fec76ebe1bdd728a1a1505cdcd2f7cf104f34b9357ba4c96f1fc4ee2ac"}], "attributes": [], "_id": "482aca533fea9ed97d46170440aeb70c6fe7400cd8baaec42a302a3439f2446c", "type": "ContractTransaction", "size": 202}
            debugLog(3);
            let txid = "1b504c5fb070aaca3d57c42b5297d811fe6f5a0c5d4cd4496261417cf99013a5";
            Global.RestClient.getTx(txid).then(response => {
                let tx: JSON = JSON.parse(response);
                debugLog(tx["txid"]);
            });
        }

        private getName(assetName: string, lang = navigator.language): string {
            let _names: string | Array<{ lang: string, name: string }>;
            try {
                _names = <string | Array<{ lang: string, name: string }>>JSON.parse(assetName);
            }
            catch (ex) {
                _names = assetName;
            }
            if (typeof _names === "string") {
                return _names;
            }
            else {
                let map = new Map<string, string>();
                for (let i = 0; i < _names.length; i++)
                    map.set(_names[i].lang, _names[i].name);
                if (map.has(lang))
                    return map.get(lang);
                else if (map.has("en"))
                    return map.get("en");
                else
                    return _names[0].name;
            }
        }

        private OnGetAddressClick = () => {
            //url: http://api.otcgo.cn/mainnet/address/AHWzoRf9PHtW1nDaU7h2raBEkiXj9GsUos
            //{"utxo": {"602c79718b16e442de58778e148d0b1084e3b2dffd5de6b7b16cee7969282de7": [{"prevIndex": 0, "prevHash": "25d337deae8730d9a627310d8b386e5c2323f9ca7ffe1a0096d5edddd2909172", "value": "0.08463024"}, {"prevIndex": 0, "prevHash": "4268b477e2d1631a1d6e3df535612fed06dfbc2d77c2a6cc5ff4cbc55f292b5a", "value": "0.0965472"}, {"prevIndex": 0, "prevHash": "26e96f2a3cea657c0fe622d07298dd39afd097f4da19d943b23a6533ecd380d5", "value": "0.1379856"}], "c56f33fc6ecfcd0c225c4ab356fee59390af8560be0e930faebe74a6daff7c9b": [{"prevIndex": 0, "prevHash": "482aca533fea9ed97d46170440aeb70c6fe7400cd8baaec42a302a3439f2446c", "value": "534"}]}, "_id": "AHWzoRf9PHtW1nDaU7h2raBEkiXj9GsUos", "balances": {"602c79718b16e442de58778e148d0b1084e3b2dffd5de6b7b16cee7969282de7": "0.31916304", "c56f33fc6ecfcd0c225c4ab356fee59390af8560be0e930faebe74a6daff7c9b": "534"}}
            debugLog(4);
            let addr = "AGDJB6ufhfFL8oMtfUfWwY7RXtA9uHRBp1";
            Global.RestClient.getAddr(addr).then(response => {
                let addr: JSON = JSON.parse(response);
                debugLog(addr["utxo"]);
                debugLog(addr["balances"]);
                let balances = addr["balances"];
                let assetItems = new Array<{ assetId: string, amount: string }>();
                for (var key in balances) {
                    
                    assetItems.push({ assetId: key, amount: scientificToNumber(balances[key]) });
                }
                debugLog(assetItems);


                //let promises = [];
                //for (var key in addr.balances)
                //{
                //    promises.push(this.getAssetName(Uint256.parse(key)));
                //}
                //return Promise.all(promises);
            }).then(assets => {

            });
        }

        private getAssetName = (assetId: Uint256): PromiseLike<string> => {
            return Core.Blockchain.Default.getTransaction(assetId).then(result => {
                let asset = <Core.RegisterTransaction>result;
                return asset.getName();
            });
        }

        private OnPostOnTransferClick = () => {
            //url: http://api.otcgo.cn/mainnet/transfer
            //{"transaction": "800000014bfcd765505eb3b2a3761aa62d926ac9a144b19ded37419825bee14edb01df47000002d447af79bcd9ba3ebc45e67871065d101a74c4e3ab09e7cff19f0ab0f7825d0200e1f505000000002d18fdf7e7aea7a9d18b078779d13c51f6fdcf35d447af79bcd9ba3ebc45e67871065d101a74c4e3ab09e7cff19f0ab0f7825d020084d717000000002d18fdf7e7aea7a9d18b078779d13c51f6fdcf35", "result": true}
            debugLog(5);
            let source = "ALeCDAHg2gAJz69L6oHqP4x6JM5sJbJTEe";
            let dests = "AaAHt6Xi51iMCaDaYoDFTFLnGbBN1m75SM";
            let amounts = "1";
            let assetId = "025d82f7b00a9ff1cfe709abe3c4741a105d067178e645bc3ebad9bc79af47d4";

            Global.RestClient.postOnTransfer(source, dests, amounts, assetId).then(response => {
                debugLog(response);
                let res: JSON = JSON.parse(response);
                if (res["result"] == true) {
                    alert("交易成功， tx = " + res["transaction"]);
                    this.strTx = res["transaction"];
                }
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

        private signMsgInternal(message: string, account: AntShares.Wallets.Account): PromiseLike<ArrayBuffer> {
            let pubkey = account.publicKey.encodePoint(false);
            let d = new Uint8Array(account.privateKey).base64UrlEncode();
            let x = pubkey.subarray(1, 33).base64UrlEncode();
            let y = pubkey.subarray(33, 65).base64UrlEncode();
            return window.crypto.subtle.importKey("jwk", <any>{ kty: "EC", crv: "P-256", d: d, x: x, y: y, ext: true }, { name: "ECDSA", namedCurve: "P-256" }, false, ["sign"]).then(result => {
                let ms = new IO.MemoryStream();
                let writer = new IO.BinaryWriter(ms);
                writer.writeVarString(message);
                return window.crypto.subtle.sign({ name: "ECDSA", hash: { name: "SHA-256" } }, result, <any>ms.toArray());
            });
        }

        private sign = (tx: string): PromiseLike<any> => {
            let context: Core.SignatureContext;
            tx = '{"type":"ContractTransaction","hex":"800001bbd57449979c6b532c93f2f0db2d853a9f5057de8d1382dfc9935dd657f1202f000002c9b4afd3375aa51e02531d5b2b5d9d1e0dad11b6f958ed6c86a4132da19d3ddc00e1f50500000000e139554370a9d2adb9d8f06ce9a8f5751d376c17c9b4afd3375aa51e02531d5b2b5d9d1e0dad11b6f958ed6c86a4132da19d3ddc00e9a43500000000e139554370a9d2adb9d8f06ce9a8f5751d376c17","scripts":[{"redeem_script":"522103b232347551ca9b793cf29f4e4415f1b6d249bbc76b3398c9b390263523a11dac2102e9260870034fd42df90624291f535b160ecc98379d44a18f4057953683e4ee6952ae","signatures":[{"pubkey":"02e9260870034fd42df90624291f535b160ecc98379d44a18f4057953683e4ee69","signature":"a71adad3015f0be221402c844a1da41e9234a9627afd5bcf81c015bb54549696801d7197b671e096725c2d0c776ddbc0ef94ca363885960b733e48216e1dcf49"}],"completed":false}]}';

            return Core.SignatureContext.parse(tx).then(result => {
                context = result;
                return Global.Wallet.sign(result);
            }).then(success => {
                if (success) {
                    return context.toString();
                }
                else {
                    alert(Resources.global.signError1);
                }
            }).catch(reason => {
                alert(reason);
            });
        }

        private OnPostBroadcastClick = () => {
            //url: http://api.otcgo.cn/mainnet/broadcast
            //"{"height": 1080065}"
            debugLog(6);

            let publicKey = Global.Wallet.getAccounts()[0].publicKey.encodePoint(false).toHexString();
            debugLog("publicKey: " + publicKey);
            

            let tx = Core.Transaction.deserializeFrom(this.strTx.hexToBytes().buffer);
            debugLog(tx);
            this.signInternal(tx, Global.Wallet.getAccounts()[0]).then(signature => {
                let sig: string = new Uint8Array(signature).toHexString();
                debugLog(sig);
                Global.RestClient.postBroadcast(publicKey, sig, this.strTx).then(response => {
                    debugLog(response);
                    let res: JSON = JSON.parse(response);
                    if (res["result"] == true) {
                        alert("交易成功， txid = " + res["txid"]);
                    }
                });
            });

            //this.signMsgInternal(strTx, Global.Wallet.getAccounts()[0]).then(signature => {
            //    let sig: string = new Uint8Array(signature).toHexString();

            //    debugLog(sig);
            //    Global.RestClient.postBroadcast(publicKey, sig, strTx).then(response => {
            //        debugLog(response);
            //        let res: JSON = JSON.parse(response);
            //        if (res["result"] == true) {
            //            alert("交易成功， txid = " + res["txid"]);
            //        }
            //    });
            //});

            //let tx = Core.Transaction.deserializeFrom(this.strTx.hexToBytes().buffer);
            //let context: Core.SignatureContext;
            //Core.SignatureContext.create(tx, "AntShares.Core." + Core.TransactionType[tx.type]).then(result => {
            //    context = result;
            //    return Global.Wallet.sign(context);
            //}).then(result => {
            //    if (!result) throw new Error(Resources.global.canNotSign);
            //    if (!context.isCompleted())
            //        throw new Error(Resources.global.thisVersion1);
            //    tx.scripts = context.getScripts();
            //    return tx.ensureHash();
            //}).then(() => {
            //    return Global.Node.relay(tx);
            //}).then(result => {
            //    alert(Resources.global.txId + tx.hash.toString());
            //}).catch(e => {
            //    alert(e.message);
            //});
        }


        private OnPostTransferClick = () => {
            debugLog(7);

            let source = "ALeCDAHg2gAJz69L6oHqP4x6JM5sJbJTEe";
            let dests = "AaAHt6Xi51iMCaDaYoDFTFLnGbBN1m75SM";
            let amounts = "1";
            let assetId = "025d82f7b00a9ff1cfe709abe3c4741a105d067178e645bc3ebad9bc79af47d4";
            let context: Core.SignatureContext;
            let tx: Core.ContractTransaction;
            Promise.resolve(1).then(() => {
                return this.loadTx(source, dests, amounts, assetId);
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
                $("#Tab_Account_Index .pay_value").val("");
                $("#Tab_Account_Index .pay_address").val("");
                Global.count = 0;
                alert(Resources.global.txId + tx.hash.toString());
            }).catch(e => {
                alert(e.message);
            });
        }

        private loadContext = (tx: Core.Transaction): PromiseLike<Core.SignatureContext> => {
            let context: Core.SignatureContext;
            return Core.SignatureContext.create(tx, "AntShares.Core." + Core.TransactionType[tx.type]);
        }
        
        private loadTx = (source: string, dests: string, amounts: string, assetId: string): JQueryPromise<any> => {
            return Global.RestClient.postOnTransfer(source, dests, amounts, assetId).then(response => {
                let res: JSON = JSON.parse(response);
                if (res["result"] == true) {
                    //alert("交易成功， tx = " + res["transaction"]);
                    this.strTx = res["transaction"];
                }
            });
        }


        private OnGetRpcHeightClick = () => {
            debugLog(156);
            Global.RpcClient.call("getblockcount", []).then(height => {
                debugLog(height);
            });
        }

        private OnGetRpcBalanceClick = () => {
            debugLog(157);
            let addr: string = "AGDJB6ufhfFL8oMtfUfWwY7RXtA9uHRBp1";
            let params = [];
            params.push(addr);
            Global.RpcClient.call("getaccountstate", params).then(result => {
                for (let i = 0; i < result.balances.length; i++){
                    debugLog(result.balances[i].asset);
                    debugLog(result.balances[i].value);
                }
            });

        }

    }
}