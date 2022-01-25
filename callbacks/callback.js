//pobierane od użytkownika
var f = 1000; //częstotliwość próbkowania
var amax = controls.amax.value;
var aham = controls.aham.value; //przyspieszenie hamowania
var Vx_pilki_pilki = controls.Vx_pilki.value; //prędkość piłki w osi X
var Vy_pocz = controls.Vy.value; //prędkość piłki w osi Y 
var pozX_bramki_pocz = controls.pozX_bramki_pocz.value; //pozycja X bramki > 0, bo pilka = 0
var pozY_bramki_pocz = controls.pozY_bramki_pocz.value; //pozycja Y bramki
var pozY_pocz = controls.pozY_pocz.value; //poczakowa pozycja piłki w osi Y - w X jest zawsze 0

var k = 1; //globalna zmienna regulatora
var kp = 1;
var ki = 1;
var kd = 1;
var KT = 20; //regulator zadanego przyspieszenia 
var kb = 0.1;

//zapiszanie wartości z suwaków do LocalStorage
/*var test = {
    'f': f,
    'amax': amax,
    'aham': aham
};
localStorage.setItem('test', JSON.stringify(test));*/
//console.log(save_button.label);


//wyliczane
var przys_bramki = new Array(czas); //aktualne przyspieszenie bramki w osi Y
przys_bramki[0] = 0;
var V_pilki = new Array(czas); //aktualna prędkość bramki w osi Y
V_pilki[0] = 0;
var dx = pozX_bramki_pocz; //dystans w osi X między pozycją piłki, a osią bramki
var dt = 1/f; //kwant czasu - okres zegara, który aktualizuje dane
var Tx = dx/Vx_pilki; //czas w jakim piłka spotka się z osią bramki
var Txp = Tx;
var czas = (Tx*f);
var Vy_cale = []; //wszystkie prędkości piłki Y 
Vy_cale.push(Vy_pocz);
var poz_pilki = [[],[]]; //pozycja piłki
poz_pilki[1].push(pozY_pocz);
poz_pilki[0].push(0);
var s_ham;
var t_ham;
var suma = 0;
var e = [0.0,0.0];
//e[0] = 0;
//e[1] = 0;
var g = 9.81;
var doc_pos; //docelowa pozycja bramki w osi Y - pozycja, która jest wyznaczona na podstawie paraboli przewidywanego lotu piłki
var pozY_bramki = []; //aktualna pozycja bramki
pozY_bramki.push(pozY_bramki_pocz);

for(var i=1;i<=czas;i++)
{
    s_ham = (V_pilki[i-1]*V_pilki[i-1])/(2*aham); 
    t_ham = V_pilki[i-1]/aham;

    Vy_cale.push(Vy_cale[i - 1] + g / f);
    poz_pilki[1].push(poz_pilki[1][i - 1] + Vy_cale[i] / f);//pozycja piłki w osi Y
    poz_pilki[0].push(poz_pilki[0][i - 1] + Vx_pilki / f);//pozycja piłki w osi X

    if(i >= 3) {
        var a_licz = (poz_pilki[1][i] - poz_pilki[1][i - 2]) * (poz_pilki[0][i - 2] - poz_pilki[0][i - 1]) + (poz_pilki[1][i - 1] - poz_pilki[1][i - 2]) * (poz_pilki[0][i] + 1); 
        var a_mian = (poz_pilki[0][i-2] - poz_pilki[0][i - 1]) * ((poz_pilki[0][i]*poz_pilki[0][i] - poz_pilki[0][i - 2]*poz_pilki[0][i - 2])- (poz_pilki[0][i - 1]+poz_pilki[0][i - 2])*(poz_pilki[0][i]-1));
        
        var a = a_licz / a_mian;
        var b = (a*poz_pilki[0][i - 1]*poz_pilki[0][i - 1] - a*poz_pilki[0][i - 2]*poz_pilki[0][i - 2] + poz_pilki[1][i - 2]-poz_pilki[1][i - 1])/(poz_pilki[0][i - 2]-poz_pilki[0][i - 1]);
        var c = poz_pilki[1][i - 2] - a* poz_pilki[0][i - 2]*poz_pilki[0][i - 2] - b*poz_pilki[0][i - 2];
        
        doc_pos = a*pozX_bramki_pocz*pozX_bramki_pocz + b*pozX_bramki_pocz + c;
    }
    else doc_pos = poz_pilki[1][i];
    var V_zadane = (doc_pos - pozY_bramki[i-1] - s_ham)/(Tx - t_ham); //prędkość zadania w danym momencie czasu
    var a_zadane = KT*((V_zadane - V_pilki[i-1])/Txp); //przyspieszenie zadane na podst, prędkości zadanej
    suma = suma + e[i];
    var de = e[i] - e[i-1];
    var a_n = przys_bramki[i-1] + k * (kp * (kb * e[i]) + ki * suma * dt + kd * de * dt);
    przys_bramki[i] = a_n;
    e.push(a_zadane-przys_bramki[i]);

    if(amax < przys_bramki[i]){
        przys_bramki[i] = amax;
    }
    if(Tx < t_ham){
        przys_bramki[i] = -aham;
    }
    V_pilki[i] = V_pilki[i-1] + przys_bramki[i] * dt;
    pozY_bramki.push(pozY_bramki[i-1] + V_pilki[i] * dt);
    dx = dx - (Vx_pilki*dt);
    console.log("dx: ", dx);
    Tx = dx/Vx_pilki;
    console.log("pozY_bramki[i]: ", pozY_bramki[i]);
}

//for (var iter = 1; iter<t; iter++){
//    temperature_inside.push(temperature_inside[temperature_inside.length-1]+(sampling_period/(mass_air*specific_heat_air+mass_object*specific_heat_object))*(power_heater-((heat_transfer_coefficient/thickness_wall)*area_wall*(temperature_inside[temperature_inside.length-1]-temperature_outside))));
//    var e_here = target_temperature-temperature_inside[iter];
//    e.push(e_here);
//    e_sum += e_here;
//    if (iter>1){
//        var en = e[iter];
//        var den = e[e.length-1]-e[e.length-2];
//        var u = kp*(en+(sampling_period/Ti)*e_sum + (Td/sampling_period)*den);
//        power_heater = max_power_heater*u;
//        if (power_heater<0){
//            power_heater = 0;
//        }
//    }
//}
//console.log(t);
//console.log(temperature_inside);
var ts = [];
//console.log(ts);
for (var i=1; i<=czas; i++){
    ts.push(i);
}
//console.log(ts);
source.data = {x: ts, y: przys_bramki};
source.change.emit();