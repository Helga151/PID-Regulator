//pobierane od użytkownika
var amax = controls.amax.value;
var aham = controls.aham.value; //przyspieszenie hamowania
var vX_pilki_stale = controls.Vx.value; //prędkość piłki w osi X - niezmienna
var vY_pilki_pocz = controls.Vy.value; //prędkość piłki w osi Y 
var pozX_bramki = controls.pozX_bramki.value; //pozycja X bramki > 0, bo pilka = 0
var pozY_bramki_pocz = controls.pozY_bramki_pocz.value; //pozycja Y bramki
var pozY_pocz = controls.pozY_pocz.value; //poczakowa pozycja piłki w osi Y - w X jest zawsze 0

//stałe
var f = 1000; //częstotliwość próbkowania
var k = controls.k.value; 
var kp = controls.kp.value;
var ki = controls.ki.value;
var kd = controls.kd.value;
var KT = controls.KT.value; 
/*var k = 1; //globalna zmienna regulatora
var kp = 1;
var ki = 1;
var kd = 1;
var KT = 20; //regulator zadanego przyspieszenia 
var kb = 0.1;*/ //regulacja uchybu
var suma = 0;
var e = [0.0,0.0]; //uchyb //e[0] = 0; e[1] = 0;
var g = 9.81;

//tablice
var przys_bramki = new Array(czas); //aktualne przyspieszenie bramki w osi Y
przys_bramki[0] = 0;
var vY_bramki = new Array(czas); //aktualna prędkość bramki w osi Y
vY_bramki[0] = 0;
var vY_pilki = []; //wszystkie prędkości piłki Y 
vY_pilki.push(vY_pilki_pocz);
var pozY_bramki = []; //aktualna pozycja bramki
pozY_bramki.push(pozY_bramki_pocz);
var poz_pilki = [[],[]]; //pozycja piłki X i Y
poz_pilki[1].push(pozY_pocz);
poz_pilki[0].push(0);

//zmienne
var dystansX = pozX_bramki; //dystans w osi X między pozycją piłki, a osią bramki
//kwant czasu - okres zegara, który aktualizuje dane
var Tx = dystansX/vX_pilki_stale; //czas w jakim piłka spotka się z osią bramki
var Txp = Tx;
var doc_pozY_bramki; //docelowa pozycja bramki w osi Y - pozycja, która jest wyznaczona na podstawie paraboli przewidywanego lotu piłki
var czas = Tx*f;

function Wyznaczenie_pozycjiY_bramki(x1, y1, x2, y2, x3, y3) {
    var a_licz = (y3 - y1) * (x1 - x2) + (y2 - y1) * (x3 + 1);    
    var a_mian = (x1 - x2) * ((x3*x3 - x1*x1)- (x2+x1)*(x3-1));
    
    var a = a_licz / a_mian;
    var b = (a*x2*x2 - a*x1*x1 + y1-y2)/(x1-x2);
    var c = y1 - a* x1*x1 - b*x1;
    return a*pozX_bramki*pozX_bramki + b*pozX_bramki + c;
}

for(var i=1;i<=czas;i++)
{
    var s_ham = (vY_bramki[i-1]*vY_bramki[i-1])/(2*aham); 
    var t_ham = vY_bramki[i-1]/aham;

    vY_pilki.push(vY_pilki[i - 1] - g / f);
    poz_pilki[1].push(poz_pilki[1][i - 1] + vY_pilki[i] / f);//pozycja piłki w osi Y
    poz_pilki[0].push(poz_pilki[0][i - 1] + vX_pilki_stale / f);//pozycja piłki w osi X

    if(i >= 3) {
        let x = Math.floor(i / 2);
        doc_pozY_bramki = Wyznaczenie_pozycjiY_bramki(poz_pilki[0][0], poz_pilki[1][0], poz_pilki[0][x], poz_pilki[1][x], poz_pilki[0][i], poz_pilki[1][i]);
    }
    else doc_pozY_bramki = poz_pilki[1][i];
    var V_zadane = (doc_pozY_bramki - pozY_bramki[i-1] - s_ham)/(Tx - t_ham); //prędkość zadania w danym momencie czasu
    var a_zadane = KT*((V_zadane - vY_bramki[i-1])/Txp); //przyspieszenie zadane na podst, prędkości zadanej
    suma += e[i];
    var de = e[i] - e[i-1]; //różnica uchybu
    przys_bramki[i] = przys_bramki[i-1] + k * (kp * e[i]) + ki * suma / f + kd * de / f;
    e.push(a_zadane-przys_bramki[i]);
    if(amax < przys_bramki[i]){
        przys_bramki[i] = amax;
    }
    if(Tx < t_ham){
        przys_bramki[i] = -aham;
    }
    if(przys_bramki[i] < -amax) {
        przys_bramki[i] = -amax;
    }
    vY_bramki[i] = vY_bramki[i-1] + przys_bramki[i] / f;
    pozY_bramki.push(pozY_bramki[i-1] + vY_bramki[i] / f);
    dystansX = dystansX - (vX_pilki_stale / f);
    Tx = dystansX/vX_pilki_stale; 
}
console.log({doc_pozY_bramki});
console.log("pozY_bramki[i]: ", pozY_bramki[czas]);
console.log("dystansX: ", dystansX);
var ts = [];
//console.log(ts);
for (var i=1; i<=czas; i++){
    ts.push(i);
}
//console.log(ts);
source[0].data = {x: ts, y: przys_bramki};
source[1].data = {x: ts, y: pozY_bramki};
source[2].data = {x: ts, y: vY_bramki};
source[4].data = {x: ts, y: poz_pilki[1]};
source.change.emit();
