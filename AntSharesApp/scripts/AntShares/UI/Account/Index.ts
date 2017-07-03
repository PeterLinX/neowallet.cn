namespace AntShares.UI.Account
{
    export class Index extends TabBase
    {
        private map: Map<string, { assetId: Uint256, amount: Fixed8 }>;
        private address: string;
        private strTx: string;
        private assets: Map<Core.RegisterTransaction, Fixed8>;

        protected oncreate(): void
        {
            $(this.target).find("#asset_show_more").click(this.OnShowMore);
            $("#Tab_Account_Index #send").click(this.OnSendButtonClick);
        }

        protected onload(): void {
            if (Global.Wallet == null) {
                TabBase.showTab("#Tab_Wallet_Open");
                return;
            }
            setTitle(1);
            this.circle();
            
            $("#Tab_Account_Index #my_ans").text("0");
            $("#Tab_Account_Index #my_anc").text("0");
            $("#Tab_Account_Index .pay_value").val("");
            $("#Tab_Account_Index .pay_address").val("");

            let asset_ul = $("#Tab_Account_Index").find("ul:eq(0)");
            asset_ul.find(".add").remove();

            this.map = new Map<string, { assetId: Uint256, amount: Fixed8 }>();
            this.assets = new Map<Core.RegisterTransaction, Fixed8>();
            this.loadAddr().then(addr => {
                this.address = addr;
                return this.loadBalance(addr);
            }).then(() => {
                debugLog(this.map);
                //return this.map.forEach(this.addCoinList);
                let promises = new Array<PromiseLike<void>>();
                let j = 0;
                this.map.forEach(value => {
                    promises.push(this.addCoinList(value));
                    j++;
                });
                return Promise.all(promises);
            }).then(() => {
                let select = $("#Tab_Account_Index select");
                select.html("");
                select.append("<option value=0>" + Resources.global.pleaseChoose + "</option>");
                select.change(() => {
                    let amount = $("#Tab_Account_Index #transfer_asset").find("option:selected").data("amount");
                    $(".asset-amount").text(amount ? amount : 0);
                });
                this.assets.forEach((value, key, map) => {
                    let option = document.createElement("option");
                    option.text = key.getName();
                    option.value = key.hash.toString();
                    option.dataset["amount"] = value.toString();
                    select.append(option);
                });
                select.change();
            }).then(() => {
                $("#Tab_Account_Index .dropdown-menu").find("li.add").remove();
                return this.loadContactsList();
            }).catch(e => {
                debugLog(e.message);
            });
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
                debugLog(addr["balances"]);
                let balances = addr["balances"];
                for (var key in balances) {
                    this.map.set(key, { assetId: Uint256.parse(key), amount: Fixed8.parse(balances[key]) });
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
                let context: Core.SignatureContext;
                let tx: Core.ContractTransaction;
                Promise.resolve(1).then(() => {
                    debugLog("source: " + this.address);
                    return this.loadTx(this.address, dests, amounts, assetId);
                }).then(() => {
                    debugLog("strTx: " + this.strTx);
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
                    alert(Resources.global.txId + tx.hash.toString());
                }).catch(e => {
                    alert(e.message);
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
            let ul = $("#Tab_Account_Index").find("ul:eq(0)");
            let liTemplet = ul.find("li:eq(0)");
            let li = liTemplet.clone(true);
            li.removeAttr("style");
            return Core.Blockchain.Default.getTransaction(item.assetId).then(result =>
            {
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
                    li.addClass("add");
                    ul.append(li);
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


        private sign = (tx: string): PromiseLike<any> => {
            let context: Core.SignatureContext;
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
                }).then(signedTx => {
                    return signedTx;
                }).catch(reason => {
                alert(reason);
            });
        }


        private loadContactsList = (): PromiseLike<void> => {
            let contacts: Contacts.Contact;
            return Contacts.Contact.instance().then(result => {
                contacts = result;
                return contacts.getContacts();
            }).then(results => {
                debugLog(results);
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
