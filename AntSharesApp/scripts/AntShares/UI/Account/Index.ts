namespace AntShares.UI.Account
{
    export class Index extends TabBase
    {
        private map: Map<string, { assetId: Uint256, amount: Fixed8 }>;
        private assets: Map<Core.RegisterTransaction, Fixed8>;
        private address: string;
        private strTx: string;

        protected oncreate(): void
        {
            $(this.target).find("#asset_show_more").click(this.OnShowMore);
            $("#Tab_Account_Index #send").click(this.OnSendButtonClick);
            SyncHeight.heightChanged.addEventListener(this.refreshBalanceEvent);
        }

        protected onload(): void {
            if (Global.Wallet == null) {
                TabBase.showTab("#Tab_Wallet_Open");
                return;
            }
            setTitle(1);
            //this.circle();

            $("#Tab_Account_Index #my_ans").text("0");
            $("#Tab_Account_Index #my_anc").text("0");
            $("#Tab_Account_Index .pay_value").val("");
            $("#Tab_Account_Index .pay_address").val("");
            $("#Tab_Account_Index .dropdown-menu").find("li.add").remove();
            this.map = new Map<string, { assetId: Uint256, amount: Fixed8 }>();
            this.assets = new Map<Core.RegisterTransaction, Fixed8>();

            this.loadAddr().then(addr => {
                return this.refreshBalance(addr);
            }).then(() => {
                return this.loadContactsList();
            }).catch(e => {
                debugLog(e.message);
            });
        }

        private refreshBalance = (addr: string): PromiseLike<void> => {
            return Promise.resolve(addr).then(addr => {
                this.map.clear();
                this.assets.clear();
                this.address = addr;
                return this.loadBalance(addr);
            }).then(() => {
                let promises = new Array<PromiseLike<void>>();
                this.map.forEach(value => {
                    promises.push(this.addCoinList(value));
                });
                return Promise.all(promises);
            }).then(() => {
                let select = $("#Tab_Account_Index select");
                select.html("");
                select.append("<option value=0>" + Resources.global.pleaseChoose + "</option>");
                select.change(() => {
                    let amount = $("#Tab_Account_Index #transfer_asset").find("option:selected").data("amount");
                    $("#Tab_Account_Index .asset-amount").text(amount ? amount : 0);
                });
                this.assets.forEach((value, key, map) => {
                    let option = document.createElement("option");
                    option.text = key.getName();
                    option.value = key.hash.toString();
                    option.dataset["amount"] = value.toString();
                    select.append(option);
                });
                select.change();
            }).catch(e => {
                debugLog(e.message);
            });
        }

        private refreshBalanceEvent = (sender: Object) => {
            this.refreshBalance(this.address);
        }

        private circle = () => {
            $("#circli").empty();
            $("#circli").circliful({
                animation: 1,
                animationStep: 5,
                foregroundBorderWidth: 15,
                backgroundBorderWidth: 15,
                percent: 100,
                textSize: 28,
                textStyle: 'font-size: 12px;',
                textColor: '#666',
                multiPercentage: 1,
                percentages: [10, 20, 30]
            }, () => {
                this.circle();
            });
        }

        private loadAddr = (): PromiseLike<string> => {
            return Global.Wallet.getContracts()[0].getAddress().then(addr => {
                this.address = addr;
                return addr;
            });
        }

        private loadBalance = (addr: string): JQueryPromise<any> => {
            return Global.RestClient.getAddr(addr).then(response => {
                let addr: JSON = JSON.parse(response);
                let balances = addr["balances"];
                for (var key in balances) {
                    this.map.set(key, { assetId: Uint256.parse(key), amount: Fixed8.parse(scientificToNumber(balances[key])) });
                }
            });
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

                let publicKey = Global.Wallet.getAccounts()[0].publicKey.encodePoint(false).toHexString();
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

        private OnShowMore =()=>
        {
            if ($("#asset_show_more").hasClass("rotate180"))
            {
                $("#asset_show_more").removeClass("rotate180");
                $(".blue-panel").css("height", "240");
                $(".other-assets").hide("400");
            }
            else
            {
                $("#asset_show_more").addClass("rotate180");
                let otherAssetCount = $("#Tab_Account_Index").find("ul:eq(0)").find("li").length - 1;
                console.log(otherAssetCount);
                if (otherAssetCount)
                    $(".blue-panel").css("height", (320 + otherAssetCount * 40).toString());
                else
                    $(".blue-panel").css("height", 320);
                $(".other-assets").show("400");
            }
        }

        private addCoinList = (item: { assetId: Uint256, amount: Fixed8 }): PromiseLike<void> =>
        {
            return Core.Blockchain.Default.getTransaction(item.assetId).then(result =>
            {
                let asset_ul = $("#Tab_Account_Index").find("ul:eq(0)");
                asset_ul.find(".addAsset").remove();

                let liTemplet = asset_ul.find("li:eq(0)");
                let li = liTemplet.clone(true);
                li.removeAttr("style");

                let asset = <Core.RegisterTransaction>result;
                this.assets.set(asset, item.amount);
                if (asset.assetType == AntShares.Core.AssetType.AntShare) {
                    $("#my_ans").text(convert(item.amount.toString()))
                }
                else if (asset.assetType == AntShares.Core.AssetType.AntCoin)
                {
                    $("#my_anc").text(convert(item.amount.toString()))
                } else {
                    li.find(".asset_value").text(convert(item.amount.toString()));
                    li.find(".asset_issuer").text(asset.issuer.toString());
                    li.find(".asset_name").text(asset.getName());
                    li.addClass("addAsset");
                    asset_ul.append(li);
                }
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
                        li.attr("onclick", "$('#transfer_txout').val('" + results[i].address + "')");
                        ul.append(li);
                    }
                }
            }).catch(e => {
                alert(e);
            });
        }

    }
}
