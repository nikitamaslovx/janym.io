"""
Material Dashboard Theme for Plotly Charts
"""

import plotly.graph_objects as go

class MaterialChartTheme:
    """Material Dashboard color scheme"""
    
    PURPLE = "#9c27b0"
    SUCCESS = "#4caf50"
    INFO = "#00bcd4"
    WARNING = "#ff9800"
    DANGER = "#f44336"
    DARK = "#344767"
    GRAY = "#7b809a"


def get_material_layout(title=None, height=400):
    """Get Material Dashboard layout for Plotly charts"""
    
    return {
        "font": {
            "family": "Roboto, sans-serif",
            "color": MaterialChartTheme.DARK
        },
        "plot_bgcolor": "rgba(0,0,0,0)",
        "paper_bgcolor": "rgba(0,0,0,0)",
        "height": height,
        "title": {
            "text": title,
            "font": {"size": 18, "color": MaterialChartTheme.DARK},
            "x": 0
        } if title else {},
        "xaxis": {
            "showgrid": False,
            "color": MaterialChartTheme.GRAY
        },
        "yaxis": {
            "showgrid": True,
            "gridcolor": "rgba(0,0,0,0.05)",
            "color": MaterialChartTheme.GRAY
        }
    }


def create_material_figure(title=None, height=400):
    """Create Plotly figure with Material Dashboard styling"""
    
    fig = go.Figure()
    fig.update_layout(get_material_layout(title=title, height=height))
    return fig
