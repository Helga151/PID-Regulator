console.log("first_load");

// załadowanie opcji load i delete
$(document).ready(function() {
    var load_select = Bokeh.documents[0].get_model_by_name('load_select');
    var delete_select = Bokeh.documents[0].get_model_by_name('delete_select');
    var key_names = Object.keys(localStorage);
    load_select.options = key_names;
    delete_select.options = key_names;
});

// sztuczna zmiana nieistniejącego slidera, aby wykres się odświeżył
$(document).ready(function() {
    var dummy = Bokeh.documents[0].get_model_by_name('dummy');
    dummy.value = 1;
});