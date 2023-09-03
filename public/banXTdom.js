const eID = function(e){return document.getElementById(e)};
const eCN = function(e){return document.getElementsByClassName(e)};
const eTN = function(e,x){return document.getElementsByTagName(e)[x]};
const sBK = function(e){return document.getElementById(e).style.display='block'};
const sGR = function(e){return document.getElementById(e).style.display='grid'};
const sNO = function(e){return document.getElementById(e).style.display='none'};
const eVL = function(e){return document.getElementById(e).value};

function goDark(){
  let el = document.body;
  el.classList.toggle("dark");
};

function goUp() {
  document.body.scrollTop = 0; // For Safari
  document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
};

function mobileMenu(){
  let el = eID('mobileMenuBox');
  if(el.style.display === "grid"){
    sNO('mobileMenuBox');
    sGR('splitBox');
  } else {
    sGR('mobileMenuBox');
    sNO('splitBox');
  }
};

function changeTxType(){
  let selId = eID('txType');
  let optId = selId.value;
  console.log(optId);
  if(optId === 'selIncome'){
    sBK('newIncome');
    sNO('newExpense');
    sNO('newTransfer');
    eID('inputContainer').style.borderColor = '#88c246';
  } else if(optId === 'selExpense') {
    sBK('newExpense');
    sNO('newIncome');
    sNO('newTransfer');
    eID('inputContainer').style.borderColor = '#e71130';
  } else {
    sBK('newTransfer');
    sNO('newIncome');
    sNO('newExpense');
    eID('inputContainer').style.borderColor = '#3479ff';
  }
};

function newOptions(ar, el){
  for (let i = 0; i < ar.length; i++) {
    let nOpt = document.createElement('option');
    nOpt.setAttribute('value', ar[i].acIx);
    nOpt.setAttribute('id', 'ix'+ar[i].acIx);
    nOpt.innerHTML = ar[i].name;
    eID(el).appendChild(nOpt);
  }
};

function prepareTxForm(){
  newOptions(incAcc, 'txIncomeSrc');
  newOptions(walAcc, 'txToAccount');
  newOptions(expAcc, 'txExpenseCat');
  newOptions(walAcc, 'txFromAccount');
  newOptions(walAcc, 'transferFrom');
  newOptions(walAcc, 'transferTo');
};


async function selAccBal(id){
  /*
  let ix = eID(id).value;
  let ac = await getAcc(seed, ix);
  let cb = await getBal(seed, ac);
  let nb = cb.balance;
  let cc = eID('ix'+ix).innerHTML;
  let cn = cc.split(':')[0]
  eID('ix'+ix).innerHTML = cn+': ['+nb+']';
  console.log(ix)
  */
}

async function postIncome(){
  let iFr = eID('txIncomeSrc').value;
  let aFr = await getAcc(iFr);
  console.log(iFr, aFr)
  let iTo = eID('txToAccount').value;
  let aTo = await getAcc(iTo);
  console.log(iTo,aTo)
  let iAm = (eID('txAmount').value).toString();
  console.log(iAm)
  let nAm = iAm.padStart(29,'0');
  let aAm = '0.'+nAm;

  await newTxn(seed,'1',aFr,aAm)
  await postPen(seed,iFr);
  await newTxn(seed,iFr,aTo,aAm);
  await postPen(seed,iTo)
};
async function postExpense(){
  let iFr = eID('txFromAccount').value;
  let aFr = await getAcc(iFr);
  console.log(iFr, aFr)
  let iTo = eID('txExpenseCat').value;
  let aTo = await getAcc(iTo);
  console.log(iTo,aTo)
  let iAm = (eID('txAmount').value).toString();
  console.log(iAm)
  let nAm = iAm.padStart(29,'0');
  let aAm = '0.'+nAm;

  await newTxn(seed,iFr,aTo,aAm);
  await postPen(seed,iFr);
  await newTxn(seed,iTo,0,aAm);
  await postPen(seed,iTo);
};
async function postTransfer(){
  let iFr = eID('transferFrom').value;
  let aFr = await getAcc(iFr);
  console.log(iFr,aFr)
  let iTo = eID('transferTo').value;
  let aTo = await getAcc(iTo);
  console.log(iTo,aTo)
  let iAm = (eID('txAmount').value).toString();
  console.log(iAm)
  let nAm = iAm.padStart(29,'0');
  let aAm = '0.'+nAm;

  await newTxn(seed,iFr,aTo,aAm);
  await postPen(seed,iTo);
};