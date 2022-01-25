console.log("first_load");
let ck = document.cookie;

// aktualizacja listy wyboru stanów do wczytania
let cookie_list = [];
let curr_num = 0;
console.log(ck);
if (ck === ""){
    cookie_list = [];
}
else{
    for (const element of ck.split(';')){
        if (element === "") break;
        let [p, v] = element.split('=');
        if (!p.includes(':')) continue;
        let [k, n] = p.split(':');
        let num = parseInt(n);
        if (!cookie_list.includes(n)) cookie_list.push(n);
        if (num > curr_num) curr_num = num;
    }
}
console.log(cookie_list);

// załadowanie opcji load i delete
$(document).ready(function() {
            var load_select = Bokeh.documents[0].get_model_by_name('load_select');
            var delete_select = Bokeh.documents[0].get_model_by_name('delete_select');
            load_select.options = cookie_list;
            delete_select.options = cookie_list;
        });

// sztuczna zmiana nieistniejącego slidera, aby wykres się odświeżył
$(document).ready(function() {
            var dummy = Bokeh.documents[0].get_model_by_name('dummy');
            dummy.value = 1;
        });