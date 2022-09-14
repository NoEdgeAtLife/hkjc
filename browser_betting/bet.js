let raceno = 7;
let bet_amount = [100];
let horse_no = [3];

async function bet() {
    document.getElementById("raceSel"+raceno).click();
    for (let i = 0; i < horse_no.length; i++) {
        await setTimeout(()=>{document.getElementById("winCell"+horse_no).getElementsByTagName("span")[0].getElementsByTagName("a")[0].click();}, 1000);
        // setTimeout(()=>{document.querySelector(".rsInvCalUnitBetInput").value = 100;}, 500);
        await setTimeout(()=>{document.getElementById("inputAmount"+i).value = bet_amount[i];
                        CheckRefreshUnitbet(0);
        }, 1500);
    }
    setTimeout(()=>{OnClickPreview();}, 1000*horse_no.length+2000);
    // setTimeout(()=>{OnClickConfirmBet();}, 2500);
}

bet()