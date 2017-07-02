namespace AntShares.UI.Account
{
    export class Index extends TabBase
    {
        private map: Map<string, { assetId: Uint256, amount: Fixed8 }>;
        private address: string;

        protected oncreate(): void
        {
            $(this.target).find("#asset_show_more").click(this.OnShowMore);
            //this.loadAddr().then(addr => { this.address = addr });
        }

        protected onload(): void
        {
            if (Global.Wallet == null)
            {
                TabBase.showTab("#Tab_Wallet_Open");
                return;
            }
            setTitle(1);

            $("#my_ans").text("0");
            $("#my_anc").text("0");
            //this.map.clear();
            //let address: string;
            this.map = new Map<string, { assetId: Uint256, amount: Fixed8 }>();

            this.loadAddr().then(addr => {
                //let x = "APBvNT5JHLsGFofDUExEvmAC3hGrnWYA6x";
                return this.loadBalance(addr);
            }).then(() => {
                debugLog(this.map);
                this.map.forEach(Index.addCoinList);
            });
        }

        private loadAddr = (): PromiseLike<any> => {
            return Global.Wallet.getContracts()[0].getAddress();
        }

        private loadBalance = (addr: string): JQueryPromise<any> => {
            return Global.RestClient.getAddr(addr).then(info => {
                let strBalances: string = JSON.stringify(info.balances);
                let balances: JSON = JSON.parse(strBalances);
                for (var key in balances) {
                    this.map.set(key, { assetId: Uint256.parse(key), amount: Fixed8.parse(balances[key]) });
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

        private static addCoinList(item: { assetId: Uint256, amount: Fixed8 })
        {
            let ul = $("#Tab_Account_Index").find("ul:eq(0)");
            let liTemplet = ul.find("li:eq(0)");
            let li = liTemplet.clone(true);
            li.removeAttr("style");
            Core.Blockchain.Default.getTransaction(item.assetId).then(result =>
            {
                let asset = <Core.RegisterTransaction>result;
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


    }
}
