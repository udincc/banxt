const banJs =  window.bananocoinBananojs;
const url = 'https://kaliumapi.appditto.com/api';
const maxHistory = 10;
const maxPending = 10;

banJs.setBananodeApiUrl(url);


async function getAcc(seed, ix){
  const pvK = await banJs.getPrivateKey(seed, ix);
  const pbK = await banJs.getPublicKey(pvK);
  const acc = await banJs.getBananoAccount(pbK);
  //console.log(acc);
  return acc;
};

async function getBal(acc){
  let bal = await banJs.getAccountInfo(acc);
  //console.log(bal)
  return bal;
};
async function getPen(acc){
  let pen = await banJs.getAccountsPending([acc], 20, true);
  if(pen.error){
    //console.log(pen.error);
    return pen.error;
  }
  //console.log(pen);
  return pen;
};

async function getHst(acc, max) {
  let hst = await banJs.getAccountHistory(acc, max);
  if(hst.error){
      return hst.error;
  }
  return hst;
};

async function newTxn(seed, ix, rc, am){
  let res = await banJs.sendBananoWithdrawalFromSeed(seed, ix, rc, am);
  if(res.error){
    console.log(res.error)
    return res.error;
  }
  console.log(res);
  return res;
};

async function postPen(seed, ix){
  banJs.setBananodeApiUrl(url);
  let res = await banJs.receiveBananoDepositsForSeed(seed, ix, 'ban_1fomoz167m7o38gw4rzt7hz67oq6itejpt4yocrfywujbpatd711cjew8gjj');
  if(res.error){
    console.log(res.error)
    return res.error;
  }
  console.log(res);
  return res;
};



async function getToFrom(arr,acc){
  for (let i = 0; i < arr.length; i++) {
    if(acc === arr[i][2]){
      tFr = arr[i][1];
      return tFr;
    }
  };
};

async function poolAccount(arr){
  let tArr = [];
  for (let iw = 0; iw < arr.length; iw++) {
    let eIx = arr[iw].acIx;
    let eNm = arr[iw].name;
    let eAd = await getAcc(seed,eIx);
    tArr.push([eIx, eNm, eAd]);
  };
  return tArr;
};


async function getWalletInfo(walAcc, incAcc, expAcc){
  console.log('getWalletInfo');
  let wAcc = await poolAccount(walAcc);
  let iAcc = await poolAccount(incAcc);
  let eAcc = await poolAccount(expAcc);
  let tHst = [];
  
  let tBal = 0; let tInc = 0; let tExp = 0;
  console.log('wAcc',wAcc);
  console.log('iAcc',iAcc);
  console.log('eAcc',eAcc);

  for (let bw = 0; bw < wAcc.length; bw++) {
    console.log(wAcc[bw][0])
    let wBl = await getBal(wAcc[bw][2]);
    let wBs = await wBl.balance;
    tBal+=(+wBs);
  };

  for (let hw = 0; hw < wAcc.length; hw++) {
    let wHs = await getHst(wAcc[hw][2],-1);
    let wNm = wAcc[hw][1];
    let cHs = await wHs.history;
    console.log(cHs)
    if(cHs.length > 0){
      for (let ih = 0; ih < cHs.length; ih++ ) {
        let tAm = cHs[ih].amount;
        let tTm = cHs[ih].local_timestamp;
        let tHs = cHs[ih].hash;
        let cAc = cHs[ih].account;
        let tTp = cHs[ih].type;

        if(tTp === 'receive'){
          for (let i = 0; i < iAcc.length; i++) {
            if(cAc === iAcc[i][2]){
              tInc += (+tAm);
              tHst.push(
                {
                  "tm" : +tTm,
                  "tp" : "income",
                  "fr" : iAcc[i][1],
                  "to" : wNm,
                  "am" : tAm,
                  "hs" : tHs
                }
              )
            }
          };
          for (let i = 0; i < wAcc.length; i++) {
            if(cAc === wAcc[i][2]){
              tHst.push(
                {
                  "tm" : +tTm,
                  "tp" : "transfer",
                  "fr" : wAcc[i][1],
                  "to" : wNm,
                  "am" : tAm,
                  "hs" : tHs
                }
              )
            }
          };
        } else if(tTp === 'send'){
          for (let i = 0; i < eAcc.length; i++) {
            if(cAc === eAcc[i][2]){
              tExp += (+tAm);
              tHst.push(
                {
                  "tm" : +tTm,
                  "tp" : "expense",
                  "fr" : wNm,
                  "to" : eAcc[i][1],
                  "am" : tAm,
                  "hs" : tHs
                }
              )
            }
          };
          for (let i = 0; i < wAcc.length; i++) {
            if(cAc === wAcc[i][2]){
              tHst.push(
                {
                  "tm" : +tTm,
                  "tp" : "transfer",
                  "fr" : wNm,
                  "to" : wAcc[i][1],
                  "am" : tAm,
                  "hs" : tHs
                }
              )
            }
          };
        }


      }
    };
  };
  console.log(tHst);
  let nHst = tHst.sort(function(a, b){ return a.tm - b.tm;});
  console.log(nHst)
  eID('tBalance').innerHTML = tBal;
  eID('tInflow').innerHTML  = '+ '+tInc;
  eID('tOutflow').innerHTML = '- '+tExp;
  console.log('tBal', tBal);
  let tNet = ((+tInc)-(+tExp));
  let iNet = (tNet > 0) ? '+ ' : '- ';
  eID('tNetflow').innerHTML = iNet+tNet;
  for (let txr = 0; txr < nHst.length; txr++) {
    if(nHst[txr].tp === 'income'){
      tSm = '[INC] '; tSg = '+ ';
    } if(nHst[txr].tp === 'expense'){
      tSm = '[EXP] '; tSg = '- ';
    } if(nHst[txr].tp === 'transfer') {
      tSm = '[TRF] '; tSg = '~ ';
    }
    let nDiv = document.createElement('div');
    nDiv.setAttribute('id',nHst[txr].hs);
    nDiv.setAttribute('class','historyrow');
    nDiv.innerHTML = '<i>'+tSm+'</i>'
    +'<span>' +nHst[txr].fr + ' ⇴ ' +nHst[txr].to+ '</span>'
    +'<span>'+tSg+nHst[txr].am+'</span>';
    eID('historyBox').append(nDiv);
    sNO('noHistory');
  }
};


async function getNewSeed(){
  let sb = new Uint8Array(32);
  window.crypto.getRandomValues(sb);
  let seed = banJs.bananoUtil.bytesToHex(sb);
  let uacc = await getAcc(seed,1);
  eID('newSeed').value = seed;
  eID('newRoot').value = uacc;
  sBK('useSeed');
  return false;
};

async function useThisSeed(){
  let seed = eVL('newSeed');
  localStorage.setItem('banXTSeed', seed);
  window.location.replace("./");
};
