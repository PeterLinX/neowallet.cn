namespace AntShares.UI.Account
{
    export class Index extends TabBase
    {
        private coins: Map<string, { name: string, amount: Fixed8}>;
        private address: string;
        private strTx: string;
        private assetSelected = 0;

        protected oncreate(): void
        {
            $(this.target).find("#asset_show_more").click(this.OnShowMore);
            $("#Tab_Account_Index #send").click(this.OnSendButtonClick);
            SyncHeight.heightChanged.addEventListener(this.refreshBalanceEvent);
        }

        protected onload(args: any[]): void {
            if (Global.Wallet == null) {
                TabBase.showTab("#Tab_Wallet_Open");
                return;
            }
            setTitle(1);

            if (args[0]) {
                $("#Tab_Account_Index .pay_address").val(args[0]);
            } else {
                $("#Tab_Account_Index .pay_address").val("");
            }
            $("#Tab_Account_Index .pay_value").val("");
            
            $("#Tab_Account_Index .dropdown-menu").find("li.add").remove();
            this.coins = new Map<string, { name: string, amount: Fixed8}>();

            let select = $("#Tab_Account_Index select");
            select.change(() => {
                let amount = $("#Tab_Account_Index #transfer_asset").find("option:selected").data("amount");
                $("#Tab_Account_Index .asset-amount").text(amount ? amount : 0);
                this.assetSelected = $("#Tab_Account_Index #transfer_asset").find("option:selected").val();
            });

            this.loadAddr().then(addr => {
                return this.refreshBalance(addr);
            }).then(() => {
                return this.loadContactsList();
            }).catch(e => {
                debugLog(e.message);
            });
        }
        
        private loadAddr = (): PromiseLike<string> => {
            return Global.Wallet.getContracts()[0].getAddress().then(addr => {
                this.address = addr;
                return addr;
            });
        }

        //private loadCoins = (addr: string): PromiseLike<any> => {
        //    if (Global.isConnected == false) return;
        //    return Global.RestClient.getAddr(addr).then(response => {
        //        let addr: JSON = JSON.parse(response);
        //        let promises = [];
        //        if (jQuery.isEmptyObject(addr)) {
        //            promises[0] = this.loadCoin({ assetId: AntShares.Core.Blockchain.AntShare.hash, amount: Fixed8.parse("0") });
        //            promises[1] = this.loadCoin({ assetId: AntShares.Core.Blockchain.AntCoin.hash, amount: Fixed8.parse("0") });
        //        } else {
        //            let balances = addr["balances"];
        //            for (var key in balances) {
        //                if (balances[key] == 0) continue;
        //                if (key.length == 64) {
        //                    promises.push(this.loadCoin({ assetId: Uint256.parse(key), amount: Fixed8.parse(scientificToNumber(balances[key])) }));
        //                } else if (key.length == 40) {//NEP5
        //                    //debugLog(key);
        //                }
        //            }
        //        }
        //        return Promise.all(promises);
        //    }).then(results => {
        //        for (let i = 0; i < results.length; i++) {
        //            this.coins.set((<any>results[i]).assetId, { name: (<any>results[i]).name, amount: (<any>results[i]).amount });
        //        }
        //    });
        //}

        //private loadNEP5 = (item: { hash: string, amount: Fixed8 }): PromiseLike<{ assetId: string, name: string, amount: Fixed8 }> => {
        //    return Core.Blockchain.Default.getContract(item.assetId).then(result => {
        //        let asset = <Core.RegisterTransaction>result;
        //        return { assetId: item.assetId.toString(), name: asset.getName(), amount: item.amount };
        //    });
        //}

        private loadCoin = (item: { assetId: Uint256, amount: Fixed8 }): PromiseLike<{ assetId: string, name: string, amount: Fixed8 }> => {
            return Core.Blockchain.Default.getTransaction(item.assetId).then(result => {
                let asset = <Core.RegisterTransaction>result;
                return { assetId: item.assetId.toString(), name: asset.getName(), amount: item.amount };
            });
        }

        private loadCoins = (addr: string): PromiseLike<any> => {
            if (Global.isConnected == false) return;
            let params = [];
            params.push(addr);
            return Global.RpcClient.call("getaccountstate", params).then(result => {
                let promises = [];
                if (result.balances.length == 0) {
                    promises[0] = this.loadCoin({ assetId: AntShares.Core.Blockchain.AntShare.hash, amount: Fixed8.parse("0") });
                    promises[1] = this.loadCoin({ assetId: AntShares.Core.Blockchain.AntCoin.hash, amount: Fixed8.parse("0") });
                } else {
                    for (let i = 0; i < result.balances.length; i++) {
                        promises[i] = this.loadCoin({ assetId: Uint256.parse(result.balances[i].asset), amount: Fixed8.parse(result.balances[i].value) });
                    }
                }
                return Promise.all(promises);
            }).then(results => {
                for (let i = 0; i < results.length; i++) {
                    this.coins.set((<any>results[i]).assetId, { name: (<any>results[i]).name, amount: (<any>results[i]).amount });
                }
            });
        }

        private refreshBalance = (addr: string): PromiseLike<void> => {
            return Promise.resolve(addr).then(addr => {
                this.coins.clear();
                this.address = addr;
                return this.loadCoins(addr);
            }).then(() => {
                let promises = new Array<PromiseLike<void>>();
                $("#Tab_Account_Index").find("ul:eq(0)").find(".addAsset").remove();
                this.coins.forEach((value, key, map) => {
                    promises.push(this.updateCoinList(key, value));
                });
                return Promise.all(promises);
            }).then(() => {
                let select = $("#Tab_Account_Index select");
                select.html("");
                select.append("<option value=0>" + Resources.global.pleaseChoose + "</option>");
                this.coins.forEach((value, key, map) => {
                    let option = document.createElement("option");
                    option.text = ansToNeo(value.name);
                    option.value = key.toString();
                    option.dataset["amount"] = value.amount.toString();
                    select.append(option);
                });
                select.val(this.assetSelected);
                select.change();
            }).catch(e => {
                debugLog(e.message);
            });
        }

        private updateCoinList = (assetId: string, item: { name: string, amount: Fixed8}): PromiseLike<void> => {
            if (Global.isConnected == false) return;
            if (assetId == Core.Blockchain.AntShare.hash.toString()) {
                $("#my_ans").text(convert(item.amount.toString()))
            }
            else if (assetId == Core.Blockchain.AntCoin.hash.toString()) {
                $("#my_anc").text(convert(item.amount.toString()))
            } else {
                let asset_ul = $("#Tab_Account_Index").find("ul:eq(0)");
                let liTemplet = asset_ul.find("li:eq(0)");
                let li = liTemplet.clone(true);
                li.removeAttr("style");
                li.find(".asset_value").text(convert(item.amount.toString()));
                li.find(".asset_id").text(assetId);
                li.find(".asset_name").text(item.name);
                li.addClass("addAsset");
                asset_ul.append(li);
            }
        }

        private refreshBalanceEvent = (sender: Object) => {
            this.refreshBalance(this.address);
        }

        private OnSendButtonClick = () => {
            if (formIsValid("form_account_send")) {
                let dests = $("#Tab_Account_Index .pay_address").val();
                let amounts = $("#Tab_Account_Index .pay_value").val();

                if ($("#Tab_Account_Index select>:selected").val() == 0) {
                    alert(Resources.global.pleaseChooseAsset);
                    return;
                }
                let assetId: string = $("#Tab_Account_Index select>:selected").val();
                let assetType: Uint256 = Uint256.parse($("#Tab_Account_Index select>:selected").val());
                if (assetType.equals(AntShares.Core.Blockchain.AntShare.hash) && amounts.indexOf(".") > -1) {
                    alert(Resources.global.antshareIntegerOnly);
                    return;
                }

                let publicKey = Global.Wallet.getAccounts()[0].publicKey.encodePoint(true).toHexString();
                Promise.resolve(1).then(() => {
                    return this.loadTx(this.address, dests, amounts, assetId);
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
                }).then(() => {
                    $("#Tab_Account_Index .pay_value").val("");
                    $("#Tab_Account_Index .pay_address").val("");
                }).catch(e => {
                    debugLog(e.message);
                });
            }
        }

        private loadTx = (source: string, dests: string, amounts: string, assetId: string): JQueryPromise<any> => {
            return Global.RestClient.postOnTransfer(source, dests, amounts, assetId).then(response => {
                let res: JSON = JSON.parse(response);
                if (res["result"] == true) {
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

        private loadContactsList = (): PromiseLike<void> => {
            let contacts: Contacts.Contact;
            return Contacts.Contact.instance().then(result => {
                contacts = result;
                return contacts.getContacts();
            }).then(results => {
                if (results.length > 0) {
                    let contactsArray = linq(results).orderByDescending(p => p.name).toArray();
                    let result = Promise.resolve();
                    for (let i = 0; i < contactsArray.length; i++) {
                        let ul = $("#Tab_Account_Index .dropdown-menu");
                        let liTemp = ul.find("li:eq(0)");
                        let li = liTemp.clone(true);
                        li.removeAttr("style");
                        li.addClass("add");
                        li.find(".contact-name").text(results[i].name);
                        li.find(".contact-address").text(results[i].address);
                        li.attr("onclick", "$('.pay_address').val('" + results[i].address + "')");
                        ul.append(li);
                    }
                }
            }).catch(e => {
                alert(e);
            });
        }


        private OnShowMore = () => {
            if ($("#asset_show_more").hasClass("rotate180")) {
                $("#asset_show_more").removeClass("rotate180");
                $(".blue-panel").css("height", "240");
                $(".other-assets").hide("400");
            }
            else {
                $("#asset_show_more").addClass("rotate180");
                let otherAssetCount = $("#Tab_Account_Index").find("ul:eq(0)").find("li").length - 1;
                if (otherAssetCount)
                    $(".blue-panel").css("height", (320 + otherAssetCount * 40).toString());
                else
                    $(".blue-panel").css("height", 320);
                $(".other-assets").show("400");
            }
        }
    }
}
