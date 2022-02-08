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
var k = controls.k.value; //globalna zmienna regulatora
var kp = controls.kp.value;
var ki = controls.ki.value;
var kd = controls.kd.value;
var KT = controls.KT.value; //regulator zadanego przyspieszenia 
var suma = 0;
var e = [0.0,0.0]; //uchyb //e[0] = 0; e[1] = 0;
var g = 9.81;

//zmienne
var dystansX = pozX_bramki; //dystans w osi X między pozycją piłki, a osią bramki
//kwant czasu - okres zegara, który aktualizuje dane
var Tx = dystansX/vX_pilki_stale; //czas w jakim piłka spotka się z osią bramki
var Txp = Tx;
var doc_pozY_bramki; //docelowa pozycja bramki w osi Y - pozycja, która jest wyznaczona na podstawie paraboli przewidywanego lotu piłki
var czas = Math.ceil(Tx*f);
var odbito = 0;
var oid = 0;

//tablice
var przys_bramki = new Array(czas); //aktualne przyspieszenie bramki w osi Y
przys_bramki[0] = 0;
var vY_bramki = new Array(czas); //aktualna prędkość bramki w osi Y
vY_bramki[0] = 0;
var vY_pilki = []; //wszystkie prędkości piłki Y 
vY_pilki.push(vY_pilki_pocz);
var pozY_bramki = []; //aktualna pozycja bramki
pozY_bramki.push(pozY_bramki_pocz);
//pozycja piłki X i Y
var pozX_pilki = new Array(czas + 1);
pozX_pilki[0] = 0;
var pozY_pilki = new Array(czas + 1); 
pozY_pilki[0] = pozY_pocz;

function Wyznaczenie_pozycjiY_bramki(x1, y1, x2, y2, x3, y3) {
    var s1 = y1 * (pozX_bramki - x2)/(x1 - x2) * (pozX_bramki - x3)/(x1 - x3);//pierwszy składnik sumy ze wzoru Lagrange'a
    var s2 = y2 * (pozX_bramki - x1)/(x2 - x1) * (pozX_bramki - x3)/(x2 - x3);
    var s3 = y3 * (pozX_bramki - x1)/(x3 - x1) * (pozX_bramki - x2)/(x3 - x2);
    var wysokosc = s1 + s2 + s3;
    if (wysokosc > 0) return wysokosc;
    else {
        var a = y1 / ((x1 - x2) * (x1 - x3)) + y2 / ((x2 - x1) * (x2 - x3)) + y3 / ((x3 - x1) * (x3 - x2));
        var b = (a*x2*x2 - a*x1*x1 + y1-y2)/(x1-x2);
        var c = y1 - a* x1*x1 - b*x1;
        var delta = b*b-4*a*c;
        if (delta < 0){
            console.log("ujemna delta");
            return wysokosc;
        }
        var xz1 = (-b-Math.sqrt(delta))/(2*a); //miejsce zerowe 1
        var xz2 = (-b+Math.sqrt(delta))/(2*a); //miejsce zerowe 2
        var xz = Math.max(xz1, xz2);
        if (xz < x3) {
            console.log("miejsce zerowe po lewej");
            return wysokosc;
        }
    }
return  Wyznaczenie_pozycjiY_bramki(xz, 0, x3+2*(xz-x3), y3, x2+2*(xz-x2), y2);
}

for(var i=1;i<=czas;i++)
{
    var s_ham = (vY_bramki[i-1]*vY_bramki[i-1])/(2*aham); 
    var t_ham = vY_bramki[i-1]/aham;
    
    var pilkinewV = (vY_pilki[i - 1] - g / f);
    var pilkinewpozY = (pozY_pilki[i - 1] + pilkinewV / f);
    if (pilkinewpozY <= 0 && pilkinewV <= 0){
        console.log("<= 0");
        pilkinewpozY = pilkinewpozY * (-1);//pozycja piłki w osi Y
        pilkinewV = pilkinewV * (-1); //przeciwna liczba
        odbito = 4; //czeka 4 iteracje żeby przewidzieć parabolę
        oid = i + 1; //następna pozycja PO tej i-tej
    }
    vY_pilki.push(pilkinewV);
    pozY_pilki[i] = pilkinewpozY;//pozycja piłki w osi Y
    pozX_pilki[i] = pozX_pilki[i - 1] + vX_pilki_stale / f;//pozycja piłki w osi X

    if(i >= 3 && odbito == 0) {
        let mid = Math.floor((oid+i)/2);
        doc_pozY_bramki = Wyznaczenie_pozycjiY_bramki(pozX_pilki[oid], pozY_pilki[oid], pozX_pilki[mid], pozY_pilki[mid], pozX_pilki[i], pozY_pilki[i]);
    }
    else if (odbito > 0){
        odbito--;
    }
    else if (i < 3) {
        doc_pozY_bramki = pozY_pilki[i];
    }
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
console.log("pozY_bramki[i]: ", pozY_bramki[czas-1]);
console.log("dystansX: ", dystansX);
var ts = [];
for (var i=1; i<=czas; i++){
    ts.push(i);
}
source[0].data = {x: ts, y: przys_bramki};
source[1].data = {x: ts, y: pozY_bramki};
source[2].data = {x: ts, y: vY_bramki};
source[3].data = {x: ts, y: pozY_pilki};
source.change.emit();