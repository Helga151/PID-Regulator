#region Imports
from flask import Flask, render_template
from bokeh import events
from bokeh.models import Button, CustomJS, ColumnDataSource, Select, Slider, Div, TextAreaInput, Paragraph
from bokeh.resources import INLINE
from bokeh.embed import components
from bokeh.plotting import figure
from bokeh.layouts import column, row, widgetbox
from bokeh.models.callbacks import CustomJS
#endregion

app = Flask(__name__)

@app.route('/')
def index():
    #region Sliders declaration
    controls1 = {

    "amax": Slider(title="amax", value=1, start=0, end=100, step=0.5),
    "aham": Slider(title="aham", value=0, start=0, end=100, step=0.5),

    "Vx": Slider(title="Vx", value=10, start=1, end=100, step=1),
    "Vy": Slider(title="Vy", value=10, start=1, end=100, step=1),
    "dx": Slider(title="dx", value=10, start=1, end=100, step=1)
    
    }
    controls2 = {
        "dummy_slider": Slider(name="dummy", visible=False, title="dummy_slider", value=0, start=0, end=1, step=1),
        "f": Slider(name="f", title="f", value=1, start=0, end=1000, step=1),
        "pozX_bramki_pocz": Slider(name="pozX_bramki_pocz", title="pozX_bramki_pocz", value=10, start=1, end=100, step=1),
        "pozY_bramki_pocz": Slider(name="pozY_bramki_pocz", title="pozY_bramki_pocz", value=10, start=0, end=100, step=1),
        "pozY_pocz": Slider(title="pozY_pocz", value=10, start=0, end=100, step=1)
    }
    controls3 = {
    "k": Slider(title="k", value=0, start=0, end=10, step=0.1),
    "kp": Slider(title="kp", value=0, start=0, end=10, step=0.1),
    "kd": Slider(title="kd", value=0, start=0, end=10, step=0.1),
    "ki": Slider(title="ki", value=0, start=0, end=10, step=0.1),
    "KT": Slider(title="KT", value=0, start=0, end=10, step=0.1),
    "a": Slider(title="a", value=10, start=0, end=40, step=0.1),
    "b": Slider(title="b", value=10, start=0, end=40, step=0.1),
    "c": Slider(title="c", value=10, start=0, end=40, step=0.1)
    }

    save_button = {"save_button": Button(label="Zapisz do pliku", button_type="success", css_classes =['custom_button_bokeh'], name='save_button')}
    compare_button = {"compare_button": Button(label="Zapisz do porównania", button_type="primary", css_classes =['custom_button_bokeh'])}
    hide_button = {"hide_button": Button(label="Ukryj", button_type="warning", css_classes =['custom_button_bokeh'])}
    load_select = {"load_select": Select(name="load_select", title="Wczytaj plik zapisu...", options=["1", "2"])}
    delete_select = {"delete_select": Select(name="delete_select", title="Usuń plik zapisu...", options=load_select["load_select"].options)}
    #endregion

    #region Controls array setup
    controls = dict()
    controls.update(controls1)
    controls.update(controls2)
    controls.update(controls3)
    controls_array = controls.values()
    #endregion

    #region Graphs setup
    source = ColumnDataSource()
    comp_source = ColumnDataSource()
    fig = figure(name="graph", plot_height=730, plot_width=1000, tooltips=[("x", "@x"), ("y", "@y")],
    background_fill_color='#20262B', border_fill_color='#15191C', outline_line_color='#E5E5E5')
    fig.line(x="x", y="y", source=source)
    fig.line(x="x", y="y", source=comp_source, color="red", line_color="red")
    fig.xaxis.axis_line_color="#E5E5E5"
    fig.yaxis.axis_line_color="#E5E5E5"
    fig.xaxis.axis_label = "Czas symulacji [s]"
    fig.yaxis.axis_label = "Przyspieszenie [m/s]"
    fig.xaxis.axis_label_text_color='#9cdcfe'
    fig.yaxis.axis_label_text_color='#9cdcfe'
    fig.xaxis.major_label_text_color = "#9cdcfe"
    fig.yaxis.major_label_text_color = "#9cdcfe"
    fig.grid.grid_line_alpha = 0.2
    #show(fig)
    #endregion

    #region Callbacks
    file = open("callbacks/callback.js", 'r')
    save_button['save_button'].js_on_click(CustomJS(args=dict(save_button=save_button), code="""
        console.log('button: click!', this.toString())
        $(document).ready(function() {
            const d = new Date()
            const date = d.toISOString().split('T')[0];
            const time = d.toTimeString().split(' ')[0].replace(/:/g, '-');
            //zapiszanie wartości z suwaków do LocalStorage
            var f = Bokeh.documents[0].get_model_by_name('f');
            var pozX_bramki_pocz = Bokeh.documents[0].get_model_by_name('pozX_bramki_pocz');
            var pozY_bramki_pocz = Bokeh.documents[0].get_model_by_name('pozY_bramki_pocz');
            var data = {
                'f': f.value,
                'pozX_bramki_pocz': pozX_bramki_pocz.value,
                'pozY_bramki_pocz': pozY_bramki_pocz.value
            };
            var czas = `${date} ${time}`;
            localStorage.setItem(czas, JSON.stringify(data));
        });
        var key_names = Object.keys(localStorage);
        console.log(key_names);
    """))
    load_select['load_select'].js_on_change('value', CustomJS(args=dict(load_select=load_select), code="""
        var key_names = Object.keys(localStorage);
        console.log(key_names);
    """))
    callback_code = '\n'.join([str(line) for line in file])
    callback = CustomJS(args=dict(source=source, controls=controls), code=callback_code)
    for single_control in controls_array:
        single_control.js_on_change('value', callback)
    #endregion

    #region Looks and placement of the elements
    # 1. kolumna
    text_with_controls = {
        "header": Div(text="""<h1>Menu konfiguracji</h1>""", width=320, height=50)
    }
    text_with_controls.update({
        "starting_conditions": Div(text="""<h2>Początkowe warunki:</h2>""", width=320, height=50)
    })
    text_with_controls.update(controls1)
    text_with_controls.update({
        "vspace": Div(text="""<h1 style="margin-bottom:0.2cm"></h1>""")
    })
    text_with_controls.update({
        "simulation data": Div(text="""<h2>Dane do symulacji:</h2>""", width=320, height=50)
    })
    text_with_controls.update(controls2)
    text_with_controls.update({
        "vspace": Div(text="""<h1 style="margin-bottom:1cm"></h1>""")
    })

    controls_array = text_with_controls.values()
    inputs_column = column(*controls_array, width=350, height=800)
    # 2. kolumna
    text_with_controls2 = {
        "placeholder": Div(text="""<h1 style="margin-bottom:0.2cm"></h1>""")
    }
    text_with_controls2.update({
        "PID_coefficients": Div(text="""<h2>Zmienne regulujące:</h2>""", width=320, height=50)
    })
    text_with_controls2.update(controls3)
    text_with_controls2.update({
        "vspace2": Div(text="""<h1 style="margin-bottom:0.52cm"></h1>""")
    })
    text_with_controls2.update(save_button)
    text_with_controls2.update(compare_button)
    text_with_controls2.update(hide_button)
    text_with_controls2.update(load_select)
    text_with_controls2.update(delete_select)
    controls_array2 = text_with_controls2.values()

    inputs_column2 = column(*controls_array2, width=350, height=800)
    #endregion

    #region Layout of the site and render
    layout_row = row([ inputs_column, column(width=50, height=800), inputs_column2, column(width=50, height=800), fig ])
    script, div = components(layout_row)
    return render_template(
        'index.html',
        plot_script=script,
        plot_div=div,
        js_resources=INLINE.render_js(),
        css_resources=INLINE.render_css(),
    )
    #endregion

if __name__ == "__main__":
    app.run(debug=True)
